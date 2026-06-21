import React, { useState, useMemo } from 'react'
import { getEmployees } from '../api/services'
import { useApi } from '../hooks/useApi'
import { Avatar, Chip, LoadingState, EmptyState, Card } from '../components/UI'
import styles from './Employees.module.css'

export default function Employees() {
  const { data: employees = [], loading, error } = useApi(getEmployees)
  const [search,    setSearch]    = useState('')
  const [whFilter,  setWhFilter]  = useState('')

  const warehouses = useMemo(() => (
    [...new Set((employees || []).map(e => e.warehouseid).filter(Boolean))].sort()
  ), [employees])

  const filtered = useMemo(() => (
    (employees || []).filter(e => {
      const q = search.toLowerCase()
      const matchSearch = !q
        || (e.name || '').toLowerCase().includes(q)
        || (e.employeecode || '').toLowerCase().includes(q)
        || (e.attendancecode || '').toLowerCase().includes(q)
      const matchWh = !whFilter || e.warehouseid === whFilter
      return matchSearch && matchWh
    })
  ), [employees, search, whFilter])

  return (
    <div className={styles.page}>
      {/* Filters */}
      <div className={styles.filters}>
        <div className={styles.searchWrap}>
          <svg className={styles.searchIcon} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            className={styles.searchInput}
            placeholder="Search by name or code…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <select
          className={styles.select}
          value={whFilter}
          onChange={e => setWhFilter(e.target.value)}
        >
          <option value="">All Warehouses</option>
          {warehouses.map(w => <option key={w} value={w}>{w}</option>)}
        </select>
        <span className={styles.count}>
          {loading ? '…' : `${filtered.length} employee${filtered.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {error && (
        <div className={styles.errorBanner}>Could not load employees: {error}</div>
      )}

      <Card style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        {loading ? (
          <LoadingState text="Loading employees…" />
        ) : filtered.length === 0 ? (
          <EmptyState text="No employees match your search" />
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Employee Code</th>
                  <th>Attendance Code</th>
                  <th>Warehouse</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id ?? emp.employeecode} className={styles.row}>
                    <td>
                      <div className={styles.empCell}>
                        <Avatar name={emp.name} size={32} />
                        <div>
                          <div className={styles.empName}>{emp.name}</div>
                          {emp.fathername && (
                            <div className={styles.empSub}>S/O {emp.fathername}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td><code className={styles.code}>{emp.employeecode}</code></td>
                    <td><code className={styles.code}>{emp.attendancecode}</code></td>
                    <td>
                      <Chip variant="out">{emp.warehouseid || '—'}</Chip>
                    </td>
                    <td>
                      <Chip variant={emp.is_active ? 'active' : 'inactive'}>
                        {emp.is_active ? 'Active' : 'Inactive'}
                      </Chip>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
