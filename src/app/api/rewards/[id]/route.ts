import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// PUT update reward (claim reward)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rewardId = params.id
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId y role son requeridos' },
        { status: 400 }
      )
    }

    // Get the reward
    const reward = await db.reward.findUnique({
      where: { id: rewardId },
      include: {
        child: true
      }
    })

    if (!reward) {
      return NextResponse.json(
        { error: 'Recompensa no encontrada' },
        { status: 404 }
      )
    }

    // Only the child who owns the reward can claim it
    if (role !== 'CHILD' || reward.childId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para canjear esta recompensa' },
        { status: 403 }
      )
    }

    // Check if reward is already claimed
    if (reward.claimed) {
      return NextResponse.json(
        { error: 'Recompensa ya canjeada' },
        { status: 400 }
      )
    }

    // Check if child has enough points
    if (reward.child.points < reward.cost) {
      return NextResponse.json(
        { error: 'Puntos insuficientes' },
        { status: 400 }
      )
    }

    // Deduct points from child and mark reward as claimed
    await db.user.update({
      where: { id: userId },
      data: {
        points: {
          decrement: reward.cost
        }
      }
    })

    const updatedReward = await db.reward.update({
      where: { id: rewardId },
      data: { claimed: true }
    })

    return NextResponse.json({ 
      reward: updatedReward,
      message: '¡Recompensa canjeada exitosamente!'
    })
  } catch (error) {
    console.error('Error canjeando recompensa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE reward
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const rewardId = params.id
    const { userId, role } = await request.json()

    if (!userId || !role) {
      return NextResponse.json(
        { error: 'userId y role son requeridos' },
        { status: 400 }
      )
    }

    // Get the reward
    const reward = await db.reward.findUnique({
      where: { id: rewardId },
      include: {
        child: true
      }
    })

    if (!reward) {
      return NextResponse.json(
        { error: 'Recompensa no encontrada' },
        { status: 404 }
      )
    }

    // Only parents can delete rewards, and only for their children
    if (role !== 'PARENT' || reward.child.parentId !== userId) {
      return NextResponse.json(
        { error: 'No autorizado para eliminar esta recompensa' },
        { status: 403 }
      )
    }

    await db.reward.delete({
      where: { id: rewardId }
    })

    return NextResponse.json({ message: 'Recompensa eliminada exitosamente' })
  } catch (error) {
    console.error('Error eliminando recompensa:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}