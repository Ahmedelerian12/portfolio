// ========================================
// DUMMY DATA FOR DEMO WEBSITE
// All data is fake and not from real servers
// ========================================

export const dummyUser = {
    _id: 'demo-user-001',
    username: 'demo_admin',
    firstName: 'Demo',
    lastName: 'Admin',
    email: 'demo@example.com',
    role: 'admin',
    permissions: [
        'servers.read', 'servers.write', 'servers.delete',
        'network.read', 'network.write',
        'users.read', 'users.write',
        'orders.read', 'orders.write',
        'system.admin'
    ],
    createdAt: '2024-01-15T10:00:00Z',
    lastLogin: new Date().toISOString(),
}

export const dummyUsers = [
    { ...dummyUser },
    {
        _id: 'demo-user-002',
        username: 'john_tech',
        firstName: 'John',
        lastName: 'Mitchell',
        email: 'john.mitchell@example.com',
        role: 'technician',
        permissions: ['servers.read', 'network.read', 'orders.read'],
        createdAt: '2024-03-10T14:00:00Z',
        lastLogin: '2025-12-20T08:30:00Z',
    },
    {
        _id: 'demo-user-003',
        username: 'sarah_ops',
        firstName: 'Sarah',
        lastName: 'Chen',
        email: 'sarah.chen@example.com',
        role: 'operator',
        permissions: ['servers.read', 'servers.write', 'network.read', 'orders.read', 'orders.write'],
        createdAt: '2024-05-22T09:00:00Z',
        lastLogin: '2026-01-10T16:45:00Z',
    },
    {
        _id: 'demo-user-004',
        username: 'mike_hw',
        firstName: 'Mike',
        lastName: 'Johnson',
        email: 'mike.johnson@example.com',
        role: 'hardware',
        permissions: ['orders.read', 'orders.write'],
        createdAt: '2024-07-01T11:00:00Z',
        lastLogin: '2026-02-28T12:00:00Z',
    },
    {
        _id: 'demo-user-005',
        username: 'lisa_viewer',
        firstName: 'Lisa',
        lastName: 'Park',
        email: 'lisa.park@example.com',
        role: 'viewer',
        permissions: ['servers.read', 'network.read'],
        createdAt: '2025-01-05T08:00:00Z',
        lastLogin: '2026-03-01T10:00:00Z',
    },
]

// Generate realistic dummy servers
const datacenters = ['AMS-DC-01', 'AMS-DC-02', 'FRA-DC-01', 'LON-DC-01']
const vendors = ['HP', 'HPE', 'Dell', 'Lenovo', 'Supermicro']
const models = {
    HP: ['ProLiant DL380 Gen10', 'ProLiant DL360 Gen10', 'ProLiant DL580 Gen10'],
    HPE: ['ProLiant DL380 Gen10 Plus', 'ProLiant DL360 Gen10 Plus', 'Synergy 480 Gen10'],
    Dell: ['PowerEdge R740', 'PowerEdge R640', 'PowerEdge R940'],
    Lenovo: ['ThinkSystem SR650', 'ThinkSystem SR630', 'ThinkSystem SR850'],
    Supermicro: ['SuperServer 6029P', 'SuperServer 1029P', 'SuperServer 2029U'],
}
const managementTypes = { HP: 'iLO', HPE: 'iLO', Dell: 'iDRAC', Lenovo: 'XCC', Supermicro: 'IPMI' }
const statuses = ['online', 'online', 'online', 'online', 'online', 'online', 'offline', 'maintenance']
const switchNames = ['TOR-SW-01', 'TOR-SW-02', 'AGG-SW-01', 'CORE-SW-01', 'MGMT-SW-01']

