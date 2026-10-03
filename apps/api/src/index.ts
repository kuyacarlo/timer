import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { z } from 'zod'

type TimerRow = {
  id: string
  duration_seconds: number
  started_at: string
  ends_at: string | null
}

const app = new Hono<{ Bindings: Env }>()
const createTimerSchema = z.object({ endsAt: z.iso.datetime() }).refine(
  ({ endsAt }) => Date.parse(endsAt) > Date.now(),
  { message: 'Choose an end time in the future.' },
)
const timerSchema = z.object({
  id: z.string(),
  endsAt: z.iso.datetime(),
  remainingSeconds: z.number().int().min(0),
})

app.use('/api/*', cors())

app.get('/health', (c) => c.json({ status: 'ok', service: 'api' }))

app.post('/api/timers', async (c) => {
  const input = createTimerSchema.safeParse(await c.req.json().catch(() => null))
  if (!input.success) return c.json({ error: 'Choose an end time later than now.' }, 400)

  const startedAt = new Date()
  const endAt = new Date(input.data.endsAt)
  const timer = { id: crypto.randomUUID(), startedAt, endAt }
  await c.env.DB.prepare(
    'INSERT INTO timers (id, duration_seconds, started_at, ends_at) VALUES (?, ?, ?, ?)',
  ).bind(
    timer.id,
    Math.ceil((endAt.getTime() - startedAt.getTime()) / 1000),
    startedAt.toISOString(),
    endAt.toISOString(),
  ).run()

  return c.json(serializeTimer({ id: timer.id, endsAt: endAt.toISOString() }), 201)
})

app.get('/api/timers/:id', async (c) => {
  const timer = await c.env.DB.prepare(
    'SELECT id, duration_seconds, started_at, ends_at FROM timers WHERE id = ? LIMIT 1',
  ).bind(c.req.param('id')).first<TimerRow>()
  if (!timer) return c.json({ error: 'Timer not found' }, 404)

  const endsAt = timer.ends_at ?? new Date(
    Date.parse(timer.started_at) + timer.duration_seconds * 1000,
  ).toISOString()
  return c.json(serializeTimer({ id: timer.id, endsAt }))
})

app.notFound((c) => c.env.ASSETS.fetch(c.req.raw))

function serializeTimer(timer: { id: string; endsAt: string }) {
  const endsAt = new Date(timer.endsAt)
  return timerSchema.parse({
    id: timer.id,
    endsAt: endsAt.toISOString(),
    remainingSeconds: Math.max(0, Math.ceil((endsAt.getTime() - Date.now()) / 1000)),
  })
}

export default app
