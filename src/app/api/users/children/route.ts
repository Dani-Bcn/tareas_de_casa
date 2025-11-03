import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

// GET children for a parent
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const parentId = searchParams.get('parentId')

    if (!parentId) {
      return NextResponse.json(
        { error: 'parentId es requerido' },
        { status: 400 }
      )
    }

    // Verify parent exists
    const parent = await db.user.findUnique({
      where: { id: parentId, role: 'PARENT' }
    })

    if (!parent) {
      return NextResponse.json(
        { error: '@adre no encontrado' },
        { status: 404 }
      )
    }

    const children = await db.user.findMany({
      where: { parentId: parentId },
      select: {
        id: true,
        name: true,
        username: true,
        points: true,
        birthDate: true,
        createdAt: true
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json({ children })
  } catch (error) {
    console.error('Error obteniendo hij@s:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST add child to parent
export async function POST(request: NextRequest) {
  try {
    const { name, username, password, birthDate,  parentId } = await request.json()

    if (!name || !username || !password || !birthDate || !parentId) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validar contraseña segura
    const validatePassword = (pwd: string): string | null => {
      // Mínimo 6 caracteres
      if (pwd.length < 6) {
        return 'La contraseña debe tener al menos 6 caracteres'
      }
      
      // Al menos una letra
      if (!/[a-zA-Z]/.test(pwd)) {
        return 'La contraseña debe tener al menos una letra'
      }
      
      // Al menos un número
      if (!/\d/.test(pwd)) {
        return 'La contraseña debe tener al menos un número'
      }
      
      // Al menos un carácter especial
      if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) {
        return 'La contraseña debe tener al menos un carácter especial (!@#$%^&*...)'
      }
      
      return null
    }

    const passwordValidationError = validatePassword(password)
    if (passwordValidationError) {
      return NextResponse.json(
        { error: passwordValidationError },
        { status: 400 }
      )
    }

    // Validar fecha de nacimiento
    const validateBirthDate = (date: string): string | null => {
      const birth = new Date(date)
      const today = new Date()
      
      // Verificar que la fecha no sea futura
      if (birth > today) {
        return 'La fecha de nacimiento no puede ser futura'
      }
      
      // Verificar que no sea muy antigua (más de 100 años)
      const maxAge = new Date()
      maxAge.setFullYear(maxAge.getFullYear() - 100)
      
      if (birth < maxAge) {
        return 'La fecha de nacimiento no es válida'
      }
      
      // Verificar que no sea menor de 3 años
      const minAge = new Date()
      minAge.setFullYear(minAge.getFullYear() - 3)
      
      if (birth > minAge) {
        return 'El niño debe tener al menos 3 años'
      }
      
      // Verificar que no sea mayor de 18 años
      const maxChildAge = new Date()
      maxChildAge.setFullYear(maxChildAge.getFullYear() - 18)
      
      if (birth < maxChildAge) {
        return 'La edad máxima para niños es 18 años'
      }
      
      return null
    }

    const birthDateValidationError = validateBirthDate(birthDate)
    if (birthDateValidationError) {
      return NextResponse.json(
        { error: birthDateValidationError },
        { status: 400 }
      )
    }

    // Verify parent exists
    const parent = await db.user.findUnique({
      where: { id: parentId, role: 'PARENT' }
    })

    if (!parent) {
      return NextResponse.json(
        { error: '@adre no encontrado' },
        { status: 404 }
      )
    }

    // Check if username already exists
    const existingUser = await db.user.findFirst({
      where: { 
        OR: [
          { username: username },
          { email: username } // Por si acaso alguien usa email como username
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El nombre de usuari@ ya está en uso' },
        { status: 400 }
      )
    }

  

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create child
    const child = await db.user.create({
      data: {
        name,
        username: username,
        password: hashedPassword,
        role: 'CHILD',
        parentId: parentId,
        birthDate: new Date(birthDate),
      },
      select: {
        id: true,
        name: true,
        username: true,
        points: true,
        birthDate: true,
        createdAt: true
      }
    })

    return NextResponse.json({ 
      child,
      message: 'hij@ agregado exitosamente'
    }, { status: 201 })
  } catch (error) {
    console.error('Error agregando hij@:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}