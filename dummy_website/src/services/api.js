// Dummy services/api.js - Returns fake data, no real backend needed
import { dummyServers, dummySubnets, dummyNetworkSummary, dummySwitches, dummyUser, dummyUsers, dummyOrders, dummyJobs, dummySyncStatus } from '../dummyData'

// Simulate delay
const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

// Create a fake axios-like response
const fakeResponse = (data) => ({ data, status: 200, statusText: 'OK' })

// Create axios-like instance (all methods return dummy data)
const api = {
  get: async (url, config) => {
    await delay()
    console.log(`🎭 DUMMY axios GET: ${url}`)
    return routeGet(url, config)
  },
  post: async (url, data, config) => {
    await delay()
    console.log(`🎭 DUMMY axios POST: ${url}`)
    return routePost(url, data)
  },
  put: async (url, data, config) => {
    await delay()
    console.log(`🎭 DUMMY axios PUT: ${url}`)
    return fakeResponse({ success: true, message: 'Updated (Demo Mode)' })
  },
  patch: async (url, data, config) => {
    await delay()
    console.log(`🎭 DUMMY axios PATCH: ${url}`)
    return fakeResponse({ success: true })
  },
  delete: async (url, config) => {
    await delay()
    console.log(`🎭 DUMMY axios DELETE: ${url}`)
    return fakeResponse({ success: true, message: 'Deleted (Demo Mode)' })
  },
  interceptors: {
    request: { use: () => { } },
    response: { use: () => { } },
  },
}

function routeGet(url, config) {
  // Servers
  if (url.startsWith('/servers')) {
    if (url.includes('/summary') || url.includes('/stats')) {
      const dcCount = {};
      dummyServers.forEach(s => { dcCount[s.datacenter] = (dcCount[s.datacenter] || 0) + 1; });
      return fakeResponse({
        totalServers: dummyServers.length,
        online: dummyServers.filter(s => s.status === 'online').length,
        offline: dummyServers.filter(s => s.status === 'offline').length,
        maintenance: dummyServers.filter(s => s.status === 'maintenance').length,
        datacenters: dcCount,
      })
    }
    const idMatch = url.match(/^\/servers\/([^/?]+)/)
    if (idMatch) {
      const server = dummyServers.find(s => s._id === idMatch[1]) || dummyServers[0]
      return fakeResponse({ server })
    }
    return fakeResponse({ servers: dummyServers, total: dummyServers.length })
  }

  // Network
  if (url.startsWith('/network')) {
    if (url.includes('/switches')) return fakeResponse({ switches: dummySwitches, count: dummySwitches.length })
    if (url.includes('/subnets')) return fakeResponse({ subnets: dummySubnets, summary: dummyNetworkSummary })
    return fakeResponse({})
  }

  // Users
  if (url.startsWith('/users')) {
    return fakeResponse({ users: dummyUsers, total: dummyUsers.length })
  }

  // Auth
  if (url.startsWith('/auth')) {
    return fakeResponse({ user: dummyUser })
  }

  // Orders
  if (url.startsWith('/orders')) {
    return fakeResponse({ success: true, orders: dummyOrders, total: dummyOrders.length })
  }

  // Automation
  if (url.startsWith('/automation')) {
    if (url.includes('/jobs')) return fakeResponse({ jobs: dummyJobs })
    return fakeResponse({ tasks: [], schedules: [], scripts: [] })
  }

  // System
  if (url.startsWith('/system')) {
    return fakeResponse({ health: 'ok', uptime: '45 days' })
  }

  // Monitoring
  if (url.startsWith('/monitoring')) {
    return fakeResponse({ dashboard: {} })
  }

  // Server management
  if (url.startsWith('/server-management')) {
    return fakeResponse({ data: {} })
  }

  return fakeResponse({})
}

