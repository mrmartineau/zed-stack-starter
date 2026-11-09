/**
 * Where a form's submit is. One value, so a form cannot be "saving" and
 * "failed" at the same time.
 */
export type FormStatus =
  | { kind: 'idle' }
  | { kind: 'saving' }
  | { kind: 'error'; message: string }
