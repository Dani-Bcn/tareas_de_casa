import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all rewards for a user
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const role = searchParams.get('role')

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId y role son requeridos' },
        { status: 400 }
      )
    }

    let rewards

    if (role === 'PARENT') {
      // Parents see all rewards for their children
      rewards = await db.reward.findMany({
        where: {
          child: {
            parentId: userId
          }
        },
        include: {
          child: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Children see only their rewards
      rewards = await db.reward.findMany({
        where: { childId: userId },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ rewards })
  } catch (error) {
    console.error('Error obteniendo recompensas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST create new reward
export async function POST(request: NextRequest) {
  try {
    const { title, description, cost, childId, parentId } = await request.json()

    if (!title || !cost || !childId || !parentId) {
      return NextResponse.json(
        { error: 'title, cost, childId y parentId son requeridos' },
        { status: 400 }
      )
    }

    // Verify parent exists
    const parent = await db.user.findUnique({
      where: { id: parentId, role: 'PARENT' }
    })

    if (!parent) {
      return NextResponse.json(
        { error: '@adre no encontrado o no autorizado' },
        { status: 404 }
      )
    }

    // Verify child exists and belongs to parent
    const child = await db.user.findUnique({
      where: { id: childId, parentId: parentId }
    })

    if (!child) {
      return NextResponse.json(
        { error: 'hij@ no encontrado o no pertenece a este @adre' },
        { status: 404 }
      )
    }

    const reward = await db.reward.create({
      data: {
        title,
        description,
        cost,
        childId
      },
      include: {
        child: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ reward }, { status: 201 })
  } catch (error) {
    console.error('Error creando recompensa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}