function generateServers(count = 85) {
    const servers = []
    for (let i = 1; i <= count; i++) {
        const vendor = vendors[Math.floor(Math.random() * vendors.length)]
        const dc = datacenters[Math.floor(Math.random() * datacenters.length)]
        const rackNum = Math.floor(Math.random() * 20) + 1
        const posStart = Math.floor(Math.random() * 40) + 1
        const posEnd = posStart + Math.floor(Math.random() * 3) + 1
        const status = statuses[Math.floor(Math.random() * statuses.length)]
        const modelList = models[vendor]
        const model = modelList[Math.floor(Math.random() * modelList.length)]
        const mgmtType = managementTypes[vendor]
        const switchName = switchNames[Math.floor(Math.random() * switchNames.length)]

        servers.push({
            _id: `srv-${String(i).padStart(3, '0')}`,
            id: `srv-${String(i).padStart(3, '0')}`,
            name: `${dc}-SRV-${String(i).padStart(3, '0')}`,
            ipAddress: `10.${20 + Math.floor(i / 256)}.${i % 256}.${10 + (i % 200)}`,
            ip: `10.${20 + Math.floor(i / 256)}.${i % 256}.${10 + (i % 200)}`,
            vendor,
            model,
            status,
            powerState: status === 'offline' ? 'Off' : 'On',
            datacenter: dc,
            managementInterface: {
                type: mgmtType,
                ip: `10.99.${Math.floor(i / 256)}.${(i % 256) + 1}`,
                enabled: status !== 'offline',
                networkConnection: `${switchName} Port ${Math.floor(Math.random() * 48) + 1}`,
            },
            location: {
                datacenter: dc,
                rack: `R-${String(rackNum).padStart(2, '0')}`,
                position: `U${posStart}-U${posEnd}`,
            },
            additionalIPs: i % 5 === 0 ? [`10.30.${i % 256}.${10 + (i % 200)}`] : [],
            networkInfo: {
                serverNetworkDescription: `${switchName} GigabitEthernet 1/${Math.floor(Math.random() * 48) + 1}`,
                iloNetworkDescription: `MGMT-SW-01 GigabitEthernet 1/${Math.floor(Math.random() * 48) + 1}`,
            },
            networkPort: `${switchName} Gi1/${Math.floor(Math.random() * 48) + 1}`,
            iloPort: `MGMT-SW-01 Gi1/${Math.floor(Math.random() * 48) + 1}`,
            networkConnection: `${switchName} Port ${Math.floor(Math.random() * 48) + 1}`,
            serialNumber: `SN${String(Math.floor(Math.random() * 9999999)).padStart(7, '0')}`,
            firmware: `v${Math.floor(Math.random() * 3) + 1}.${Math.floor(Math.random() * 50)}.${Math.floor(Math.random() * 100)}`,
            os: ['Ubuntu 22.04', 'CentOS 8', 'Windows Server 2022', 'RHEL 9', 'Proxmox VE 8'][Math.floor(Math.random() * 5)],
            cpuModel: ['Intel Xeon Gold 6248', 'Intel Xeon Silver 4214', 'AMD EPYC 7543', 'Intel Xeon Platinum 8280'][Math.floor(Math.random() * 4)],
            cpuCores: [16, 24, 32, 48, 64][Math.floor(Math.random() * 5)],
            ramGB: [64, 128, 256, 512][Math.floor(Math.random() * 4)],
            storageGB: [960, 1920, 3840, 7680][Math.floor(Math.random() * 4)],
            createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
            updatedAt: new Date(2025, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString(),
        })
    }
    return servers
}

export const dummyServers = generateServers(85)

// Dashboard summary data
export const dummyDashboardData = {
    totalServers: dummyServers.length,
    onlineServers: dummyServers.filter(s => s.status === 'online').length,
    offlineServers: dummyServers.filter(s => s.status === 'offline').length,
    maintenanceServers: dummyServers.filter(s => s.status === 'maintenance').length,
    datacenters: [...new Set(dummyServers.map(s => s.datacenter))],
    datacenterBreakdown: datacenters.map(dc => ({
        name: dc,
        count: dummyServers.filter(s => s.datacenter === dc).length,
        online: dummyServers.filter(s => s.datacenter === dc && s.status === 'online').length,
    })),
    recentActivity: [
        { type: 'server_added', message: 'New server AMS-DC-01-SRV-086 added', time: '2 hours ago' },
        { type: 'sync_complete', message: 'iLO sync completed for 12 servers', time: '4 hours ago' },
        { type: 'alert', message: 'Server FRA-DC-01-SRV-042 went offline', time: '6 hours ago' },
        { type: 'maintenance', message: 'Scheduled maintenance for LON-DC-01 rack R-05', time: '1 day ago' },
        { type: 'server_updated', message: 'Firmware updated on 5 Dell servers', time: '2 days ago' },
    ],
}

// Network / Subnet data
export const dummySubnets = [
    {
        subnet: '10.20.0.0/24',
        primaryDatacenter: 'AMS-DC-01',
        serverCount: 18,
        ipCount: 22,
        datacenters: { 'AMS-DC-01': 18 },
        servers: dummyServers.filter(s => s.datacenter === 'AMS-DC-01').slice(0, 18).map(s => ({
            name: s.name,
            datacenter: s.datacenter,
            ips: [{ ip: s.ipAddress, type: 'primary' }],
            networkInfo: s.networkInfo,
        })),
    },
    {
        subnet: '10.20.1.0/24',
        primaryDatacenter: 'AMS-DC-02',
        serverCount: 15,
        ipCount: 19,
        datacenters: { 'AMS-DC-02': 15 },
        servers: dummyServers.filter(s => s.datacenter === 'AMS-DC-02').slice(0, 15).map(s => ({
            name: s.name,
            datacenter: s.datacenter,
            ips: [{ ip: s.ipAddress, type: 'primary' }],
            networkInfo: s.networkInfo,
        })),
    },
    {
        subnet: '10.21.0.0/24',
        primaryDatacenter: 'FRA-DC-01',
        serverCount: 22,
        ipCount: 28,
        datacenters: { 'FRA-DC-01': 22 },
        servers: dummyServers.filter(s => s.datacenter === 'FRA-DC-01').slice(0, 22).map(s => ({
            name: s.name,
            datacenter: s.datacenter,
            ips: [{ ip: s.ipAddress, type: 'primary' }],
            networkInfo: s.networkInfo,
        })),
    },
    {
        subnet: '10.22.0.0/24',
        primaryDatacenter: 'LON-DC-01',
        serverCount: 20,
        ipCount: 24,
        datacenters: { 'LON-DC-01': 20 },
        servers: dummyServers.filter(s => s.datacenter === 'LON-DC-01').slice(0, 20).map(s => ({
            name: s.name,
            datacenter: s.datacenter,
            ips: [{ ip: s.ipAddress, type: 'primary' }],
            networkInfo: s.networkInfo,
        })),
    },
    {
        subnet: '10.99.0.0/24',
        primaryDatacenter: 'AMS-DC-01',
        serverCount: 30,
        ipCount: 30,
        datacenters: { 'AMS-DC-01': 12, 'AMS-DC-02': 8, 'FRA-DC-01': 10 },
        servers: dummyServers.slice(0, 30).map(s => ({
            name: s.name,
            datacenter: s.datacenter,
            ips: [{ ip: s.managementInterface.ip, type: 'management' }],
            networkInfo: s.networkInfo,
        })),
    },
]

export const dummyNetworkSummary = {
    totalSubnets: dummySubnets.length,
    totalIPs: dummySubnets.reduce((sum, s) => sum + s.ipCount, 0),
    multiDatacenterSubnets: 1,
    duplicateIPs: 0,
}

export const dummySwitches = [
    { name: 'TOR-SW-01', type: 'Top of Rack', datacenter: 'AMS-DC-01', portCount: 48, usedPorts: 32, model: 'Cisco Nexus 9300' },
    { name: 'TOR-SW-02', type: 'Top of Rack', datacenter: 'AMS-DC-02', portCount: 48, usedPorts: 28, model: 'Cisco Nexus 9300' },
    { name: 'AGG-SW-01', type: 'Aggregation', datacenter: 'FRA-DC-01', portCount: 96, usedPorts: 54, model: 'Cisco Nexus 9500' },
    { name: 'CORE-SW-01', type: 'Core', datacenter: 'LON-DC-01', portCount: 128, usedPorts: 72, model: 'Juniper QFX10000' },
    { name: 'MGMT-SW-01', type: 'Management', datacenter: 'AMS-DC-01', portCount: 48, usedPorts: 40, model: 'Cisco Catalyst 9300' },
]

// Orders data matching OrderManagement format
export const dummyOrders = [
    {
        _id: 'ord-001',
        orderCode: 'ORD-240115',
        chassis: 'DL360 Gen9',
        cpu: '2 x 2640v4 (40TH)',
        ram: '128GB',
        disk: '1x256GB M.2 ubuntu 20',
        nic: '2 GB Bandwidth',
        location: 'AMS-DC-01',
        priority: 1,
        deliveryDate: '2026-03-10T00:00:00Z',
        status: 'Pending',
        serverCode: '',
        notes: 'Urgent client deployment - Amsterdam North',
        createdAt: '2026-02-15T10:00:00Z',
        updatedAt: '2026-02-20T14:00:00Z',
    },
    {
        _id: 'ord-002',
        orderCode: 'ORD-240116',
        chassis: 'DL380 Gen10 Plus',
        cpu: '2 x Intel Xeon Gold 6248 (40TH)',
        ram: '256GB',
        disk: '2x960GB SSD RAID1',
        nic: '10 GB Bandwidth',
        location: 'FRA-DC-01',
        priority: 2,
        deliveryDate: '2026-03-15T00:00:00Z',
        status: 'Processing',
        serverCode: 'FRA-SRV-091',
        notes: 'High-performance compute node for Frankfurt cluster',
        createdAt: '2026-01-28T09:00:00Z',
        updatedAt: '2026-02-05T11:30:00Z',
    },
    {
        _id: 'ord-003',
        orderCode: 'ORD-240117',
        chassis: 'PowerEdge R740',
        cpu: '2 x Intel Xeon Silver 4214 (24TH)',
        ram: '64GB',
        disk: '1x480GB SSD + 4x2TB HDD',
        nic: '1 GB Bandwidth',
        location: 'LON-DC-01',
        priority: 5,
        deliveryDate: '2026-03-20T00:00:00Z',
        status: 'Delivered',
        serverCode: 'LON-SRV-045',
        notes: 'Storage node - London datacenter expansion',
        createdAt: '2025-12-10T08:00:00Z',
        updatedAt: '2026-01-15T16:00:00Z',
    },
    {
        _id: 'ord-004',
        orderCode: 'ORD-240118',
        chassis: 'DL360 Gen10',
        cpu: '2 x 2630v4 (20TH)',
        ram: '64GB',
        disk: '1x256GB M.2 ubuntu 22',
        nic: '2 GB Bandwidth',
        location: 'AMS-DC-02',
        priority: 3,
        deliveryDate: '2026-03-25T00:00:00Z',
        status: 'Pending',
        serverCode: '',
        notes: 'Web hosting cluster replacement',
        createdAt: '2026-02-25T13:00:00Z',
        updatedAt: '2026-03-01T10:00:00Z',
    },
    {
        _id: 'ord-005',
        orderCode: 'ORD-240119',
        chassis: 'Synergy 480 Gen10',
        cpu: '2 x Intel Xeon Platinum 8280 (56TH)',
        ram: '512GB',
        disk: '2x1.92TB NVMe SSD',
        nic: '25 GB Bandwidth',
        location: 'AMS-DC-01',
        priority: 1,
        deliveryDate: '2026-04-01T00:00:00Z',
        status: 'Processing',
        serverCode: 'AMS-SRV-092',
        notes: 'Database server - mission critical SAP deployment',
        createdAt: '2026-03-01T08:00:00Z',
        updatedAt: '2026-03-03T09:00:00Z',
    },
    {
        _id: 'ord-006',
        orderCode: 'ORD-240120',
        chassis: 'ThinkSystem SR650',
        cpu: '2 x AMD EPYC 7543 (64TH)',
        ram: '256GB',
        disk: '4x960GB SSD RAID10',
        nic: '10 GB Bandwidth',
        location: 'FRA-DC-01',
        priority: 4,
        deliveryDate: '2026-04-05T00:00:00Z',
        status: 'Pending',
        serverCode: '',
        notes: 'Virtualization host - VMware cluster',
        createdAt: '2026-03-02T10:00:00Z',
        updatedAt: '2026-03-02T10:00:00Z',
    },
    {
        _id: 'ord-007',
        orderCode: 'ORD-240121',
        chassis: 'DL380 Gen10',
        cpu: '2 x 2640v4 (40TH)',
        ram: '128GB',
        disk: '2x480GB SSD',
        nic: '2 GB Bandwidth',
        location: 'LON-DC-01',
        priority: 7,
        deliveryDate: '2026-04-10T00:00:00Z',
        status: 'Delivered',
        serverCode: 'LON-SRV-046',
        notes: 'Backup server for DR site',
        createdAt: '2025-11-20T14:00:00Z',
        updatedAt: '2025-12-15T16:00:00Z',
    },
    {
        _id: 'ord-008',
        orderCode: 'ORD-240122',
        chassis: 'SuperServer 6029P',
        cpu: '2 x Intel Xeon Gold 6248 (40TH)',
        ram: '384GB',
        disk: '8x3.84TB NVMe SSD',
        nic: '25 GB Bandwidth',
        location: 'AMS-DC-01',
        priority: 2,
        deliveryDate: '2026-03-30T00:00:00Z',
        status: 'Processing',
        serverCode: 'AMS-SRV-093',
        notes: 'High-density storage for object storage cluster',
        createdAt: '2026-02-20T11:00:00Z',
        updatedAt: '2026-03-01T14:00:00Z',
    },
    {
        _id: 'ord-009',
        orderCode: 'ORD-240123',
        chassis: 'PowerEdge R640',
        cpu: '2 x Intel Xeon Silver 4214 (24TH)',
        ram: '96GB',
        disk: '1x480GB SSD',
        nic: '10 GB Bandwidth',
        location: 'AMS-DC-02',
        priority: 6,
        deliveryDate: '2026-04-15T00:00:00Z',
        status: 'Cancelled',
        serverCode: '',
        notes: 'Cancelled - requirements changed',
        createdAt: '2026-01-05T09:00:00Z',
        updatedAt: '2026-02-10T10:00:00Z',
    },
    {
        _id: 'ord-010',
        orderCode: 'ORD-240124',
        chassis: 'DL360 Gen9',
        cpu: '2 x 2640v4 (40TH)',
        ram: '128GB',
        disk: '1x256GB M.2 ubuntu 20',
        nic: '2 GB Bandwidth',
        location: 'FRA-DC-01',
        priority: 3,
        deliveryDate: '2026-03-28T00:00:00Z',
        status: 'Pending',
        serverCode: '',
        notes: 'Standard web server deployment',
        createdAt: '2026-03-01T15:00:00Z',
        updatedAt: '2026-03-01T15:00:00Z',
    },
]

// Jobs / Automation data
export const dummyJobs = [
    { _id: 'job-001', name: 'iLO Full Sync', status: 'completed', progress: 100, startedAt: '2026-03-03T08:00:00Z', completedAt: '2026-03-03T08:45:00Z', serverCount: 85 },
    { _id: 'job-002', name: 'Firmware Check', status: 'completed', progress: 100, startedAt: '2026-03-02T22:00:00Z', completedAt: '2026-03-02T22:30:00Z', serverCount: 85 },
]

// OneDrive Sync data
export const dummySyncStatus = {
    lastSync: '2026-03-03T06:00:00Z',
    status: 'idle',
    totalFiles: 42,
    syncedFiles: 42,
    pendingFiles: 0,
    errors: [],
}
