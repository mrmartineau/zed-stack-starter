import { describe, expect, it } from 'vitest'
import { CONTENT } from '@/constants'
import { createTitle } from './create-title'

describe('createTitle', () => {
  it('returns the app name when no page name is given', () => {
    expect(createTitle()).toEqual(CONTENT.appName)
  })

  it('looks up a CONTENT key', () => {
    expect(createTitle('signInTitle')).toEqual('Sign in — Z Stack Starter')
  })

  it('uses the text as it is when it is not a CONTENT key', () => {
    expect(createTitle('Zander')).toEqual('Zander — Z Stack Starter')
  })

  it('treats inherited object names as plain text', () => {
    expect(createTitle('toString')).toEqual('toString — Z Stack Starter')
    expect(createTitle('__proto__')).toEqual('__proto__ — Z Stack Starter')
  })
})
