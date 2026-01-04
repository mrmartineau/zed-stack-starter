import { Hono } from 'hono'

export const app = new Hono().basePath('/api')

app.get('/', (c) => {
  return c.text('Otter API', 200)
})

app.get('debug', (c) => {
  return c.json({
    message: 'Hello, world!',
  })
})

app.notFound((c) => {
  return c.text('Not found', 404)
})

app.onError((err, c) => {
  console.error(`${err}`)
  return c.text(err.message, 500)
})
