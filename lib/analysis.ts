import { eq, count, desc, sql } from 'drizzle-orm'
import * as schema from './db/schema.js'
import db from './utils/db.js'
import { LoggerFn, SearchQuery } from '../types'

const getSkillFrequencies = async (searchQuery: SearchQuery) => {
  const skills = await db
    .select({
      skill: schema.s.name,
      frequency: count().as('count'),
    })
    .from(schema.vs)
    .innerJoin(schema.s, eq(schema.vs.skill_id, schema.s.id))
    .innerJoin(schema.v, eq(schema.vs.vacancy_id, schema.v.id))
    .innerJoin(schema.sqr, eq(schema.v.id, schema.sqr.vacancy_id))
    .where(eq(schema.sqr.search_query_id, searchQuery.id!))
    .limit(100)
    .groupBy(schema.s.name)
    .orderBy(desc(sql`count`))

  return skills
}

async function analyze(term: string, log: LoggerFn) {
  const searchQuery = await db.query.sq.findFirst({ where: eq(schema.sq.term, term) })
  if (!searchQuery) {
    log(`"${term}" does not downloaded. Check list`)
    return {}
  }

  const resultForVacanciesCount = await db
    .select({ vacancies_count: count().as('count') })
    .from(schema.sqr)
    .where(eq(schema.sqr.search_query_id, searchQuery.id))
  log(`Vacancies Analyzed: ${resultForVacanciesCount[0].vacancies_count}`)

  const specialtyDistribution = await db
    .select({
      specialty: schema.v.specialty,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.v)
    .groupBy(schema.v.specialty)

  console.table(specialtyDistribution)

  const positionLevelDistribution = await db
    .select({
      position_level: schema.v.position_level,
      count: sql<number>`COUNT(*)`,
    })
    .from(schema.v)
    .groupBy(schema.v.position_level)
  console.table(positionLevelDistribution)

  const skills = await getSkillFrequencies(searchQuery)
  console.table(skills)
}

export default analyze
