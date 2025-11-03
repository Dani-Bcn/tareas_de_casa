import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { identifier, password, loginType } = await request.json()

    if (!identifier || !password || !loginType) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    let user

    if (loginType === 'parent') {
      // Login para @adres: buscar por email
      user = await db.user.findUnique({
        where: { 
          email: identifier,
          role: 'PARENT'
        }
      })
    } else {
      // Login para niños: buscar por username
      user = await db.user.findUnique({
        where: { 
          username: identifier,
          role: 'CHILD'
        }
      })
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json(
      { 
        message: 'Login exitoso', 
        user: userWithoutPassword,
        // In a real app, you'd create a JWT token here
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error en login:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}