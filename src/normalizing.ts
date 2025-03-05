import debug from 'debug'
import * as schema from './db/schema.js'

import { eq, Logger } from 'drizzle-orm'
import { LoggerFn, Vacancy, VacancySkill } from '../types/index.js'
import { extractSkills } from './lib/ai.js'
import db from './lib/db.js'
import PQueue from 'p-queue'

const debugLog = debug('app')

async function loadInfo(v: Vacancy) {
  const result = await extractSkills(v)

  await db.delete(schema.vs).where(eq(schema.vs.vacancy_id, v.id!))

  for (const skillName of result.skills) {
    const normalizedSkillname = skillName.trim().toLowerCase()
    const skillParams = { name: normalizedSkillname }
    const skill = await db.insert(schema.s).values(skillParams)
      .onConflictDoUpdate({ target: schema.s.name, set: skillParams })
      // .onConflictDoNothing()
      .returning().get()

    const vacancySkillParams: VacancySkill = {
      vacancy_id: v.id!,
      skill_id: skill.id,
    }
    const vacancySkill = await db.insert(schema.vs).values(vacancySkillParams)
  }

  const data: Partial<Vacancy> = {
    normalization_state: 'normalized',
    position_level: result.position_level,
    specialty: result.specialty,
  }
  await db.update(schema.v).set(data)
    .where(eq(schema.v.id, v.id!))
}

async function normalize(term: string | undefined, log: LoggerFn) {
  // use when ready https://orm.drizzle.team/docs/select#iterator
  const vacancies = await db.query.v.findMany({
    limit: 100,
    where: eq(schema.v.normalization_state, 'raw'),
  })
  log(`Raw vacancies count: ${vacancies.length}`)
  const queue = new PQueue({ concurrency: 5 })
  const promises = vacancies.map(v => queue.add(() => loadInfo(v)))
  await Promise.all(promises)
  log(`Vacancies Processed: ${vacancies.length}`)
}

export default normalize
