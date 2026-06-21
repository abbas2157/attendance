import React, { useEffect, useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Sidebar from './Sidebar'
import Topbar from './Topbar'
import styles from './Layout.module.css'

export default function Layout() {
  const { user, loading } = useAuth()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    if (!sidebarOpen) return undefined

    const handleResize = () => {
      if (window.innerWidth > 1024) setSidebarOpen(false)
    }

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('resize', handleResize)

    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('resize', handleResize)
    }
  }, [sidebarOpen])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh' }}>
      <div style={{ width:28, height:28, borderRadius:'50%', border:'3px solid #dce3f0', borderTopColor:'#153982', animation:'spin .7s linear infinite' }} />
    </div>
  )

  if (!user) return <Navigate to="/login" replace />

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      {sidebarOpen && (
        <button
          type="button"
          className={styles.backdrop}
          aria-label="Close navigation menu"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={styles.main}>
        <Topbar onMenuToggle={() => setSidebarOpen(prev => !prev)} />
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
