'use client'

import ParentDashboard from './ParentDashboard'
import ChildDashboard from './ChildDashboard'
import { Button } from '@/components/ui/button'

interface User {
  id: string
  name: string
  email: string
  role: 'PARENT' | 'CHILD'
  points?: number
}

interface AppLayoutProps {
  user: User
  onLogout: () => void
}

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  return (
    <div>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold text-purple-600">🌟 Tareas Mágicas</h1>
              <div className="flex items-center gap-2">
                <span className="text-gray-600">Bienvenido,</span>
                <span className="font-medium">{user.name}</span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  {user.role === 'PARENT' ? '👨‍👩‍👧‍👦 Padre/Madre' : '👶 Niño/a'}
                </span>
                {user.points !== undefined && (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm flex items-center gap-1">
                    ⭐ {user.points} puntos
                  </span>
                )}
              </div>
            </div>
            
            <Button 
              onClick={onLogout}
              variant="outline"
              className="flex items-center gap-2"
            >
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {user.role === 'PARENT' ? <ParentDashboard /> : <ChildDashboard />}
      </main>
    </div>
  )
}