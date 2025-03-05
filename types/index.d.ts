import { InferInsertModel } from 'drizzle-orm'
import * as schema from '../src/db/schema.ts'

type SearchQuery = InferInsertModel<typeof schema.sq>
type Vacancy = InferInsertModel<typeof schema.v>
type SearchQueryResult = InferInsertModel<typeof schema.sqr>
type Skill = InferInsertModel<typeof schema.s>
type VacancySkill = InferInsertModel<typeof schema.vs>

export interface Config {
  openAIApiKey: string
}

export namespace HeadHunter {
  interface Salary {
    from?: number
    to?: number
    currency?: string
  }

  interface Area {
    id: string
    name: string
  }

  interface Schedule {
    id: string
    name: string
  }

  interface BaseVacancy {
    id: string
    name: string
    area: Area
    salary?: Salary
    // employer: Employer
    alternate_url: string
    published_at: string
    created_at: string
    url: string
    employment?: { id: string, name: string }
    experience?: { id: string, name: string }
    schedule?: Schedule
    type?: { id: string, name: string }
    response_letter_required: boolean
    accept_incomplete_resumes: boolean
    internship: boolean
  }

  interface Vacancy extends BaseVacancy {
    description: string
  }

  interface SearchVacanciesResult {
    items: BaseVacancy[]
    found: number
    pages: number
    page: number
    per_page: number
    alternate_url: string
  }

  interface SearchParams {
    area?: string
    text: string
    per_page?: number
    page?: number
    clusters?: boolean
  }
}

type LoggerFn = (message?: string, ...args: unknown[]) => void
