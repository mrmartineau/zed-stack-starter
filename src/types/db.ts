/** A profile as the API sends it (snake_case). */
export interface UserProfile {
  api_key: string
  avatar_url: string | null
  id: string
  updated_at: string | null
  username: string | null
}
