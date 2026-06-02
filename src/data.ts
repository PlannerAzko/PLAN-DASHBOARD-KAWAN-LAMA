/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeliveryRequest, HubRoute, HubPerformance, DailyTrend } from './types';

export const INITIAL_REQUESTS: DeliveryRequest[] = [
  {
    id: 'OMO-2023-11001-020626',
    omo: 'OMO-2023-11001',
    noOrder: 'ORD-2023-880',
    namaCustomer: 'PT. Maju Bersama Jaya',
    noRt: 'RT-098',
    rtAction: 'AB',
    namaBarang: 'Industrial Generator Set 150kVA',
    alamatLengkap: 'Jl. Industri Utama No. 45, Kawasan Industri Cimareme',
    kecamatan: 'Ngamprah',
    kota: 'Bandung',
    remark: 'Kirim sebelum jam 15:00 WIB, gunakan forklift berat',
    kesiapanBarang: 'Siap',
    status: 'Terkirim',
    tanggal: '2026-06-02',
    destination: 'Bandung, Jawa Barat',
  },
  {
    id: 'OMO-2023-11002-020626',
    omo: 'OMO-2023-11002',
    noOrder: 'ORD-2023-881',
    namaCustomer: 'IndoRetail Group',
    noRt: 'RT-098',
    rtAction: 'AB',
    namaBarang: 'Suku Cadang Kompresor Angin High Pressure',
    alamatLengkap: 'Kawasan Retail Terpadu Blok C3, Cilandak',
    kecamatan: 'Cilandak',
    kota: 'Jakarta Selatan',
    remark: 'Hubungi Pak Danu sebelum kirim (+628123456789)',
    kesiapanBarang: 'Siap',
    status: 'Pending',
    tanggal: '2026-06-02',
    destination: 'Jakarta Selatan, DKI Jakarta',
  },
  {
    id: 'OMO-2023-11003-020626',
    omo: 'OMO-2023-11003',
    noOrder: 'ORD-2023-882',
    namaCustomer: 'CV. Surya Abadi',
    noRt: 'RT-099',
    rtAction: 'BC',
    namaBarang: 'Welding Machine & Accessories Pack',
    alamatLengkap: ' pergudangan Margomulyo Permai Blok G-12',
    kecamatan: 'Tandes',
    kota: 'Surabaya',
    remark: 'Minta tanda tangan basah direktur operasional',
    kesiapanBarang: 'Siap',
    status: 'Reschedule',
    tanggal: '2026-06-02',
    destination: 'Surabaya, Jawa Timur',
  },
  {
    id: 'OMO-2023-11004-010626',
    omo: 'OMO-2023-11004',
    noOrder: 'ORD-2023-883',
    namaCustomer: 'Bpk. Andi Wijaya',
    noRt: 'RT-100',
    rtAction: 'AB',
    namaBarang: 'Hydraulic Cylinder Custom',
    alamatLengkap: 'Perumahan Gading Serpong, Cluster Emerald Blok B9',
    kecamatan: 'Kelapa Dua',
    kota: 'Tangerang',
    remark: 'Penelepon mengonfirmasi barang bisa dititipkan ke sekuriti',
    kesiapanBarang: 'Belum Siap',
    status: 'Belum Dikonfirmasi',
    tanggal: '2026-06-01',
    destination: 'Tangerang, Banten',
  },
  {
    id: 'OMO-2023-11005-010626',
    omo: 'OMO-2023-11005',
    noOrder: 'ORD-2023-884',
    namaCustomer: 'Global Tech Solutions',
    noRt: 'RT-101',
    rtAction: 'CD',
    namaBarang: 'Pneumatic Valves & Actuators',
    alamatLengkap: 'Kawasan Industri Bukit Semarang Baru Blok F-2',
    kecamatan: 'Mijen',
    kota: 'Semarang',
    remark: 'Emergency delivery, butuh cepat',
    kesiapanBarang: 'Siap',
    status: 'Terkirim',
    tanggal: '2026-06-01',
    destination: 'Semarang, Jawa Tengah',
  },
  {
    id: 'OMO-2023-11006-020626',
    omo: 'OMO-2023-11006',
    noOrder: 'ORD-2023-885',
    namaCustomer: 'Logistics Pro',
    noRt: 'RT-102',
    rtAction: 'AB',
    namaBarang: 'Heavy Duty Conveyor Belt 100 Meter',
    alamatLengkap: 'Jl. Sisingamangaraja No. 200, Amplas',
    kecamatan: 'Medan Amplas',
    kota: 'Medan',
    remark: 'Wajib mengendarai truk engkel maksimal roda 6',
    kesiapanBarang: 'Siap',
    status: 'Pending',
    tanggal: '2026-06-02',
    destination: 'Medan, Sumatera Utara',
  },
];

