interface ErrorWithMessage {
  message: string
}

const isErrorWithMessage = (error: unknown): error is ErrorWithMessage => {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  )
}

const toErrorWithMessage = (maybeError: unknown): ErrorWithMessage => {
  if (isErrorWithMessage(maybeError)) return maybeError

  try {
    return new Error(JSON.stringify(maybeError))
  } catch {
    // JSON.stringify throws on circular references.
    return new Error(String(maybeError))
  }
}

/** Gets readable text from any thrown value, `Error` or not. */
export const getErrorMessage = (error: unknown) => {
  return toErrorWithMessage(error).message
}
