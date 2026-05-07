import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Camera, X, Upload } from 'lucide-react';

interface PhotoUploadProps {
  onPhotoSelect: (file: File | null) => void;
  previewUrl?: string;
}

export function PhotoUpload({ onPhotoSelect, previewUrl: initialPreview }: PhotoUploadProps) {
  const [preview, setPreview] = useState<string | null>(initialPreview || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onPhotoSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearSelection = () => {
    setPreview(null);
    onPhotoSelect(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {preview ? (
        <div className="relative group rounded-2xl overflow-hidden border border-slate-200 aspect-video bg-slate-50 shadow-sm">
          <img src={preview} alt="Evidence" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-indigo-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 backdrop-blur-sm">
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={clearSelection} 
              type="button"
              className="rounded-xl font-bold shadow-lg"
            >
              <X className="mr-2 h-4 w-4" />
              Hapus Foto
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer bg-slate-50 group"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="w-16 h-16 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Camera className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-700">Unggah Bukti Foto</p>
            <p className="text-xs text-slate-400 mt-1 italic">Klik untuk memilih atau ambil foto melalui kamera</p>
          </div>
          <Button variant="outline" size="sm" className="mt-2 rounded-xl border-slate-200 bg-white" type="button">
            <Upload className="mr-2 h-3 w-3 text-indigo-500" />
            Pilih Berkas
          </Button>
        </div>
      )}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />
    </div>
  );
}
