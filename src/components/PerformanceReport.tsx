/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { REGIONAL_HUB_PERFORMANCE, DAILY_DELIVERY_TREND } from '../data';
import { Calendar, AlertCircle, CheckCircle2, TrendingUp, Sparkles, Plus, ArrowRight, Table } from 'lucide-react';

interface PerformanceReportProps {
  onNavigateToForm: () => void;
}

export default function PerformanceReport({ onNavigateToForm }: PerformanceReportProps) {
  const [dateRange, setDateRange] = useState('2023-10-01 s/d 2023-10-31');
  const [selectedHubKey, setSelectedHubKey] = useState<string | null>(null);
  const [hoveredTrend, setHoveredTrend] = useState<number | null>(null);

  // SLA Circle computations
  const totalSLA = 95;
  const targetSLA = 98;
  const strokeDashoffset = 251.2 - (251.2 * totalSLA) / 100;

  return (
    <div id="performance-report-view" className="space-y-6">
      
      {/* 1. Header with Range Picker */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#24191a] tracking-tight">
            Laporan Performa Pengiriman
          </h2>
          <p className="text-[#574143] text-sm mt-1">
            Analisis SLA (Service Level Agreement) dan tren pengiriman harian PT. Kawan Lama Solusi.
          </p>
        </div>

        {/* Date block */}
        <div className="flex items-center gap-2">
          <label className="text-[11px] text-[#574143] font-bold uppercase tracking-wider whitespace-nowrap">Rentang Analisis:</label>
          <div className="relative">
            <select
              id="rentang-analisis"
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3.5 py-1.5 border border-[#ddbfc1] font-semibold text-xs rounded bg-white text-gray-800 focus:ring-1 focus:ring-[#c74e62] outline-none cursor-pointer"
            >
              <option value="2023-10-01 s/d 2023-10-31">Oct 1, 2023 - Oct 31, 2023</option>
              <option value="2023-11-01 s/d 2023-11-30">Nov 1, 2023 - Nov 30, 2023</option>
              <option value="2023-12-01 s/d 2023-12-31">Dec 1, 2023 - Dec 31, 2023</option>
            </select>
          </div>
        </div>
      </div>

      {/* 2. Visual Graphs Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Circular SLA Target */}
        <div className="lg:col-span-4 bg-white border border-[#ddbfc1] p-6 rounded-lg text-center flex flex-col justify-between h-[360px] shadow-xs">
          <h3 className="text-xs font-bold text-[#574143] uppercase tracking-wider text-left border-b border-gray-100 pb-3">
            SLA KAWAN LAMA INDUSTRIAL
          </h3>

          <div className="relative flex items-center justify-center py-6">
            <svg className="w-40 h-40 transform -rotate-95" viewBox="0 0 100 100">
              {/* Outer circle background grey */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-gray-100 fill-none"
                strokeWidth="7"
              />
              {/* Active SLA Progress Arc */}
              <circle
                cx="50"
                cy="50"
                r="40"
                className="stroke-[#a33348] fill-none transition-all duration-1000 ease-out"
                strokeWidth="7.5"
                strokeDasharray="251.2"
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
              />
            </svg>
            
            {/* Direct Central Label */}
            <div className="absolute inset-x-0 inset-y-0 flex flex-col items-center justify-center text-center">
              <span className="text-[34px] font-extrabold text-[#24191a] block tracking-tight leading-none">
                {totalSLA}%
              </span>
              <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wide mt-1">
                SLA Aktif
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <p className="text-[11px] text-[#574143] font-medium leading-none">
              Target SLA Perusahaan: <strong className="font-extrabold text-gray-900">{targetSLA}%</strong>
            </p>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded bg-[#fef2f2] text-[#b91c1c] text-[10px] font-extrabold tracking-widest uppercase mx-auto">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              Slightly Below Target
            </span>
          </div>
        </div>

        {/* Right Bar Chart Visualizer */}
        <div className="lg:col-span-8 bg-white border border-[#ddbfc1] p-6 rounded-lg flex flex-col justify-between h-[360px] shadow-xs">
          
          {/* Header & Legends */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center pb-3 border-b border-gray-100 gap-2">
            <h3 className="text-xs font-bold text-[#574143] uppercase tracking-wider">
              Tren Pengiriman Harian
            </h3>
            
            {/* Custom Interactive Legend */}
            <div className="flex items-center gap-4 text-[10px] font-semibold text-[#574143]">
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-[#a33348] rounded-xs"></span>
                <span>Berhasil</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 bg-[#fcd5da] rounded-xs"></span>
                <span>Gagal</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-0.5 w-4 bg-teal-600"></span>
                <span>SLA Line</span>
              </div>
            </div>
          </div>

          {/* Interactive Chart container */}
          <div className="w-full h-56 flex items-end justify-between relative mt-4 px-2 sm:px-6">
            
            {/* Horizontal Guide grid lines */}
            <div className="absolute inset-x-0 top-1/4 border-b border-gray-100/80 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-2/4 border-b border-gray-100/80 pointer-events-none"></div>
            <div className="absolute inset-x-0 top-3/4 border-b border-gray-100/80 pointer-events-none"></div>

            {/* Simulated green horizontal SLA Line */}
            <div className="absolute inset-x-0 top-[20%] border-t-[1.5px] border-emerald-600 border-dashed pointer-events-none flex justify-end">
              <span className="bg-emerald-50 text-emerald-800 text-[8px] font-bold px-1 py-0.5 rounded -mt-2.5 mr-2 font-mono">
                SLA Threshold Target (95%)
              </span>
            </div>

            {/* Interactive Column Pillars */}
            {DAILY_DELIVERY_TREND.map((trend, idx) => {
              const maxVal = 280; // Scale maximum
              const successHeight = (trend.berhasil / maxVal) * 100;
              const failHeight = (trend.gagal / maxVal) * 100;
              const isHovered = hoveredTrend === idx;

              return (
                <div 
                  key={trend.date} 
                  className="flex flex-col items-center flex-1 h-full justify-end group cursor-pointer relative"
                  onMouseEnter={() => setHoveredTrend(idx)}
                  onMouseLeave={() => setHoveredTrend(null)}
                >
                  {/* Dynamic Tooltip bubble */}
                  {isHovered && (
                    <div className="absolute -top-6 bg-gray-900 text-white rounded p-2 text-[9px] font-semibold space-y-0.5 shadow-lg z-10 w-28 text-center animate-fade-in pointer-events-none font-mono">
                      <p className="text-pink-300 font-bold">{trend.date}</p>
                      <p>Berhasil: {trend.berhasil} box</p>
                      <p>Gagal: {trend.gagal} box</p>
                      <p className="border-t border-gray-700 pt-0.5 mt-0.5 text-emerald-400">SLA: {trend.slaLine}%</p>
                    </div>
                  )}

                  {/* Bars stack column */}
                  <div className="flex gap-1 items-end w-4 sm:w-10">
                    {/* Success part */}
                    <div 
                      className={`w-full bg-[#a33348] rounded-t-xs transition-all duration-300 ${
                        isHovered ? 'brightness-110 shadow-sm' : ''
                      }`}
                      style={{ height: `${successHeight}%` }}
                    ></div>
                    {/* Failure part */}
                    <div 
                      className={`w-full bg-[#fcd5da] rounded-t-xs transition-all duration-300 ${
                        isHovered ? 'brightness-105 shadow-sm' : ''
                      }`}
                      style={{ height: `${failHeight}%` }}
                    ></div>
                  </div>

                  {/* Label Date below */}
                  <span className="text-[10px] text-gray-500 font-mono font-bold mt-2 truncate">
                    {trend.date}
                  </span>
                </div>
              );
            })}

          </div>

          <p className="text-[10px] text-gray-400 mt-2 text-center select-none font-medium text-center">
            Posisikan kursor mouse (hover) di atas batang grafik untuk menganalisis statistik kubik kargo harian.
          </p>
        </div>

      </div>

      {/* 3. Performance by Regional Table */}
      <div className="bg-white rounded-lg border border-[#ddbfc1] p-6 shadow-xs relative">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-[#a33348]" />
            <h3 className="font-extrabold text-base text-[#24191a] tracking-tight">
              Performa per Regional HUB
            </h3>
          </div>

          <button
            onClick={() => handleExportCSVData()}
            className="text-xs text-[#a33348] hover:text-[#8e2b3e] font-bold border border-[#ddbfc1] px-3.5 py-1.5 rounded bg-white hover:bg-rose-50 transition"
          >
            Unduh Laporan Regional &darr;
          </button>
        </div>

        {/* Regional Hub Table */}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[650px] border-collapse text-left">
            <thead>
              <tr className="bg-[#fff8f7] text-[10px] font-extrabold text-[#574143] uppercase tracking-wider border-b border-gray-200">
                <th className="px-5 py-3">Nama HUB / Kota</th>
                <th className="px-5 py-3">Volume Total</th>
                <th className="px-5 py-3">Terkirim</th>
                <th className="px-5 py-3 text-red-600">Gagal</th>
                <th className="px-5 py-3">SLA (%)</th>
                <th className="px-5 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {REGIONAL_HUB_PERFORMANCE.map((hub) => (
                <tr 
                  key={hub.namaHub} 
                  onClick={() => setSelectedHubKey(selectedHubKey === hub.namaHub ? null : hub.namaHub)}
                  className={`hover:bg-[#fff9fa]/40 transition h-14 cursor-pointer ${
                    selectedHubKey === hub.namaHub ? 'bg-[#fff0f1]' : ''
                  }`}
                >
                  <td className="px-5 py-3 font-bold text-gray-900 font-mono tracking-wider">
                    {hub.namaHub}
                  </td>
                  <td className="px-5 py-3 font-mono font-semibold">
                    {hub.volumeTotal.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-mono text-emerald-700 font-semibold">
                    {hub.terkirim.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-mono text-red-600 font-semibold">
                    {hub.gagal.toLocaleString()}
                  </td>
                  <td className="px-5 py-3 font-mono font-bold text-[#a33348]">
                    {hub.sla.toFixed(1)}%
                  </td>
                  <td className="px-5 py-3 text-right">
                    {hub.status === 'OPTIMAL' ? (
                      <span className="inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-[#15803d] rounded-full">
                        Optimal
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-800 rounded-full">
                        Warning
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Selected Hub detailed analytics inline popup snippet */}
        {selectedHubKey && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded text-xs leading-relaxed space-y-1">
            <p className="font-bold text-[#a33348] text-xs uppercase font-mono">{selectedHubKey} Detail SLA Analysis:</p>
            <p className="text-gray-600">
              {selectedHubKey === 'SURABAYA' && 'Kinerja hub Surabaya dinilai sangat optimal dengan tingkat kegagalan armada di bawah 2%. Mayoritas kendala berasal dari force majeure cuaca penyeberangan laut.'}
              {selectedHubKey === 'HUB MALANG' && 'Warning diaktifkan karena tingkat kegagalan mencapai 50 unit. Kendala utama diakibatkan penataan jalur pegunungan terjal dan keterlambatan serah terima barang dari vendor pihak ketiga.'}
              {selectedHubKey === 'JAKARTA BARAT' && 'Memegang rekor volume pengapalan tertinggi sebesar 2,100 unit. Rata-rata response SLA sangat baik di angkat 97.6% berkat tim support standby 24 jam.'}
            </p>
          </div>
        )}

      </div>

      {/* 4. Floating Trigger buttons on the bottom-right for extremely smart UX shortcut to Form creation */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          id="floating-create-btn"
          onClick={onNavigateToForm}
          className="bg-[#a33348] hover:bg-[#8e2b3e] text-white p-4 sm:px-5 sm:py-3 rounded-full sm:rounded-lg shadow-xl hover:shadow-2xl transition duration-150 active:scale-95 flex items-center justify-center gap-2 group cursor-pointer"
          title="Ajukan Permintaan Pengiriman Baru"
        >
          <Plus className="w-5 h-5 font-bold animate-pulse group-hover:rotate-90 transition-all duration-300" />
          <span className="hidden sm:inline text-xs font-bold uppercase tracking-wider whitespace-nowrap">
            Buat Permintaan
          </span>
        </button>
      </div>

    </div>
  );

  function handleExportCSVData() {
    const csvContent = "data:text/csv;charset=utf-8," 
      + ["HubName,VolumeTotal,Terkirim,Gagal,SLA_Percent,Status"].join(",") + "\n"
      + REGIONAL_HUB_PERFORMANCE.map(h => `"${h.namaHub}",${h.volumeTotal},${h.terkirim},${h.gagal},${h.sla},"${h.status}"`).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Laporan_Regional_Hub_${dateRange.replace(/ /g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
