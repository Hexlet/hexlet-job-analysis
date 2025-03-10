import ollama from 'ollama'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { Vacancy } from '../../types/index.js'
import debug from 'debug'
import { getConfig } from '../../config.js'

const log = debug('app')

// https://github.com/ollama/ollama-js/blob/main/examples/structured_outputs/structured-outputs.ts
const SkillsListSchema = z.object({
  skills: z.array(z.string()).describe('An array of skills'),
  specialty: z.string().nullable().describe('name of specialty'),
  position_level: z.string().nullable(),
})

const jsonSchema = zodToJsonSchema(SkillsListSchema)

// const client = ollama
async function requestOllama(prompt: string) {
  const response = await ollama.chat({
    model: 'openthinker',
    format: jsonSchema,
    options: {
      temperature: 0, // Make responses more deterministic
    },
    messages: [{
      role: 'user',
      content: prompt,
    }],
  })

  const result = response.message.content
  const data = SkillsListSchema.parse(JSON.parse(result))
  return data
}

async function requestChatGPT(prompt: string) {
  const config = await getConfig()
  const client = new OpenAI({
    apiKey: config.openAIApiKey,
  })

  const chatCompletion = await client.chat.completions.create({
    messages: [{ role: 'user', content: prompt }],
    response_format: {
      type: 'json_object',
      // json_schema: jsonSchema,
    },
    model: 'gpt-4o',
  })
  const result = chatCompletion.choices[0].message.content ?? ''
  const data = SkillsListSchema.parse(JSON.parse(result))
  return data
}

export async function extractSkills(vacancy: Vacancy) {
  const prompt = [
    `Extract data using format { specialty: development | devops | analytics | ... and so on, position_level: junior | middle | senior , skills: [] }.
     Determine specialty based on the vacancy's name.
     Translate everything to english. Do not use braces or slash or anything else like this.
     Remove versions. Every tool name have to be separated from the others.
     Return data as a json where skills is array, specialty is string, position_level is string`,
    `Название вакансии: ${vacancy.name}`,
    `Описание вакансии: ${vacancy.description}`,
  ].join('\n\n')

  log('extractSkills', vacancy.name)
  // return requestOllama(prompt)
  return requestChatGPT(prompt)
}
