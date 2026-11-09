const PG_UNIQUE_VIOLATION = '23505'

/**
 * True when a Postgres unique constraint rejected the write. Drizzle wraps
 * the driver's error, so this also checks each `cause` in the chain.
 */
export const isUniqueViolation = (error: unknown): boolean => {
  if (typeof error !== 'object' || error === null) return false
  if ('code' in error && error.code === PG_UNIQUE_VIOLATION) return true
  return 'cause' in error && isUniqueViolation(error.cause)
}
