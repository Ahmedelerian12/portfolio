import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from 'date-fns';
import {
    ChevronLeftIcon,
    ChevronRightIcon,
    ServerIcon
} from '@heroicons/react/24/outline';

const OrderCalendar = ({ orders }) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, -1));

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate
    });

    const getOrdersForDay = (day) => {
        return orders.filter(order => isSameDay(new Date(order.deliveryDate), day));
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <h2 className="text-lg font-bold text-gray-900 flex items-center">
                    <ServerIcon className="h-5 w-5 mr-2 text-primary-600" />
                    Delivery Calendar
                </h2>
                <div className="flex items-center space-x-4">
                    <span className="text-sm font-bold text-gray-700">
                        {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ChevronLeftIcon className="h-5 w-5" />
                        </button>
                        <button
                            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                            className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ChevronRightIcon className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-7 border-b border-gray-100">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="py-2 text-center text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50/30">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 auto-rows-[120px]">
                {calendarDays.map((day, idx) => {
                    const dayOrders = getOrdersForDay(day);
                    const isSelected = isSameDay(day, new Date());
                    const isCurrentMonth = isSameMonth(day, monthStart);

                    return (
                        <div
                            key={idx}
                            className={`p-2 border-r border-b border-gray-50 group hover:bg-primary-50/30 transition-colors ${!isCurrentMonth ? 'bg-gray-50/20' : ''
                                } ${idx % 7 === 6 ? 'border-r-0' : ''}`}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <span className={`text-xs font-bold ${isSelected
                                        ? 'bg-primary-600 text-white w-6 h-6 flex items-center justify-center rounded-full'
                                        : isCurrentMonth ? 'text-gray-900' : 'text-gray-300'
                                    }`}>
                                    {format(day, 'd')}
                                </span>
                                {dayOrders.length > 0 && (
                                    <span className="text-[10px] font-black text-primary-600 bg-primary-50 px-1.5 py-0.5 rounded-md">
                                        {dayOrders.length}
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1 overflow-y-auto max-h-[80px] scrollbar-hide">
                                {dayOrders.map((order, oIdx) => (
                                    <div
                                        key={oIdx}
                                        className={`text-[10px] p-1 rounded-md truncate font-bold border ${order.priority <= 1
                                                ? 'bg-red-50 text-red-700 border-red-100'
                                                : 'bg-primary-50 text-primary-700 border-primary-100'
                                            }`}
                                        title={`${order.orderCode}: ${order.chassis}`}
                                    >
                                        {order.orderCode}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default OrderCalendar;
