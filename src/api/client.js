import axios from 'axios'

const api = axios.create({
  baseURL: 'https://api.bmsapp.com.pk/api',
  timeout: 15000,
})

// Attach JWT on every request
api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('bms_access')
  if (token) cfg.headers.Authorization = `Bearer ${token}`
  return cfg
})

// Auto-refresh token on 401
api.interceptors.response.use(
  res => res,
  async err => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
      orig._retry = true
      try {
        const refresh = localStorage.getItem('bms_refresh')
        const { data } = await axios.post(
          'https://api.bmsapp.com.pk/api/auth/refresh/',
          { refresh }
        )
        localStorage.setItem('bms_access', data.access)
        orig.headers.Authorization = `Bearer ${data.access}`
        return api(orig)
      } catch {
        localStorage.removeItem('bms_access')
        localStorage.removeItem('bms_refresh')
        localStorage.removeItem('bms_user')
        window.location.replace(`${import.meta.env.BASE_URL}login`)
      }
    }
    return Promise.reject(err)
  }
)

export default api
