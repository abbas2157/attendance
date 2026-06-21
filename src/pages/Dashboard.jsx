import React, { useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats } from '../api/services'
import { useApi } from '../hooks/useApi'
import {
  StatCard, Card, SectionHead, LoadingState, EmptyState, Avatar, Chip,
} from '../components/UI'
import styles from './Dashboard.module.css'

/* ── Icons ─────────────────────────────────────────────────────────────────── */
const IconUsers = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="9" cy="7" r="4"/><path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
  </svg>
)
const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
)
const IconClock = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
)
const IconX = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/>
    <line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
  </svg>
)

/* ── Dashboard ─────────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const navigate = useNavigate()
  const { data, loading, error, reload } = useApi(getDashboardStats)

  // Auto-refresh every 60 seconds
  useEffect(() => {
    const id = setInterval(reload, 60_000)
    return () => clearInterval(id)
  }, [reload])

  const d = data || {}
  const total   = d.total_employees   ?? 0
  const present = d.present_today     ?? 0
  const absent  = d.absent_today      ?? 0
  const checkin = d.checked_in        ?? 0
  const checkout= d.checked_out       ?? 0
  const rate    = total ? Math.round(present / total * 100) : 0

  return (
    <div>
      {/* KPI Cards */}
      <div className={styles.statsGrid}>
        {loading ? (
          <div style={{ gridColumn: '1/-1' }}><LoadingState text="Loading stats…" /></div>
        ) : (
          <>
            <StatCard label="Total Employees" value={total}   sub="Active staff members"          color="blue"  icon={<IconUsers />} />
            <StatCard label="Present Today"   value={present} sub={`${rate}% attendance rate`}    color="green" icon={<IconCheck />} />
            <StatCard label="Currently In"    value={checkin} sub="On duty right now"              color="amber" icon={<IconClock />} />
            <StatCard label="Absent Today"    value={absent}  sub={`${checkout} already checked out`} color="red" icon={<IconX />} />
          </>
        )}
      </div>

      {error && (
        <div className={styles.errorBanner}>
          Could not reach the server — showing cached data. ({error})
        </div>
      )}

     

      {/* Activity + Warehouse */}
      <div className={styles.grid}>
        <Card>
          <SectionHead
            title="Recent Activity"
            action="View all records"
            onAction={() => navigate('/attendance')}
          />
          <ActivityFeed items={d.recent_activity || []} loading={loading} />
        </Card>

        <Card>
          <SectionHead title="By Warehouse" />
          <WarehouseBars
            stats={d.warehouse_stats || []}
            total={present}
            loading={loading}
          />
          {d.last_updated && (
            <p className={styles.lastUpdated}>Last updated: {d.last_updated}</p>
          )}
        </Card>
      </div>
    </div>
  )
}

/* ── Activity feed ──────────────────────────────────────────────────────────── */
function ActivityFeed({ items, loading }) {
  if (loading) return <LoadingState />
  if (!items.length) return <EmptyState text="No activity today" />
  return (
    <ul className={styles.activityList}>
      {items.slice(0, 8).map((a, i) => {
        const isIn = a.action?.toLowerCase().includes('in')
        return (
          <li key={i} className={styles.activityItem}>
            <div className={`${styles.actIcon} ${isIn ? styles.actIn : styles.actOut}`}>
              {isIn ? '→' : '←'}
            </div>
            <div className={styles.actBody}>
              <div className={styles.actName}>{a.name}</div>
              <div className={styles.actAction}>{a.action}</div>
            </div>
            <Chip variant={isIn ? 'out' : 'out'}>{a.warehouse || '—'}</Chip>
            <span className={styles.actTime}>{a.time}</span>
          </li>
        )
      })}
    </ul>
  )
}

/* ── Warehouse bars ─────────────────────────────────────────────────────────── */
function WarehouseBars({ stats, total, loading }) {
  if (loading) return <LoadingState />
  if (!stats.length) return <EmptyState text="No warehouse data" />
  const max = Math.max(...stats.map(s => s.present), 1)
  return (
    <div className={styles.wbList}>
      {stats.map((s, i) => (
        <div key={i} className={styles.wbRow}>
          <div className={styles.wbHead}>
            <span className={styles.wbName}>{s.warehouseid || 'Unknown'}</span>
            <span className={styles.wbCount}>{s.present} present</span>
          </div>
          <div className={styles.wbTrack}>
            <div
              className={styles.wbFill}
              style={{ width: `${Math.round(s.present / max * 100)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}
