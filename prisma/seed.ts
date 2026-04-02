import { PrismaClient } from '../src/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter } as any)

async function main() {
  console.log('🌱 Seeding database...')

  // 1. テナント
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'bloom' },
    update: {},
    create: {
      name: 'リラクゼーションサロン BLOOM',
      slug: 'bloom',
      email: 'info@bloom-salon.com',
      phone: '03-1234-5678',
      postalCode: '150-0001',
      address: '東京都渋谷区神宮前1-2-3 ABCビル 3F',
      plan: 'standard',
      timezone: 'Asia/Tokyo',
      bookingBufferMinutes: 0,
      cancelDeadlineHours: 24,
      bookingDeadlineHours: 1,
      maxFutureDays: 60,
    },
  })
  console.log(`✅ Tenant: ${tenant.name}`)

  // 2. スタッフ
  const staff1 = await prisma.staff.create({
    data: {
      tenantId: tenant.id,
      name: '山田 花子',
      email: 'hanako@bloom-salon.com',
      phone: '090-1111-2222',
      role: 'owner',
      bio: 'お客様一人ひとりに合わせた施術を心がけています。',
      nominationFee: 500,
      displayOrder: 1,
    },
  })
  const staff2 = await prisma.staff.create({
    data: {
      tenantId: tenant.id,
      name: '佐藤 健太',
      email: 'kenta@bloom-salon.com',
      phone: '090-3333-4444',
      role: 'staff',
      bio: '丁寧な施術をモットーにしています。',
      nominationFee: 0,
      displayOrder: 2,
    },
  })
  const staff3 = await prisma.staff.create({
    data: {
      tenantId: tenant.id,
      name: '鈴木 美咲',
      email: 'misaki@bloom-salon.com',
      phone: '090-5555-6666',
      role: 'staff',
      bio: 'フェイシャルが得意です。',
      nominationFee: 500,
      displayOrder: 3,
    },
  })
  console.log(`✅ Staff: 3名`)

  // 3. メニューカテゴリ
  const catBody = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'ボディケア', displayOrder: 1 },
  })
  const catFace = await prisma.menuCategory.create({
    data: { tenantId: tenant.id, name: 'フェイシャル', displayOrder: 2 },
  })
  console.log(`✅ Categories: 2`)

  // 4. メニュー
  const menu60 = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      categoryId: catBody.id,
      name: 'ボディケア60分コース',
      description: '肩こり・腰痛にお悩みの方におすすめ。全身をくまなくほぐします。',
      durationMinutes: 60,
      bufferMinutes: 15,
      basePrice: 8000,
      displayOrder: 1,
    },
  })
  const menu90 = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      categoryId: catBody.id,
      name: 'ボディケア90分コース',
      description: 'じっくり全身ケア。慢性的な疲れに。',
      durationMinutes: 90,
      bufferMinutes: 15,
      basePrice: 11000,
      displayOrder: 2,
    },
  })
  const menuFace = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      categoryId: catFace.id,
      name: 'フェイシャル45分',
      description: '小顔・リフトアップ。むくみ解消に。',
      durationMinutes: 45,
      bufferMinutes: 10,
      basePrice: 6000,
      displayOrder: 3,
    },
  })
  const menuPremium = await prisma.menu.create({
    data: {
      tenantId: tenant.id,
      categoryId: catBody.id,
      name: 'プレミアム全身120分',
      description: '全身+フェイシャルの贅沢コース。特別な日に。',
      durationMinutes: 120,
      bufferMinutes: 15,
      basePrice: 15000,
      displayOrder: 4,
    },
  })
  console.log(`✅ Menus: 4`)

  // 5. 料金ルール（★差別化の核心）
  await prisma.pricingRule.createMany({
    data: [
      // 60分コースの料金ルール
      { menuId: menu60.id, ruleType: 'day_of_week', dayOfWeek: [1, 2, 3, 4, 5], price: 8000, label: '平日料金', priority: 1 },
      { menuId: menu60.id, ruleType: 'day_of_week', dayOfWeek: [0, 6], price: 10000, label: '休日料金', priority: 2 },
      { menuId: menu60.id, ruleType: 'day_and_time', dayOfWeek: [1, 2, 3, 4, 5], timeFrom: '18:00', timeTo: '21:00', price: 7000, label: '平日ナイト割', priority: 3 },
      // 90分コース
      { menuId: menu90.id, ruleType: 'day_of_week', dayOfWeek: [0, 6], price: 13000, label: '休日料金', priority: 1 },
      // フェイシャル
      { menuId: menuFace.id, ruleType: 'day_of_week', dayOfWeek: [0, 6], price: 7000, label: '休日料金', priority: 1 },
      // プレミアム
      { menuId: menuPremium.id, ruleType: 'day_of_week', dayOfWeek: [0, 6], price: 18000, label: '休日料金', priority: 1 },
    ],
  })
  console.log(`✅ Pricing rules: 6`)

  // 6. メニューオプション
  await prisma.menuOption.createMany({
    data: [
      { menuId: menu60.id, name: 'ヘッドスパ追加', price: 1500, durationMinutes: 15, displayOrder: 1 },
      { menuId: menu60.id, name: 'アロマ変更', price: 500, durationMinutes: 0, displayOrder: 2 },
      { menuId: menu60.id, name: '延長15分', price: 2000, durationMinutes: 15, displayOrder: 3 },
      { menuId: menu90.id, name: 'ヘッドスパ追加', price: 1500, durationMinutes: 15, displayOrder: 1 },
      { menuId: menu90.id, name: 'アロマ変更', price: 500, durationMinutes: 0, displayOrder: 2 },
      { menuId: menuFace.id, name: 'デコルテケア追加', price: 2000, durationMinutes: 15, displayOrder: 1 },
    ],
  })
  console.log(`✅ Menu options: 6`)

  // 7. スタッフ×メニュー対応
  for (const staff of [staff1, staff2, staff3]) {
    for (const menu of [menu60, menu90, menuFace, menuPremium]) {
      await prisma.staffMenu.create({
        data: { staffId: staff.id, menuId: menu.id },
      })
    }
  }
  console.log(`✅ Staff-Menu links: 12`)

  // 8. 営業時間
  await prisma.businessHour.createMany({
    data: [
      { tenantId: tenant.id, dayOfWeek: 0, openTime: '10:00', closeTime: '18:00', isClosed: false },
      { tenantId: tenant.id, dayOfWeek: 1, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { tenantId: tenant.id, dayOfWeek: 2, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { tenantId: tenant.id, dayOfWeek: 3, openTime: '10:00', closeTime: '20:00', isClosed: true },
      { tenantId: tenant.id, dayOfWeek: 4, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { tenantId: tenant.id, dayOfWeek: 5, openTime: '10:00', closeTime: '20:00', isClosed: false },
      { tenantId: tenant.id, dayOfWeek: 6, openTime: '10:00', closeTime: '18:00', isClosed: false },
    ],
  })
  console.log(`✅ Business hours: 7 days`)

  // 9. 顧客
  const customers = await Promise.all([
    prisma.customer.create({ data: { tenantId: tenant.id, name: '山田 太郎', nameKana: 'ヤマダ タロウ', email: 'yamada@example.com', phone: '090-1234-5678', totalVisits: 24, totalRevenue: 192000 } }),
    prisma.customer.create({ data: { tenantId: tenant.id, name: '佐藤 花子', nameKana: 'サトウ ハナコ', email: 'sato@example.com', phone: '080-2345-6789', totalVisits: 12, totalRevenue: 96000 } }),
    prisma.customer.create({ data: { tenantId: tenant.id, name: '田中 一郎', nameKana: 'タナカ イチロウ', email: 'tanaka@example.com', phone: '070-3456-7890', totalVisits: 3, totalRevenue: 24000 } }),
    prisma.customer.create({ data: { tenantId: tenant.id, name: '鈴木 美咲', nameKana: 'スズキ ミサキ', email: 'suzuki@example.com', phone: '090-4567-8901', totalVisits: 8, totalRevenue: 52000 } }),
    prisma.customer.create({ data: { tenantId: tenant.id, name: '高橋 遼', nameKana: 'タカハシ リョウ', email: 'takahashi@example.com', phone: '090-5678-9012', totalVisits: 5, totalRevenue: 40000 } }),
  ])
  console.log(`✅ Customers: ${customers.length}`)

  // 10. 顧客タグ
  const tagVip = await prisma.customerTag.create({ data: { tenantId: tenant.id, name: 'VIP', color: '#7C3AED' } })
  const tagTicket = await prisma.customerTag.create({ data: { tenantId: tenant.id, name: '回数券保有', color: '#2563EB' } })
  const tagNew = await prisma.customerTag.create({ data: { tenantId: tenant.id, name: '新規', color: '#16A34A' } })

  await prisma.customerTagAssignment.createMany({
    data: [
      { customerId: customers[0].id, tagId: tagVip.id },
      { customerId: customers[0].id, tagId: tagTicket.id },
      { customerId: customers[1].id, tagId: tagTicket.id },
      { customerId: customers[2].id, tagId: tagNew.id },
    ],
  })
  console.log(`✅ Tags: 3, Assignments: 4`)

  // 11. 回数券テンプレート
  const ticketTemplate = await prisma.ticketTemplate.create({
    data: {
      tenantId: tenant.id,
      name: '60分コース10回券',
      totalCount: 10,
      price: 70000,
      validMonths: 6,
      targetMenus: { create: [{ menuId: menu60.id }] },
    },
  })

  // 購入済み回数券
  await prisma.purchasedTicket.create({
    data: {
      tenantId: tenant.id,
      customerId: customers[0].id,
      ticketTemplateId: ticketTemplate.id,
      remainingCount: 5,
      expiresAt: new Date('2026-07-15'),
    },
  })
  await prisma.purchasedTicket.create({
    data: {
      tenantId: tenant.id,
      customerId: customers[1].id,
      ticketTemplateId: ticketTemplate.id,
      remainingCount: 2,
      expiresAt: new Date('2026-04-15'),
    },
  })
  console.log(`✅ Tickets: 1 template, 2 purchased`)

  // 12. 予約（過去+未来）
  const now = new Date()
  const reservations = [
    { customerId: customers[0].id, staffId: staff1.id, menuId: menu60.id, startsAt: addDays(now, 1, 10, 0), menuPrice: 10000, optionPrice: 1500, nominationFee: 500, totalPrice: 12000, status: 'confirmed' },
    { customerId: customers[1].id, staffId: staff2.id, menuId: menu90.id, startsAt: addDays(now, 1, 11, 30), menuPrice: 11000, optionPrice: 0, nominationFee: 0, totalPrice: 11000, status: 'confirmed' },
    { customerId: customers[4].id, staffId: staff3.id, menuId: menuFace.id, startsAt: addDays(now, 1, 13, 0), menuPrice: 6000, optionPrice: 0, nominationFee: 500, totalPrice: 6500, status: 'confirmed' },
    { customerId: customers[2].id, staffId: staff1.id, menuId: menu60.id, startsAt: addDays(now, 1, 14, 30), menuPrice: 8000, optionPrice: 0, nominationFee: 0, totalPrice: 8000, status: 'confirmed' },
    { customerId: customers[3].id, staffId: staff2.id, menuId: menu60.id, startsAt: addDays(now, 2, 10, 0), menuPrice: 8000, optionPrice: 500, nominationFee: 0, totalPrice: 8500, status: 'confirmed' },
    { customerId: customers[0].id, staffId: staff1.id, menuId: menu60.id, startsAt: addDays(now, -1, 10, 0), menuPrice: 8000, optionPrice: 0, nominationFee: 500, totalPrice: 8500, status: 'completed' },
    { customerId: customers[1].id, staffId: staff3.id, menuId: menuFace.id, startsAt: addDays(now, -2, 14, 0), menuPrice: 6000, optionPrice: 2000, nominationFee: 500, totalPrice: 8500, status: 'completed' },
    { customerId: customers[4].id, staffId: staff2.id, menuId: menu90.id, startsAt: addDays(now, -3, 16, 0), menuPrice: 11000, optionPrice: 0, nominationFee: 0, totalPrice: 11000, status: 'cancelled' },
  ]

  for (const r of reservations) {
    const endsAt = new Date(r.startsAt.getTime() + 75 * 60000)
    await prisma.reservation.create({
      data: {
        tenantId: tenant.id,
        customerId: r.customerId,
        staffId: r.staffId,
        menuId: r.menuId,
        startsAt: r.startsAt,
        endsAt,
        menuPrice: r.menuPrice,
        optionPrice: r.optionPrice,
        nominationFee: r.nominationFee,
        totalPrice: r.totalPrice,
        status: r.status,
        source: 'manual',
      },
    })
  }
  console.log(`✅ Reservations: ${reservations.length}`)

  // 13. カルテテンプレート
  const carteTemplate = await prisma.carteTemplate.create({
    data: {
      tenantId: tenant.id,
      name: 'ボディケアカルテ',
      fields: {
        create: [
          { name: '主訴', fieldType: 'text', isRequired: true, displayOrder: 1 },
          { name: '痛みの部位', fieldType: 'multi_select', options: ['首', '肩', '背中', '腰', '膝', '足'], isRequired: true, displayOrder: 2 },
          { name: '痛みレベル', fieldType: 'number', isRequired: true, displayOrder: 3 },
          { name: '施術内容', fieldType: 'text', isRequired: false, displayOrder: 4 },
          { name: '次回への申し送り', fieldType: 'text', isRequired: false, displayOrder: 5 },
        ],
      },
    },
  })
  console.log(`✅ Carte template: 1 (5 fields)`)

  // 14. HP設定
  await prisma.hpSetting.create({
    data: {
      tenantId: tenant.id,
      template: 'simple',
      primaryColor: '#2563EB',
      heroTitle: 'あなたの体をリセットする60分',
      heroSubtitle: '完全個室・完全予約制のリラクゼーションサロン',
      metaTitle: 'BLOOM | 渋谷のリラクゼーションサロン',
      metaDescription: '原宿駅徒歩3分。完全個室のリラクゼーションサロン。国家資格保有のスタッフが丁寧に施術いたします。',
    },
  })
  console.log(`✅ HP settings: 1`)

  console.log('\n🎉 Seed complete!')
}

function addDays(base: Date, days: number, hours: number, minutes: number): Date {
  const d = new Date(base)
  d.setDate(d.getDate() + days)
  d.setHours(hours, minutes, 0, 0)
  return d
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => pool.end())
