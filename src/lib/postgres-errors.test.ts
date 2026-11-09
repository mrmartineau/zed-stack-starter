import { describe, expect, it } from 'vitest'
import { isUniqueViolation } from './postgres-errors'

describe('isUniqueViolation', () => {
  it('finds the code on the error', () => {
    expect(isUniqueViolation({ code: '23505' })).toBe(true)
  })

  it('finds the code on a wrapped cause', () => {
    const error = new Error('Failed query', { cause: { code: '23505' } })
    expect(isUniqueViolation(error)).toBe(true)
  })

  it('is false for other Postgres errors', () => {
    expect(
      isUniqueViolation(new Error('x', { cause: { code: '23503' } })),
    ).toBe(false)
  })

  it('is false for values that are not objects', () => {
    expect(isUniqueViolation(null)).toBe(false)
    expect(isUniqueViolation('23505')).toBe(false)
  })
})
