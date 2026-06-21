export const AVATAR_COLORS = [
  '#153982','#10b981','#f59e0b','#8b5cf6',
  '#ef4444','#3b82f6','#ec4899','#14b8a6',
]

export function getAvatarColor(str = '') {
  let h = 0
  for (const c of str) h = ((h << 5) - h) + c.charCodeAt(0)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export function getInitials(name = '') {
  return name.split(' ').slice(0, 2).map(w => w[0] || '').join('').toUpperCase() || '?'
}

export function todayStr() {
  return new Date().toISOString().split('T')[0]
}

export function formatDate(str) {
  if (!str) return '—'
  return new Date(str).toLocaleDateString('en-PK', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}
