import fs from 'fs/promises'
import path from 'path'
import pool from './db'

const getErrorMessage = (err: unknown): string => {
  if (err instanceof Error) {
    return err.message
  }

  return 'Unknown database initialization error'
}

const initDb = async (): Promise<void> => {
  try {
    if (!process.env.DATABASE_URL) {
      throw new Error('DATABASE_URL is not configured')
    }

    const schemaPath = path.join(__dirname, 'schema.sql')
    const schema = await fs.readFile(schemaPath, 'utf8')

    await pool.query(schema)
    console.log('Athlink database schema initialized successfully')
  } catch (err) {
    console.error(getErrorMessage(err))
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

void initDb()
