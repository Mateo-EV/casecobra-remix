import { Pool, neonConfig } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-serverless"
import * as schema from "./schema"

// WEBSOCKET CONFIGURATION
import ws from "ws"
neonConfig.webSocketConstructor = ws

//LOGGER CONFIGURATION
import { type Logger } from "drizzle-orm/logger"

class CustomLogger implements Logger {
  logQuery(query: string, params: unknown[]): void {
    console.log({ query, params })
  }
}

const pool = new Pool({
  connectionString:
    "postgresql://casecobra_owner:N0APOEmS1BXp@ep-jolly-cell-a55vpcqk-pooler.us-east-2.aws.neon.tech/casecobra?sslmode=require"
})
export const db = drizzle(pool, {
  schema,
  logger: process.env.NODE_ENV === "production" ? false : new CustomLogger()
})
