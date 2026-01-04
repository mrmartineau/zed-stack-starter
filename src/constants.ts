export const REPO_URL = 'https://github.com/mrmartineau/react-supabase-starter'

export const ALLOW_SIGNUP = false

export const TITLE_SEPARATOR = ' — '

export const CONTENT = {
  accountNav: 'Account',
  accountSettingsTitle: 'Account, settings & integrations',
  accountTitle: 'Account',
  appName: 'React Supabase Starter',
  noItems: 'No items',
  noNewerItems: 'No newer items',
  noOlderItems: 'No older items',
  olderBtn: 'Older',
  publicNav: 'Public',
  publicTitle: 'Public',
  scrapeThisUrl: 'Scrape this URL',
  searchInputPlaceholder: 'Search',
  searchTitle: 'Search',
  settingsNav: 'Settings',
  settingsTitle: 'Settings',
  signInTitle: 'Sign in',
  signOutNav: 'Sign out',
  signupTitle: 'Register',
} as const

// Page Routes
export const ROUTE_HOME = '/'
export const ROUTE_APP_HOME = '/app'
export const ROUTE_SIGNIN = '/login'
export const ROUTE_SIGNUP = '/sign-up'

// API Routes
export const API_AUTH = '/api/auth.json'
export const API_SCRAPE = '/api/scrape'
export const API_SEARCH = '/api/search'
export const API_DEBUG = '/api/debug'

export const API_HEADERS = {
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  'Access-Control-Allow-Origin': '*',
  'Content-Type': 'application/json',
}
