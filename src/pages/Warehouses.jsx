import React from 'react'
import { getWarehouses } from '../api/services'
import { useApi } from '../hooks/useApi'
import { Chip, LoadingState, EmptyState } from '../components/UI'
import styles from './Warehouses.module.css'

const IconPin = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="10" r="3"/>
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
  </svg>
)
const IconHome = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
    <polyline points="9 22 9 12 15 12 15 22"/>
  </svg>
)

export default function Warehouses() {
  const { data: warehouses = [], loading, error } = useApi(getWarehouses)

  return (
    <div className={styles.page}>
      {error && (
        <div className={styles.errorBanner}>Could not load warehouses: {error}</div>
      )}
      {loading ? (
        <LoadingState text="Loading warehouses…" />
      ) : warehouses.length === 0 ? (
        <EmptyState text="No warehouses found" />
      ) : (
        <div className={styles.gridWrap}>
          <div className={styles.grid}>
            {warehouses.map(w => (
              <div key={w.id} className={`${styles.card} fade-in`}>
                <div className={styles.cardHead}>
                  <div className={styles.icon}>
                    <IconHome />
                  </div>
                  <div>
                    <div className={styles.shortName}>{w.short_name}</div>
                    <Chip variant={w.status === 1 ? 'active' : 'inactive'}>
                      {w.status === 1 ? 'Active' : 'Inactive'}
                    </Chip>
                  </div>
                </div>
                <div className={styles.fullName}>{w.full_name}</div>
                {w.remarks && (
                  <div className={styles.remarks}>{w.remarks}</div>
                )}
                <div className={styles.location}>
                  <IconPin />
                  <span>{w.latlong && w.latlong !== '0,0' ? w.latlong : 'No location set'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
