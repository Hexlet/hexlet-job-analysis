import axios from 'axios'
import debug from 'debug'
import PQueue from 'p-queue'
import 'dotenv/config'

import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './db/schema.ts'
import { HeadHunter, SearchQuery, SearchQueryResult, Vacancy } from '../types/index.js'
import { eq } from 'drizzle-orm'

const db = drizzle(process.env.DB_FILE_NAME!, { schema, casing: 'snake_case' })

const log = debug('app')

const apiUrl = 'https://api.hh.ru/vacancies'
const params: HeadHunter.SearchParams = {
  area: '1', // Москва
  text: 'php',
  per_page: 10,
  page: 0,
  clusters: true,
}

async function processVacancy(searchQuery: SearchQuery, url: string) {
  log(url)
  const response = await axios.get<HeadHunter.Vacancy>(url)
  const data = response.data
  const vacancyParams: Vacancy = {
    original_id: data.id,
    name: data.name,
    description: data.description,
  }
  const vacancy = await db.insert(schema.v).values(vacancyParams)
    .onConflictDoUpdate({ target: schema.v.original_id, set: vacancyParams })
    .returning().get()
  log('Vacancy %o', vacancy)

  const searchQueryResultParams: SearchQueryResult = {
    vacancy_id: vacancy.id,
    search_query_id: searchQuery.id!,
  }
  log('searchQueryResultParams', searchQueryResultParams)

  await db.insert(schema.sqr).values(searchQueryResultParams)
}

export default async () => {
  log(apiUrl)
  log('Search Request', params)
  const response = await axios.get<HeadHunter.SearchVacanciesResult>(apiUrl, { params })
  log('Search Response', response.status)
  const searchQueryParams: SearchQuery = {
    term: params.text,
    vacancies_count: response.data.found,
  }

  const oldSearchQuery = await db.query.sq.findFirst({
    where: eq(schema.sq.term, searchQueryParams.term),
  }) // .where(eq(schema.sq.term, searchQueryParams.term))
  log('oldSearchQuery', oldSearchQuery)

  if (oldSearchQuery) {
    await db.delete(schema.sqr).where(eq(schema.sqr.search_query_id, oldSearchQuery.id))
    log('oldSearchQuery', 'remove rows from sqr')
    await db.delete(schema.sq).where(eq(schema.sq.term, searchQueryParams.term))
    log('oldSearchQuery', 'remove rows from sq')
  }

  const newSearchQuery = await db.insert(schema.sq).values(searchQueryParams)
    // .onConflictDoUpdate({ target: searchQueriesTable.term, set: searchQueryParams })
    .returning().get()
  log('newSearchQuery', newSearchQuery)

  // TODO: implement for every page
  const data = response.data

  const queue = new PQueue({ concurrency: 2 })

  const vacancies = await Promise.all(
    data.items.slice(1, 10).map((vacancy) => {
      return queue.add(() => processVacancy(newSearchQuery, vacancy.url))
    }),
  )

  // const result = {
  //   vacancies,
  //   // Количество вакансий
  //   vacanciesCount: data.found,
  // }

  // console.log(util.inspect(result, { depth: null, colors: true }))
}
