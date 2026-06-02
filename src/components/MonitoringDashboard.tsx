/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { DeliveryRequest } from '../types';
import { 
  Search, Download, Truck, CheckCircle2, AlertCircle, Calendar, 
  MapPin, Clock, ShieldCheck, X, FileText, ExternalLink, RefreshCw
} from 'lucide-react';

interface MonitoringDashboardProps {
  requests: DeliveryRequest[];
  onUpdateRequestStatus: (id: string, newStatus: DeliveryRequest['status']) => void;
  onNavigateToPlanning: () => void;
}

export default function MonitoringDashboard({ 
  requests, 
  onUpdateRequestStatus,
  onNavigateToPlanning 
}: MonitoringDashboardProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('2026-06-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-06-02');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  // Selected item for Modal details
  const [selectedItem, setSelectedItem] = useState<DeliveryRequest | null>(null);
  const [modalType, setModalType] = useState<'bukti' | 'lacak' | 'jadwal' | 'konfirmasi' | null>(null);

  // New reschedule date selection state
  const [rescheduleDate, setRescheduleDate] = useState('');
  const [rescheduleReason, setRescheduleReason] = useState('');

  // 1. Calculate dynamic statistics
  const stats = useMemo(() => {
    // Standard mock database defaults from image + additions
    const baseTotal = 1278;
    const baseTerkirim = 1098;
    const basePending = 140;
    const baseReschedule = 40;

    let addedTotal = requests.length;
    let addedTerkirim = requests.filter(r => r.status === 'Terkirim').length;
    let addedPending = requests.filter(r => r.status === 'Pending').length;
    let addedReschedule = requests.filter(r => r.status === 'Reschedule').length;

    const total = baseTotal + addedTotal;
    const terkirim = baseTerkirim + addedTerkirim;
    const pending = basePending + addedPending;
    const reschedule = baseReschedule + addedReschedule;

    const rate = ((terkirim / total) * 100).toFixed(1);

    return {
      total,
      terkirim,
      pending,
      reschedule,
      successRate: `${rate}%`
    };
  }, [requests]);

  // 2. Filter requests based on search term and date range
  const filteredRequests = useMemo(() => {
    return requests.filter(req => {
      const matchSearch = 
        req.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.namaCustomer.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.namaBarang.toLowerCase().includes(searchTerm.toLowerCase()) ||
        req.kota.toLowerCase().includes(searchTerm.toLowerCase());
      
      let matchDate = true;
      if (filterStartDate) {
        matchDate = matchDate && req.tanggal >= filterStartDate;
      }
      if (filterEndDate) {
        matchDate = matchDate && req.tanggal <= filterEndDate;
      }
      
      return matchSearch && matchDate;
    });
  }, [requests, searchTerm, filterStartDate, filterEndDate]);

  // 3. Paginate filtered lists
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRequests.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRequests, currentPage]);

  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage) || 1;

  const handleActionClick = (req: DeliveryRequest, type: 'bukti' | 'lacak' | 'jadwal' | 'konfirmasi') => {
    setSelectedItem(req);
    setModalType(type);
    if (type === 'jadwal') {
      setRescheduleDate(req.tanggal);
      setRescheduleReason('');
    }
  };

  const handleCloseModal = () => {
    setSelectedItem(null);
    setModalType(null);
  };

  const handleApplyReschedule = () => {
    if (selectedItem && rescheduleDate) {
      onUpdateRequestStatus(selectedItem.id, 'Reschedule');
      alert(`Jadwal untuk ${selectedItem.id} berhasil diatur ke tanggal: ${rescheduleDate}`);
      handleCloseModal();
    }
  };

  const handleConfirmAdmin = () => {
    if (selectedItem) {
      onUpdateRequestStatus(selectedItem.id, 'Terkirim');
      alert(`Admin mengonfirmasi pengiriman ${selectedItem.id} selesai.`);
      handleCloseModal();
    }
  };

  const handleExportCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["ID,Customer,No_Order,Barang,Kota,Tanggal,Status"].join(",") + "\n"
      + requests.map(r => `"${r.id}","${r.namaCustomer}","${r.noOrder}","${r.namaBarang}","${r.kota}","${r.tanggal}","${r.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateRangeStr = `${filterStartDate || 'All'}_to_${filterEndDate || 'All'}`;
    link.setAttribute("download", `Laporan_Pengiriman_${dateRangeStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div id="monitoring-view" className="space-y-6">
      
      {/* Upper Title and Date Picker section */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#24191a] tracking-tight">
            Monitoring Pengiriman
          </h2>
          <p className="text-[#574143] text-sm mt-1">
            Lacak dan kelola status pengiriman real-time Anda.
          </p>
        </div>

        {/* Date filter - rentang tanggal */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <span className="text-xs text-[#574143] font-semibold uppercase tracking-wider block">
            Rentang Tanggal:
          </span>
          <div className="flex items-center gap-2">
            <input
              id="filter-tanggal-mulai"
              type="date"
              value={filterStartDate}
              onChange={(e) => {
                setFilterStartDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-[#ddbfc1] rounded bg-white text-xs text-[#24191a] font-medium focus:ring-1 focus:ring-[#c74e62] outline-none transition cursor-pointer"
            />
            <span className="text-xs text-gray-400 font-bold">s/d</span>
            <input
              id="filter-tanggal-selesai"
              type="date"
              value={filterEndDate}
              onChange={(e) => {
                setFilterEndDate(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 border border-[#ddbfc1] rounded bg-white text-xs text-[#24191a] font-medium focus:ring-1 focus:ring-[#c74e62] outline-none transition cursor-pointer"
            />
            {(filterStartDate || filterEndDate) && (
              <button
                id="reset-rentang-tanggal"
                onClick={() => {
                  setFilterStartDate('');
                  setFilterEndDate('');
                  setCurrentPage(1);
                }}
                className="px-2.5 py-1 text-xs text-[#a33348] hover:text-[#8e2b3e] font-bold border border-[#ddbfc1] rounded bg-white hover:bg-rose-50 transition"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Dashboard Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Pengiriman */}
        <div className="bg-white rounded-lg border border-[#ddbfc1] p-5 flex justify-between items-start shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
              Total Pengiriman
            </span>
            <span className="text-4xl font-extrabold text-[#24191a] block font-mono">
              {stats.total.toLocaleString()}
            </span>
            <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 mt-1">
              &uarr; 12% dari kemarin
            </span>
          </div>
          <div className="p-2.5 bg-[#fef2f2] text-[#c74e62] rounded">
            <Truck className="w-5 h-5" />
          </div>
        </div>

        {/* Terkirim */}
        <div className="bg-white rounded-lg border border-[#ddbfc1] p-5 flex justify-between items-start shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
              Terkirim
            </span>
            <span className="text-4xl font-extrabold text-[#24191a] block font-mono">
              {stats.terkirim.toLocaleString()}
            </span>
            <span className="text-xs text-gray-500 block mt-1">
              <strong className="text-emerald-700">{stats.successRate}</strong> Success Rate
            </span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        {/* Pending */}
        <div className="bg-white rounded-lg border border-[#ddbfc1] p-5 flex justify-between items-start shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
              Pending / Proses
            </span>
            <span className="text-4xl font-extrabold text-[#24191a] block font-mono">
              {stats.pending.toLocaleString()}
            </span>
            <span className="text-xs text-[#a33348] font-medium block mt-1">
              Dalam perjalanan
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded">
            <RefreshCw className="w-5 h-5 animate-spin-slow" />
          </div>
        </div>

        {/* Reschedule */}
        <div className="bg-white rounded-lg border border-[#ddbfc1] p-5 flex justify-between items-start shadow-xs">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block">
              Reschedule
            </span>
            <span className="text-4xl font-extrabold text-[#24191a] block font-mono">
              {stats.reschedule.toLocaleString()}
            </span>
            <span className="text-xs text-amber-600 font-medium block mt-1">
              Membutuhkan konfirmasi
            </span>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

      </div>

      {/* Main Delivery Table Card */}
      <div className="bg-white rounded-lg border border-[#ddbfc1] p-6 shadow-xs">
        
        {/* Table heading row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-[#24191a] tracking-tight">
              Daftar Status Pengiriman
            </h3>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#a33348] text-white animate-pulse tracking-wide uppercase">
              Live Data
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Search Input */}
            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                id="search-status-list"
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Cari ID atau Customer..."
                className="w-full pl-9 pr-3 py-1.5 border border-[#ddbfc1] rounded text-xs text-[#24191a] bg-white focus:ring-1 focus:ring-[#c74e62] outline-none transition"
              />
            </div>

            {/* Export Action */}
            <button
              id="export-report-button"
              onClick={handleExportCSV}
              className="bg-white border border-[#c74e62] text-[#c74e62] hover:bg-pink-50 text-xs font-bold px-4 py-1.5 rounded transition flex items-center gap-1.5 ml-auto md:ml-0"
            >
              <Download className="w-3.5 h-3.5" />
              Unduh Laporan
            </button>
          </div>
        </div>

        {/* Desktop responsive Table */}
        <div id="status-table" className="overflow-x-auto -mx-6">
          <table className="w-full min-w-[700px] border-collapse text-left">
            <thead>
              <tr className="bg-[#fff0f0] border-y border-[#ddbfc1]">
                <th className="px-6 py-3 text-[11px] font-semibold text-[#574143] uppercase tracking-wider w-[15%]">ID</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#574143] uppercase tracking-wider w-[24%]">Customer</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#574143] uppercase tracking-wider w-[15%]">No. Order</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#574143] uppercase tracking-wider w-[22%]">Destination</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#574143] uppercase tracking-wider w-[12%]">Status</th>
                <th className="px-6 py-3 text-[11px] font-semibold text-[#574143] uppercase tracking-wider text-right w-[12%]">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedRequests.map((req) => (
                <tr key={req.id} className="hover:bg-[#fffcfc] transition h-14">
                  <td className="px-6 py-3 text-xs font-semibold text-[#a33348] font-mono whitespace-nowrap">
                    {req.id}
                  </td>
                  <td className="px-6 py-3">
                    <div className="text-xs font-semibold text-[#24191a] line-clamp-1">{req.namaCustomer}</div>
                    <div className="text-[10px] text-gray-500 font-mono mt-0.5 line-clamp-1" title={req.namaBarang}>{req.namaBarang}</div>
                  </td>
                  <td className="px-6 py-3 text-xs font-semibold text-[#a33348] font-mono whitespace-nowrap">
                    {req.noOrder}
                  </td>
                  <td className="px-6 py-3 text-xs text-[#574143] whitespace-nowrap">
                    {req.destination}
                  </td>
                  <td className="px-6 py-3">
                    {/* Badge mapping */}
                    {req.status === 'Terkirim' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#e6f6ec] text-[#15803d] text-[11px] font-semibold">Terkirim</span>
                    )}
                    {req.status === 'Pending' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-blue-50 text-blue-700 text-[11px] font-semibold">Pending</span>
                    )}
                    {req.status === 'Reschedule' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-amber-50 text-amber-700 text-[11px] font-semibold">Reschedule</span>
                    )}
                    {req.status === 'Belum Dikonfirmasi' && (
                      <span className="inline-flex items-center px-2.5 py-1 rounded bg-[#f3f4f6] text-[#4b5563] text-[11px] font-semibold">Belum Dikonfirmasi</span>
                    )}
                  </td>
                  <td className="px-6 py-3 text-right">
                    {/* Unique button matching the table row */}
                    {req.status === 'Terkirim' && (
                      <button 
                        onClick={() => handleActionClick(req, 'bukti')}
                        className="text-xs text-[#a33348] hover:text-[#8e2b3e] font-semibold hover:underline bg-pink-50/50 hover:bg-pink-50 py-1 px-2.5 rounded transition"
                      >
                        Lihat Bukti
                      </button>
                    )}
                    {req.status === 'Pending' && (
                      <button 
                        onClick={() => handleActionClick(req, 'lacak')}
                        className="text-xs text-blue-700 hover:text-blue-900 font-semibold hover:underline bg-blue-50/50 hover:bg-blue-100 py-1 px-2.5 rounded transition"
                      >
                        Lacak Posisi
                      </button>
                    )}
                    {req.status === 'Reschedule' && (
                      <button 
                        onClick={() => handleActionClick(req, 'jadwal')}
                        className="text-xs text-amber-700 hover:text-amber-900 font-semibold hover:underline bg-amber-50/50 hover:bg-amber-100 py-1 px-2.5 rounded transition"
                      >
                        Detail Jadwal
                      </button>
                    )}
                    {req.status === 'Belum Dikonfirmasi' && (
                      <button 
                        onClick={() => handleActionClick(req, 'konfirmasi')}
                        className="text-xs text-[#847374] hover:text-[#24191a] font-semibold hover:underline bg-gray-100 hover:bg-gray-200 py-1 px-2.5 rounded transition"
                      >
                        Konfirmasi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {paginatedRequests.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-gray-500">
                    Tidak menemukan pengiriman yang cocok dengan kriteria pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination & Counter Footer block */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-5 mt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Menampilkan <strong className="font-semibold text-[#24191a]">{Math.min(filteredRequests.length, paginatedRequests.length)}</strong> dari <strong className="font-semibold text-[#24191a]">{filteredRequests.length}</strong> pengiriman
          </p>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-[#847374] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-semibold"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 flex items-center justify-center rounded text-xs font-semibold border transition ${
                  currentPage === pageNum 
                    ? 'bg-[#a33348] border-[#a33348] text-white' 
                    : 'border-gray-200 text-[#574143] hover:bg-gray-50'
                }`}
              >
                {pageNum}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="w-8 h-8 flex items-center justify-center border border-gray-200 rounded text-[#847374] hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition text-xs font-semibold"
            >
              &gt;
            </button>
          </div>
        </div>

      </div>

      {/* --- Dynamic Detailed Dialog Modals --- */}
      {selectedItem && modalType && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg border border-[#ddbfc1] shadow-2xl max-w-lg w-full overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="bg-[#fff0f0] p-4 border-b border-[#ddbfc1] flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#a33348]" />
                <h4 className="font-bold text-[#24191a] text-sm">
                  {modalType === 'bukti' && 'Bukti Digital Penerimaan Barang'}
                  {modalType === 'lacak' && 'Simulasi Geo-Tracking Pengiriman'}
                  {modalType === 'jadwal' && 'Atur Ulang Jadwal Pengiriman'}
                  {modalType === 'konfirmasi' && 'Persetujuan Pengiriman Admin'}
                </h4>
              </div>
              <button 
                onClick={handleCloseModal}
                className="p-1 hover:bg-rose-100 rounded transition text-gray-500 hover:text-rose-700"
              >
                <X className="w-4.5 h-4.5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              <div className="bg-[#fff8f7] p-3 rounded border border-[#ddbfc1] text-xs space-y-1.5 font-mono">
                <div><span className="text-gray-500">ID REGISTRASI :</span> <strong className="text-[#a33348]">{selectedItem.id}</strong></div>
                <div><span className="text-gray-500">NAMA CUSTOMER :</span> {selectedItem.namaCustomer}</div>
                <div><span className="text-gray-500">NAMA BARANG   :</span> {selectedItem.namaBarang}</div>
                <div><span className="text-gray-500">TUJUAN UTAMA  :</span> {selectedItem.alamatLengkap}</div>
              </div>

              {/* 1. LIHAT BUKTI */}
              {modalType === 'bukti' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest block">Tanda Tangan Elektronik</span>
                    <div className="border border-dashed border-gray-300 rounded p-4 bg-gray-50 flex flex-col items-center justify-center h-28">
                      {/* Generates a pseudo delivery signature */}
                      <svg className="w-48 h-16 text-[#a33348]" viewBox="0 0 100 30" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path d="M10 20 C 30 5, 40 25, 55 10 C 70 0, 75 25, 90 15 C 95 10, 100 12, 105 5" />
                      </svg>
                      <span className="text-[10px] text-gray-400 mt-2">Diberikan oleh Manajer Logistik PT. Maju Bersama</span>
                    </div>
                  </div>

                  <div className="p-3 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-xs flex gap-2.5">
                    <ShieldCheck className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Keabsahan Tervalidasi</p>
                      <p className="mt-0.5 text-emerald-700/90">
                        Diserahkan pada {selectedItem.tanggal} pukul 14:24 WIB menggunakan GPS Geo-Stamp dengan kode hash digital SSL-Verified.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. LACAK POSISI */}
              {modalType === 'lacak' && (
                <div className="space-y-4">
                  <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-[2px] before:bg-blue-300">
                    
                    {/* Step 3 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-blue-500 bg-white flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      </div>
                      <span className="text-[10px] text-blue-600 font-bold block">REAL-TIME STATUS</span>
                      <p className="text-xs font-semibold text-gray-900">Kurir sedang dalam rute ke tujuan ({selectedItem.kota})</p>
                      <p className="text-[10px] text-gray-500 mt-0.5">Sopir: Hendra Santoso - Pelat No: {selectedItem.noRt === 'RT-102' ? 'L 8882 J' : 'B 9751 FG'}</p>
                    </div>

                    {/* Step 2 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400 block font-mono">08:00 WIB</span>
                      <p className="text-xs font-semibold text-gray-600">Armada berangkat keluar gudang logistik regional</p>
                    </div>

                    {/* Step 1 */}
                    <div className="relative">
                      <div className="absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-gray-300 bg-white flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      </div>
                      <span className="text-[11px] font-semibold text-gray-400 block font-mono">07:15 WIB</span>
                      <p className="text-xs font-semibold text-gray-600">Selesai memuat barang di gudang utama</p>
                    </div>
                  </div>

                  <div className="p-3 bg-[#e6f6ec] text-emerald-800 rounded border border-emerald-200 text-xs flex gap-2">
                    <MapPin className="w-4.5 h-4.5 text-emerald-600 flex-shrink-0" />
                    <span>Perkiraan tiba di lokasi penerima: <strong className="font-semibold">Hari Ini (14:30 WIB)</strong></span>
                  </div>
                </div>
              )}

              {/* 3. ATUR ULANG JADWAL */}
              {modalType === 'jadwal' && (
                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#574143] uppercase tracking-wide">Pilih Tanggal Baru</label>
                    <input
                      type="date"
                      value={rescheduleDate}
                      onChange={(e) => setRescheduleDate(e.target.value)}
                      className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm focus:ring-1 focus:ring-[#c74e62] outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#574143] uppercase tracking-wide">Alasan Reschedule</label>
                    <textarea
                      rows={2}
                      value={rescheduleReason}
                      onChange={(e) => setRescheduleReason(e.target.value)}
                      placeholder="Tuliskan alasan penundaan pengiriman..."
                      className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm focus:ring-1 focus:ring-[#c74e62] outline-none"
                    />
                  </div>
                </div>
              )}

              {/* 4. KONFIRMASI ADMIN */}
              {modalType === 'konfirmasi' && (
                <div className="space-y-3">
                  <p className="text-xs text-gray-600 leading-relaxed">
                    Pesanan ini berstatus <span className="bg-gray-100 text-[#4b5563] px-1 py-0.5 rounded font-mono font-semibold">Belum Dikonfirmasi</span>. Harap pastikan barang fisik sudah termuat di kontainer dan armada bersangkutan telah siap berangkat sebelum menyetujui.
                  </p>
                  
                  <div className="bg-amber-50 p-3 rounded border border-amber-200 text-xs text-amber-800 space-y-1">
                    <p className="font-semibold">Kesiapan Suku Cadang/Fisik:</p>
                    <p>Status kesiapan barang saat formulir dikirim: <strong className="underline">{selectedItem.kesiapanBarang}</strong></p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer actions */}
            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end gap-2.5">
              <button
                onClick={handleCloseModal}
                className="px-4 py-2 bg-white text-xs font-semibold text-gray-700 hover:bg-gray-100 border border-gray-200 rounded transition"
              >
                Kembali
              </button>

              {modalType === 'jadwal' && (
                <button
                  onClick={handleApplyReschedule}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-xs font-semibold text-white rounded transition"
                >
                  Simpan Jadwal Baru
                </button>
              )}

              {modalType === 'konfirmasi' && (
                <button
                  onClick={handleConfirmAdmin}
                  className="px-4 py-2 bg-[#a33348] hover:bg-[#8e2b3e] text-xs font-semibold text-white rounded transition"
                >
                  Setujui & Konfirmasi Kirim
                </button>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
