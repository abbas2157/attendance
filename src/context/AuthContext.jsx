import React, { createContext, useContext, useState, useEffect } from 'react'
import { login as apiLogin } from '../api/services'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('bms_user')
    const token  = localStorage.getItem('bms_access')
    if (stored && token) setUser(JSON.parse(stored))
    setLoading(false)
  }, [])

  const login = async (username, password) => {
    const { data } = await apiLogin(username, password)
    const userData = { username, role: 'HR Administrator' }
    localStorage.setItem('bms_access',  data.access)
    localStorage.setItem('bms_refresh', data.refresh)
    localStorage.setItem('bms_user',    JSON.stringify(userData))
    setUser(userData)
    return userData
  }

  const logout = () => {
    localStorage.removeItem('bms_access')
    localStorage.removeItem('bms_refresh')
    localStorage.removeItem('bms_user')
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
