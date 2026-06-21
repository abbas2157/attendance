import React, { useState, useCallback, useMemo } from 'react'
import { getAttendanceRecords, getEmployees } from '../api/services'
import { useApi } from '../hooks/useApi'
import { Avatar, Chip, LoadingState, EmptyState, Card } from '../components/UI'
import { todayStr } from '../utils/helpers'
import styles from './Attendance.module.css'

export default function Attendance() {
  const { data: employees = [] } = useApi(getEmployees)
  const [date,   setDate]   = useState(todayStr())
  const [code,   setCode]   = useState('')
  const [whFilter, setWhFilter] = useState('')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')
  const [searched, setSearched] = useState(false)

  const warehouses = useMemo(() => (
    [...new Set((employees || []).map(emp => emp.warehouseid).filter(Boolean))].sort()
  ), [employees])

  const employeeWarehouseMap = useMemo(() => (
    Object.fromEntries(
      (employees || [])
        .filter(emp => emp.attendancecode)
        .map(emp => [String(emp.attendancecode).toLowerCase(), emp.warehouseid || ''])
    )
  ), [employees])

  const filteredRecords = useMemo(() => (
    (records || []).filter(record => {
      if (!whFilter) return true
      const warehouseId = employeeWarehouseMap[String(record.attendancecode || '').toLowerCase()] || ''
      return warehouseId === whFilter
    })
  ), [records, whFilter, employeeWarehouseMap])

  const load = useCallback(async () => {
    setLoading(true)
    setError('')
    setSearched(true)
    try {
      const params = { date }
      if (code.trim()) params.attendancecode = code.trim()
      const res = await getAttendanceRecords(params)
      setRecords(res.data)
    } catch (e) {
      setError(e?.response?.data?.detail || e.message || 'Failed to load records')
    } finally {
      setLoading(false)
    }
  }, [date, code])

  // Load today on mount
  React.useEffect(() => { load() }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const handleKey = e => { if (e.key === 'Enter') load() }

  return (
    <div className={styles.page}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.field}>
          <label className={styles.label}>Date</label>
          <input
            type="date"
            className={styles.input}
            value={date}
            onChange={e => setDate(e.target.value)}
            onKeyDown={handleKey}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Attendance Code</label>
          <input
            className={styles.input}
            placeholder="e.g. ATT001"
            value={code}
            onChange={e => setCode(e.target.value)}
            onKeyDown={handleKey}
            style={{ minWidth: 160 }}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Warehouse</label>
          <select
            className={styles.select}
            value={whFilter}
            onChange={e => setWhFilter(e.target.value)}
          >
            <option value="">All Warehouses</option>
            {warehouses.map(warehouse => (
              <option key={warehouse} value={warehouse}>{warehouse}</option>
            ))}
          </select>
        </div>
        <button className={styles.btnSearch} onClick={load}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          Search
        </button>
        {searched && !loading && (
          <span className={styles.count}>{filteredRecords.length} record{filteredRecords.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {error && (
        <div className={styles.errorBanner}>{error}</div>
      )}

      <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {loading ? (
          <LoadingState text="Loading attendance records…" />
        ) : searched && filteredRecords.length === 0 ? (
          <EmptyState text="No attendance records found for this date" />
        ) : !searched ? (
          <EmptyState text="Select a date and press Search" />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Code</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Duration</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.map(r => {
                  const status = r.fulltimeout ? 'out' : r.timein ? 'in' : 'absent'
                  const label  = status === 'in' ? 'On Duty' : status === 'out' ? 'Completed' : 'Absent'
                  return (
                    <tr key={r.id} className={styles.row}>
                      <td>
                        <div className={styles.empCell}>
                          <Avatar name={r.employee_name} size={30} />
                          <span className={styles.empName}>{r.employee_name}</span>
                        </div>
                      </td>
                      <td><code className={styles.code}>{r.attendancecode}</code></td>
                      <td className={styles.dateCell}>{r.date}</td>
                      <td className={r.timein ? styles.timeIn : styles.timeMissing}>
                        {r.timein || '—'}
                      </td>
                      <td className={r.fulltimeout ? styles.timeOut : styles.timeMissing}>
                        {r.fulltimeout || '—'}
                      </td>
                      <td className={styles.duration}>{r.duration || '—'}</td>
                      <td>
                        <Chip variant={status}>{label}</Chip>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
