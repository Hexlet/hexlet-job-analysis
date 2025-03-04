import 'dotenv/config'

import debug from 'debug'
import * as schema from './db/schema.ts'

import { eq } from 'drizzle-orm'
import { Vacancy, VacancySkill } from '../types/index.js'
import { extractSkills } from './lib/ai.ts'
import db from './lib/db.ts'
import PQueue from 'p-queue'

const log = debug('app')

const loadSkills = async (v: Vacancy) => {
  const skillNames = await extractSkills(v)

  await db.delete(schema.vs).where(eq(schema.vs.vacancy_id, v.id!))

  for (const skillName of skillNames) {
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

  return skillNames
}

export default async () => {
  const vacancies = await db.query.v.findMany({ limit: 100 })
  const queue = new PQueue({ concurrency: 2 })
  const promises = vacancies.map(v => queue.add(() => loadSkills(v)))
  const result = await Promise.all(promises)
  console.log(result)
}
