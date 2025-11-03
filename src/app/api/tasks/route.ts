import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET all tasks for a user
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

    let tasks

    if (role === 'PARENT') {
      // Parents see all tasks they created
      tasks = await db.task.findMany({
        where: { parentId: userId },
        include: {
          child: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } else {
      // Children see only their tasks
      tasks = await db.task.findMany({
        where: { childId: userId },
        include: {
          parent: {
            select: { id: true, name: true }
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    }

    return NextResponse.json({ tasks })
  } catch (error) {
    console.error('Error obteniendo tareas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST create new task
export async function POST(request: NextRequest) {
  try {
    const { title, description, points, childId, parentId } = await request.json()

    if (!title || !childId || !parentId) {
      return NextResponse.json(
        { error: 'title, childId y parentId son requeridos' },
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

    const task = await db.task.create({
      data: {
        title,
        description,
        points: points || 10,
        childId,
        parentId
      },
      include: {
        child: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ task }, { status: 201 })
  } catch (error) {
    console.error('Error creando tarea:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}