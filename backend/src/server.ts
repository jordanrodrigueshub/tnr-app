import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()
app.use(express.json())

// CORS: permitir o frontend (Vercel) e localhost
const allowed = [process.env.FRONTEND_ORIGIN ?? '', 'http://localhost:5173']
app.use(cors({
  origin: (origin, cb) => cb(null, true),
  credentials: true
}))

// Healthcheck
app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`select 1`
    res.json({ ok: true, db: 'up' })
  } catch (e) {
    res.status(500).json({ ok: false, error: String(e) })
  }
})

/** -------- Catalog (Phase 1) -------- */
app.get('/api/catalog', async (_req, res) => {
  const items = await prisma.catalogItem.findMany({ orderBy: { code: 'asc' } })
  res.json(items)
})

app.post('/api/catalog', async (req, res) => {
  const { code, name, unit, defaultLaborRate, defaultMaterial } = req.body
  const created = await prisma.catalogItem.create({
    data: { code, name, unit, defaultLaborRate, defaultMaterial }
  })
  res.status(201).json(created)
})

/** -------- Estimates (Phase 1) -------- */
app.get('/api/estimates', async (_req, res) => {
  const list = await prisma.estimate.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(list)
})

app.post('/api/estimates', async (req, res) => {
  const { title, scope, status } = req.body
  const est = await prisma.estimate.create({ data: { title, scope, status: status ?? 'DRAFT' } })
  res.status(201).json(est)
})

app.get('/api/estimates/:id/items', async (req, res) => {
  const items = await prisma.estimateItem.findMany({ where: { estimateId: req.params.id } })
  res.json(items)
})

app.post('/api/estimates/:id/items', async (req, res) => {
  const { catalogCode, description, qty, unit, laborRate, material, allowance, overheadPct, markupPct } = req.body
  const created = await prisma.estimateItem.create({
    data: { estimateId: req.params.id, catalogCode, description, qty, unit, laborRate, material, allowance, overheadPct, markupPct }
  })
  res.status(201).json(created)
})

/** -------- Clients (Phase 2) -------- */
app.get('/api/clients', async (_req, res) => {
  const list = await prisma.client.findMany({ orderBy: { createdAt: 'desc' } })
  res.json(list)
})

app.post('/api/clients', async (req, res) => {
  const { name, email, phone, company } = req.body
  const c = await prisma.client.create({ data: { name, email, phone, company } })
  res.status(201).json(c)
})

/** -------- Schedules (Phase 2) -------- */
app.get('/api/schedules', async (_req, res) => {
  const list = await prisma.schedule.findMany({ orderBy: { startDate: 'desc' }, include: { client: true } })
  res.json(list)
})

app.post('/api/schedules', async (req, res) => {
  const { title, startDate, endDate, clientId, location } = req.body
  const s = await prisma.schedule.create({ data: { title, startDate: new Date(startDate), endDate: new Date(endDate), clientId, location } })
  res.status(201).json(s)
})

const port = process.env.PORT ? Number(process.env.PORT) : 3001
app.listen(port, () => console.log(`API up on :${port}`))
