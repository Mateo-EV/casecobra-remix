import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"
//LOGGER CONFIGURATION

import { type Logger } from "drizzle-orm/logger"

class CustomLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log({ query, params })
  }
}

const sql = neon(process.env.DATABASE_URL!)
export const db = drizzle(sql, {
  schema,
  logger: process.env.NODE_ENV === "production" ? false : new CustomLogger()
})
