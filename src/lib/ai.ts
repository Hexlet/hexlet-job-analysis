import dotenv from 'dotenv'
import ollama from 'ollama'
import OpenAI from 'openai'
import { z } from 'zod'
import { zodToJsonSchema } from 'zod-to-json-schema'
import { Vacancy } from '../../types/index.js'
import debug from 'debug'

// TODO: Если работать напрямую с openai key, то он почему-то обрезается
const envs = dotenv.config().parsed ?? {}

const log = debug('app')

// https://github.com/ollama/ollama-js/blob/main/examples/structured_outputs/structured-outputs.ts
const SkillsListSchema = z.object({
  skills: z.array(z.string()).describe('An array of skills'),
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
  return data.skills
}

async function requestChatGPT(prompt: string) {
  const client = new OpenAI({
    apiKey: envs.OPENAI_API_KEY,
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
  return data.skills
}

export async function extractSkills(vacancy: Vacancy) {
  const prompt = [
    'Extract a list of programming tools mentioned in the following text. Do not use braces or slash or anything else like this. Every tool name have to be separated from the others. Return only the skills as a json { skills: [...] }',
    vacancy.description,
  ].join('\n\n')

  log('extractSkills', vacancy.name)
  // return requestOllama(prompt)
  return requestChatGPT(prompt)
}
