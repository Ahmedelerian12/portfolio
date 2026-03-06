import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  HomeIcon,
  ServerIcon,
  GlobeAltIcon,
  ChartBarIcon,
  CogIcon,
  UsersIcon,
  XMarkIcon,
  CalendarDaysIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'


export const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: HomeIcon, permission: null },
  { name: 'Servers', href: '/servers', icon: ServerIcon, permission: 'servers.read' },
  { name: 'Rack View', href: '/rack-view', icon: ServerIcon, permission: 'servers.read' },
  { name: 'Network', href: '/network', icon: GlobeAltIcon, permission: 'network.read' },
  { name: 'OneDrive Sync', href: '/onedrive-sync', icon: ArrowPathIcon, permission: 'system.admin' },
  { name: 'Orders', href: '/orders', icon: CalendarDaysIcon, permission: 'orders.read' },
  { name: 'Users', href: '/users', icon: UsersIcon, permission: 'users.read' },
]


const Sidebar = ({ open, setOpen, collapsed, setCollapsed, isSyncActive, syncProgress }) => {
  const { hasPermission, user } = useAuth()


  const filteredNavigation = navigation.filter(item => {
    // Hardware role should NOT see the dashboard
    if (user?.role === 'hardware' && item.href === '/dashboard') {
      return false
    }
    return !item.permission || hasPermission(item.permission)
  })

  const SidebarContent = ({ isCollapsed = false }) => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={`flex items-center h-16 flex-shrink-0 bg-primary-700 transition-all duration-300 ${isCollapsed ? 'px-2 justify-center' : 'px-4'
        }`}>
        {isCollapsed ? (
          <div
            className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-md cursor-pointer hover:shadow-lg transition-shadow duration-200"
            title="IstqSERVERS - IT Infrastructure Management"
          >
            <span className="text-2xl">🖥️</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <span className="text-2xl">🖥️</span>
            <h1 className="text-white text-xl font-bold">IstqSERVERS</h1>
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className={`flex-1 py-4 space-y-1 transition-all duration-300 ${isCollapsed ? 'px-1' : 'px-2'
          }`}>
          {filteredNavigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              className={({ isActive }) =>
                `group flex items-center text-sm font-medium rounded-md transition-all duration-200 relative ${isCollapsed
                  ? 'px-2 py-3 justify-center'
                  : 'px-2 py-2'
                } ${isActive
                  ? 'bg-primary-800 text-white shadow-lg'
                  : 'text-primary-100 hover:bg-primary-600 hover:text-white'
                }`
              }
              title={isCollapsed ? item.name : undefined}
            >
              <item.icon className={`h-6 w-6 flex-shrink-0 ${isCollapsed ? '' : 'mr-3'
                }`} />
              {!isCollapsed && (
                <span className="transition-opacity duration-200">
                  {item.name}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        {/* Global Sync Indicator */}
        {isSyncActive && (
          <div className={`p-3 border-t border-primary-600/50 transition-all duration-300 ${isCollapsed ? 'flex justify-center' : ''}`}>
            {isCollapsed ? (
              <div className="h-2 w-2 bg-blue-400 rounded-full animate-ping" title={`Syncing... ${syncProgress}%`}></div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[10px] font-bold text-primary-200 uppercase tracking-widest">
                  <span className="flex items-center">
                    <svg className="animate-spin h-3 w-3 mr-1.5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating Infrastructure
                  </span>
                  <span>{syncProgress}%</span>
                </div>
                <div className="w-full bg-primary-800 rounded-full h-1 overflow-hidden shadow-inner">
                  <div
                    className="bg-blue-400 h-full transition-all duration-1000 ease-linear shadow-[0_0_8px_rgba(96,165,250,0.5)]"
                    style={{ width: `${syncProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* User Profile Summary */}
        {!isCollapsed && user && (
          <div className="p-4 bg-primary-800 border-t border-primary-600">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-bold text-xs shadow-inner border border-primary-400">
                  {(user.username || 'U').charAt(0).toUpperCase()}
                </div>
              </div>
              <div className="ml-3 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user.username || user.firstName}</p>
                <p className="text-xs text-primary-200 truncate font-inter font-medium">{user.role}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Mobile sidebar */}
      <Transition.Root show={open} as={Fragment}>
        <Dialog as="div" className="relative z-40 md:hidden" onClose={setOpen}>
          <Transition.Child
            as={Fragment}
            enter="transition-opacity ease-linear duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-linear duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-gray-600 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 flex z-40">
            <Transition.Child
              as={Fragment}
              enter="transition ease-in-out duration-300 transform"
              enterFrom="-translate-x-full"
              enterTo="translate-x-0"
              leave="transition ease-in-out duration-300 transform"
              leaveFrom="translate-x-0"
              leaveTo="-translate-x-full"
            >
              <Dialog.Panel className="relative flex-1 flex flex-col max-w-xs w-full bg-primary-700">
                <Transition.Child
                  as={Fragment}
                  enter="ease-in-out duration-300"
                  enterFrom="opacity-0"
                  enterTo="opacity-100"
                  leave="ease-in-out duration-300"
                  leaveFrom="opacity-100"
                  leaveTo="opacity-0"
                >
                  <div className="absolute top-0 right-0 -mr-12 pt-2">
                    <button
                      type="button"
                      className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                      onClick={() => setOpen(false)}
                    >
                      <XMarkIcon className="h-6 w-6 text-white" />
                    </button>
                  </div>
                </Transition.Child>
                <SidebarContent isCollapsed={false} />
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition.Root>

      {/* Desktop sidebar */}
      <div className={`hidden md:flex md:flex-col md:fixed md:inset-y-0 transition-all duration-300 ${collapsed ? 'md:w-16' : 'md:w-64'
        }`}>
        <div className="flex-1 flex flex-col min-h-0 bg-primary-700">
          <SidebarContent isCollapsed={collapsed} />
        </div>
      </div>
    </>
  )
}

export default Sidebar
