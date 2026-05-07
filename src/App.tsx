import React, { useState } from 'react';
import { ReportForm } from './components/ReportForm';
import { StatusCheck } from './components/StatusCheck';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Toaster } from '@/components/ui/sonner';
import { ShieldCheck, MessageSquarePlus, FileSearch, Building2, MapPin } from 'lucide-react';
import { motion } from 'motion/react';

function App() {
  const [activeTab, setActiveTab] = useState('report');

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* Top Header Navigation */}
      <header className="h-20 bg-white border-b border-slate-200 flex items-center justify-between px-6 md:px-10 sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-xl tracking-tight text-slate-900">SI-ADAB SULTRA</h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Provinsi Sulawesi Tenggara</p>
          </div>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-600">
          <span 
            className={`cursor-pointer pb-1 transition-all ${activeTab === 'report' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
            onClick={() => setActiveTab('report')}
          >
            Form Laporan
          </span>
          <span 
            className={`cursor-pointer pb-1 transition-all ${activeTab === 'status' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'hover:text-slate-900'}`}
            onClick={() => setActiveTab('status')}
          >
            Cek Status
          </span>
        </nav>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto flex flex-col md:flex-row gap-8 p-6 md:p-10">
        {/* Sidebar Info */}
        <aside className="w-full md:w-1/3 flex flex-col gap-6">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-indigo-900 text-white p-8 rounded-[2rem] flex flex-col gap-4 shadow-xl shadow-indigo-100"
          >
            <h2 className="text-2xl font-bold leading-tight">Wujudkan ASN Disiplin & Berintegritas</h2>
            <p className="text-indigo-100 text-sm leading-relaxed opacity-90">
              Layanan pengaduan masyarakat untuk melaporkan Aparatur Sipil Negara (ASN) yang berada di tempat hiburan atau tidak berdinas pada jam kerja efektif.
            </p>
            <div className="mt-4 flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide opacity-60">GPS Otomatis</p>
                <p className="text-sm">Koordinat lokasi akurat</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-wide opacity-60">Identitas Aman</p>
                <p className="text-sm">Kerahasiaan data terjamin</p>
              </div>
            </div>
          </motion.div>
          
          <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Update Terakhir OPD
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 italic">Dinas Pendidikan</span>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-medium">Aktif</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-600 italic">Bappeda Sultra</span>
                <span className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-medium">Aktif</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-50 pt-4">
                <span className="text-sm font-semibold">Laporan Terverifikasi</span>
                <span className="text-lg font-bold text-indigo-600">1.284</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Content Section */}
        <section className="flex-1">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'report' ? <ReportForm /> : <StatusCheck />}
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-10 mt-12">
        <div className="container mx-auto px-10 text-center">
          <p className="text-xs text-slate-400 max-w-2xl mx-auto mb-4 italic">
            Layanan ini dikelola secara transparan untuk memantau kedisiplinan ASN di wilayah Sulawesi Tenggara. 
            Setiap aduan diproses dengan tetap menjunjung asas praduga tak bersalah.
          </p>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">
            &copy; {new Date().getFullYear()} Pemerintah Provinsi Sulawesi Tenggara
          </p>
        </div>
      </footer>

      <Toaster position="top-center" richColors />
    </div>
  );
}

export default App;
