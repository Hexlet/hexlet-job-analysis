import { Type } from '@sinclair/typebox'
import { TypeCompiler } from '@sinclair/typebox/compiler'
import ollama from 'ollama'

const SkillListType = Type.Array(Type.String())
// eslint-disable-next-line @typescript-eslint/unbound-method
const SkillListSchema = TypeCompiler.Compile(SkillListType).Schema

const prompt = [
  'Выдели из текста список технологий в чистом виде. Верни результат в виде массива json',
  'воу воу laravel же обновился до 3 версии, джанга django, orm c++',
].join('.')

export default async () => {
  // const request: GenerateRequest & { stream: true } = {
  //   prompt,
  //   model: 'phi4',
  //   stream: true,
  // }
  // const response = await ollama.generate(request)
  const response = await ollama.chat({
    model: 'phi4',
    format: SkillListSchema,
    messages: [{
      role: 'user',
      content: prompt,
    }],
  })
  console.log(prompt)
  console.log(response.message.content)
}
