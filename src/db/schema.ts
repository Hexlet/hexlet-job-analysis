import { int, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

export const sq = sqliteTable('search_queries', {
  id: int().primaryKey({ autoIncrement: true }),
  term: text().notNull().unique(),
  vacancies_count: int().notNull(),
})

export const sqr = sqliteTable('search_query_results', {
  id: int().primaryKey({ autoIncrement: true }),
  search_query_id: int().notNull().references(() => sq.id),
  vacancy_id: int().notNull().references(() => v.id),
}, (t) => {
  return {
    search_query_id_vacancy_id: unique().on(t.search_query_id, t.vacancy_id),
  }
})

export const v = sqliteTable('vacancies', {
  id: int().primaryKey({ autoIncrement: true }),
  original_id: text().unique().notNull(),
  description: text().notNull(),
  name: text().notNull(),
})
