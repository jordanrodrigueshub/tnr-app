import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  // Clients
  const clients = [
    { name: 'John Smith', email: 'john@demo.com', phone: '555-0100', company: 'Smith Holdings' },
    { name: 'Acme Restaurant Group', email: 'contact@acmerg.com', phone: '555-0200', company: 'Acme RG' },
  ]
  for (const c of clients) {
    await prisma.client.upsert({ where: { email: c.email || c.name }, update: c, create: c } as any)
  }

  // Catalog seed
  const base = [
    { code: 'DEM-DOOR', name: 'Demolition - Door', unit: 'ea', defaultLaborRate: 45, defaultMaterial: 10 },
    { code: 'FRM-WALL', name: 'Framing - Interior wall', unit: 'lf', defaultLaborRate: 65, defaultMaterial: 8 },
    { code: 'DRV-HANG', name: 'Drywall install', unit: 'sf', defaultLaborRate: 1.5, defaultMaterial: 0.8 },
    { code: 'PAI-INT', name: 'Interior painting', unit: 'sf', defaultLaborRate: 0.9, defaultMaterial: 0.4 },
    { code: 'FLR-LVP', name: 'LVP flooring install', unit: 'sf', defaultLaborRate: 2.5, defaultMaterial: 2.0 }
  ]
  for (const it of base) {
    await prisma.catalogItem.upsert({ where: { code: it.code }, update: it, create: it })
  }

  // Estimates
  const est = await prisma.estimate.create({ data: { title: 'Kitchen Remodel', scope: 'Cabinets, Countertops, Flooring' } })
  await prisma.estimateItem.create({
    data: { estimateId: est.id, catalogCode: 'FLR-LVP', description: 'Flooring LVP', qty: 500, unit: 'sf', laborRate: 2.5, material: 2.0, allowance: 300, overheadPct: 12, markupPct: 18 }
  })

  // Schedules (link to client 1)
  const cl1 = await prisma.client.findFirst({ where: { name: 'John Smith' } })
  if (cl1) {
    await prisma.schedule.create({
      data: { title: 'Kitchen demo', startDate: new Date(), endDate: new Date(Date.now()+86400000), location: 'Miami, FL', clientId: cl1.id }
    })
  }

  console.log('Seed ok')
}
main().finally(() => prisma.$disconnect())
