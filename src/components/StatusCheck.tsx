import React, { useState } from 'react';
import { db, handleFirestoreError, OperationType } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Loader2, Calendar, FileText, MapPin } from 'lucide-react';
import { toast } from 'sonner';

export function StatusCheck() {
  const [reportId, setReportId] = useState('');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleCheck = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reportId.trim()) return;

    setLoading(true);
    try {
      const docRef = doc(db, 'reports', reportId.trim());
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setReport({ id: docSnap.id, ...docSnap.data() });
      } else {
        setReport(null);
        toast.error('Laporan tidak ditemukan. Periksa kembali ID Laporan Anda.');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.GET, 'reports');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Ditinjau': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Selesai': return 'bg-green-100 text-green-800 border-green-200';
      case 'Ditolak': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50">
          <h2 className="text-xl font-bold text-slate-900">Cek Status Laporan</h2>
          <p className="text-sm text-slate-500 mt-1">
            Masukkan ID Laporan yang Anda terima setelah mengirimkan pengaduan.
          </p>
        </div>
        <div className="p-8">
          <form onSubmit={handleCheck} className="flex flex-col md:flex-row gap-3">
            <Input 
              placeholder="Contoh: xK2pL0..." 
              value={reportId}
              onChange={(e) => setReportId(e.target.value)}
              className="font-mono bg-slate-50 border-slate-200 rounded-xl px-4 py-6 text-lg focus:ring-2 focus:ring-indigo-500 transition-all border"
            />
            <Button 
              type="submit" 
              disabled={loading}
              className="bg-indigo-600 text-white px-8 py-6 rounded-xl font-bold hover:bg-indigo-700 transition-all h-auto shadow-lg shadow-indigo-100"
            >
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : <Search className="h-5 w-5 mr-2" />}
              {loading ? 'Mengecek...' : 'Cek Status'}
            </Button>
          </form>
        </div>
      </div>

      {report && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden"
        >
          <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-slate-50/50">
            <div className="space-y-1">
              <h3 className="font-bold text-lg text-slate-900">Detail Laporan</h3>
              <p className="text-xs text-slate-400 font-mono">ID: {report.id}</p>
            </div>
            <Badge className={`px-4 py-1.5 rounded-full font-bold uppercase tracking-wider text-[10px] ${getStatusColor(report.status)} shadow-sm`}>
              {report.status}
            </Badge>
          </div>
          <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <Calendar className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Tanggal Kirim</p>
                  <p className="font-medium text-slate-700">{report.createdAt?.toDate().toLocaleString('id-ID')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <FileText className="h-5 w-5 text-indigo-500" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Jenis Pelanggaran</p>
                  <p className="font-medium text-slate-700">{report.misconductType}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 col-span-full">
                <MapPin className="h-5 w-5 text-indigo-500 mt-1" />
                <div>
                  <p className="text-[10px] font-bold uppercase text-slate-400">Lokasi Kejadian</p>
                  <p className="font-medium text-slate-700 leading-relaxed">{report.location?.address}</p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest px-1">Tanggapan Resmi OPD</h4>
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100 text-sm italic text-indigo-900 leading-relaxed shadow-inner">
                {report.feedback || "Laporan Anda sedang menunggu verifikasi awal dari tim pengawas. Kami akan segera meninjau bukti yang Anda lampirkan."}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase text-slate-400 tracking-widest px-1">Bukti Terlampir</h4>
              <div className="rounded-[1.5rem] overflow-hidden border border-slate-200 shadow-lg group">
                <img src={report.photoUrl} alt="Bukti" className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
