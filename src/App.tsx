/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { DeliveryRequest } from './types';
import { INITIAL_REQUESTS, UNASSIGNED_ORDERS, loadData, saveData } from './data';
import InputRequestForm from './components/InputRequestForm';
import MonitoringDashboard from './components/MonitoringDashboard';
import PlanningBoardWorksite from './components/PlanningBoardWorksite';
import PerformanceReport from './components/PerformanceReport';
import { Bell, Truck, Heart, ArrowUpRight, LogOut, Info, Sparkles, CheckCircle2, Trash2 } from 'lucide-react';
import { initAuth, googleSignIn, logout, getAccessToken } from './firebase';
import { User } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<'input_request' | 'monitoring' | 'planning_board' | 'report'>(() => {
    return loadData<'input_request' | 'monitoring' | 'planning_board' | 'report'>('logisales_active_tab', 'monitoring');
  });

  const [requests, setRequests] = useState<DeliveryRequest[]>(() => {
    return loadData<DeliveryRequest[]>('logisales_delivery_requests', INITIAL_REQUESTS);
  });

  const [showNotificationDropdown, setShowNotificationDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Authentication State
  const [needsAuth, setNeedsAuth] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Mock list of notifications matching real-time activity
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Order #LT-88210 berhasil terkirim ke Bandung.', time: '5 mnt lalu', read: false },
    { id: 2, text: 'Permintaan pengiriman baru masuk untuk Surabaya.', time: '1 jam lalu', read: false },
    { id: 3, text: 'Sopir Hendra Wijaya ditugaskan rute Jakarta Barat.', time: '3 jam lalu', read: true }
  ]);

  useEffect(() => {
    const unsubscribe = initAuth(
      (user, token) => {
        setUser(user);
        setNeedsAuth(false);
      },
      () => {
        setUser(null);
        setNeedsAuth(true);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setNeedsAuth(false);
      }
    } catch (err) {
      console.error('Login failed:', err);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    window.location.reload();
  };

  useEffect(() => {
    saveData('logisales_delivery_requests', requests);
  }, [requests]);

  useEffect(() => {
    saveData('logisales_active_tab', activeTab);
  }, [activeTab]);

  const handleAddRequest = (newRequest: DeliveryRequest) => {
    setRequests(prev => [newRequest, ...prev]);

    // Construct the UnassignedOrder item for the Admin Confirmation / Planning Board
    const newUnassignedOrder = {
      id: newRequest.noOrder, // Map the custom ID or No. Order to display in the Planning Board list
      noRt: newRequest.noRt,
      customer: newRequest.namaCustomer,
      destination: newRequest.kota, // city selected (e.g. SURABAYA, GRESIK, etc.)
      date: newRequest.tanggal
    };

    // Load current unassigned list, prepend new item, and save to localStorage
    const currentUnassigned = loadData<any[]>('planning_unassigned_orders', UNASSIGNED_ORDERS);
    // Ensure no duplicates by ID
    if (!currentUnassigned.some(item => item.id === newUnassignedOrder.id)) {
      const updatedUnassigned = [newUnassignedOrder, ...currentUnassigned];
      saveData('planning_unassigned_orders', updatedUnassigned);
    }

    // Add real notification
    setNotifications(prev => [
      {
        id: Date.now(),
        text: `Permintaan baru ${newRequest.id} (${newRequest.namaCustomer}) berhasil diajukan.`,
        time: 'Baru saja',
        read: false
      },
      ...prev
    ]);
  };

  const handleUpdateStatus = (id: string, newStatus: DeliveryRequest['status']) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return { ...req, status: newStatus };
      }
      return req;
    }));
    // Add notification
    setNotifications(prev => [
      {
        id: Date.now(),
        text: `Status ${id} diperbarui menjadi: ${newStatus}`,
        time: 'Baru saja',
        read: false
      },
      ...prev
    ]);
  };

  const handleMarkAllNotificationsAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div id="main-application-shell" className="min-h-screen bg-[#fff8f7] flex flex-col selection:bg-rose-100 selection:text-rose-900">
      
      {/* 1. Header Bar Area */}
      <header id="main-navigation-header" className="bg-white border-b border-[#ddbfc1] sticky top-0 z-40 px-4 md:px-10 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          {/* Logo Icon */}
          <div className="p-2 bg-[#fff0f0] rounded text-[#a33348] shadow-xs">
            <Truck className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight leading-none text-gray-900">
              PT. Kawan Lama Solusi
            </h1>
            <span className="text-[10px] uppercase font-bold text-[#a33348] tracking-widest block mt-0.5">
              Logisales Delivery System
            </span>
          </div>
        </div>

        {/* Desktop Tab Selector */}
        <nav id="desktop-nav-tabs" className="hidden lg:flex items-center gap-1.5 h-full">
          <button
            id="tab-input_request"
            onClick={() => {
              setActiveTab('input_request');
              setShowNotificationDropdown(false);
              setShowUserDropdown(false);
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider relative h-full transition ${
              activeTab === 'input_request' 
                ? 'text-[#a33348]' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Input Request
            {activeTab === 'input_request' && (
              <span className="absolute bottom-0 inset-x-4 h-0.75 bg-[#a33348] rounded-t-full"></span>
            )}
          </button>

          <button
            id="tab-monitoring"
            onClick={() => {
              setActiveTab('monitoring');
              setShowNotificationDropdown(false);
              setShowUserDropdown(false);
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider relative h-full transition ${
              activeTab === 'monitoring' 
                ? 'text-[#a33348]' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Monitoring
            {activeTab === 'monitoring' && (
              <span className="absolute bottom-0 inset-x-4 h-0.75 bg-[#a33348] rounded-t-full"></span>
            )}
          </button>

          <button
            id="tab-planning_board"
            onClick={() => {
              setActiveTab('planning_board');
              setShowNotificationDropdown(false);
              setShowUserDropdown(false);
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider relative h-full transition ${
              activeTab === 'planning_board' 
                ? 'text-[#a33348]' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Konfirmasi Admin
            {activeTab === 'planning_board' && (
              <span className="absolute bottom-0 inset-x-4 h-0.75 bg-[#a33348] rounded-t-full"></span>
            )}
          </button>

          <button
            id="tab-report"
            onClick={() => {
              setActiveTab('report');
              setShowNotificationDropdown(false);
              setShowUserDropdown(false);
            }}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider relative h-full transition ${
              activeTab === 'report' 
                ? 'text-[#a33348]' 
                : 'text-gray-500 hover:text-gray-900'
            }`}
          >
            Report
            {activeTab === 'report' && (
              <span className="absolute bottom-0 inset-x-4 h-0.75 bg-[#a33348] rounded-t-full"></span>
            )}
          </button>
        </nav>

        {/* Right side notification & profile actions */}
        <div className="flex items-center gap-3.5">
          
          {/* Notifications Trigger Bell */}
          <div className="relative">
            <button
              id="bell-notification-trigger"
              onClick={() => {
                setShowNotificationDropdown(!showNotificationDropdown);
                setShowUserDropdown(false);
              }}
              className="p-2 hover:bg-rose-50 rounded-full text-gray-500 hover:text-[#a33348] transition relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-600 rounded-full text-[9px] font-bold text-white flex items-center justify-center leading-none">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown modal */}
            {showNotificationDropdown && (
              <div className="absolute right-0 mt-2.5 w-72 bg-white border border-[#ddbfc1] rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="px-4 py-1.5 border-b border-gray-100 flex justify-between items-center bg-[#fff8f7]">
                  <span className="text-[11px] font-extrabold text-[#a33348] uppercase tracking-wider">Notifikasi Sistem</span>
                  {unreadCount > 0 && (
                    <button 
                      onClick={handleMarkAllNotificationsAsRead}
                      className="text-[10px] text-gray-500 hover:text-[#a33348] underline font-semibold"
                    >
                      Tandai dibaca
                    </button>
                  )}
                </div>
                <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                  {notifications.map((n) => (
                    <div key={n.id} className={`p-3 text-xs hover:bg-slate-50 transition ${!n.read ? 'bg-amber-50/40' : ''}`}>
                      <p className="text-[#24191a] leading-normal">{n.text}</p>
                      <span className="text-[9px] text-gray-400 block mt-1 font-mono">{n.time}</span>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t border-gray-50 text-center bg-gray-50/70">
                  <span className="text-[9px] text-gray-500 font-bold">PT. KAWAN LAMA SOLUSI GEOFENCED DECK</span>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Avatar block */}
          <div className="relative">
            {needsAuth ? (
              <button
                onClick={handleLogin}
                disabled={isLoggingIn}
                className="flex items-center gap-2 bg-[#a33348] hover:bg-[#8e2b3e] text-white px-3 py-1.5 rounded text-xs font-semibold cursor-pointer transition shadow-sm disabled:opacity-50"
              >
                {isLoggingIn ? 'Memuat...' : 'Connect Google'}
              </button>
            ) : (
              <>
                <button
                  id="user-profile-trigger"
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotificationDropdown(false);
                  }}
                  className="flex items-center gap-2 hover:bg-rose-50 p-1 rounded-lg transition cursor-pointer"
                >
                  <img
                    src={user?.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=256&auto=format&fit=crop"}
                    alt="LogiSales Executive"
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-[#ddbfc1]"
                  />
                  <span className="hidden sm:inline text-xs font-bold text-gray-800 font-mono">
                    {user?.displayName || "Admin"}
                  </span>
                </button>

                {/* Profile Dropdown modal */}
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2.5 w-56 bg-white border border-[#ddbfc1] rounded-lg shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-3 duration-200">
                    <div className="px-4 py-2.5 border-b border-gray-100 bg-[#fff5f6]">
                      <p className="text-xs font-bold text-gray-900 truncate">{user?.displayName || "Admin"}</p>
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5 truncate">{user?.email || "Admin Koordinator Utama"}</p>
                    </div>
                    <div className="p-1 space-y-0.5">
                      <div className="px-3 py-1.5 text-[11px] text-[#574143] flex items-center gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-[#a33348]" />
                        <span>Level: Executive Admin</span>
                      </div>
                      <div className="px-3 py-1.5 text-[11px] text-gray-500 flex items-center gap-2">
                        <Info className="w-3.5 h-3.5" />
                        <span>ID: EMP-KL-9122</span>
                      </div>
                      <hr className="border-gray-100" />
                      <button 
                        onClick={handleLogout}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-rose-50 font-bold rounded transition flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Logout Akun
                      </button>
                      <button 
                        onClick={() => {
                          localStorage.clear();
                          window.location.reload();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-red-600 hover:bg-rose-50 font-bold rounded transition flex items-center gap-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Reset Data Simulasi
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </header>

      {/* Mobile Top Tabs for easier navigation on phones */}
      <div id="mobile-navigation-tabs" className="flex lg:hidden bg-white border-b border-[#ddbfc1] overflow-x-auto h-12 flex-shrink-0">
        <button
          onClick={() => setActiveTab('input_request')}
          className={`flex-1 min-w-[90px] text-[10px] font-bold uppercase tracking-wider transition relative ${
            activeTab === 'input_request' ? 'text-[#a33348] bg-[#fff5f6]' : 'text-gray-500'
          }`}
        >
          Form
          {activeTab === 'input_request' && <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a33348]"></span>}
        </button>

        <button
          onClick={() => setActiveTab('monitoring')}
          className={`flex-1 min-w-[90px] text-[10px] font-bold uppercase tracking-wider transition relative ${
            activeTab === 'monitoring' ? 'text-[#a33348] bg-[#fff5f6]' : 'text-gray-500'
          }`}
        >
          Monitoring
          {activeTab === 'monitoring' && <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a33348]"></span>}
        </button>

        <button
          onClick={() => setActiveTab('planning_board')}
          className={`flex-1 min-w-[90px] text-[10px] font-bold uppercase tracking-wider transition relative ${
            activeTab === 'planning_board' ? 'text-[#a33348] bg-[#fff5f6]' : 'text-gray-500'
          }`}
        >
          Admin
          {activeTab === 'planning_board' && <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a33348]"></span>}
        </button>

        <button
          onClick={() => setActiveTab('report')}
          className={`flex-1 min-w-[90px] text-[10px] font-bold uppercase tracking-wider transition relative ${
            activeTab === 'report' ? 'text-[#a33348] bg-[#fff5f6]' : 'text-gray-500'
          }`}
        >
          Report
          {activeTab === 'report' && <span className="absolute bottom-0 inset-x-0 h-1 bg-[#a33348]"></span>}
        </button>
      </div>

      {/* 2. Main Content Canvas */}
      <main id="app-main-content-area" className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-8">
        {activeTab === 'input_request' && (
          <InputRequestForm 
            onAddRequest={handleAddRequest} 
            onNavigateToMonitoring={() => setActiveTab('monitoring')} 
          />
        )}

        {activeTab === 'monitoring' && (
          <MonitoringDashboard 
            requests={requests} 
            onUpdateRequestStatus={handleUpdateStatus} 
            onNavigateToPlanning={() => setActiveTab('planning_board')}
          />
        )}

        {activeTab === 'planning_board' && (
          <PlanningBoardWorksite />
        )}

        {activeTab === 'report' && (
          <PerformanceReport 
            onNavigateToForm={() => setActiveTab('input_request')} 
          />
        )}
      </main>

      {/* 3. Footer Area */}
      <footer id="app-brand-footer" className="bg-white border-t border-[#ddbfc1] py-4 mt-12 text-center text-[10px] text-gray-400 font-mono">
        <p>&copy; {new Date().getFullYear()} PT. Kawan Lama Solusi. Seluruh hak cipta dilindungi undang-undang.</p>
        <p className="mt-1 flex items-center justify-center gap-1.5 text-gray-300">
          Made with <Heart className="w-2.5 h-2.5 text-red-500 fill-red-500" /> for supreme logistics administration.
        </p>
      </footer>

    </div>
  );
}
