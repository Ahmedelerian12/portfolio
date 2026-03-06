// Dummy Server Service - Returns fake data, no real backend needed
import { dummyServers } from '../dummyData'

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

class ServerService {
  async getAll(params = {}) {
    await delay()
    return { success: true, data: dummyServers }
  }

  async getById(id) {
    await delay()
    const server = dummyServers.find(s => s._id === id) || dummyServers[0]
    return { success: true, data: server }
  }

  async create(serverData) {
    await delay()
    return { success: true, data: { ...serverData, _id: 'new-server-demo' } }
  }

  async update(id, serverData) {
    await delay()
    return { success: true, data: { ...serverData, _id: id } }
  }

  async delete(id) {
    await delay()
    return { success: true }
  }

  async getStats() {
    await delay()
    return {
      success: true,
      data: {
        totalServers: dummyServers.length,
        online: dummyServers.filter(s => s.status === 'online').length,
        offline: dummyServers.filter(s => s.status === 'offline').length,
        maintenance: dummyServers.filter(s => s.status === 'maintenance').length,
      }
    }
  }

  async search(query) {
    await delay()
    const filtered = dummyServers.filter(s =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.ipAddress.toLowerCase().includes(query.toLowerCase())
    )
    return { success: true, data: filtered }
  }

  async getByStatus(status) {
    await delay()
    return { success: true, data: dummyServers.filter(s => s.status === status) }
  }

  async getByType(type) {
    await delay()
    return { success: true, data: dummyServers }
  }

  async getByEnvironment(environment) {
    await delay()
    return { success: true, data: dummyServers }
  }

  async testConnection(id) {
    await delay()
    return { success: true, data: { reachable: true, responseTime: '15ms' } }
  }

  async getHealth(id) {
    await delay()
    return { success: true, data: { status: 'healthy', cpu: 45, memory: 62, disk: 38 } }
  }

  async updateStatus(id, status) {
    await delay()
    const server = dummyServers.find(s => s._id === id) || dummyServers[0]
    return { success: true, data: { ...server, status } }
  }

  async bulkUpdate(serverIds, updateData) {
    await delay()
    return { success: true, data: { updated: serverIds.length } }
  }

  async bulkDelete(serverIds) {
    await delay()
    return { success: true, data: { deleted: serverIds.length } }
  }
}

export default new ServerService()
