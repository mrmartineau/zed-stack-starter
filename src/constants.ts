export const TITLE_SEPARATOR = ' — '

/** UI copy, keyed by where it shows. */
export const CONTENT = {
  appName: 'Z Stack Starter',
  signInTitle: 'Sign in',
  signOutNav: 'Sign out',
} as const

// Page routes
export const ROUTE_HOME = '/'
export const ROUTE_APP_HOME = '/app'
export const ROUTE_SIGNIN = '/login'
export const ROUTE_SIGNUP = '/sign-up'
export const ROUTE_FORGOT_PASSWORD = '/forgot-password'
export const ROUTE_UPDATE_PASSWORD = '/update-password'

// API routes
export const API_ROOT = '/api'
export const API_ME = '/api/me'
