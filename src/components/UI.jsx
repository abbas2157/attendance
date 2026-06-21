import React from 'react'
import { getAvatarColor, getInitials } from '../utils/helpers'
import styles from './UI.module.css'

// ── Avatar ────────────────────────────────────────────────────────────────────
export function Avatar({ name = '', size = 32 }) {
  return (
    <div
      className={styles.avatar}
      style={{
        width: size, height: size,
        background: getAvatarColor(name),
        fontSize: size * 0.35,
      }}
    >
      {getInitials(name)}
    </div>
  )
}

// ── Chip / Badge ──────────────────────────────────────────────────────────────
const chipVariants = {
  in:      { bg: '#d1fae5', color: '#065f46' },
  out:     { bg: '#e8eef7', color: '#153982' },
  absent:  { bg: '#fee2e2', color: '#991b1b' },
  pending: { bg: '#fef3c7', color: '#92400e' },
  active:  { bg: '#d1fae5', color: '#065f46' },
  inactive:{ bg: '#fee2e2', color: '#991b1b' },
}

export function Chip({ variant = 'out', children }) {
  const v = chipVariants[variant] || chipVariants.out
  return (
    <span
      className={styles.chip}
      style={{ background: v.bg, color: v.color }}
    >
      {children}
    </span>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 18 }) {
  return (
    <div
      className={styles.spinner}
      style={{ width: size, height: size, borderWidth: size < 20 ? 2 : 3 }}
    />
  )
}

// ── Loading row ───────────────────────────────────────────────────────────────
export function LoadingState({ text = 'Loading…' }) {
  return (
    <div className={styles.loadingState}>
      <Spinner />
      <span>{text}</span>
    </div>
  )
}

// ── Empty state ───────────────────────────────────────────────────────────────
export function EmptyState({ text = 'No data found' }) {
  return <div className={styles.emptyState}>{text}</div>
}

// ── Stat card ─────────────────────────────────────────────────────────────────
const accentColors = {
  blue:  'var(--primary)',
  green: 'var(--success)',
  amber: 'var(--warn)',
  red:   'var(--danger)',
}
const iconBg = {
  blue:  { bg: 'var(--primary-bg)',  color: 'var(--primary)' },
  green: { bg: '#d1fae5',            color: 'var(--success)' },
  amber: { bg: '#fef3c7',            color: 'var(--warn)' },
  red:   { bg: '#fee2e2',            color: 'var(--danger)' },
}

export function StatCard({ label, value, sub, color = 'blue', icon }) {
  const ic = iconBg[color]
  return (
    <div className={`${styles.statCard} fade-in`} style={{ '--accent': accentColors[color] }}>
      {icon && (
        <div className={styles.statIcon} style={{ background: ic.bg, color: ic.color }}>
          {icon}
        </div>
      )}
      <div className={styles.statLabel}>{label}</div>
      <div className={styles.statValue}>{value ?? '—'}</div>
      {sub && <div className={styles.statSub}>{sub}</div>}
    </div>
  )
}

// ── Section header ────────────────────────────────────────────────────────────
export function SectionHead({ title, action, onAction }) {
  return (
    <div className={styles.sectionHead}>
      <h2 className={styles.sectionTitle}>{title}</h2>
      {action && (
        <button className={styles.viewAll} onClick={onAction}>{action}</button>
      )}
    </div>
  )
}

// ── Card wrapper ──────────────────────────────────────────────────────────────
export function Card({ children, style }) {
  return <div className={styles.card} style={style}>{children}</div>
}
