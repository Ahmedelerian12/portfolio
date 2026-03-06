import React, { useState, useMemo } from 'react';

const RackView = ({ servers }) => {
    const [selectedDatacenter, setSelectedDatacenter] = useState('');
    const [selectedRack, setSelectedRack] = useState('');

    // Extract unique datacenters and racks
    const datacenters = useMemo(() => {
        const dcs = [...new Set(servers.map(s => s.location?.datacenter || s.datacenter || 'Unknown'))];
        return dcs.filter(dc => dc !== 'Unknown').sort();
    }, [servers]);

    const racks = useMemo(() => {
        if (!selectedDatacenter) return [];
        const filteredServers = servers.filter(s =>
            (s.location?.datacenter || s.datacenter) === selectedDatacenter
        );
        return [...new Set(filteredServers.map(s => s.location?.rack).filter(Boolean))].sort();
    }, [servers, selectedDatacenter]);

    // Set initial selections
    React.useEffect(() => {
        if (datacenters.length > 0 && !selectedDatacenter) {
            setSelectedDatacenter(datacenters[0]);
        }
    }, [datacenters]);

    React.useEffect(() => {
        if (racks.length > 0 && !selectedRack) {
            setSelectedRack(racks[0]);
        } else if (racks.length === 0) {
            setSelectedRack('');
        }
    }, [racks]);

    // Generate rack units (42U)
    const rackUnits = Array.from({ length: 42 }, (_, i) => 42 - i);

    // Map servers to positions
    const serversInRack = useMemo(() => {
        if (!selectedDatacenter || !selectedRack) return {};
        const filtered = servers.filter(s =>
            (s.location?.datacenter || s.datacenter) === selectedDatacenter &&
            s.location?.rack === selectedRack
        );

        const posMap = {};
        filtered.forEach(server => {
            const pos = parseInt(server.location?.position);
            if (!isNaN(pos)) {
                posMap[pos] = server;
            }
        });
        return posMap;
    }, [servers, selectedDatacenter, selectedRack]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'online': return 'bg-green-500 border-green-600';
            case 'offline': return 'bg-red-500 border-red-600';
            case 'maintenance': return 'bg-yellow-500 border-yellow-600';
            default: return 'bg-gray-400 border-gray-500';
        }
    };

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4 items-center">
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Datacenter</label>
                    <select
                        value={selectedDatacenter}
                        onChange={(e) => {
                            setSelectedDatacenter(e.target.value);
                            setSelectedRack('');
                        }}
                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[200px]"
                    >
                        <option value="">Select Datacenter</option>
                        {datacenters.map(dc => (
                            <option key={dc} value={dc}>{dc}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1">Rack</label>
                    <select
                        value={selectedRack}
                        onChange={(e) => setSelectedRack(e.target.value)}
                        disabled={!selectedDatacenter || racks.length === 0}
                        className="px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:ring-blue-500 focus:border-blue-500 min-w-[150px] disabled:bg-gray-50 disabled:text-gray-400"
                    >
                        <option value="">Select Rack</option>
                        {racks.map(rack => (
                            <option key={rack} value={rack}>Rack {rack}</option>
                        ))}
                    </select>
                </div>

                <div className="flex-1 flex justify-end">
                    <div className="flex items-center space-x-4 text-xs">
                        <div className="flex items-center"><span className="w-3 h-3 bg-green-500 rounded-sm mr-1"></span> Online</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-red-500 rounded-sm mr-1"></span> Offline</div>
                        <div className="flex items-center"><span className="w-3 h-3 bg-gray-400 rounded-sm mr-1"></span> Unknown</div>
                    </div>
                </div>
            </div>

            {/* Rack Visualization */}
            <div className="flex justify-center">
                {selectedRack ? (
                    <div className="relative bg-gray-800 p-4 rounded-t-xl border-x-8 border-t-8 border-gray-700 shadow-2xl min-w-[400px]">
                        {/* Rack Units Container */}
                        <div className="bg-gray-900 border-2 border-gray-600 rounded">
                            {rackUnits.map(u => {
                                const server = serversInRack[u];
                                return (
                                    <div key={u} className="flex h-8 border-b border-gray-800 hover:bg-gray-800 transition-colors group relative">
                                        {/* Unit Number */}
                                        <div className="w-10 flex-shrink-0 flex items-center justify-center text-[10px] font-mono text-gray-500 border-r border-gray-800 select-none">
                                            {String(u).padStart(2, '0')}
                                        </div>

                                        {/* Unit Slot */}
                                        <div className="flex-1 p-0.5 relative">
                                            {server ? (
                                                <div
                                                    className={`h-full w-full rounded-sm border ${getStatusColor(server.status)} flex items-center px-3 cursor-pointer group-hover:brightness-110 transition-all shadow-inner`}
                                                    title={`${server.name} (${server.ipAddress || 'No IP'})`}
                                                >
                                                    <span className="text-[10px] font-bold text-white truncate drop-shadow-md">
                                                        {server.name}
                                                    </span>

                                                    {/* Tooltip on Hover */}
                                                    <div className="absolute left-full ml-4 top-1/2 -translate-y-1/2 z-50 w-64 bg-white rounded-lg shadow-xl border border-gray-200 p-4 hidden group-hover:block transition-all pointer-events-none">
                                                        <div className="flex items-center justify-between mb-2">
                                                            <h4 className="font-bold text-gray-900 truncate">{server.name}</h4>
                                                            <span className={`w-2 h-2 rounded-full ${server.status === 'online' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                                        </div>
                                                        <div className="space-y-1 text-xs text-gray-600">
                                                            <div className="flex justify-between"><span>IP Address:</span> <span className="font-mono text-blue-600 font-semibold">{server.ipAddress || 'None'}</span></div>
                                                            <div className="flex justify-between"><span>iLO IP:</span> <span className="font-mono text-purple-600 font-semibold">{server.managementInterface?.ip || 'None'}</span></div>
                                                            <div className="flex justify-between"><span>Vendor:</span> <span>{server.vendor}</span></div>
                                                            <div className="flex justify-between"><span>U-Position:</span> <span>{u}</span></div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="h-full w-full border border-dashed border-gray-700 opacity-20 group-hover:opacity-40 transition-opacity"></div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white w-full rounded-xl border border-dashed border-gray-300 py-20 flex flex-col items-center justify-center text-gray-400">
                        <span className="text-6xl mb-4">🗄️</span>
                        <p className="text-lg">Select a Datacenter and Rack to visualize</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RackView;
