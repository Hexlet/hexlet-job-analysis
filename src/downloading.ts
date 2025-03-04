import axios from 'axios'
import debug from 'debug'
import PQueue from 'p-queue'

import { eq } from 'drizzle-orm'
import { HeadHunter, LoggerFn, SearchQuery, SearchQueryResult, Vacancy } from '../types/index.js'
import * as schema from './db/schema.ts'
import db from './lib/db.ts'
import { Command } from '@oclif/core'

const debugLog = debug('app')

const apiUrl = 'https://api.hh.ru/vacancies'

async function processVacancy(searchQuery: SearchQuery, url: string) {
  debugLog(url)
  const response = await axios.get<HeadHunter.Vacancy>(url)
  const data = response.data
  const vacancyParams: Vacancy = {
    normalization_state: 'raw',
    original_id: data.id,
    name: data.name,
    description: data.description,
  }
  const vacancy = await db.insert(schema.v).values(vacancyParams)
    .onConflictDoUpdate({ target: schema.v.original_id, set: vacancyParams })
    .returning().get()
  debugLog('Vacancy %o', vacancy)

  const searchQueryResultParams: SearchQueryResult = {
    vacancy_id: vacancy.id,
    search_query_id: searchQuery.id!,
  }
  debugLog('searchQueryResultParams', searchQueryResultParams)

  await db.insert(schema.sqr).values(searchQueryResultParams)
}

async function download(term: string, log: LoggerFn) {
  const params: HeadHunter.SearchParams = {
    // area: '', // Москва
    text: term,
    per_page: 100,
    page: 0,
    clusters: true,
  }

  debugLog(apiUrl)
  debugLog('Search Request', params)
  const response = await axios.get<HeadHunter.SearchVacanciesResult>(apiUrl, { params })

  // TODO: implement for every page
  const data = response.data

  debugLog('Search Response', response.status)
  log(`Term: ${term}`)
  log(`Vacancies Found: ${data.found}`)

  const searchQueryParams: SearchQuery = {
    term: params.text,
    vacancies_count: response.data.found,
  }

  const oldSearchQuery = await db.query.sq.findFirst({
    where: eq(schema.sq.term, searchQueryParams.term),
  }) // .where(eq(schema.sq.term, searchQueryParams.term))
  debugLog('oldSearchQuery', oldSearchQuery)

  if (oldSearchQuery) {
    await db.delete(schema.sqr).where(eq(schema.sqr.search_query_id, oldSearchQuery.id))
    debugLog('oldSearchQuery', 'remove rows from sqr')
    await db.delete(schema.sq).where(eq(schema.sq.term, searchQueryParams.term))
    debugLog('oldSearchQuery', 'remove rows from sq')
  }

  const newSearchQuery = await db.insert(schema.sq).values(searchQueryParams)
    // .onConflictDoUpdate({ target: searchQueriesTable.term, set: searchQueryParams })
    .returning().get()
  debugLog('newSearchQuery', newSearchQuery)

  const queue = new PQueue({ concurrency: 5 })

  const currentPageItems = data.items

  const promises = currentPageItems.map((vacancy) => {
    return queue.add(() => processVacancy(newSearchQuery, vacancy.url))
  })
  const vacancies = await Promise.all(promises)
  return {
    vacancies,
    totalVacanciesCount: data.found,
  }
}

export default download
