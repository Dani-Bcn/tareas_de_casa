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
    
    <div >
 
      {/* Header */}
      <header className="bg-slate-300/0 fixed min-w-screen backdrop-blur-[10px] z-50 ">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl lg-text-3xl font-bold text-purple-600">🌟 Tareas de casa</h1>
              
            </div>            
            <Button 
              onClick={onLogout}
              variant="outline"
              className="flex items-center gap-2 cursor-pointer w-[85px] bg-slate-800 text-slate-200 text-[12px]"
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