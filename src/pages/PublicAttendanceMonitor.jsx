import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Avatar, Card, Chip, EmptyState, LoadingState,
} from '../components/UI'
import { getPublicAttendanceRecords, getPublicEmployees } from '../api/services'
import { useApi } from '../hooks/useApi'
import { formatDate, todayStr } from '../utils/helpers'
import styles from './PublicAttendanceMonitor.module.css'

const REFRESH_OPTIONS = [
  { label: 'Off', value: '0' },
  { label: '15s', value: '15000' },
  { label: '30s', value: '30000' },
  { label: '60s', value: '60000' },
]

const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'On Duty', value: 'in' },
  { label: 'Completed', value: 'out' },
  { label: 'Missing Punch', value: 'absent' },
]

function getRecordStatus(record) {
  if (record.fulltimeout) return 'out'
  if (record.timein) return 'in'
  return 'absent'
}

function getStatusLabel(status) {
  if (status === 'in') return 'On Duty'
  if (status === 'out') return 'Completed'
  return 'Missing Punch'
}

function formatDateTime(value) {
  return value.toLocaleString('en-PK', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export default function PublicAttendanceMonitor() {
  const { data: employees = [] } = useApi(getPublicEmployees)
  const [date, setDate] = useState(todayStr())
  const [search, setSearch] = useState('')
  const [warehouse, setWarehouse] = useState('')
  const [status, setStatus] = useState('all')
  const [refreshMs, setRefreshMs] = useState('30000')
  const [records, setRecords] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState('')
  const [lastUpdated, setLastUpdated] = useState(null)
  const [now, setNow] = useState(new Date())

  const warehouses = useMemo(() => (
    [...new Set((employees || []).map(emp => emp.warehouseid).filter(Boolean))].sort()
  ), [employees])

  const employeeByAttendanceCode = useMemo(() => (
    Object.fromEntries(
      (employees || [])
        .filter(emp => emp.attendancecode)
        .map(emp => [String(emp.attendancecode).toLowerCase(), emp])
    )
  ), [employees])

  const hydratedRecords = useMemo(() => (
    (records || []).map(record => {
      const employee = employeeByAttendanceCode[String(record.attendancecode || '').toLowerCase()]
      return {
        ...record,
        warehouseid: employee?.warehouseid || '',
        employee_name: record.employee_name || employee?.name || 'Unknown Employee',
      }
    })
  ), [records, employeeByAttendanceCode])

  const filteredRecords = useMemo(() => {
    const query = search.trim().toLowerCase()

    return hydratedRecords.filter(record => {
      const recordStatus = getRecordStatus(record)
      const matchesSearch = !query
        || String(record.employee_name || '').toLowerCase().includes(query)
        || String(record.attendancecode || '').toLowerCase().includes(query)

      const matchesWarehouse = !warehouse || record.warehouseid === warehouse
      const matchesStatus = status === 'all' || recordStatus === status

      return matchesSearch && matchesWarehouse && matchesStatus
    })
  }, [hydratedRecords, search, warehouse, status])

  const stats = useMemo(() => {
    const total = filteredRecords.length
    const onDuty = filteredRecords.filter(record => getRecordStatus(record) === 'in').length
    const completed = filteredRecords.filter(record => getRecordStatus(record) === 'out').length
    const missing = filteredRecords.filter(record => getRecordStatus(record) === 'absent').length
    const visibleWarehouses = new Set(filteredRecords.map(record => record.warehouseid).filter(Boolean)).size

    return { total, onDuty, completed, missing, visibleWarehouses }
  }, [filteredRecords])

  const loadRecords = useCallback(async ({ silent = false } = {}) => {
    if (silent) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }

    setError('')

    try {
      const { data } = await getPublicAttendanceRecords({ date })
      setRecords(data)
      setLastUpdated(new Date())
    } catch (err) {
      setError(err?.response?.data?.detail || err.message || 'Failed to load attendance records')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [date])

  useEffect(() => {
    loadRecords()
  }, [loadRecords])

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const interval = Number(refreshMs)
    if (!interval) return undefined

    const id = setInterval(() => {
      loadRecords({ silent: true })
    }, interval)

    return () => clearInterval(id)
  }, [refreshMs, loadRecords])

  return (
    <div className={styles.page}>
      <div className={styles.shell}>
        <section className={styles.topSection}>
          <div className={styles.topSectionGrid}>
          <header className={styles.hero}>
            <div className={styles.heroCopy}>
              <span className={styles.kicker}>Public Security View</span>
              <h1 className={styles.title}>Attendance Monitor</h1>
              <div className={styles.heroInfoRow}>
                <div className={styles.heroInfoCard}>
                  <span className={styles.heroInfoLabel}>Date</span>
                  <strong className={styles.heroInfoValue}>{formatDate(date)}</strong>
                </div>
                <div className={styles.heroInfoCard}>
                  <span className={styles.heroInfoLabel}>Refresh</span>
                  <strong className={styles.heroInfoValue}>{REFRESH_OPTIONS.find(option => option.value === refreshMs)?.label || 'Off'}</strong>
                </div>
              </div>
            </div>

            <div className={styles.heroMeta}>
              <div className={styles.clockCard}>
                <span className={styles.clockLabel}>Current Time</span>
                <strong className={styles.clockValue}>{formatDateTime(now)}</strong>
              </div>
              <div className={styles.liveBadge}>
                <span className={styles.liveDot} />
                Public access enabled
              </div>
            </div>
          </header>

          <div className={styles.panel}>
            <div className={styles.controls}>
              <div className={styles.field}>
                <label className={styles.label}>Date</label>
                <input
                  type="date"
                  className={styles.input}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Search</label>
                <input
                  className={styles.input}
                  placeholder="Employee name or attendance code"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Warehouse</label>
                <select
                  className={styles.select}
                  value={warehouse}
                  onChange={e => setWarehouse(e.target.value)}
                >
                  <option value="">All Warehouses</option>
                  {warehouses.map(item => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Status</label>
                <select
                  className={styles.select}
                  value={status}
                  onChange={e => setStatus(e.target.value)}
                >
                  {STATUS_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Auto Refresh</label>
                <select
                  className={styles.select}
                  value={refreshMs}
                  onChange={e => setRefreshMs(e.target.value)}
                >
                  {REFRESH_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                className={styles.refreshBtn}
                onClick={() => loadRecords({ silent: hydratedRecords.length > 0 })}
                disabled={loading || refreshing}
              >
                {refreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>

            <div className={styles.metaRow}>
              <span>{filteredRecords.length} records</span>
              <span>Updated: {lastUpdated ? formatDateTime(lastUpdated) : 'Waiting for first sync'}</span>
            </div>

            <div className={styles.statsInline}>
              <div className={`${styles.statPill} ${styles.statBlue}`}>
                <span className={styles.statPillAccent} />
                <div className={styles.statPillBody}>
                  <span className={styles.statPillLabel}>Visible</span>
                  <strong className={styles.statPillValue}>{stats.total}</strong>
                  <span className={styles.statPillSub}>Filtered rows</span>
                </div>
              </div>
              <div className={`${styles.statPill} ${styles.statGreen}`}>
                <span className={styles.statPillAccent} />
                <div className={styles.statPillBody}>
                  <span className={styles.statPillLabel}>On Duty</span>
                  <strong className={styles.statPillValue}>{stats.onDuty}</strong>
                  <span className={styles.statPillSub}>Active now</span>
                </div>
              </div>
              <div className={`${styles.statPill} ${styles.statAmber}`}>
                <span className={styles.statPillAccent} />
                <div className={styles.statPillBody}>
                  <span className={styles.statPillLabel}>Completed</span>
                  <strong className={styles.statPillValue}>{stats.completed}</strong>
                  <span className={styles.statPillSub}>Checked out</span>
                </div>
              </div>
              <div className={`${styles.statPill} ${styles.statRed}`}>
                <span className={styles.statPillAccent} />
                <div className={styles.statPillBody}>
                  <span className={styles.statPillLabel}>Warehouses</span>
                  <strong className={styles.statPillValue}>{stats.visibleWarehouses}</strong>
                  <span className={styles.statPillSub}>{stats.missing} need attention</span>
                </div>
              </div>
            </div>
          </div>
          </div>
        </section>

        {error && (
          <div className={styles.errorBanner}>
            Could not load public attendance data. {error}
          </div>
        )}

        <Card style={{ overflow: 'hidden', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {loading ? (
            <LoadingState text="Loading public attendance monitor..." />
          ) : filteredRecords.length === 0 ? (
            <EmptyState text="No attendance records match the current filters." />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Warehouse</th>
                    <th>Code</th>
                    <th>Date</th>
                    <th>Check In</th>
                    <th>Check Out</th>
                    <th>Duration</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.map(record => {
                    const recordStatus = getRecordStatus(record)

                    return (
                      <tr key={`${record.id}-${record.attendancecode}-${record.date}`} className={styles.row}>
                        <td>
                          <div className={styles.employeeCell}>
                            <Avatar name={record.employee_name} size={34} />
                            <div className={styles.employeeCopy}>
                              <div className={styles.employeeName}>{record.employee_name}</div>
                              <div className={styles.employeeSub}>Attendance record</div>
                            </div>
                          </div>
                        </td>
                        <td>
                          <Chip variant="out">{record.warehouseid || 'Unassigned'}</Chip>
                        </td>
                        <td>
                          <code className={styles.code}>{record.attendancecode || '--'}</code>
                        </td>
                        <td>{formatDate(record.date)}</td>
                        <td className={record.timein ? styles.timeIn : styles.timeMissing}>{record.timein || '--'}</td>
                        <td className={record.fulltimeout ? styles.timeOut : styles.timeMissing}>{record.fulltimeout || '--'}</td>
                        <td>{record.duration || '--'}</td>
                        <td>
                          <Chip variant={recordStatus}>{getStatusLabel(recordStatus)}</Chip>
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
    </div>
  )
}
