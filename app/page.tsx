"use client";

import { useState } from "react";
import Scene3D from "./Scene3D";

interface Korban {
  id: number;
  nama: string;
  gejala: string;
  triageBenar: "HIJAU" | "KUNING" | "MERAH" | "HITAM";
  tindakan: string;
}

interface LokasiBencana {
  id: string;
  nama: string;
  deskripsi: string;
  koordinat3D: [number, number, number];
  korbanList: Korban[];
}

// Data Timeline Skenario Lengkap (Berdasarkan Dokumen PB-1)
const timelineSkenario = [
  { waktu: "20 Jan, 15:00", judul: "Hujan Deras", desc: "Hujan deras mulai turun terus-menerus. Debit sungai hulu meningkat.", cuaca: "Hujan Deras", suhu: "22°C", curahHujan: "150 mm/jam", angin: "15 km/jam" },
  { waktu: "20 Jan, 17:30", judul: "Longsor Pertama", desc: "Longsor pertama terjadi. Akses jalan di bukit mulai tertutup material tanah.", cuaca: "Hujan Deras", suhu: "21°C", curahHujan: "160 mm/jam", angin: "18 km/jam" },
  { waktu: "20 Jan, 18:00", judul: "Banjir Bandang", desc: "Aliran air kencang menghantam minimarket dan pemancingan secara tiba-tiba.", cuaca: "Hujan Badai", suhu: "20°C", curahHujan: "200 mm/jam", angin: "25 km/jam" },
  { waktu: "20 Jan, 19:00", judul: "Longsor Susulan Masif", desc: "Lereng ambrol menimpa perumahan Kasimpar. Pohon tumbang, Listrik padam total.", cuaca: "Badai Petir", suhu: "19°C", curahHujan: "180 mm/jam", angin: "30 km/jam" },
  { waktu: "20 Jan, 20:00", judul: "Akses Terputus", desc: "Jembatan putus, jalan utama tertutup. Akses evakuasi terhambat sepenuhnya.", cuaca: "Hujan Lebat", suhu: "19°C", curahHujan: "150 mm/jam", angin: "20 km/jam" },
  { waktu: "20 Jan, 21:00", judul: "Tim SAR Tiba (Triage Aktif)", desc: "Helikopter SAR tiba. Evakuasi medis & Triage dimulai di tengah kegelapan.", cuaca: "Hujan Sedang", suhu: "19°C", curahHujan: "80 mm/jam", angin: "15 km/jam" },
  { waktu: "20 Jan, 23:00", judul: "Pencarian Malam", desc: "Pencarian terus dilakukan tim gabungan. Korban mulai ditemukan.", cuaca: "Hujan Ringan", suhu: "18°C", curahHujan: "50 mm/jam", angin: "10 km/jam" },
  { waktu: "21 Jan, 04:00", judul: "Evakuasi RSUD", desc: "Korban luka-luka dilarikan ke RSUD dan Puskesmas terdekat.", cuaca: "Berawan", suhu: "20°C", curahHujan: "5 mm/jam", angin: "5 km/jam" },
  { waktu: "21 Jan, 05:00", judul: "Pembukaan Akses", desc: "Alat berat mulai bekerja membuka akses jalan yang tertutup longsor.", cuaca: "Cerah Berawan", suhu: "22°C", curahHujan: "0 mm/jam", angin: "5 km/jam" },
  { waktu: "21 Jan, 09:00", judul: "Tanggap Darurat", desc: "Bupati menetapkan status darurat 14 hari. Logistik terorganisir di posko.", cuaca: "Cerah", suhu: "25°C", curahHujan: "0 mm/jam", angin: "8 km/jam" }
];