export const INITIAL_ROUTES: HubRoute[] = [
  {
    id: 'SURABAYA',
    noLc: 'LC-SBY-001',
    nopolArmada: 'L 1234 AB',
    driver: 'Budi Santoso',
    kapasitasCapacity: 5,
    kapasitasFilled: 3,
    status: 'Planned',
    assignedOrderIds: ['ORD-2023-880', 'ORD-2023-881', 'ORD-2023-882']
  },
  {
    id: 'HUB MALANG',
    noLc: 'Auto-generated',
    nopolArmada: 'Assign vehicle',
    driver: 'Assign driver',
    kapasitasCapacity: 5,
    kapasitasFilled: 0,
    status: 'Planned',
    assignedOrderIds: []
  },
  {
    id: 'JAKARTA BARAT',
    noLc: 'Auto-generated',
    nopolArmada: 'B 9876 XYZ',
    driver: 'Hendra Wijaya',
    kapasitasCapacity: 6,
    kapasitasFilled: 0,
    status: 'Planned',
    assignedOrderIds: []
  }
];

export const UNASSIGNED_ORDERS = [
  { id: 'ORD-2023-891', noRt: 'RT-102', customer: 'PT. Maju Bersama', destination: 'SURABAYA', date: '2023-10-24' },
  { id: 'ORD-2023-892', noRt: 'RT-103', customer: 'CV. Agro Lestari', destination: 'HUB MALANG', date: '2023-10-25' },
  { id: 'ORD-2023-893', noRt: 'RT-104', customer: 'Toko Makmur Sentosa', destination: 'SURABAYA', date: '2023-10-25' },
  { id: 'ORD-2023-894', noRt: 'RT-105', customer: 'PT. Steel Indonesia', destination: 'JAKARTA BARAT', date: '2023-10-26' },
  { id: 'ORD-2023-895', noRt: 'RT-106', customer: 'PT. Kencana Mandiri', destination: 'HUB MALANG', date: '2023-10-26' },
];

export const REGIONAL_HUB_PERFORMANCE: HubPerformance[] = [
  {
    namaHub: 'SURABAYA',
    volumeTotal: 1240,
    terkirim: 1215,
    gagal: 25,
    sla: 98.0,
    status: 'OPTIMAL'
  },
  {
    namaHub: 'HUB MALANG',
    volumeTotal: 840,
    terkirim: 790,
    gagal: 50,
    sla: 94.0,
    status: 'WARNING'
  },
  {
    namaHub: 'JAKARTA BARAT',
    volumeTotal: 2100,
    terkirim: 2050,
    gagal: 50,
    sla: 97.6,
    status: 'OPTIMAL'
  }
];

export const DAILY_DELIVERY_TREND: DailyTrend[] = [
  { date: '01 Oct', berhasil: 180, gagal: 20, slaLine: 95 },
  { date: '02 Oct', berhasil: 210, gagal: 12, slaLine: 97 },
  { date: '03 Oct', berhasil: 165, gagal: 15, slaLine: 94 },
  { date: '04 Oct', berhasil: 195, gagal: 15, slaLine: 96 },
  { date: '05 Oct', berhasil: 240, gagal: 8,  slaLine: 98 },
  { date: '06 Oct', berhasil: 175, gagal: 30, slaLine: 92 },
];

// Helper to load/save state
export const loadData = <T>(key: string, initialValue: T): T => {
  try {
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initialValue;
  } catch (err) {
    console.error('Error reading localStorage key', key, err);
    return initialValue;
  }
};

export const saveData = <T>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('Error writing localStorage key', key, err);
  }
};
