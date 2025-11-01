'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Check, Star, Trophy, Gift, Target, Baby, Cake } from 'lucide-react'
import { calculateAge } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  points: number
  completed: boolean
}

interface Reward {
  id: string
  title: string
  description?: string
  cost: number
  claimed: boolean
}

interface Child {
  id: string
  name: string
  username: string
  points: number
  birthDate?: string
  gender?: string
}

export default function ChildDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [rewards, setRewards] = useState<Reward[]>([])
  const [user, setUser] = useState<Child | null>(null)

  // Cargar datos del usuario desde localStorage y API
  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) {
      const userData = JSON.parse(savedUser)
      setUser(userData)
      loadTasks(userData.id)
      loadRewards(userData.id)
    }
  }, [])

  const loadTasks = async (userId: string) => {
    try {
      const response = await fetch(`/api/tasks?userId=${userId}&role=CHILD`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Error cargando tareas:', error)
    }
  }

  const loadRewards = async (userId: string) => {
    try {
      const response = await fetch(`/api/rewards?userId=${userId}&role=CHILD`)
      if (response.ok) {
        const data = await response.json()
        setRewards(data.rewards)
      }
    } catch (error) {
      console.error('Error cargando recompensas:', error)
    }
  }

  const completeTask = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    if (task && !task.completed && user) {
      try {
        const response = await fetch(`/api/tasks/${taskId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            completed: true,
            userId: user.id,
            role: 'CHILD'
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setTasks(tasks.map(t => 
            t.id === taskId ? data.task : t
          ))
          // Actualizar puntos del usuario
          setUser(prev => prev ? {...prev, points: prev.points + task.points} : null)
          alert(`¡Tarea completada! +${task.points} puntos`)
        }
      } catch (error) {
        alert('Error al completar tarea')
      }
    }
  }

  const claimReward = async (rewardId: string) => {
    const reward = rewards.find(r => r.id === rewardId)
    if (reward && !reward.claimed && user && user.points >= reward.cost) {
      try {
        const response = await fetch(`/api/rewards/${rewardId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user.id,
            role: 'CHILD'
          }),
        })

        if (response.ok) {
          const data = await response.json()
          setRewards(rewards.map(r => 
            r.id === rewardId ? data.reward : r
          ))
          // Actualizar puntos del usuario
          setUser(prev => prev ? {...prev, points: prev.points - reward.cost} : null)
          alert(`¡Felicidades! Has canjeado: ${reward.title}`)
        }
      } catch (error) {
        alert('Error al canjear recompensa')
      }
    }
  }

  const getGenderIcon = (gender?: string) => {
    switch (gender) {
      case 'MALE': return '👦'
      case 'FEMALE': return '👧'
      default: return '🧒'
    }
  }

  const getChildAge = (): number => {
    return user?.birthDate ? calculateAge(user.birthDate) : 0
  }

  const completedTasks = tasks.filter(t => t.completed).length
  const totalTasks = tasks.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }
  {
    console.log(user)
  }

  return (
    <div className="min-h-screen  from-pink-50 to-blue-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-purple-600 mb-2 mt-20">🌟 Mis Tareas</h1>
          <p className="text-gray-600">
            ¡Hola {user.name}! 
            <span className="ml-2 text-2xl">{getGenderIcon(user.gender)}</span>
            {user.birthDate && (
              <span className="ml-2">
                <Cake className="w-4 h-4 inline mr-1" />
                {getChildAge()} años
              </span>
            )}
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Usuario: <span className="font-mono bg-purple-100 px-2 py-1 rounded">{user.username}</span>
          </p>
          {user.birthDate && (
            <p className="text-xs text-gray-400 mt-1">
              🎂 Fecha de nacimiento: {new Date(user.birthDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          )}
          <p className="text-sm text-gray-400 mt-1">Completa tus tareas y gana premios 🎈</p>
        </div>

        {/* Tarjeta de perfil y puntos */}
        <Card className="mb-8 bg-linear-to-r from-purple-500 to-pink-500 text-white">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
              <div>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Trophy className="w-8 h-8" />
                  {user.points}
                </div>
                <p className="text-purple-100">Mis Puntos</p>
              </div>
              
              <div>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Target className="w-8 h-8" />
                  {completedTasks}/{totalTasks}
                </div>
                <p className="text-purple-100">Tareas Completadas</p>
              </div>
              
              <div>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Star className="w-8 h-8" />
                  {progressPercentage.toFixed(0)}%
                </div>
                <p className="text-purple-100">Progreso del Día</p>
              </div>

              <div>
                <div className="text-3xl font-bold flex items-center justify-center gap-2">
                  <Baby className="w-8 h-8" />
                  {getChildAge()}
                </div>
                <p className="text-purple-100">Mi Edad</p>
              </div>
            </div>
            
            <div className="mt-4">
              <Progress value={progressPercentage} className="h-3 bg-purple-300" />
            </div>
          </CardContent>
        </Card>

        {/* Mis Tareas */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Check className="w-5 h-5 text-green-500" />
              Mis Tareas de Hoy
            </CardTitle>
            <CardDescription>¡Completa todas tus tareas para ganar más puntos!</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {tasks.length === 0 ? (
                <div className="text-center py-8">
                  <Check className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No tienes tareas asignadas hoy</p>
                  <p className="text-sm text-gray-400">¡Pídele a papá o mamá que te asigne algunas!</p>
                </div>
              ) : (
                tasks.map(task => (
                  <div key={task.id} className={`border rounded-lg p-4 ${task.completed ? 'bg-green-50 border-green-200' : 'bg-white'}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                            {task.title}
                          </h4>
                          <Badge variant={task.completed ? "secondary" : "default"}>
                            {task.completed ? "✅ Completada" : "⏳ Pendiente"}
                          </Badge>
                          <Badge variant="outline" className="flex items-center gap-1">
                            <Star className="w-3 h-3" />
                            {task.points} pts
                          </Badge>
                        </div>
                        {task.description && (
                          <p className="text-sm text-gray-600">{task.description}</p>
                        )}
                      </div>
                      
                      {!task.completed && (
                        <Button
                          onClick={() => completeTask(task.id)}
                          className="ml-4 bg-green-500 hover:bg-green-600"
                        >
                          <Check className="w-4 h-4 mr-2" />
                          ¡Completar!
                        </Button>
                      )}
                      
                      {task.completed && (
                        <div className="ml-4 text-green-500 font-bold">
                          ¡Listo! +{task.points} ⭐
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recompensas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Gift className="w-5 h-5 text-pink-500" />
              Mis Recompensas
            </CardTitle>
            <CardDescription>Usa tus puntos para canjear premios increíbles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
              {rewards.length === 0 ? (
                <div className="text-center py-8 col-span-2">
                  <Gift className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No hay recompensas disponibles</p>
                  <p className="text-sm text-gray-400">¡Pídele a papá o mamá que agregue algunas!</p>
                </div>
              ) : (
                rewards.map(reward => (
                  <div key={reward.id} className={`border rounded-lg p-4 ${reward.claimed ? 'bg-gray-50 border-gray-200' : 'bg-white'}`}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className={`font-medium ${reward.claimed ? 'line-through text-gray-500' : ''}`}>
                        {reward.title}
                      </h4>
                      <Badge variant="outline" className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {reward.cost} pts
                      </Badge>
                    </div>
                    
                    {reward.description && (
                      <p className="text-sm text-gray-600 mb-3">{reward.description}</p>
                    )}
                    
                    {reward.claimed ? (
                      <Button disabled className="w-full">
                        ✅ Ya canjeado
                      </Button>
                    ) : user.points >= reward.cost ? (
                      <Button 
                        onClick={() => claimReward(reward.id)}
                        className="w-full bg-pink-500 hover:bg-pink-600"
                      >
                        🎁 Canjear Premio
                      </Button>
                    ) : (
                      <Button disabled className="w-full">
                        Necesitas {reward.cost - user.points} puntos más
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}