export default function TableTopSimulation() {
  const [faseIndex, setFaseIndex] = useState(0);
  const [lokasiTerpilih, setLokasiTerpilih] = useState<LokasiBencana | null>(null);
  const [korbanTerpilih, setKorbanTerpilih] = useState<Korban | null>(null);

  const faseSaatIni = timelineSkenario[faseIndex];
  
  // Triage PIN HANYA MUNCUL saat SAR tiba (21:00) sampai sebelum korban dibawa ke RSUD (04:00)
  const isEvakuasiAktif = faseIndex >= 5 && faseIndex <= 7; 
  const isEvakuasiSelesai = faseIndex >= 8;

  const lokasiData: LokasiBencana[] = [
    {
      id: "rumah-warga",
      nama: "Area Perumahan (Desa Kasimpar)",
      deskripsi: "Rumah warga tertimbun material longsor dan pohon tumbang.",
      koordinat3D: [-4.5, 0, -2],
      korbanList: [
        { id: 1, nama: "Pria Dewasa (Korban 1)", gejala: "Kaki tertimpa material, berteriak kesakitan, napas teratur, nadi kuat.", triageBenar: "KUNING", tindakan: "Imobilisasi ekstremitas, evakuasi tertunda (Delayed)." },
        { id: 2, nama: "Balita (Korban 2)", gejala: "Tertimpa bangunan. Tidak bernapas, nadi karotis tidak teraba.", triageBenar: "HITAM", tindakan: "Kematian klinis (Deceased). Pindah ke korban berikutnya." },
        { id: 3, nama: "Anak Laki-laki (Korban 3)", gejala: "Luka lecet di tangan dan kaki, tubuh gemetar, diam membisu, bisa berjalan.", triageBenar: "HIJAU", tindakan: "Arahkan berjalan ke posko aman (Walking Wounded)." }
      ]
    },
    {
      id: "kafe",
      nama: "Area Perekonomian (Minimarket)",
      deskripsi: "Minimarket dan area usaha hancur tersapu banjir sungai.",
      koordinat3D: [5, 0, -1],
      korbanList: [
        { id: 4, nama: "Perempuan Muda (Korban 4)", gejala: "Napas >30x/menit dangkal, bibir kebiruan (sianosis), lemas tidak bisa berdiri.", triageBenar: "MERAH", tindakan: "Bebaskan jalan napas, berikan oksigen segera (Immediate)!" },
        { id: 5, nama: "Pengunjung Pria (Korban 5)", gejala: "Perdarahan wajah dan tangan akibat pecahan kaca, berdiri sempoyongan.", triageBenar: "KUNING", tindakan: "Balut tekan perdarahan. Observasi kesadaran (Delayed)." },
        { id: 6, nama: "Relawan Lokal (Korban 9)", gejala: "Terduduk lemas, napas tersengal-sengal, wajah pucat.", triageBenar: "MERAH", tindakan: "Dugaan syok/kelelahan berat. Resusitasi cairan segera (Immediate)." }
      ]
    }
  ];

  const getWarnaTriage = (status: string) => {
    switch (status) {
      case "HIJAU": return "bg-emerald-600 border-emerald-400 text-white";
      case "KUNING": return "bg-amber-500 border-amber-300 text-slate-900";
      case "MERAH": return "bg-rose-600 border-rose-400 text-white";
      case "HITAM": return "bg-zinc-800 border-zinc-500 text-white";
      default: return "bg-slate-700";
    }
  };

  return (
    <main className="flex flex-col lg:flex-row h-screen bg-slate-900 text-white font-sans overflow-hidden">
      
      {/* KIRI: Peta Simulator 3D */}
      <div className="w-full lg:w-3/5 h-[60%] lg:h-full relative bg-slate-950">
        
        {/* PANEL GEOGRAFIS */}
        <div className="absolute top-4 left-4 z-10 bg-slate-900/80 backdrop-blur p-4 rounded-xl border border-slate-700 shadow-xl max-w-sm pointer-events-none">
          <h1 className="text-lg font-black text-amber-400 uppercase tracking-wider">Triage PB-1 Petungkriyono</h1>
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <span className="text-slate-400 block">Cuaca Lapangan</span>
              <strong className="text-white text-sm">{faseSaatIni.cuaca}</strong>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <span className="text-slate-400 block">Suhu Udara</span>
              <strong className="text-white text-sm">{faseSaatIni.suhu}</strong>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <span className="text-slate-400 block">Intensitas Hujan</span>
              <strong className="text-rose-400 text-sm">{faseSaatIni.curahHujan}</strong>
            </div>
            <div className="bg-slate-800 p-2 rounded border border-slate-700">
              <span className="text-slate-400 block">Kecepatan Angin</span>
              <strong className="text-white text-sm">{faseSaatIni.angin}</strong>
            </div>
          </div>
        </div>

        <Scene3D 
          lokasiSkenario={lokasiData} 
          faseIndex={faseIndex}
          onSelectLokasi={(lokasi) => {
            if (isEvakuasiAktif) {
              setLokasiTerpilih(lokasi);
              setKorbanTerpilih(null);
            }
          }} 
        />
        
        {/* KONTROL PEMUTAR TIMELINE */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 bg-slate-900/95 p-3 rounded-2xl border border-slate-700 shadow-2xl flex items-center gap-4 w-[90%] max-w-lg z-20">
          <button 
            onClick={() => { setFaseIndex(Math.max(0, faseIndex - 1)); setLokasiTerpilih(null); }}
            disabled={faseIndex === 0}
            className="p-3 bg-slate-800 rounded-lg disabled:opacity-30 cursor-pointer text-white hover:bg-slate-700 border-none"
          >
            ⏮ Mundur
          </button>
          <div className="flex-1 text-center">
            <div className="text-amber-400 font-black text-sm uppercase tracking-widest">{faseSaatIni.waktu}</div>
            <div className="text-xs text-slate-300 font-semibold">{faseSaatIni.judul}</div>
          </div>
          <button 
            onClick={() => { setFaseIndex(Math.min(timelineSkenario.length - 1, faseIndex + 1)); setLokasiTerpilih(null); }}
            disabled={faseIndex === timelineSkenario.length - 1}
            className="p-3 bg-blue-600 rounded-lg disabled:opacity-30 cursor-pointer text-white hover:bg-blue-500 font-bold border-none"
          >
            {faseIndex === timelineSkenario.length - 1 ? "Selesai" : "Maju ⏭"}
          </button>
        </div>
      </div>

      {/* KANAN: Dashboard Evakuasi & Triage */}
      <div className="w-full lg:w-2/5 h-[40%] lg:h-full overflow-y-auto p-6 bg-slate-900 border-l border-slate-800">
        <div className="bg-slate-800 p-5 rounded-xl border border-slate-700 mb-6 shadow-lg">
          <div className="text-xs font-mono text-slate-400 mb-1 border-b border-slate-700 pb-2">LAPORAN SITUASI</div>
          <h2 className="text-xl font-bold text-amber-400 mt-2">{faseSaatIni.judul}</h2>
          <p className="text-sm text-slate-300 mt-2 leading-relaxed">{faseSaatIni.desc}</p>
        </div>

        {isEvakuasiSelesai ? (
           <div className="flex flex-col items-center justify-center h-48 text-blue-400 text-sm text-center border-2 border-dashed border-blue-900/50 rounded-xl p-4 bg-blue-900/10">
           ✅ Operasi Medis Selesai.<br/><br/>Korban telah dievakuasi ke RSUD terdekat. Alat berat sedang bekerja membersihkan sisa material bencana.
         </div>
        ) : !isEvakuasiAktif ? (
          <div className="flex flex-col items-center justify-center h-48 text-slate-500 text-sm text-center border-2 border-dashed border-slate-700 rounded-xl p-4">
            ⏳ Menunggu Tim SAR Tiba.<br/><br/>Maju ke pukul 21:00 WIB di pemutar waktu untuk memicu kedatangan SAR dan memulai Triage Medis.
          </div>
        ) : !lokasiTerpilih ? (
          <div className="flex flex-col items-center justify-center h-48 text-emerald-400 text-sm text-center border-2 border-dashed border-emerald-900/50 rounded-xl p-4 bg-emerald-900/10 animate-pulse">
            📍 Helikopter SAR Mendarat!<br/><br/>Klik indikator PIN KUNING di area maket 3D untuk menyelamatkan korban di reruntuhan.
          </div>
        ) : (
          <div className="space-y-4 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="font-bold text-lg text-white">{lokasiTerpilih.nama}</h3>
              <button onClick={() => setLokasiTerpilih(null)} className="text-xs text-slate-400 hover:text-white bg-transparent border-none cursor-pointer p-1">Tutup ✖</button>
            </div>
            
            <div className="space-y-3">
              {lokasiTerpilih.korbanList.map((korban) => (
                <div key={korban.id} className="border border-slate-700 rounded-xl overflow-hidden shadow-sm">
                  <button
                    onClick={() => setKorbanTerpilih(korbanTerpilih?.id === korban.id ? null : korban)}
                    className="w-full text-left p-4 bg-slate-800 hover:bg-slate-750 transition-colors cursor-pointer border-none flex justify-between items-center"
                  >
                    <div className="pr-4">
                      <div className="font-bold text-sm text-white">{korban.nama}</div>
                      <div className="text-xs text-slate-400 mt-1 line-clamp-1">{korban.gejala}</div>
                    </div>
                    <span className="text-[10px] bg-blue-600/20 text-blue-400 border border-blue-600/50 px-2 py-1.5 rounded uppercase font-bold whitespace-nowrap">
                      {korbanTerpilih?.id === korban.id ? "Tutup Data" : "Buka Medis"}
                    </span>
                  </button>

                  {korbanTerpilih?.id === korban.id && (
                    <div className={`p-5 border-t border-slate-700 border-l-8 ${getWarnaTriage(korban.triageBenar)} bg-slate-850 animate-fadeIn`}>
                      <div className="flex justify-between items-start mb-3">
                        <span className="font-black tracking-widest text-sm uppercase">TAG {korban.triageBenar}</span>
                      </div>
                      <div className="text-xs space-y-3 opacity-90 font-mono bg-slate-900/50 p-3 rounded-lg border border-slate-700/50">
                        <p className="leading-relaxed"><strong className="text-slate-300">Gejala Klinis:</strong><br/>{korban.gejala}</p>
                        <p className="leading-relaxed"><strong className="text-slate-300">Tindakan Logis:</strong><br/>{korban.tindakan}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}