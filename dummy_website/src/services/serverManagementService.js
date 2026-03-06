// Dummy Server Management Service - Returns fake data, no real backend needed

const delay = (ms = 150) => new Promise(resolve => setTimeout(resolve, ms))

class ServerManagementService {
  async testConnection(serverConfig) {
    await delay()
    return { success: true, data: { connected: true, responseTime: '25ms' } }
  }

  async getServerInfo(serverId) {
    await delay()
    return {
      success: true,
      data: {
        serverName: 'Demo Server',
        health: 'OK',
        firmware: 'v2.30.100',
        model: 'ProLiant DL380 Gen10',
        serialNumber: 'DM0123456',
        biosVersion: 'U30 v2.30',
        powerState: 'On',
        cpu: { model: 'Intel Xeon Gold 6248', cores: 20, threads: 40, speed: '2.5 GHz' },
        memory: { totalGB: 256, slots: 16, usedSlots: 8, type: 'DDR4' },
        storage: [
          { name: 'Disk 0', sizeGB: 960, type: 'SSD', status: 'OK' },
          { name: 'Disk 1', sizeGB: 960, type: 'SSD', status: 'OK' },
        ],
        network: [
          { name: 'NIC 1', speed: '10 Gbps', mac: '00:11:22:33:44:55', status: 'Connected' },
          { name: 'NIC 2', speed: '10 Gbps', mac: '00:11:22:33:44:56', status: 'Connected' },
        ],
        temperatures: [
          { name: 'CPU 1', current: 42, warning: 70, critical: 85 },
          { name: 'Inlet Ambient', current: 22, warning: 42, critical: 46 },
        ],
        fans: [
          { name: 'Fan 1', speed: 28, status: 'OK' },
          { name: 'Fan 2', speed: 30, status: 'OK' },
        ],
      }
    }
  }

  async powerControl(serverId, action) {
    await delay(300)
    return { success: true, data: { message: `Power action '${action}' simulated (Demo Mode)` } }
  }

  async getMetrics(serverId) {
    await delay()
    return {
      success: true,
      data: {
        cpu: { usage: 45, temperature: 42 },
        memory: { usage: 62, totalGB: 256, usedGB: 159 },
        network: { inMbps: 125, outMbps: 88 },
        power: { watts: 350, peakWatts: 420 },
      }
    }
  }

  async getLogs(serverId, logType = 'System') {
    await delay()
    return {
      success: true,
      data: {
        logs: [
          { timestamp: '2026-03-03T10:00:00Z', severity: 'Info', message: 'System health check passed' },
          { timestamp: '2026-03-03T08:00:00Z', severity: 'Info', message: 'Firmware update available' },
          { timestamp: '2026-03-02T22:00:00Z', severity: 'Warning', message: 'Fan speed increased temporarily' },
        ]
      }
    }
  }

  async getPowerActions(vendor) {
    await delay()
    return {
      success: true,
      data: ['PowerOn', 'PowerOff', 'ForceRestart', 'GracefulShutdown', 'ForcePowerOff']
    }
  }

  async updateConfig(serverId, config) {
    await delay()
    return { success: true, data: { ...config, _id: serverId } }
  }
}

export default new ServerManagementService()
