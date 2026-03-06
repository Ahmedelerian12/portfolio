import React from 'react';
import {
    CheckCircleIcon,
    ClockIcon,
    ArrowPathIcon,
    ExclamationCircleIcon,
    MapPinIcon,
    CalendarIcon
} from '@heroicons/react/24/outline';
import { format } from 'date-fns';

const OrderKanban = ({ orders, onStatusUpdate, onEdit, onDelete, hasPermission }) => {
    const columns = [
        { id: 'Pending', title: 'Pending', icon: ClockIcon, color: 'bg-gray-100 text-gray-600', border: 'border-gray-200' },
        { id: 'Processing', title: 'Processing', icon: ArrowPathIcon, color: 'bg-blue-50 text-blue-600', border: 'border-blue-200' },
        { id: 'Delivered', title: 'Delivered', icon: CheckCircleIcon, color: 'bg-green-50 text-green-600', border: 'border-green-200' },
        { id: 'Cancelled', title: 'Cancelled', icon: ExclamationCircleIcon, color: 'bg-red-50 text-red-600', border: 'border-red-200' }
    ];

    const getPriorityColor = (priority) => {
        if (priority <= 1) return 'bg-red-100 text-red-700 border-red-200';
        if (priority <= 3) return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-blue-50 text-blue-700 border-blue-100';
    };

    const handleDragStart = (e, orderId) => {
        e.dataTransfer.setData('orderId', orderId);
        e.dataTransfer.effectAllowed = 'move';
        // Add a ghost image or style if needed
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = (e, newStatus) => {
        e.preventDefault();
        const orderId = e.dataTransfer.getData('orderId');
        if (orderId) {
            onStatusUpdate(orderId, newStatus);
        }
    };

    return (
        <div className="flex gap-6 overflow-x-auto pb-8 h-[calc(100vh-250px)]">
            {columns.map(column => {
                const columnOrders = orders.filter(o => o.status === column.id);

                return (
                    <div
                        key={column.id}
                        className="min-w-[320px] w-full max-w-sm flex flex-col bg-gray-50/50 rounded-2xl border border-gray-100 h-full transition-colors duration-200"
                        onDragOver={handleDragOver}
                        onDrop={(e) => hasPermission('orders.update') && handleDrop(e, column.id)}
                    >
                        {/* Column Header */}
                        <div className={`p-4 border-b ${column.border} bg-white rounded-t-2xl flex items-center justify-between sticky top-0 z-10`}>
                            <div className="flex items-center gap-2">
                                <div className={`p-2 rounded-lg ${column.color}`}>
                                    <column.icon className="h-5 w-5" />
                                </div>
                                <h3 className="font-bold text-gray-700">{column.title}</h3>
                            </div>
                            <span className="bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md text-xs font-bold border border-gray-200">
                                {columnOrders.length}
                            </span>
                        </div>

                        {/* Orders List */}
                        <div className="p-3 flex-1 overflow-y-auto space-y-3 custom-scrollbar">
                            {columnOrders.map(order => (
                                <div
                                    key={order._id}
                                    draggable={hasPermission('orders.update')}
                                    onDragStart={(e) => handleDragStart(e, order._id)}
                                    className={`bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group relative ${hasPermission('orders.update') ? 'cursor-grab active:cursor-grabbing' : ''}`}
                                >
                                    <div className="flex justify-between items-start mb-3">
                                        <span className="font-mono text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                                            {order.orderCode}
                                        </span>
                                        <span className={`px-2 py-1 rounded-md text-[10px] font-bold border uppercase tracking-wider ${getPriorityColor(order.priority)}`}>
                                            P{order.priority}
                                        </span>
                                    </div>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-xs text-gray-600 font-medium">
                                            <MapPinIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                            {order.location}
                                        </div>
                                        <div className="flex items-center text-xs text-gray-600 font-medium">
                                            <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                            {format(new Date(order.deliveryDate), 'MMM d, yyyy')}
                                        </div>
                                        <div className="text-xs text-gray-500 line-clamp-2 mt-2 pl-5 border-l-2 border-gray-100 italic">
                                            {order.notes || 'No notes'}
                                        </div>
                                    </div>

                                    {/* Specifications Summary */}
                                    <div className="flex flex-wrap gap-1 mb-4">
                                        <span className="px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-500 font-medium">
                                            {order.cpu}
                                        </span>
                                        <span className="px-1.5 py-0.5 bg-gray-50 border border-gray-100 rounded text-[10px] text-gray-500 font-medium">
                                            {order.ram}
                                        </span>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center justify-between pt-3 border-t border-gray-50">
                                        {hasPermission('orders.write') && (
                                            <button
                                                onClick={() => onEdit(order)}
                                                className="text-xs font-bold text-primary-600 hover:text-primary-700"
                                            >
                                                Edit
                                            </button>
                                        )}

                                        {hasPermission('orders.update') && (
                                            <select
                                                value={order.status}
                                                onChange={(e) => onStatusUpdate(order._id, e.target.value)}
                                                className="text-xs font-semibold bg-gray-50 border-none rounded-lg focus:ring-1 focus:ring-primary-500 cursor-pointer py-1 pl-2 pr-6"
                                            >
                                                {columns.map(col => (
                                                    <option key={col.id} value={col.id}>{col.title}</option>
                                                ))}
                                            </select>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default OrderKanban;
