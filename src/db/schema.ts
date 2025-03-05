import { sql } from 'drizzle-orm'
import { foreignKey, int, sqliteTable, text, unique } from 'drizzle-orm/sqlite-core'

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
  normalization_state: text({ enum: ['raw', 'normalized'] }).notNull(),
  description: text().notNull(),
  specialty: text(),
  position_level: text(),
  published_at: text('timestamp'),
  salary_from: int(),
  salary_to: int(),
  schedule_name: text(),
  // schedule_id: foreignKey(),
  area_name: text(),
  // area_id: foreignKey(config)
  salary_currency: text(),
  name: text().notNull(),
})

export const s = sqliteTable('skills', {
  id: int().primaryKey({ autoIncrement: true }),
  name: text().unique().notNull(),
})

export const vs = sqliteTable('vacancy_skills', {
  id: int().primaryKey({ autoIncrement: true }),
  vacancy_id: int().notNull().references(() => v.id),
  skill_id: int().notNull().references(() => s.id),
})
