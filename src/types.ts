/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface DeliveryRequest {
  id: string; // e.g. #LT-88210
  omo: string;
  noOrder: string;
  namaCustomer: string;
  noRt: string;
  rtAction: string;
  namaBarang: string;
  alamatLengkap: string;
  kecamatan: string;
  kota: string;
  remark: string;
  kesiapanBarang: string;
  lampiran?: string;
  status: 'Terkirim' | 'Pending' | 'Reschedule' | 'Belum Dikonfirmasi';
  tanggal: string; // YYYY-MM-DD
  destination: string;
}

export interface HubRoute {
  id: string; // e.g. SURABAYA, HUB MALANG, JAKARTA BARAT
  noLc: string;
  nopolArmada: string;
  driver: string;
  kapasitasCapacity: number;
  kapasitasFilled: number;
  status: 'Planned' | 'In Progress' | 'Completed';
  assignedOrderIds: string[];
}

export interface HubPerformance {
  namaHub: string;
  volumeTotal: number;
  terkirim: number;
  gagal: number;
  sla: number; // percentage
  status: 'OPTIMAL' | 'WARNING';
}

export interface DailyTrend {
  date: string; // e.g. "01 Oct"
  berhasil: number;
  gagal: number;
  slaLine: number; // percentage
}
