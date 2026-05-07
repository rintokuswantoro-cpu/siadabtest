import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { db, storage, handleFirestoreError, OperationType } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { MapSelector } from '@/components/MapSelector';
import { PhotoUpload } from '@/components/PhotoUpload';
import { OPD_SULTRA, MISCONDUCT_TYPES } from '@/constants';
import { Loader2, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const formSchema = z.object({
  reporterName: z.string().min(2, 'Nama minimal 2 karakter'),
  reporterEmail: z.string().email('Email tidak valid'),
  asnName: z.string().min(2, 'Nama ASN minimal 2 karakter'),
  asnInstansi: z.string().min(1, 'Pilih instansi'),
  misconductType: z.string().min(1, 'Pilih jenis pelanggaran'),
  description: z.string().min(10, 'Deskripsi minimal 10 karakter'),
});

export function ReportForm() {
  const [photo, setPhoto] = useState<File | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      reporterName: '',
      reporterEmail: '',
      asnName: '',
      asnInstansi: '',
      misconductType: '',
      description: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!location) {
      toast.error('Harap pilih lokasi kejadian di peta');
      return;
    }
    if (!photo) {
      toast.error('Harap unggah foto bukti kejadian');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Upload Photo to Storage
      const storageRef = ref(storage, `evidence/${Date.now()}_${photo.name}`);
      const uploadResult = await uploadBytes(storageRef, photo);
      const photoUrl = await getDownloadURL(uploadResult.ref);

      // 2. Save to Firestore
      const docRef = await addDoc(collection(db, 'reports'), {
        ...values,
        location,
        photoUrl,
        status: 'Pending',
        feedback: '',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      setSubmittedId(docRef.id);
      toast.success('Laporan berhasil dikirim! Kami akan menghubungi lewat email untuk update selanjutnya.');
      form.reset();
      setPhoto(null);
      setLocation(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'reports');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submittedId) {
    return (
      <Card className="max-w-2xl mx-auto border-green-100 bg-green-50/30">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
            <CheckIcon className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-800">Laporan Terkirim!</CardTitle>
          <CardDescription className="text-green-700">
            Terima kasih atas partisipasi Anda dalam menjaga disiplin ASN Sulawesi Tenggara.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-sm font-medium">Nomor ID Laporan Anda:</p>
          <code className="block p-3 bg-white rounded-lg border border-green-200 font-mono text-lg text-green-900">
            {submittedId}
          </code>
          <p className="text-xs text-muted-foreground">
            Simpan nomor ID ini untuk pengecekan status laporan di masa mendatang. Update juga akan dikirim ke email Anda.
          </p>
          <Button variant="outline" onClick={() => setSubmittedId(null)} className="mt-4">
            Buat Laporan Baru
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm flex flex-col overflow-hidden">
      <div className="p-8 border-b border-slate-100">
        <h2 className="text-xl font-bold text-slate-900">Formulir Pelaporan Masyarakat</h2>
        <p className="text-sm text-slate-500 mt-1">Data Anda akan dijaga kerahasiaannya sesuai regulasi yang berlaku.</p>
      </div>
      
      <div className="p-8">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="reporterName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-400">Nama Lengkap Anda</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Masukkan nama Anda" 
                        className="bg-slate-50 border-slate-200 rounded-xl px-4 py-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reporterEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-400">Email Aktif</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="email@anda.com" 
                        className="bg-slate-50 border-slate-200 rounded-xl px-4 py-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="asnName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-400">Nama ASN Terlapor</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Nama atau ciri fisik" 
                        className="bg-slate-50 border-slate-200 rounded-xl px-4 py-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all border"
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="asnInstansi"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold uppercase text-slate-400">Instansi / OPD Tujuan</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl px-4 py-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all border">
                          <SelectValue placeholder="Pilih Instansi" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OPD_SULTRA.map((opd) => (
                          <SelectItem key={opd} value={opd}>
                            {opd}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="misconductType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-400">Jenis Pelanggaran</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="bg-slate-50 border-slate-200 rounded-xl px-4 py-6 outline-none focus:ring-2 focus:ring-indigo-500 transition-all border">
                        <SelectValue placeholder="Pilih Jenis Pelanggaran" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MISCONDUCT_TYPES.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold uppercase text-slate-400">Deskripsi Singkat Kejadian</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ceritakan kronologi singkat..." 
                      className="bg-slate-50 border-slate-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 transition-all border resize-none min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-2">
              <FormLabel className="text-xs font-bold uppercase text-slate-400">Lokasi Kejadian (GPS)</FormLabel>
              <MapSelector onLocationSelect={(lat, lng, address) => setLocation({ lat, lng, address })} />
              {location && (
                <div className="bg-emerald-50 border border-emerald-100 rounded-xl px-4 py-3 flex items-center justify-between mt-2">
                  <span className="text-sm text-emerald-700 font-medium truncate pr-4">{location.address}</span>
                  <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shrink-0"></div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <FormLabel className="text-xs font-bold uppercase text-slate-400">Unggah Bukti Foto (JPG/PNG)</FormLabel>
              <PhotoUpload onPhotoSelect={setPhoto} />
            </div>

            <div className="p-8 bg-slate-50 -mx-8 -mb-8 mt-12 flex flex-col md:flex-row items-center justify-between gap-4 border-t border-slate-100">
              <p className="text-xs text-slate-400 max-w-sm text-center md:text-left italic">
                Dengan menekan tombol, Anda menyatakan bahwa laporan ini dibuat dengan sebenar-benarnya tanpa unsur fitnah.
              </p>
              <Button 
                type="submit" 
                className="bg-indigo-600 text-white px-10 py-7 rounded-2xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all active:scale-95 disabled:opacity-70" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-5 w-5" />
                    Kirim Laporan
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}

function CheckIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function MapPinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