function routePost(url, data) {
  if (url.includes('/auth/login')) {
    return fakeResponse({
      user: dummyUser,
      token: 'dummy-token-for-demo',
      refreshToken: 'dummy-refresh-token',
    })
  }
  return fakeResponse({ success: true, message: 'Action completed (Demo Mode)' })
}

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: (data) => api.post('/auth/logout', data),
  refresh: (refreshToken) => api.post('/auth/refresh', { refreshToken }),
  getProfile: () => api.get('/auth/me'),
}

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post('/users', userData),
  update: (id, userData) => api.put(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
  updateProfile: (userData) => api.put('/users/profile', userData),
  changePassword: (passwordData) => api.put('/users/change-password', passwordData),
}

// Servers API
export const serversAPI = {
  getAll: (params) => api.get('/servers', { params }),
  getSummary: () => api.get('/servers/summary'),
  getById: (id) => api.get(`/servers/${id}`),
  create: (serverData) => api.post('/servers', serverData),
  update: (id, serverData) => api.put(`/servers/${id}`, serverData),
  delete: (id) => api.delete(`/servers/${id}`),
  getStatus: (id) => api.get(`/servers/${id}/status`),
  getMetrics: (id, params) => api.get(`/servers/${id}/metrics`, { params }),
  executeCommand: (id, command) => api.post(`/servers/${id}/execute`, { command }),
  getServices: (id) => api.get(`/servers/${id}/services`),
  manageService: (id, serviceData) => api.post(`/servers/${id}/services`, serviceData),
  getAlerts: (id) => api.get(`/servers/${id}/alerts`),
  acknowledgeAlert: (id, alertId) => api.put(`/servers/${id}/alerts/${alertId}/acknowledge`),
}

// Network API
export const networkAPI = {
  getIPs: (params) => api.get('/network/ips', { params }),
  createIP: (ipData) => api.post('/network/ips', ipData),
  updateIP: (id, ipData) => api.put(`/network/ips/${id}`, ipData),
  deleteIP: (id) => api.delete(`/network/ips/${id}`),
  getSubnets: () => api.get('/network/subnets'),
  createSubnet: (subnetData) => api.post('/network/subnets', subnetData),
  getVLANs: () => api.get('/network/vlans'),
  createVLAN: (vlanData) => api.post('/network/vlans', vlanData),
  generateNetplan: (config) => api.post('/network/netplan/generate', config),
  getFirewallRules: () => api.get('/network/firewall/rules'),
  createFirewallRule: (ruleData) => api.post('/network/firewall/rules', ruleData),
  updateFirewallRule: (id, ruleData) => api.put(`/network/firewall/rules/${id}`, ruleData),
  deleteFirewallRule: (id) => api.delete(`/network/firewall/rules/${id}`),
  testConnection: (target) => api.post('/network/test', { target }),
}

// Monitoring API
export const monitoringAPI = {
  getDashboard: () => api.get('/monitoring/dashboard'),
  getMetrics: (params) => api.get('/monitoring/metrics', { params }),
  getAlerts: (params) => api.get('/monitoring/alerts', { params }),
}

// Automation API
export const automationAPI = {
  getTasks: () => api.get('/automation/tasks'),
  getJobs: (params) => api.get('/automation/jobs', { params }),
  executeTask: (taskId, params) => api.post('/automation/execute', { taskId, params }),
  stopTask: (taskId) => api.post('/automation/stop', { taskId }),
  getJobById: (id) => api.get(`/automation/jobs/${id}`),
  getSchedules: () => api.get('/automation/schedules'),
  getScripts: () => api.get('/automation/scripts'),
}

// Orders API
export const ordersAPI = {
  getAll: (params) => api.get('/orders', { params }),
  create: (orderData) => api.post('/orders', orderData),
  update: (id, orderData) => api.put(`/orders/${id}`, orderData),
  delete: (id) => api.delete(`/orders/${id}`),
}

// System API
export const systemAPI = {
  getHealth: () => api.get('/system/health'),
  getStats: () => api.get('/system/stats'),
  getLogs: (params) => api.get('/system/logs', { params }),
  backup: () => api.post('/system/backup'),
  getBackups: () => api.get('/system/backups'),
  restoreBackup: (backupId) => api.post(`/system/backups/${backupId}/restore`),
  deleteBackup: (backupId) => api.delete(`/system/backups/${backupId}`),
}

export default api
