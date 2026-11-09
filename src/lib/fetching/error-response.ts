interface ErrorResponseParams {
  /** Short message the person can act on. */
  error: string
  /** What the server was doing when it failed. */
  reason: string
  status: number
}

/** JSON error in the API's `{ data, error, reason }` shape. */
export const errorResponse = ({ error, reason, status }: ErrorResponseParams) =>
  Response.json({ data: null, error, reason }, { status })
