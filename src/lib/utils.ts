/**
 * Calcula la edad a partir de una fecha de nacimiento
 * @param birthDate - Fecha de nacimiento (Date o string)
 * @returns Edad en años
 */
export function calculateAge(birthDate: Date | string): number {
  const birth = new Date(birthDate)
  const today = new Date()
  
  let age = today.getFullYear() - birth.getFullYear()
  const monthDiff = today.getMonth() - birth.getMonth()
  
  // Si el mes actual es anterior al mes de nacimiento, o es el mismo mes pero el día es anterior
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--
  }
  
  return age
}

/**
 * Combina nombres de clases CSS de forma condicional
 * @param inputs - Nombres de clases a combinar
 * @returns String con clases combinadas
 */
export function cn(...inputs: string[]): string {
  return inputs.filter(Boolean).join(' ')
}

/**
 * Valida que la fecha de nacimiento sea válida (no futura y no muy antigua)
 * @param birthDate - Fecha de nacimiento a validar
 * @returns Mensaje de error o null si es válida
 */
export function validateBirthDate(birthDate: string): string | null {
  const birth = new Date(birthDate)
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

const obtenerFechaDeTarea = (taskDate: string): string => {
  const fecha = new Date(taskDate)
  return fecha.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export { obtenerFechaDeTarea }