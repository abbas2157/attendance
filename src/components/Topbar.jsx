import React, { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import styles from './Topbar.module.css'

const PAGE_TITLES = {
  '/':           'Dashboard',
  '/dashboard':  'Dashboard',
  '/employees':  'Employees',
  '/attendance': 'Attendance Records',
  '/warehouses': 'Warehouses',
}

export default function Topbar({ onMenuToggle }) {
  const { pathname } = useLocation()
  const [now, setNow] = useState(new Date())

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(id)
  }, [])

  const dateStr = now.toLocaleDateString('en-PK', {
    weekday: 'short', year: 'numeric', month: 'short', day: 'numeric',
  })

  return (
    <header className={styles.topbar}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuBtn}
          aria-label="Open navigation menu"
          onClick={onMenuToggle}
        >
          <span />
          <span />
          <span />
        </button>
        <h1 className={styles.title}>{PAGE_TITLES[pathname] || 'BMS HR Portal'}</h1>
      </div>
      <div className={styles.right}>
        <div className={styles.liveBadge}>
          <span className={styles.liveDot} />
          Live
        </div>
        <div className={styles.date}>{dateStr}</div>
      </div>
    </header>
  )
}
