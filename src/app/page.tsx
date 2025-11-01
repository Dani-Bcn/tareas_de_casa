'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import AppLayout from '@/components/AppLayout'

interface User {
  id: string
  name: string
  email: string
  role: 'PARENT' | 'CHILD'
  points?: number
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [loginType, setLoginType] = useState<'parent' | 'child'>('parent')

  useEffect(() => {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      setUser(JSON.parse(savedUser))
    }
    setIsCheckingAuth(false)
  }, [])

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const identifier = formData.get('identifier') as string // Puede ser email o username
    const password = formData.get('password') as string

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          identifier, 
          password,
          loginType 
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setUser(data.user)
        localStorage.setItem('user', JSON.stringify(data.user))
        alert('¡Login exitoso!')
      } else {
        alert(data.error || 'Error en el login')
      }
    } catch (error) {
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const name = formData.get('reg-name') as string
    const email = formData.get('reg-email') as string
    const password = formData.get('reg-password') as string

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          name, 
          email, 
          password, 
          role: 'parent' // Siempre es padre
        }),
      })

      const data = await response.json()

      if (response.ok) {
        alert('¡Registro exitoso! Ahora puedes iniciar sesión y agregar a tus hijos')
        // Switch to login tab
        const loginTab = document.querySelector('[value="login"]') as HTMLElement
        loginTab?.click()
      } else {
        alert(data.error || 'Error en el registro')
      }
    } catch (error) {
      alert('Error de conexión')
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen  from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  const handleLogout = () => {
    localStorage.removeItem('user')
    setUser(null)
  }

  if (user) {
    return <AppLayout user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-linear-to-r from-blue-300 to-purple-300 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-purple-600 mb-2">🌟 Tareas Mágicas</h1>
          <p className="text-gray-600">¡Completa tareas y gana recompensas!</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Bienvenido</CardTitle>
            <CardDescription className="text-center">
              Inicia sesión o regístrate como padre/madre para comenzar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Iniciar Sesión</TabsTrigger>
                <TabsTrigger value="register">Registrarse</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="space-y-4">
                  {/* Selector de tipo de login */}
                  <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
                    <Button
                      type="button"
                      variant={loginType === 'parent' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setLoginType('parent')}
                      className="flex-1"
                    >
                      👨‍👩‍👧‍👦 Padre/Madre
                    </Button>
                    <Button
                      type="button"
                      variant={loginType === 'child' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setLoginType('child')}
                      className="flex-1"
                    >
                      👶 Niño/a
                    </Button>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="identifier">
                        {loginType === 'parent' ? 'Correo Electrónico' : 'Nombre de Usuario'}
                      </Label>
                      <Input
                        id="identifier"
                        name="identifier"
                        type={loginType === 'parent' ? 'email' : 'text'}
                        placeholder={loginType === 'parent' ? 'tu@email.com' : 'tu_usuario'}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        name="password"
                        type="password"
                        placeholder="Tu contraseña"
                        required
                      />
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
                    </Button>
                  </form>
                </div>
              </TabsContent>

              <TabsContent value="register">
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reg-name">Nombre Completo</Label>
                    <Input
                      id="reg-name"
                      name="reg-name"
                      type="text"
                      placeholder="Tu nombre completo"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">Correo Electrónico</Label>
                    <Input
                      id="reg-email"
                      name="reg-email"
                      type="email"
                      placeholder="tu@email.com"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Contraseña</Label>
                    <Input
                      id="reg-password"
                      name="reg-password"
                      type="password"
                      placeholder="Crea una contraseña segura"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? 'Registrando...' : 'Registrarse como Padre/Madre'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <div className="mt-8 text-center text-sm text-gray-600">
          <p className="mb-2">🏆 Este formulario es solo para padres/madres</p>
          <p>🎈 Los niños usan la cuenta que sus padres crean para ellos</p>
          <p className="mt-2 text-xs text-gray-500">Después de registrarte, podrás agregar a tus hijos</p>
        </div>
      </div>
    </div>
  )
}