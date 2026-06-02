/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { HubRoute } from '../types';
import { INITIAL_ROUTES, UNASSIGNED_ORDERS, loadData, saveData } from '../data';
import { 
  FileSpreadsheet, Save, ArrowRight, User, Truck, ShieldAlert,
  Trash2, Layers, CheckCircle, ChevronDown, ChevronUp, GripVertical
} from 'lucide-react';

interface UnassignedOrder {
  id: string;
  noRt: string;
  customer: string;
  destination: string;
  date: string;
}

export default function PlanningBoardWorksite() {
  const [unassigned, setUnassigned] = useState<UnassignedOrder[]>(() => {
    return loadData('planning_unassigned_orders', UNASSIGNED_ORDERS);
  });
  
  const [routes, setRoutes] = useState<HubRoute[]>(() => {
    return loadData('planning_hub_routes', INITIAL_ROUTES);
  });

  const [dateFilter, setDateFilter] = useState('2023-10-25');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedHubs, setExpandedHubs] = useState<Record<string, boolean>>({
    'SURABAYA': true,
    'HUB MALANG': true,
    'JAKARTA BARAT': false
  });

  const toggleToggleHub = (hubId: string) => {
    setExpandedHubs(prev => ({ ...prev, [hubId]: !prev[hubId] }));
  };

  // Drag and Drop State Handlers
  const handleDragStart = (e: React.DragEvent, orderId: string) => {
    e.dataTransfer.setData('order_id', orderId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetHubId: string) => {
    e.preventDefault();
    const orderId = e.dataTransfer.getData('order_id');
    if (orderId) {
      assignOrderToHub(orderId, targetHubId);
    }
  };

  // Alternative Tap-assignment mechanics for better accessibility
  const handleSelectAssign = (orderId: string, hubId: string) => {
    if (hubId) {
      assignOrderToHub(orderId, hubId);
    }
  };

  const assignOrderToHub = (orderId: string, hubId: string) => {
    const orderToMove = unassigned.find(o => o.id === orderId);
    if (!orderToMove) return;

    // Check capacity limit
    const targetRoute = routes.find(r => r.id === hubId);
    if (targetRoute && targetRoute.assignedOrderIds.length >= targetRoute.kapasitasCapacity) {
      alert(`Kapasitas armada HUB ${hubId} penuh (${targetRoute.kapasitasCapacity}/${targetRoute.kapasitasCapacity}). Tambah kapasitas atau pilih rute lain!`);
      return;
    }

    // 1. Move from unassigned
    setUnassigned(prev => prev.filter(o => o.id !== orderId));

    // 2. Add to designated hub route
    setRoutes(prevRoutes => prevRoutes.map(route => {
      if (route.id === hubId) {
        return {
          ...route,
          assignedOrderIds: [...route.assignedOrderIds, orderId],
          kapasitasFilled: route.assignedOrderIds.length + 1
        };
      }
      return route;
    }));
  };

  const handleRemoveOrder = (orderId: string, hubId: string) => {
    // 1. Determine from mock info
    const isBaseOrder = !['ORD-2023-891', 'ORD-2023-892', 'ORD-2023-893', 'ORD-2023-894', 'ORD-2023-895'].includes(orderId);
    
    const returnedOrder: UnassignedOrder = {
      id: orderId,
      noRt: orderId === 'ORD-2023-880' ? 'RT-098' : orderId === 'ORD-2023-881' ? 'RT-098' : 'RT-099',
      customer: orderId === 'ORD-2023-880' ? 'PT. Maju Bersama Jaya' : orderId === 'ORD-2023-881' ? 'IndoRetail Group' : 'CV. Surya Abadi',
      destination: hubId,
      date: '2023-10-24'
    };

    // 2. Reduce route item
    setRoutes(prevRoutes => prevRoutes.map(route => {
      if (route.id === hubId) {
        return {
          ...route,
          assignedOrderIds: route.assignedOrderIds.filter(id => id !== orderId),
          kapasitasFilled: Math.max(0, route.assignedOrderIds.length - 1)
        };
      }
      return route;
    }));

    // 3. Save back to unassigned list
    setUnassigned(prev => [...prev, returnedOrder]);
  };

  const handleEditRouteField = (hubId: string, field: 'noLc' | 'nopolArmada' | 'driver' | 'status', value: string) => {
    setRoutes(prev => prev.map(route => {
      if (route.id === hubId) {
        return { ...route, [field]: value };
      }
      return route;
    }));
  };

  const handleSavePlan = () => {
    saveData('planning_unassigned_orders', unassigned);
    saveData('planning_hub_routes', routes);
    alert('Perencanaan logistik (Delivery Plan) berhasil disimpan ke server lokal database!');
  };

  const filteredUnassigned = unassigned.filter(item => {
    const matchSearch = item.id.toLowerCase().includes(searchQuery.toLowerCase()) || 
                        item.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        item.destination.toLowerCase().includes(searchQuery.toLowerCase());
    return matchSearch;
  });

  return (
    <div id="planning-board-view" className="space-y-6">
      
      {/* Upper header action row */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#24191a] tracking-tight flex items-center gap-2">
            Planning Board
          </h2>
          <p className="text-[#574143] text-sm mt-1">
            Seret dan lepas kargo pesanan ke bagian rute hub distribusi armada yang sesuai.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Quick Find */}
          <input
            id="search-orders"
            type="text"
            placeholder="Cari order unassigned..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 border border-[#ddbfc1] rounded text-xs text-[#24191a] bg-white w-full sm:w-48 focus:ring-1 focus:ring-[#c74e62] outline-none"
          />

          {/* Date Picker */}
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-gray-500 font-bold uppercase whitespace-nowrap">Tgl Kirim:</span>
            <input
              id="plan-date"
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-1.5 border border-[#ddbfc1] bg-white text-xs font-semibold rounded text-gray-800"
            />
          </div>

          <button
            id="save-plan-btn"
            onClick={handleSavePlan}
            className="bg-[#a33348] hover:bg-[#8e2b3e] text-white px-4 py-2 rounded text-xs font-bold transition flex items-center gap-1.5 shadow-sm ml-auto"
          >
            <Save className="w-3.5 h-3.5" />
            Save Plan
          </button>
        </div>
      </div>

      {/* Main Workspace split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Unassigned Orders */}
        <div className="lg:col-span-4 bg-[#fff8f7] border border-[#ddbfc1] rounded-lg p-5 flex flex-col h-[650px]">
          <div className="flex justify-between items-center pb-4 border-b border-[#ddbfc1] mb-4">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#a33348]" />
              <h3 className="font-bold text-sm text-[#24191a]">Unassigned Orders</h3>
            </div>
            <span className="bg-[#fff0f0] text-[#a33348] px-2.5 py-0.5 rounded-full text-xs font-bold font-mono">
              {filteredUnassigned.length} Pending
            </span>
          </div>

          {/* Flow list body */}
          <div className="space-y-3 overflow-y-auto flex-1 pr-1">
            {filteredUnassigned.map((order) => (
              <div
                key={order.id}
                draggable
                onDragStart={(e) => handleDragStart(e, order.id)}
                className="bg-white border border-[#ddbfc1] rounded p-4 hover:border-[#a33348] hover:shadow-md transition duration-150 cursor-grab active:cursor-grabbing relative group"
              >
                <div className="absolute top-4 right-4 flex items-center text-gray-300 group-hover:text-amber-500 transition cursor-help" title="Seret kartu ini ke Hub di sebelah kanan untuk menetapkan rute!">
                  <GripVertical className="w-4 h-4" />
                </div>

                <div className="flex items-baseline gap-2">
                  <span className="text-xs font-extrabold text-[#a33348] font-mono">{order.id}</span>
                  <span className="text-[10px] bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded font-mono uppercase">{order.noRt}</span>
                </div>

                <h4 className="text-xs font-semibold text-gray-900 mt-2 line-clamp-1">{order.customer}</h4>
                
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-50 text-[10px] text-gray-500 font-medium">
                  <span className="bg-[#fff0f0] text-[#a33348] px-1.5 py-0.5 rounded font-mono font-bold">{order.destination}</span>
                  <span className="font-mono">{order.date}</span>
                </div>

                {/* Dropdown menu alternative to Drag&Drop for mobile / ease of use */}
                <div className="mt-3.5 pt-2 border-t border-gray-100 flex items-center justify-between gap-1.5">
                  <span className="text-[9px] text-gray-400 font-bold uppercase">Assign ke:</span>
                  <select
                    id={`assign-select-${order.id}`}
                    value=""
                    onChange={(e) => handleSelectAssign(order.id, e.target.value)}
                    className="text-[10px] bg-[#fff0f0] hover:bg-[#ffe2e4] text-[#a33348] font-bold border-none rounded py-1 px-1.5 outline-none transition cursor-pointer"
                  >
                    <option value="">Pilih Hub...</option>
                    {routes.map(r => (
                      <option key={r.id} value={r.id}>{r.id}</option>
                    ))}
                  </select>
                </div>
              </div>
            ))}

            {filteredUnassigned.length === 0 && (
              <div className="text-center py-24 text-xs text-gray-400">
                Semua pesanan berhasil direncanakan! Tidak ada pesanan tertunda.
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Delivery Plan routes list */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-[#fff0f0] border border-[#ddbfc1] p-4 rounded-lg flex justify-between items-center">
            <h3 className="text-sm font-bold text-[#24191a] flex items-center gap-2">
              <Truck className="w-4 h-4 text-[#a33348]" />
              Workspace Delivery Plan
            </h3>
            <span className="text-[10px] text-[#574143] font-mono leading-none">
              Double-click kolom isian rute untuk mengubah data sopir
            </span>
          </div>

          <div className="space-y-4 max-h-[580px] overflow-y-auto pr-1">
            {routes.map((hub) => {
              const isExpanded = expandedHubs[hub.id];
              const filledPercent = Math.min(100, Math.round((hub.assignedOrderIds.length / hub.kapasitasCapacity) * 100));

              return (
                <div 
                  key={hub.id}
                  onDragOver={handleDragOver}
                  onDrop={(e) => handleDrop(e, hub.id)}
                  className={`bg-white border text-[#24191a] rounded-lg transition duration-200 overflow-hidden ${
                    isExpanded ? 'border-[#a33348] ring-1 ring-[#a33348]/20' : 'border-[#ddbfc1]'
                  }`}
                >
                  {/* Collapsible Hub Header */}
                  <div 
                    onClick={() => toggleToggleHub(hub.id)}
                    className="bg-gray-50/70 p-4 border-b border-gray-100 flex justify-between items-center cursor-pointer select-none"
                  >
                    <div className="flex items-center gap-3">
                      <h4 className="font-extrabold text-sm text-[#24191a] font-mono tracking-wider">{hub.id}</h4>
                      <span className="bg-[#a33348] text-white text-[10px] font-extrabold px-2 py-0.5 rounded">
                        {hub.assignedOrderIds.length} Orders
                      </span>
                    </div>

                    <div className="flex items-center gap-4">
                      {/* Capacity short recap pill */}
                      <span className="text-xs font-semibold text-[#8a7173] font-mono">
                        Kapasitas: {hub.assignedOrderIds.length}/{hub.kapasitasCapacity} ({filledPercent}%)
                      </span>
                      
                      {/* State tag */}
                      <select
                        id={`status-select-${hub.id}`}
                        value={hub.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => handleEditRouteField(hub.id, 'status', e.target.value)}
                        className="text-[11px] font-bold border border-gray-200 rounded py-0.5 px-1.5 focus:ring-0 cursor-pointer bg-white"
                      >
                        <option value="Planned">Planned</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>

                      {isExpanded ? <ChevronUp className="w-4.5 h-4.5 text-gray-400" /> : <ChevronDown className="w-4.5 h-4.5 text-gray-400" />}
                    </div>
                  </div>

                  {/* Expanded block */}
                  {isExpanded && (
                    <div className="p-5 space-y-4">
                      
                      {/* Input fields as shown in visual 4 */}
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                        {/* No. LC */}
                        <div>
                          <label className="text-[10px] font-extrabold text-[#574143] uppercase tracking-wider block mb-1">No. LC</label>
                          <input
                            id={`input-lc-${hub.id}`}
                            type="text"
                            value={hub.noLc}
                            onChange={(e) => handleEditRouteField(hub.id, 'noLc', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#ddbfc1] rounded text-xs font-medium focus:ring-1 focus:ring-[#c74e62] outline-none"
                          />
                        </div>

                        {/* Nopol Armada */}
                        <div>
                          <label className="text-[10px] font-extrabold text-[#574143] uppercase tracking-wider block mb-1">Nopol Armada</label>
                          <input
                            id={`input-nopol-${hub.id}`}
                            type="text"
                            value={hub.nopolArmada}
                            onChange={(e) => handleEditRouteField(hub.id, 'nopolArmada', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#ddbfc1] rounded text-xs font-medium focus:ring-1 focus:ring-[#c74e62] outline-none"
                          />
                        </div>

                        {/* Driver */}
                        <div>
                          <label className="text-[10px] font-extrabold text-[#574143] uppercase tracking-wider block mb-1">Driver</label>
                          <input
                            id={`input-driver-${hub.id}`}
                            type="text"
                            value={hub.driver}
                            onChange={(e) => handleEditRouteField(hub.id, 'driver', e.target.value)}
                            className="w-full px-2.5 py-1.5 border border-[#ddbfc1] rounded text-xs font-medium focus:ring-1 focus:ring-[#c74e62] outline-none"
                          />
                        </div>

                        {/* Capacity Percentage display bar */}
                        <div>
                          <span className="text-[10px] font-extrabold text-[#574143] uppercase tracking-wider block mb-1">Kapasitas</span>
                          <div className="bg-gray-100 rounded px-2.5 py-1.5 border border-[#ddbfc1] flex flex-col justify-center h-[32px]">
                            <div className="flex justify-between items-center text-[10px] font-semibold mb-1">
                              <span>{hub.assignedOrderIds.length}/{hub.kapasitasCapacity}</span>
                              <span className={filledPercent === 100 ? 'text-red-500 font-bold' : 'text-gray-500'}>{filledPercent}%</span>
                            </div>
                            <div className="w-full bg-gray-200 h-1 rounded overflow-hidden">
                              <div 
                                className={`h-full transition-all duration-300 ${
                                  filledPercent === 100 ? 'bg-red-500' : filledPercent > 70 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${filledPercent}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Orders mapped in list */}
                      <div className="border border-gray-100 rounded overflow-hidden">
                        
                        <div className="bg-[#fff8f7] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#574143] grid grid-cols-12 gap-2 border-b border-gray-100">
                          <div className="col-span-4">No. Order</div>
                          <div className="col-span-3">No. RT</div>
                          <div className="col-span-4">Kota / Hub</div>
                          <div className="col-span-1 text-right">Aksi</div>
                        </div>

                        {/* Order Elements list */}
                        <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                          {hub.assignedOrderIds.map((orderId) => {
                            // Assign standard RT visual mappings matching UI 4
                            let rtCode = 'RT-098';
                            if (orderId === 'ORD-2023-882') rtCode = 'RT-099';
                            if (orderId === 'ORD-2023-891') rtCode = 'RT-102';
                            if (orderId === 'ORD-2023-892') rtCode = 'RT-103';

                            return (
                              <div key={orderId} className="px-4 py-2.5 text-xs grid grid-cols-12 gap-2 items-center hover:bg-slate-50 transition">
                                <div className="col-span-4 font-mono font-bold text-[#a33348]">{orderId}</div>
                                <div className="col-span-3 text-gray-500 font-mono">{rtCode}</div>
                                <div className="col-span-4 font-semibold text-gray-800">{hub.id}</div>
                                <div className="col-span-1 text-right">
                                  <button
                                    id={`remove-btn-${orderId}`}
                                    onClick={() => handleRemoveOrder(orderId, hub.id)}
                                    className="p-1 text-[#a33348] hover:text-[#ba1a1a] hover:bg-rose-50 rounded transition"
                                    title="Batalkan penetapan rute"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}

                          {hub.assignedOrderIds.length === 0 && (
                            <div className="p-8 text-center bg-gray-50/50 flex flex-col items-center justify-center border-2 border-dashed border-gray-100 m-2 rounded">
                              <FileSpreadsheet className="w-6 h-6 text-gray-300 mb-2" />
                              <p className="text-[11px] text-gray-400 font-medium">
                                Drag orders here to assign to {hub.id} route
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
}
