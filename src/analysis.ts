import { eq, count, desc, sql } from 'drizzle-orm'
import * as schema from './db/schema.ts'
import db from './lib/db.ts'

const getSkillFrequencies = async (term: string) => {
  const searchQuery = await db.query.sq.findFirst({ where: eq(schema.sq.term, term) })
  if (!searchQuery) {
    return {}
  }

  const result = await db
    .select({
      skill_name: schema.s.name,
      frequency: count().as('count'),
    })
    .from(schema.vs)
    .innerJoin(schema.s, eq(schema.vs.skill_id, schema.s.id))
    .innerJoin(schema.v, eq(schema.vs.vacancy_id, schema.v.id))
    .innerJoin(schema.sqr, eq(schema.v.id, schema.sqr.vacancy_id))
    .where(eq(schema.sqr.search_query_id, searchQuery.id))
    .groupBy(schema.s.name)
    .orderBy(desc(sql`count`))

  return result
}

async function analyze(term: string) {
  const result = await getSkillFrequencies(term)
  return result
}

export default analyze
