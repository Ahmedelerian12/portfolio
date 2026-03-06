import { useState } from 'react'
import { Tab } from '@headlessui/react'
import {
  GlobeAltIcon,
  ServerIcon,
  ShieldCheckIcon,
  WifiIcon
} from '@heroicons/react/24/outline'
import IPManagement from '../../components/Network/IPManagement'
import SubnetManagement from '../../components/Network/SubnetManagement'
import VLANManagement from '../../components/Network/VLANManagement'
import FirewallRules from '../../components/Network/FirewallRules'

function classNames(...classes) {
  return classes.filter(Boolean).join(' ')
}

const Network = () => {
  const tabs = [
    { name: 'IP Management', icon: GlobeAltIcon, component: IPManagement },
    { name: 'Subnets', icon: ServerIcon, component: SubnetManagement },
    { name: 'VLANs', icon: WifiIcon, component: VLANManagement },
    { name: 'Firewall', icon: ShieldCheckIcon, component: FirewallRules },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Network Management</h1>
        <p className="mt-1 text-sm text-gray-600">
          Manage IP addresses, subnets, and network configuration.
        </p>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-blue-700 shadow'
                    : 'text-blue-100 hover:bg-white/[0.12] hover:text-white'
                )
              }
            >
              <div className="flex items-center justify-center space-x-2">
                <tab.icon className="h-5 w-5" />
                <span>{tab.name}</span>
              </div>
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-8">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                'rounded-xl bg-white p-3',
                'ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2'
              )}
            >
              <tab.component />
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>
    </div>
  )
}

export default Network
