/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { DeliveryRequest } from '../types';
import { Send, Upload, CheckCircle2 } from 'lucide-react';
import { getAccessToken } from '../firebase';

interface InputRequestFormProps {
  onAddRequest: (req: DeliveryRequest) => void;
  onNavigateToMonitoring: () => void;
}

export default function InputRequestForm({ onAddRequest, onNavigateToMonitoring }: InputRequestFormProps) {
  const [formData, setFormData] = useState({
    omo: '',
    noOrder: '',
    namaCustomer: '',
    noRt: '',
    rtAction: '',
    namaBarang: '',
    alamatLengkap: '',
    kecamatan: '',
    kota: '',
    remark: '',
    kesiapanBarang: '',
    konfirmasiKirim: false
  });

  const [fileName, setFileName] = useState<string>('');
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [createdId, setCreatedId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileName(e.target.files[0].name);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.namaCustomer || !formData.noOrder || !formData.namaBarang || !formData.alamatLengkap) {
      alert('Mohon lengkapi data wajib yang ditandai (Customer, No Order, Nama Barang, Alamat Laporan)!');
      return;
    }

    if (!formData.omo) {
      alert('Mohon pilih OMO terlebih dahulu!');
      return;
    }

    if (!formData.rtAction) {
      alert('Mohon pilih RT Action terlebih dahulu!');
      return;
    }

    if (!formData.kota) {
      alert('Mohon pilih Kota terlebih dahulu!');
      return;
    }

    if (!formData.kesiapanBarang) {
      alert('Mohon pilih Kesiapan Barang terlebih dahulu!');
      return;
    }

    if (!formData.konfirmasiKirim) {
      alert('Konfirmasi kirim harus dicentang terlebih dahulu untuk memproses permintaan!');
      return;
    }

    const token = await getAccessToken();
    if (!token) {
      alert('Silakan Connect Google (di bagian pojok kanan atas) terlebih dahulu untuk menyimpan ke Spreadsheet.');
      return;
    }

    setIsSubmitting(true);

    // Generate custom code in OMO-DDMMYY format
    const omoVal = formData.omo;
    const today = new Date();
    const dd = String(today.getDate()).padStart(2, '0');
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const yy = String(today.getFullYear()).slice(-2);
    const ddmmyy = `${dd}${mm}${yy}`;
    const newId = `${omoVal}-${ddmmyy}`;

    const newRequest: DeliveryRequest = {
      id: newId,
      omo: omoVal,
      noOrder: formData.noOrder,
      namaCustomer: formData.namaCustomer,
      noRt: formData.noRt || 'RT30282488',
      rtAction: formData.rtAction,
      namaBarang: formData.namaBarang,
      alamatLengkap: formData.alamatLengkap,
      kecamatan: formData.kecamatan || '-',
      kota: formData.kota,
      remark: formData.remark,
      kesiapanBarang: formData.kesiapanBarang,
      lampiran: fileName || undefined,
      status: 'Belum Dikonfirmasi',
      tanggal: today.toISOString().split('T')[0],
      destination: `${formData.kota}, ${formData.kecamatan || 'Umum'}`
    };

    try {
      const sheetId = '1lG35nFJ3FRrjIKQ8vtir2CzLHQtY5jHPE1AQofn05P4';
      const range = 'A1';
      const rowData = [
        newRequest.omo,
        newRequest.noOrder,
        newRequest.noRt,
        newRequest.rtAction,
        newRequest.namaCustomer,
        newRequest.kota,
        newRequest.kecamatan,
        newRequest.alamatLengkap,
        newRequest.namaBarang,
        newRequest.remark,
        newRequest.kesiapanBarang,
        newRequest.status,
        newRequest.tanggal,
        newRequest.id
      ]; // Columns to append

      const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          values: [rowData]
        }),
      });

      if (!response.ok) {
        let errorMsg = 'Failed to append to spreadsheet';
        try {
          const errData = await response.json();
          errorMsg = errData.error?.message || errorMsg;
        } catch(e) {}
        throw new Error(errorMsg);
      }

      onAddRequest(newRequest);
      setCreatedId(newId);
      setShowSuccessToast(true);

      // Reset Form
      setFormData({
        omo: '',
        noOrder: '',
        namaCustomer: '',
        noRt: '',
        rtAction: '',
        namaBarang: '',
        alamatLengkap: '',
        kecamatan: '',
        kota: '',
        remark: '',
        kesiapanBarang: '',
        konfirmasiKirim: false
      });
      setFileName('');

      setTimeout(() => {
        setShowSuccessToast(false);
      }, 5000);
    } catch (error: any) {
      console.error(error);
      alert('Gagal menyimpan ke Spreadsheet: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePreFill = () => {
    setFormData({
      omo: 'DWITYAS',
      noOrder: 'TTO/Q331/2026/05/0006',
      namaCustomer: 'PT. Kawan Lama Sejahtera',
      noRt: 'RT30282488',
      rtAction: 'TD',
      namaBarang: 'Alat Ukur Presisi & Mesin Bubut Bubut CNC',
      alamatLengkap: 'Kawasan Industri Jababeka Tahap II Blok J No. 12',
      kecamatan: 'Cikarang Selatan',
      kota: 'SURABAYA',
      remark: 'Hubungi Ibu Fitria di lokasi proyek.',
      kesiapanBarang: 'Siap',
      konfirmasiKirim: true
    });
    setFileName('spec_mesin_bubut_v2.pdf');
  };

  return (
    <div id="input-request-view" className="relative p-1 md:p-4">
      {showSuccessToast && (
        <div className="fixed top-20 right-4 z-50 max-w-md bg-emerald-600 text-white p-4 rounded-lg shadow-xl flex items-start gap-3 animate-bounce">
          <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
          <div>
            <h4 className="font-semibold text-sm">Permintaan Pengiriman Berhasil Dibuat!</h4>
            <p className="text-xs text-emerald-100 mt-1">
              Data dengan ID <strong className="font-mono">{createdId}</strong> telah disimpan ke sistem dan siap diproses di menu Monitoring.
            </p>
            <button 
              onClick={onNavigateToMonitoring} 
              className="mt-2 text-xs bg-white text-emerald-800 px-2 py-1 rounded font-medium hover:bg-emerald-50 transition"
            >
              Cek di Monitoring &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Main card */}
      <div className="bg-white rounded-lg border border-[#ddbfc1] shadow-sm overflow-hidden">
        {/* Form Header */}
        <div className="p-6 pb-0 flex justify-between items-center">
          <h2 className="text-[22px] font-bold text-[#a33348] tracking-tight">
            Buat Permintaan Pengiriman Baru
          </h2>
          <button 
            type="button" 
            onClick={handlePreFill}
            className="text-xs bg-pink-50 text-[#a33348] hover:bg-pink-100 border border-pink-200 py-1.5 px-3 rounded transition font-medium"
          >
            Isi Otomatis (Demo)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* OMO */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                OMO
              </label>
              <select
                id="select-omo"
                value={formData.omo}
                onChange={(e) => setFormData({ ...formData, omo: e.target.value })}
                className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition cursor-pointer"
              >
                <option value="">Pilih Omo...</option>
                <option value="ROHMAD">ROHMAD</option>
                <option value="DWITYAS">DWITYAS</option>
                <option value="WIDYA">WIDYA</option>
                <option value="FITRIA">FITRIA</option>
                <option value="PUTRI">PUTRI</option>
                <option value="ELZA">ELZA</option>
              </select>
            </div>

            {/* No. Order */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                No. Order <span className="text-red-500">*</span>
              </label>
              <input
                id="input-noorder"
                type="text"
                required
                placeholder="cth: 9513189361 / F2.XE00003 / TTO/Q331/2026/05/0006 / 095/WD/SVCSBY/V/26"
                value={formData.noOrder}
                onChange={(e) => setFormData({ ...formData, noOrder: e.target.value })}
                className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Nama Customer */}
            <div className="md:col-span-1 space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                Nama Customer <span className="text-red-500">*</span>
              </label>
              <input
                id="input-customer"
                type="text"
                required
                placeholder="Nama Perusahaan / Perorangan"
                value={formData.namaCustomer}
                onChange={(e) => setFormData({ ...formData, namaCustomer: e.target.value })}
                className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition"
              />
            </div>

            {/* No. RT */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                No. RT
              </label>
              <input
                id="input-nort"
                type="text"
                placeholder="cth: RT30282488"
                value={formData.noRt}
                onChange={(e) => setFormData({ ...formData, noRt: e.target.value })}
                className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition"
              />
            </div>

            {/* RT Action */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                RT Action
              </label>
              <select
                id="select-rtaction"
                value={formData.rtAction}
                onChange={(e) => setFormData({ ...formData, rtAction: e.target.value })}
                className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition"
              >
                <option value="">Pilih Action...</option>
                <option value="AB">AB</option>
                <option value="TD">TD</option>
              </select>
            </div>
          </div>

          {/* Nama Barang */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
              Nama Barang <span className="text-red-500">*</span>
            </label>
            <textarea
              id="input-namabarang"
              required
              rows={2}
              placeholder="Sebutkan item-item barang serta spek singkat bila diperlukan..."
              value={formData.namaBarang}
              onChange={(e) => setFormData({ ...formData, namaBarang: e.target.value })}
              className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition resize-y"
            />
          </div>

          {/* Alamat Lengkap */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
              Alamat Lengkap <span className="text-red-500">*</span>
            </label>
            <textarea
              id="input-alamat"
              required
              rows={3}
              placeholder="Alamat penyerahan / pelabuhan bongkar muat..."
              value={formData.alamatLengkap}
              onChange={(e) => setFormData({ ...formData, alamatLengkap: e.target.value })}
              className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kecamatan */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                Kecamatan
              </label>
              <input
                id="input-kecamatan"
                type="text"
                placeholder="cth: Ngamprah"
                value={formData.kecamatan}
                onChange={(e) => setFormData({ ...formData, kecamatan: e.target.value })}
                className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition"
              />
            </div>

            {/* Kota */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                Kota
              </label>
              <select
                id="select-kota"
                value={formData.kota}
                onChange={(e) => setFormData({ ...formData, kota: e.target.value })}
                className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition"
              >
                <option value="">Pilih Kota...</option>
                <option value="SURABAYA">SURABAYA</option>
                <option value="GRESIK">GRESIK</option>
                <option value="MOJOKERTO">MOJOKERTO</option>
                <option value="SIDOARJO">SIDOARJO</option>
                <option value="PASURUAN">PASURUAN</option>
                <option value="MALANG">MALANG</option>
                <option value="HUB KEDIRI">HUB KEDIRI</option>
                <option value="JOMBANG">JOMBANG</option>
                <option value="TUBAN">TUBAN</option>
                <option value="LAMONGAN">LAMONGAN</option>
                <option value="BANYUWANGI">BANYUWANGI</option>
                <option value="JEMBER">JEMBER</option>
              </select>
            </div>
          </div>

          {/* Remark */}
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
              Remark
            </label>
            <textarea
              id="input-remark"
              rows={2}
              placeholder="Tambahkan instruksi operasional, kontak penerima, nomor kontainer..."
              value={formData.remark}
              onChange={(e) => setFormData({ ...formData, remark: e.target.value })}
              className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition resize-y"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Kesiapan Barang */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                Kesiapan Barang
              </label>
              <select
                id="select-kesiapan"
                value={formData.kesiapanBarang}
                onChange={(e) => setFormData({ ...formData, kesiapanBarang: e.target.value })}
                className="w-full px-3 py-2 border border-[#ddbfc1] rounded bg-white text-sm text-[#24191a] focus:ring-1 focus:ring-[#c74e62] focus:border-[#c74e62] outline-none transition cursor-pointer"
              >
                <option value="">Konfirmasi Barang...</option>
                <option value="Siap">Siap</option>
                <option value="Belum Siap">Belum Siap</option>
                <option value="BARANG DI DC">BARANG DI DC</option>
              </select>
            </div>

            {/* Lampiran (Choose File) */}
            <div className="space-y-1.5">
              <label className="block text-xs font-semibold text-[#574143] uppercase tracking-wider">
                Lampiran
              </label>
              <div className="relative border border-[#ddbfc1] text-[#24191a] rounded flex items-center bg-white px-3 py-2 h-[38px] cursor-pointer hover:border-[#c74e62] transition overflow-hidden">
                <Upload className="w-4 h-4 text-[#8a7173] mr-2 flex-shrink-0" />
                <span className="text-xs bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded px-2 py-0.5 mr-2 text-gray-700 font-medium select-none text-[11px]">
                  Choose File
                </span>
                <span className="text-xs text-gray-500 truncate select-none">
                  {fileName || 'No file chosen'}
                </span>
                <input
                  id="input-lampiran-file"
                  type="file"
                  onChange={handleFileChange}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Konfirmasi Kirim & Submit Button */}
          <div className="pt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-t border-gray-100">
            {/* Checkbox */}
            <label className="flex items-center gap-2.5 cursor-pointer group">
              <input
                id="checkbox-konfirmasi"
                type="checkbox"
                checked={formData.konfirmasiKirim}
                onChange={(e) => setFormData({ ...formData, konfirmasiKirim: e.target.checked })}
                className="w-4.5 h-4.5 text-[#a33348] border-[#ddbfc1] rounded focus:ring-offset-0 focus:ring-[#a33348] cursor-pointer"
              />
              <span className="text-sm text-[#574143] group-hover:text-[#24191a] transition select-none font-medium">
                Konfirmasi Kirim
              </span>
            </label>

            {/* Submit */}
            <button
              id="submit-request-button"
              type="submit"
              disabled={isSubmitting}
              className="w-full sm:w-auto bg-[#a33348] hover:bg-[#8e2b3e] text-white px-6 py-2.5 rounded font-semibold text-sm shadow-sm transition active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-75 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4 transform rotate-0" />
              {isSubmitting ? 'Menyimpan...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
