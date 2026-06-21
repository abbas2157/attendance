import React from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { getInitials } from '../utils/helpers'
import styles from './Sidebar.module.css'

const NAV = [
  {
    to: '/dashboard', label: 'Dashboard',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1"/>
        <rect x="14" y="3" width="7" height="7" rx="1"/>
        <rect x="3" y="14" width="7" height="7" rx="1"/>
        <rect x="14" y="14" width="7" height="7" rx="1"/>
      </svg>
    ),
  },
  {
    to: '/employees', label: 'Employees',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="9" cy="7" r="4"/>
        <path d="M2 21v-2a4 4 0 0 1 4-4h6a4 4 0 0 1 4 4v2"/>
        <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        <path d="M21 21v-2a4 4 0 0 0-3-3.87"/>
      </svg>
    ),
  },
  {
    to: '/attendance', label: 'Attendance',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="18" rx="2"/>
        <line x1="16" y1="2" x2="16" y2="6"/>
        <line x1="8" y1="2" x2="8" y2="6"/>
        <line x1="3" y1="10" x2="21" y2="10"/>
      </svg>
    ),
  },
  {
    to: '/warehouses', label: 'Warehouses',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    to: '/attendance-monitor', label: 'Monitor',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="4" width="18" height="14" rx="2"/>
        <line x1="8" y1="20" x2="16" y2="20"/>
        <line x1="12" y1="18" x2="12" y2="20"/>
        <path d="M7 14l3-3 2 2 5-5"/>
      </svg>
    ),
  },
]

export default function Sidebar({ isOpen = false, onClose = () => {} }) {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    onClose()
    logout()
    navigate('/login')
  }

  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>BMS</div>
        <div>
          <div className={styles.brandName}>BMS Portal</div>
          <div className={styles.brandSub}>HR Management</div>
        </div>
        <button
          type="button"
          className={styles.closeBtn}
          aria-label="Close navigation menu"
          onClick={onClose}
        >
          <span />
          <span />
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <span className={styles.navLabel}>Main</span>
        {NAV.map(item => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `${styles.navItem} ${isActive ? styles.active : ''}`
            }
            onClick={() => {
              if (pathname !== item.to) onClose()
            }}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      {/* User footer */}
      <div className={styles.footer}>
        <div className={styles.userCard}>
          <div className={styles.userAvatar}>
            {getInitials(user?.username || 'HR')}
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user?.username || 'Admin'}</div>
            <div className={styles.userRole}>Administrator</div>
          </div>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign Out
        </button>
      </div>
    </aside>
  )
}
