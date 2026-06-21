import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import Layout    from './components/Layout'
import Login     from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import Attendance from './pages/Attendance'
import PublicAttendanceMonitor from './pages/PublicAttendanceMonitor'
import Warehouses from './pages/Warehouses'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/attendance-monitor" element={<PublicAttendanceMonitor />} />
        <Route path="/" element={<Layout />}>
          <Route index        element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="employees"  element={<Employees />} />
          <Route path="attendance" element={<Attendance />} />
          <Route path="warehouses" element={<Warehouses />} />
        </Route>
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
