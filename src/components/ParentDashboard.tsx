'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Plus, Check, X, Star, Trophy, UserPlus, Baby, Calendar } from 'lucide-react'
import { calculateAge, validateBirthDate } from '@/lib/utils'

interface Task {
  id: string
  title: string
  description?: string
  points: number
  completed: boolean
  childId: string
  childName: string
   child?: {
    id: string
    name: string
  }
}

interface Child {
  id: string
  name: string
  username: string
  points: number
  birthDate?: string
  gender?: string
}

export default function ParentDashboard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [children, setChildren] = useState<Child[]>([])
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [showChildForm, setShowChildForm] = useState(false)
  const [selectedChild, setSelectedChild] = useState('')
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    points: 10
  })
  const [newChild, setNewChild] = useState({
    name: '',
    username: '',
    password: '',
    birthDate: '',
    gender: ''
  })
  const [passwordError, setPasswordError] = useState('')
  const [isPasswordValid, setIsPasswordValid] = useState(false)
  const [birthDateError, setBirthDateError] = useState('')

  // Cargar hijos desde la API
  useEffect(() => {
    loadChildren()
  }, [])

  const loadChildren = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch(`/api/users/children?parentId=${user.id}`)
      if (response.ok) {
        const data = await response.json()
        setChildren(data.children)
      }
    } catch (error) {
      console.error('Error cargando hijos:', error)
    }
  }

  const loadTasks = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch(`/api/tasks?userId=${user.id}&role=PARENT`)
      if (response.ok) {
        const data = await response.json()
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('Error cargando tareas:', error)
    }
  }

  useEffect(() => {
    if (children.length > 0) {
      loadTasks()
    }
  }, [children])

  const validatePassword = (password: string): boolean => {
    // Mínimo 6 caracteres
    if (password.length < 6) {
      return false
    }
    
    // Al menos una letra
    if (!/[a-zA-Z]/.test(password)) {
      return false
    }
    
    // Al menos un número
    if (!/\d/.test(password)) {
      return false
    }
    
    // Al menos un carácter especial
    if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return false
    }
    
    return true
  }

  const getPasswordError = (password: string): string => {
    // Mínimo 6 caracteres
    if (password.length > 0 && password.length < 6) {
      return 'La contraseña debe tener al menos 6 caracteres'
    }
    
    // Al menos una letra
    if (password.length > 0 && !/[a-zA-Z]/.test(password)) {
      return 'La contraseña debe tener al menos una letra'
    }
    
    // Al menos un número
    if (password.length > 0 && !/\d/.test(password)) {
      return 'La contraseña debe tener al menos un número'
    }
    
    // Al menos un carácter especial
    if (password.length > 0 && !/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
      return 'La contraseña debe tener al menos un carácter especial (!@#$%^&*...)'
    }
    
    return ''
  }

  const handleCreateChild = async () => {
    if (!newChild.name || !newChild.username || !newChild.password || !newChild.birthDate || !newChild.gender) {
      alert('Por favor completa todos los campos')
      return
    }

    // Validar contraseña
    if (!isPasswordValid) {
      const error = getPasswordError(newChild.password)
      alert(error || 'La contraseña no cumple con los requisitos')
      return
    }

    // Validar fecha de nacimiento
    const birthDateValidationError = validateBirthDate(newChild.birthDate)
    if (birthDateValidationError) {
      alert(birthDateValidationError)
      return
    }

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch('/api/users/children', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newChild.name,
          username: newChild.username,
          password: newChild.password,
          birthDate: newChild.birthDate,
          gender: newChild.gender,
          parentId: user.id
        }),
      })

      const data = await response.json()

      if (response.ok) {
        const childAge = calculateAge(newChild.birthDate)
        alert(`¡Hijo agregado exitosamente!\n\nDatos para iniciar sesión:\nUsuario: ${newChild.username}\nContraseña: ${newChild.password}\nEdad: ${childAge} años`)
        setNewChild({ name: '', username: '', password: '', birthDate: '', gender: '' })
        setPasswordError('')
        setIsPasswordValid(false)
        setBirthDateError('')
        setShowChildForm(false)
        loadChildren()
      } else {
        alert(data.error || 'Error al agregar hijo')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const handleCreateTask = async () => {
    if (!selectedChild || !newTask.title) return

    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: newTask.title,
          description: newTask.description,
          points: newTask.points,
          childId: selectedChild,
          parentId: user.id
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks([...tasks, data.task])
        setNewTask({ title: '', description: '', points: 10 })
        setSelectedChild('')
        setShowTaskForm(false)
      } else {
        const errorData = await response.json()
        alert(errorData.error || 'Error al crear tarea')
      }
    } catch (error) {
      alert('Error de conexión')
    }
  }

  const toggleTaskComplete = async (taskId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const task = tasks.find(t => t.id === taskId)
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !task?.completed,
          userId: user.id,
          role: 'PARENT'
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setTasks(tasks.map(task => 
          task.id === taskId ? data.task : task
        ))
        // Recargar hijos para actualizar puntos
        loadChildren()
      }
    } catch (error) {
      alert('Error al actualizar tarea')
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}')
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user.id,
          role: 'PARENT'
        }),
      })

      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== taskId))
        loadChildren()
      }
    } catch (error) {
      alert('Error al eliminar tarea')
    }
  }

  const getGenderIcon = (gender?: string) => {
    switch (gender) {
      case 'MALE': return '👦'
      case 'FEMALE': return '👧'
      default: return '🧒'
    }
  }

  const getChildAge = (child: Child): number => {
    return child.birthDate ? calculateAge(child.birthDate) : 0
  }
  console.log(tasks)

  return (
    <div className="min-h-screen  from-blue-50 to-purple-500 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 mt-20">
          <h1 className="text-3xl font-bold text-purple-600 mb-2">🏆 Panel de Padres</h1>
          <p className="text-gray-600">Gestiona las tareas y recompensas de tus hijos</p>
        </div>

        {/* Sección de hijos */}
        <Card className="mb-8 bg-linear-to-r from-blue-300 to-purple-300">
          <CardHeader >
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Baby className="w-5 h-5" />
                  Mis Hijos
                </CardTitle>
                <CardDescription>Agrega y gestiona las cuentas de tus hijos</CardDescription>
              </div>
              <Button 
                onClick={() => setShowChildForm(!showChildForm)}
                className="flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Agregar Hijo
              </Button>
            </div>
          </CardHeader>
          
          {showChildForm && (
            <CardContent className="border-t ">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="child-name">Nombre Completo</Label>
                  <Input
                    value={newChild.name}
                    onChange={(e) => setNewChild({...newChild, name: e.target.value})}
                    placeholder="Ej: Ana María"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="child-username">Nombre de Usuario</Label>
                  <Input
                    value={newChild.username}
                    onChange={(e) => setNewChild({...newChild, username: e.target.value})}
                    placeholder="Ej: ana123"
                  />
                  <p className="text-xs text-gray-500">Este será el usuario para iniciar sesión</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="child-password">Contraseña</Label>
                  <Input
                    type="password"
                    value={newChild.password}
                    onChange={(e) => {
                      const newPassword = e.target.value
                      setNewChild({...newChild, password: newPassword})
                      
                      // Validar contraseña y actualizar estados
                      const isValid = validatePassword(newPassword)
                      setIsPasswordValid(isValid)
                      
                      if (newPassword) {
                        const error = getPasswordError(newPassword)
                        setPasswordError(error)
                      } else {
                        setPasswordError('')
                      }
                    }}
                    placeholder="Ej: Ana123!"
                    className={passwordError ? 'border-red-500' : ''}
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">Dale esta contraseña a tu hijo para que inicie sesión</p>
                    <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                      <p className="font-medium mb-1">Requisitos de contraseña:</p>
                      <ul className="space-y-1">
                        <li className={`flex items-center gap-1 ${newChild.password.length >= 6 ? 'text-green-600' : 'text-gray-500'}`}>
                          {newChild.password.length >= 6 ? '✓' : '○'} Mínimo 6 caracteres
                        </li>
                        <li className={`flex items-center gap-1 ${/[a-zA-Z]/.test(newChild.password) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[a-zA-Z]/.test(newChild.password) ? '✓' : '○'} Al menos una letra
                        </li>
                        <li className={`flex items-center gap-1 ${/\d/.test(newChild.password) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/\d/.test(newChild.password) ? '✓' : '○'} Al menos un número
                        </li>
                        <li className={`flex items-center gap-1 ${/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newChild.password) ? 'text-green-600' : 'text-gray-500'}`}>
                          {/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newChild.password) ? '✓' : '○'} Al menos un carácter especial
                        </li>
                      </ul>
                    </div>
                    {passwordError && (
                      <p className="text-xs text-red-500 flex items-center gap-1">
                        <span>⚠️</span> {passwordError}
                      </p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="child-birthdate">Fecha de Nacimiento</Label>
                  <Input
                    type="date"
                    value={newChild.birthDate}
                    onChange={(e) => {
                      setNewChild({...newChild, birthDate: e.target.value})
                      if (e.target.value) {
                        const error = validateBirthDate(e.target.value)
                        setBirthDateError("error")
                      } else {
                        setBirthDateError('')
                      }
                    }}
                    max={new Date().toISOString().split('T')[0]} // Máximo hoy
                    className={birthDateError ? 'border-red-500' : ''}
                  />
                  {birthDateError && (
                    <p className="text-xs text-red-500 flex items-center gap-1">
                      <span>⚠️</span> {birthDateError}
                    </p>
                  )}
                  <p className="text-xs text-gray-500">Esta fecha se usará para calcular la edad automáticamente</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="child-gender">Género</Label>
                  <Select value={newChild.gender} onValueChange={(value) => setNewChild({...newChild, gender: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona género" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">👦 Niño</SelectItem>
                      <SelectItem value="FEMALE">👧 Niña</SelectItem>
                      <SelectItem value="OTHER">🧒 Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="md:col-span-2 flex gap-2">
                  <Button 
                    onClick={handleCreateChild} 
                    disabled={
                      !newChild.name || 
                      !newChild.username || 
                      !newChild.password || 
                      !newChild.birthDate || 
                      !newChild.gender ||
                      !!passwordError ||
                      !!birthDateError ||
                      !isPasswordValid
                    }
                  >
                    Agregar Hijo
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setShowChildForm(false)
                    setPasswordError('')
                    setIsPasswordValid(false)
                    setBirthDateError('')
                  }}>
                    Cancelar
                  </Button>
                </div>
              </div>
            </CardContent>
          )}

          <CardContent>
            {children.length === 0 ? (
              <div className="text-center py-8">
                <Baby className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No tienes hijos agregados todavía</p>
                <p className="text-sm text-gray-400 ">Haz clic en "Agregar Hijo" para comenzar</p>
              </div>
            ) : (
              <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 duration-500 gap-4">
                {children.map(child => (
                  <Card key={child.id} className="bg-linear-to-t  hover:shadow-xl/30 duration-250 from-green-100 to-slate-100  border-purple-200">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-2xl">{getGenderIcon(child.gender)}</span>
                          <span>{child.name}</span>
                        </div>
                        <Trophy className="w-5 h-5 text-yellow-500" />
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-purple-600">{child.points}</div>
                        <p className="text-sm text-gray-600">puntos acumulados</p>
                        <p className="text-sm text-gray-500">Edad: {getChildAge(child)} años</p>
                        <p>Tareas pendientes</p>
                        {tasks.filter(task => task.childId === child.id && !task.completed).length === 0 ? (
                          <p className="text-sm text-gray-500">No hay tareas pendientes</p>
                        ) : (
                          <ul className="list-disc list-inside text-sm text-gray-700">
                            {tasks.filter(task => task.childId === child.id && !task.completed).map(task => (
                              <li key={task.id}>{task.title} - {task.points} pts</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Crear nueva tarea - Solo mostrar si hay hijos */}
        {children.length > 0 && (
          <Card className="mb-8 clear-start bg-linear-to-r from-blue-300 to-purple-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>📝 Gestión de Tareas</CardTitle>
                  <CardDescription>Asigna nuevas tareas a tus hijos</CardDescription>
                </div>
                <Button 
                  onClick={() => setShowTaskForm(!showTaskForm)}
                  className="flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Tarea
                </Button>
              </div>
            </CardHeader>
            
            {showTaskForm && (
              <CardContent className="border-t">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="child">Hijo</Label>
                    <Select value={selectedChild} onValueChange={setSelectedChild}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un hijo" />
                      </SelectTrigger>
                      <SelectContent>
                        {children.map(child => (
                          <SelectItem key={child.id} value={child.id}>
                            {getGenderIcon(child.gender)} {child.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="points">Puntos</Label>
                    <Input
                      type="number"
                      value={newTask.points}
                      onChange={(e) => setNewTask({...newTask, points: parseInt(e.target.value) || 0})}
                      min="1"
                      max="100"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="title">Título de la tarea</Label>
                    <Input
                      value={newTask.title}
                      onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                      placeholder="Ej: Ordenar la habitación"
                    />
                  </div>
                  
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="description">Descripción (opcional)</Label>
                    <Textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                      placeholder="Describe los detalles de la tarea..."
                      rows={3}
                    />
                  </div>
                  
                  <div className="md:col-span-2 flex gap-2">
                    <Button onClick={handleCreateTask} disabled={!selectedChild || !newTask.title}>
                      Crear Tarea
                    </Button>
                    <Button variant="outline" onClick={() => setShowTaskForm(false)}>
                      Cancelar
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* Lista de tareas - Solo mostrar si hay hijos */}
        {children.length > 0 && (
          <Card className='bg-linear-to-r from-blue-300 to-purple-300'>
            <CardHeader>
              <CardTitle>📋 Tareas Activas</CardTitle>
              <CardDescription>Revisa y gestiona las tareas asignadas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {tasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No hay tareas asignadas todavía</p>
                ) : (
                  tasks.map((task) => (
                    <div key={task.id} className="border rounded-lg p-4 bg-white bg-linear-to-t from-orange-200   to-slate-100">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className={`font-medium ${task.completed ? 'line-through text-gray-500' : ''}`}>
                              {task.title}
                            </h4>
                            <Badge variant={task.completed ? "secondary" : "default"}>
                              {task.completed ? "Completada" : "Pendiente"}
                            </Badge>
                            <Badge variant="outline" className="flex items-center gap-1">
                              <Star className="w-3 h-3" />
                              {task.points} pts
                            </Badge>
                          </div>
                          {task.description && (
                            <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                          )}{
                            tasks && (
                                <p className="text-sm text-gray-500">Asignada a: {task.child?.name}</p>
                            )
                          }
                        
                        </div>
                        
                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant={task.completed ? "outline" : "default"}
                            onClick={() => toggleTaskComplete(task.id)}
                            className="flex items-center gap-1"
                          >
                            {task.completed ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                            {task.completed ? "Deshacer" : "Completar"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => deleteTask(task.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensaje cuando no hay hijos */}
        {children.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <Baby className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 mb-2">¡Comienza Agregando un Hijo!</h3>
              <p className="text-gray-500">Para crear tareas y recompensas, primero necesitas agregar al menos un hijo a tu cuenta.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}