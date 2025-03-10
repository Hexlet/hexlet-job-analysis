import axios from 'axios'
import debug from 'debug'
import PQueue from 'p-queue'

import { eq } from 'drizzle-orm'
import { HeadHunter, LoggerFn, SearchQuery, SearchQueryResult, Vacancy } from '../types/index.js'
import * as schema from './db/schema.js'
import db from './utils/db.js'

// https://api.hh.ru/openapi/redoc#section/Obshaya-informaciya/Trebovaniya-k-zaprosam
axios.defaults.headers.post['User-Agent'] = 'User-Agent: MyApp/1.0 (support@hexlet.io)'

const debugLog = debug('app')

const apiUrl = 'https://api.hh.ru/vacancies'

async function processVacancy(searchQuery: SearchQuery, url: string, log: LoggerFn) {
  debugLog(url)

  let response
  try {
    response = await axios.get<HeadHunter.Vacancy>(url)
  }
  catch (e) {
    if (axios.isAxiosError(e)) {
      debugLog(e.response?.data)
    }
    throw e
  }

  const data = response.data
  const vacancyParams: Vacancy = {
    normalization_state: 'raw',
    original_id: data.id,
    name: data.name,
    description: data.description,
    salary_currency: data.salary?.currency,
    salary_from: data.salary?.from,
    salary_to: data.salary?.to,
    schedule_name: data.schedule?.name,
    area_name: data.area?.name,
    published_at: data.published_at,
  }

  const vacancy = await db.insert(schema.v).values(vacancyParams)
    .onConflictDoUpdate({ target: schema.v.original_id, set: vacancyParams })
    .returning().get()
  // debugLog('Vacancy %o', vacancy)

  const searchQueryResultParams: SearchQueryResult = {
    vacancy_id: vacancy.id,
    search_query_id: searchQuery.id!,
  }
  debugLog('searchQueryResultParams', searchQueryResultParams)

  await db.insert(schema.sqr).values(searchQueryResultParams)
}

async function download(term: string, log: LoggerFn) {
  log(`Term: ${term}`)

  const params: HeadHunter.SearchParams = {
    // area: '', // Москва
    text: term,
    per_page: 100,
    page: 0,
    clusters: false,
  }

  debugLog(apiUrl)
  log('Search Request', params)

  let initResponse
  try {
    initResponse = await axios.get<HeadHunter.SearchVacanciesResult>(apiUrl, { params })
  }
  catch (e) {
    if (axios.isAxiosError(e)) {
      debugLog(e.response)
    }
    throw e
  }

  const initData = initResponse.data

  log(`Vacancies Found: ${initData.found}`)
  log(`Response Items Count: ${initData.items.length}`)

  const searchQueryParams: SearchQuery = {
    term: params.text,
    vacancies_count: initResponse.data.found,
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

  const vacancies = []
  let data = initData

  // 100 vacancies is enough
  for (let page = 0; page < 1; page += 1) {
    if (page != 0) { // already loaded
      const params: HeadHunter.SearchParams = {
        text: term,
        per_page: 100,
        page,
      }
      log('Search Request', params)
      const response = await axios.get<HeadHunter.SearchVacanciesResult>(apiUrl, { params })
      data = response.data
      log(`Response Items Count: ${data.items.length}`)
    }

    const queue = new PQueue({ concurrency: 1 })

    const vacancyPromises = data.items.map((item) => {
      return queue.add(() => processVacancy(newSearchQuery, item.url, log))
    })
    vacancies.push(...await Promise.all(vacancyPromises))
  }

  return {
    vacancies,
    totalVacanciesCount: initData.found,
  }
}

export default download
