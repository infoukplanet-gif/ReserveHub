export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedTenantId } from '@/lib/auth'
import { handleApiError, ApiError } from '@/lib/api-error'
import { ALL_TEMPLATES, type TemplateType } from '@/lib/carte-template-defaults'

export async function POST(req: NextRequest) {
  try {
    const tenantId = await getAuthenticatedTenantId()
    const body = await req.json()
    const types: TemplateType[] = body.types || ['seitai', 'shinkyu']

    const created: string[] = []

    for (const type of types) {
      const def = ALL_TEMPLATES[type]
      if (!def) throw new ApiError(400, 'INVALID_TYPE', `無効なテンプレートタイプ: ${type}`)

      // 同名テンプレが既にあればスキップ
      const existing = await prisma.carteTemplate.findFirst({
        where: { tenantId, name: def.name },
      })
      if (existing) continue

      await prisma.carteTemplate.create({
        data: {
          tenantId,
          name: def.name,
          fields: {
            create: def.fields.map((f, i) => ({
              name: f.name,
              fieldType: f.fieldType,
              options: f.options || [],
              isRequired: f.isRequired,
              displayOrder: i,
            })),
          },
        },
      })
      created.push(def.name)
    }

    return NextResponse.json({ data: { created } }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
