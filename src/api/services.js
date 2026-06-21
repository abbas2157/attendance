import axios from 'axios'
import api from './client'

const publicApi = axios.create({
  baseURL: 'https://api.bmsapp.com.pk/api',
  timeout: 15000,
})

// ── Auth ──────────────────────────────────────────────────────────────────────
export const login = (username, password) =>
  api.post('/auth/login/', { username, password })

// ── Dashboard ─────────────────────────────────────────────────────────────────
export const getDashboardStats = () =>
  api.get('/hr/stats')

// ── Employees ─────────────────────────────────────────────────────────────────
export const getEmployees = () =>
  api.get('/employees')

export const deactivateEmployee = id =>
  api.delete(`/employees/${id}/`)

export const updateEmployee = (id, data) =>
  api.patch(`/employees/${id}/`, data)

// ── Attendance ────────────────────────────────────────────────────────────────
export const getAttendanceRecords = (params = {}) =>
  api.get('/attendance/records', { params })

export const getPublicAttendanceRecords = (params = {}) =>
  publicApi.get('/attendance/records', { params })

export const getPublicEmployees = () =>
  publicApi.get('/employees')

// ── Warehouses ────────────────────────────────────────────────────────────────
export const getWarehouses = () =>
  api.get('/warehouses')
