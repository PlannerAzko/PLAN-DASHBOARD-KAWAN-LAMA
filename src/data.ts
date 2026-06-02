/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { DeliveryRequest, HubRoute, HubPerformance, DailyTrend } from './types';

export const INITIAL_REQUESTS: DeliveryRequest[] = [];

export const INITIAL_ROUTES: HubRoute[] = [
  {
    id: 'SURABAYA',
    noLc: 'Auto-generated',
    nopolArmada: 'Assign vehicle',
    driver: 'Assign driver',
    kapasitasCapacity: 5,
    kapasitasFilled: 0,
    status: 'Planned',
    assignedOrderIds: []
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
    nopolArmada: 'Assign vehicle',
    driver: 'Assign driver',
    kapasitasCapacity: 6,
    kapasitasFilled: 0,
    status: 'Planned',
    assignedOrderIds: []
  }
];

export const UNASSIGNED_ORDERS: any[] = [];

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
