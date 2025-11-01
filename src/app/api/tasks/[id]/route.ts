import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT update task
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id
    const { completed, userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId y role son requeridos' },
        { status: 400 }
      )
    }

    // Get the task
    const task = await db.task.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    // Check permissions
    if (role === 'PARENT' && task.parentId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para modificar esta tarea' },
        { status: 403 }
      )
    }

    if (role === 'CHILD' && task.childId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para modificar esta tarea' },
        { status: 403 }
      )
    }

    // If task is being marked as completed, add points to child
    if (completed && !task.completed) {
      await db.user.update({
        where: { id: task.childId },
        data: {
          points: {
            increment: task.points
          }
        }
      })
    }

    // If task is being marked as incomplete, remove points from child
    if (!completed && task.completed) {
      await db.user.update({
        where: { id: task.childId },
        data: {
          points: {
            decrement: task.points
          }
        }
      })
    }

    const updatedTask = await db.task.update({
      where: { id: taskId },
      data: { completed },
      include: {
        child: {
          select: { id: true, name: true }
        }
      }
    })

    return NextResponse.json({ task: updatedTask })
  } catch (error) {
    console.error('Error actualizando tarea:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE task
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const taskId = params.id
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId y role son requeridos' },
        { status: 400 }
      )
    }

    // Get the task
    const task = await db.task.findUnique({
      where: { id: taskId }
    })

    if (!task) {
      return NextResponse.json(
        { error: 'Tarea no encontrada' },
        { status: 404 }
      )
    }

    // Only parents can delete tasks
    if (role !== 'PARENT' || task.parentId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar esta tarea' },
        { status: 403 }
      )
    }

    // If task was completed, remove points from child
    if (task.completed) {
      await db.user.update({
        where: { id: task.childId },
        data: {
          points: {
            decrement: task.points
          }
        }
      })
    }

    await db.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({ message: 'Tarea eliminada exitosamente' })
  } catch (error) {
    console.error('Error eliminando tarea:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}