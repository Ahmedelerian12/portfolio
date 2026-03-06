import React, { useState, useEffect } from 'react';
import { ordersAPI, serversAPI } from '../../services/api';
import {
    CalendarDaysIcon,
    PlusIcon,
    TrashIcon,
    PencilSquareIcon,
    CheckCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    MagnifyingGlassIcon,
    FunnelIcon,
    TableCellsIcon,
    ViewColumnsIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import OrderCalendar from '../../components/Orders/OrderCalendar';
import OrderKanban from '../../components/Orders/OrderKanban';

const OrderManagement = () => {
    const { hasPermission } = useAuth();
    const [orders, setOrders] = useState([]);
    const [filteredOrders, setFilteredOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('kanban'); // Default to Kanban view
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [locations, setLocations] = useState([]);

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [filterLocation, setFilterLocation] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPriority, setFilterPriority] = useState('');

    const [editingOrder, setEditingOrder] = useState(null);
    const [formData, setFormData] = useState({
        orderCode: '',
        chassis: 'Dl360 Gen9',
        cpu: '2 x 2640v4 (40TH)',
        ram: '128GB',
        disk: '1x256GB M.2 ubuntu 20',
        nic: '2 GB Bandwidth',
        location: 'Ams North C',
        priority: 3,
        deliveryDate: format(new Date(), 'yyyy-MM-dd'),
        notes: ''
    });

    useEffect(() => {
        fetchOrders();
        fetchLocations();
    }, []);

    useEffect(() => {
        let result = orders;

        if (searchTerm) {
            const lowerSearch = searchTerm.toLowerCase();
            result = result.filter(o =>
                o.orderCode.toLowerCase().includes(lowerSearch) ||
                (o.serverCode && o.serverCode.toLowerCase().includes(lowerSearch)) ||
                (o.notes && o.notes.toLowerCase().includes(lowerSearch))
            );
        }

        if (filterLocation) {
            result = result.filter(o => o.location === filterLocation);
        }

        if (filterStatus) {
            result = result.filter(o => o.status === filterStatus);
        }

        if (filterPriority) {
            // Priority filtering: High (1-3), Medium (4-7), Low (8-10)
            if (filterPriority === 'High') result = result.filter(o => o.priority <= 3);
            if (filterPriority === 'Medium') result = result.filter(o => o.priority > 3 && o.priority <= 7);
            if (filterPriority === 'Low') result = result.filter(o => o.priority > 7);
        }

        setFilteredOrders(result);
    }, [orders, searchTerm, filterLocation, filterStatus, filterPriority]);

    const fetchLocations = async () => {
        try {
            const response = await serversAPI.getSummary();
            if (response.data && response.data.datacenters) {
                const dcList = Object.keys(response.data.datacenters).sort();
                setLocations(dcList);
            }
        } catch (err) {
            console.error('Error fetching locations:', err);
        }
    };

    const fetchOrders = async () => {
        try {
            const response = await ordersAPI.getAll();
            if (response.data.success) {
                setOrders(response.data.orders);
                setFilteredOrders(response.data.orders);
            }
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            toast.error('Failed to load orders');
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const toastId = toast.loading(editingOrder ? 'Updating order...' : 'Creating order...');

        try {
            if (editingOrder) {
                await ordersAPI.update(editingOrder._id, formData);
                toast.success('Order updated successfully', { id: toastId });
            } else {
                await ordersAPI.create(formData);
                toast.success('Order created successfully', { id: toastId });
            }
            setIsModalOpen(false);
            setEditingOrder(null);
            fetchOrders();
        } catch (err) {
            console.error('Error saving order:', err);
            const errorMessage = err.response?.data?.error || 'Failed to save order';
            toast.error(errorMessage, { id: toastId });
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        const toastId = toast.loading('Updating status...');
        try {
            await ordersAPI.update(id, { status: newStatus });
            toast.success(`Status updated to ${newStatus}`, { id: toastId });
            fetchOrders();
        } catch (err) {
            console.error('Error updating status:', err);
            const errorMessage = err.response?.data?.error || 'Failed to update status';
            toast.error(errorMessage, { id: toastId });
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this order?')) return;

        const toastId = toast.loading('Deleting order...');
        try {
            await ordersAPI.delete(id);
            toast.success('Order deleted successfully', { id: toastId });
            fetchOrders();
        } catch (err) {
            console.error('Error deleting order:', err);
            toast.error('Failed to delete order', { id: toastId });
        }
    };

    const openEditModal = (order) => {
        setEditingOrder(order);
        setFormData({
            ...order,
            deliveryDate: format(new Date(order.deliveryDate), 'yyyy-MM-dd')
        });
        setIsModalOpen(true);
    };

    const openCreateModal = () => {
        setEditingOrder(null);
        setFormData({
            orderCode: `ORD-${Date.now().toString().slice(-6)}`,
            chassis: 'Dl360 Gen9',
            cpu: '2 x 2640v4 (40TH)',
            ram: '128GB',
            disk: '1x256GB M.2 ubuntu 20',
            nic: '2 GB Bandwidth',
            location: 'North C',
            priority: 3,
            deliveryDate: format(new Date(), 'yyyy-MM-dd'),
            notes: ''
        });
        setIsModalOpen(true);
    };

    const getPriorityColor = (priority) => {
        if (priority <= 1) return 'bg-red-50 text-red-700 border-red-100';
        if (priority <= 3) return 'bg-orange-50 text-orange-700 border-orange-100';
        return 'bg-blue-50 text-blue-700 border-blue-100';
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Delivered': return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
            case 'Processing': return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />;
            case 'Cancelled': return <ExclamationCircleIcon className="h-5 w-5 text-red-500" />;
            default: return <ClockIcon className="h-5 w-5 text-gray-400" />;
        }
    };

    // Calculate Stats based on CURRENT filtered search or all orders? Usually stats are for all.
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'Pending').length,
        processing: orders.filter(o => o.status === 'Processing').length,
        delivered: orders.filter(o => o.status === 'Delivered').length
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header Section */}
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">Order Management</h1>
                    <p className="mt-1 text-sm text-gray-500 font-medium font-inter">
                        Track and prioritize server deployments across locations.
                    </p>
                </div>
                {hasPermission('orders.write') && (
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center justify-center px-4 py-2.5 bg-primary-600 border border-transparent rounded-xl text-sm font-bold text-white hover:bg-primary-700 transition-all duration-200 shadow-md shadow-primary-200 hover:shadow-primary-300"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Create New Order
                    </button>
                )}
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Orders</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.total}</p>
                    </div>
                    <div className="h-10 w-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <TableCellsIcon className="h-6 w-6" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Pending</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.pending}</p>
                    </div>
                    <div className="h-10 w-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500">
                        <ClockIcon className="h-6 w-6" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-blue-400 uppercase tracking-wider">Processing</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.processing}</p>
                    </div>
                    <div className="h-10 w-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                        <ArrowPathIcon className="h-6 w-6 animate-spin-slow" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between">
                    <div>
                        <p className="text-xs font-bold text-green-400 uppercase tracking-wider">Delivered</p>
                        <p className="text-2xl font-black text-gray-900 mt-1">{stats.delivered}</p>
                    </div>
                    <div className="h-10 w-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                        <CheckCircleIcon className="h-6 w-6" />
                    </div>
                </div>
            </div>

            {/* Controls & Filters */}
            <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-1 items-center gap-4 flex-wrap">
                    <div className="relative">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm font-medium w-full md:w-64 focus:ring-2 focus:ring-primary-100"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <FunnelIcon className="h-4 w-4 text-gray-400" />
                        <select
                            value={filterLocation}
                            onChange={(e) => setFilterLocation(e.target.value)}
                            className="py-2 pl-3 pr-8 bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-primary-100 cursor-pointer"
                        >
                            <option value="">All Locations</option>
                            {locations.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>

                        <select
                            value={filterPriority}
                            onChange={(e) => setFilterPriority(e.target.value)}
                            className="py-2 pl-3 pr-8 bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-600 focus:ring-2 focus:ring-primary-100 cursor-pointer"
                        >
                            <option value="">All Priorities</option>
                            <option value="High">High Priority</option>
                            <option value="Medium">Medium Priority</option>
                            <option value="Low">Low Priority</option>
                        </select>
                    </div>
                </div>

                <div className="flex bg-gray-100 p-1 rounded-xl shrink-0">
                    <button
                        onClick={() => setView('kanban')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'kanban' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <ViewColumnsIcon className="h-4 w-4" />
                        Board
                    </button>
                    <button
                        onClick={() => setView('table')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'table' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <TableCellsIcon className="h-4 w-4" />
                        Table
                    </button>
                    <button
                        onClick={() => setView('calendar')}
                        className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <CalendarDaysIcon className="h-4 w-4" />
                        Calendar
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {view === 'calendar' ? (
                <OrderCalendar orders={filteredOrders} />
            ) : view === 'kanban' ? (
                <OrderKanban
                    orders={filteredOrders}
                    onStatusUpdate={handleStatusUpdate}
                    onEdit={openEditModal}
                    onDelete={handleDelete}
                    hasPermission={hasPermission}
                />
            ) : (
                /* Enhanced Table View */
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-100">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Order Info</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Specs</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Location</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Priority</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Delivery</th>
                                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">Status</th>
                                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 uppercase tracking-widest">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-50">
                                {filteredOrders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 font-mono">{order.orderCode}</span>
                                                <span className="text-xs text-gray-500">{order.notes || '-'}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                                    {order.cpu}
                                                </span>
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-gray-100 text-gray-600">
                                                    {order.ram}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                                            {order.location}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-2 py-1 rounded-lg text-xs font-bold border ${getPriorityColor(order.priority)}`}>
                                                P{order.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-medium">
                                            {format(new Date(order.deliveryDate), 'MMM d, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center space-x-2">
                                                {getStatusIcon(order.status)}
                                                <select
                                                    value={order.status}
                                                    onChange={(e) => handleStatusUpdate(order._id, e.target.value)}
                                                    disabled={!hasPermission('orders.update')}
                                                    className={`text-xs font-bold border-none bg-transparent focus:ring-0 cursor-pointer py-0 pl-0 pr-6 ${!hasPermission('orders.update') ? 'cursor-not-allowed opacity-80' : ''
                                                        } ${order.status === 'Delivered' ? 'text-green-700' :
                                                            order.status === 'Processing' ? 'text-blue-700' :
                                                                order.status === 'Cancelled' ? 'text-red-700' :
                                                                    'text-gray-700'
                                                        }`}
                                                >
                                                    <option value="Pending">Pending</option>
                                                    <option value="Processing">Processing</option>
                                                    <option value="Delivered">Delivered</option>
                                                    <option value="Cancelled">Cancelled</option>
                                                </select>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                {hasPermission('orders.write') && (
                                                    <button
                                                        onClick={() => openEditModal(order)}
                                                        className="p-1.5 bg-gray-50 text-gray-400 hover:text-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
                                                    >
                                                        <PencilSquareIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                                {hasPermission('orders.update') && (
                                                    <button
                                                        onClick={() => handleDelete(order._id)}
                                                        className="p-1.5 bg-gray-50 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                                    >
                                                        <TrashIcon className="h-4 w-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {filteredOrders.length === 0 && (
                                    <tr>
                                        <td colSpan="7" className="px-6 py-12 text-center">
                                            <div className="flex flex-col items-center justify-center">
                                                <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                                    <MagnifyingGlassIcon className="h-8 w-8 text-gray-300" />
                                                </div>
                                                <h3 className="text-lg font-bold text-gray-900">No orders found</h3>
                                                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                                                    Try adjusting your search or filters to find what you're looking for.
                                                </p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}


            {/* Redesigned Modal for Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200 my-8">
                        {/* Modal Header */}
                        <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight">
                                    {editingOrder ? 'Edit Order' : 'New Order Request'}
                                </h2>
                                <p className="text-sm text-gray-500 font-medium">Please fill in the deployment details below.</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="h-10 w-10 flex items-center justify-center rounded-full bg-white border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition-all shadow-sm">
                                <PlusIcon className="h-6 w-6 rotate-45" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-8">
                            {/* Section 1: Deployment Details */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest border-b border-primary-100 pb-2 mb-4">Deployment Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Order Code</label>
                                        <input
                                            type="text"
                                            name="orderCode"
                                            value={formData.orderCode}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none font-mono text-sm"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Location</label>
                                        <select
                                            name="location"
                                            value={formData.location}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                            required
                                        >
                                            <option value="">Select Location</option>
                                            {locations.map(loc => (
                                                <option key={loc} value={loc}>{loc}</option>
                                            ))}
                                            {!locations.includes('North C') && <option value="AMS North C">AMS North C</option>}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Priority (1-10)</label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                name="priority"
                                                min="1"
                                                max="10"
                                                value={formData.priority}
                                                onChange={handleInputChange}
                                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            />
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 font-medium pointer-events-none">
                                                Low (10) - High (1)
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Delivery Date</label>
                                        <input
                                            type="date"
                                            name="deliveryDate"
                                            value={formData.deliveryDate}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none cursor-pointer"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 2: Hardware Specs */}
                            <div className="space-y-4">
                                <h3 className="text-xs font-bold text-primary-600 uppercase tracking-widest border-b border-primary-100 pb-2 mb-4">Hardware Specifications</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">CPU</label>
                                        <input
                                            type="text"
                                            name="cpu"
                                            value={formData.cpu}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">RAM</label>
                                        <input
                                            type="text"
                                            name="ram"
                                            value={formData.ram}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 128GB"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Disk</label>
                                        <input
                                            type="text"
                                            name="disk"
                                            value={formData.disk}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 1x256GB M.2"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">NIC</label>
                                        <input
                                            type="text"
                                            name="nic"
                                            value={formData.nic}
                                            onChange={handleInputChange}
                                            placeholder="e.g. 10Gbps"
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 gap-6 pt-4">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-600 uppercase">Chassis / Server Model</label>
                                        <input
                                            type="text"
                                            name="chassis"
                                            value={formData.chassis}
                                            onChange={handleInputChange}
                                            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Section 3: Additional Notes */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-600 uppercase">Notes / Instructions</label>
                                <textarea
                                    name="notes"
                                    value={formData.notes}
                                    onChange={handleInputChange}
                                    rows="3"
                                    placeholder="Any special configurations or deployment instructions..."
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => setIsModalOpen(false)}
                                    className="px-6 py-3.5 bg-white border border-gray-200 text-gray-600 rounded-xl font-bold hover:bg-gray-50 hover:text-gray-900 transition-colors shadow-sm"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 px-6 py-3.5 bg-primary-600 text-white rounded-xl font-bold hover:bg-primary-700 transition-all shadow-md hover:shadow-lg shadow-primary-200"
                                >
                                    {editingOrder ? 'Update Order Details' : 'Create New Order'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderManagement;
