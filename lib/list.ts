import { LoggerFn } from '../types'
import db from './utils/db.js'

async function list(log: LoggerFn) {
  const searchQueres = await db.query.sq.findMany()
  console.table(searchQueres)
}

export default list
