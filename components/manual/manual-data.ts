import type { AppLocale } from "@/lib/i18n";

export type PeakKind =
  | "typography3d"
  | "rotatablePage"
  | "neuralConsole"
  | "livingWorld"
  | "tactileDeck"
  | "orbitalAtlas";

export type LocalizedText = Record<AppLocale, string>;

export type ManualStep = {
  id: string;
  heading: LocalizedText;
  body: LocalizedText;
  badge?: LocalizedText;
};

export type ManualLink = {
  href: string;
  label: LocalizedText;
};

export type ManualChapter = {
  id: string;
  number: string;
  peakKind: PeakKind;
  peakBadge: LocalizedText;
  title: LocalizedText;
  subtitle: LocalizedText;
  summary: LocalizedText;
  readMinutes: number;
  roles: LocalizedText[];
  steps: ManualStep[];
  tips: LocalizedText[];
  links: ManualLink[];
};

export const MANUAL_CHAPTERS: ManualChapter[] = [
  {
    id: "overview-roles",
    number: "01",
    peakKind: "typography3d",
    peakBadge: { id: "Tipografi 3D Berlapis", en: "Layered 3D Typography" },
    title: {
      id: "Pengenalan Sistem & 6 Role Pengguna",
      en: "System Overview & 6 User Roles",
    },
    subtitle: {
      id: "Memahami arsitektur, hak akses, sesi aman, dan notifikasi berbasis role di TNGL.",
      en: "Understand architecture, permissions, secure sessions, and role-scoped notifications in TNGL.",
    },
    summary: {
      id: "Sistem Pemantauan Satwa Liar TNGL menggabungkan pelacakan GPS, analisis AI kamera jebak & audio, wisata & POS loket, serta ensiklopedia satwa 3D dalam satu portal terpadu.",
      en: "The TNGL Wildlife Monitoring System unifies GPS tracking, camera-trap & audio AI analysis, tourism & POS ticketing, and a 3D wildlife encyclopedia in one portal.",
    },
    readMinutes: 4,
    roles: [
      { id: "Semua 6 Role", en: "All 6 Roles" },
      { id: "RBAC Terpusat", en: "Centralized RBAC" },
    ],
    steps: [
      {
        id: "roles-matrix",
        badge: { id: "Hak Akses", en: "Access Control" },
        heading: {
          id: "Kenali 6 role & halaman awal masing-masing",
          en: "Know the 6 roles & their landing pages",
        },
        body: {
          id: "Administrator Sistem, Peneliti Ekologi, Konservasionis Lapangan, dan Pengambil Kebijakan masuk ke Dashboard. Petugas Loket langsung diarahkan ke Kasir (POS), sedangkan Pengunjung diarahkan ke Jelajah Tur.",
          en: "System Administrator, Ecologist, Field Conservationist, and Policymaker land on Dashboard. Ticket Counter Staff land on Cashier (POS), while Visitors land on Explore Tours.",
        },
      },
      {
        id: "session-security",
        badge: { id: "Keamanan", en: "Security" },
        heading: {
          id: "Sesi httpOnly & batas idle 2 jam",
          en: "httpOnly session & 2-hour idle timeout",
        },
        body: {
          id: "Browser tidak pernah memanggil backend Laravel secara langsung. Semua permintaan melewati server action Next.js dengan token cookie httpOnly. Jika tidak aktif lebih dari 2 jam, sesi otomatis keluar ke halaman login.",
          en: "The browser never calls Laravel directly. All requests proxy through Next.js server actions using an httpOnly cookie token. After 2 hours of inactivity, sessions expire safely to the login screen.",
        },
      },
      {
        id: "scoped-notifications",
        badge: { id: "No-Show", en: "No-Show" },
        heading: {
          id: "Notifikasi terbuka untuk semua role dengan isolasi ketat",
          en: "Notifications for all roles with strict isolation",
        },
        body: {
          id: "Semua 6 role dapat membuka menu Notifikasi. Namun peringatan zona risiko dan alert perangkat hanya dikirim ke staf konservasi/admin; pengunjung dan petugas loket hanya melihat informasi pemesanan dan sistem.",
          en: "All 6 roles can open Notifications. However, risk-zone and device alerts are restricted to conservation staff/admins; visitors and counter staff only see booking and system updates.",
        },
      },
      {
        id: "theme-lang",
        badge: { id: "Preferensi", en: "Preferences" },
        heading: {
          id: "Ganti Bahasa (ID/EN) & Mode Gelap/Terang",
          en: "Switch Language (ID/EN) & Dark/Light Mode",
        },
        body: {
          id: "Gunakan tombol ID/EN dan ikon Bulan/Matahari di pojok kanan atas header (atau halaman login) kapan saja. Pilihan tersimpan otomatis di browser Anda.",
          en: "Use the ID/EN toggle and Sun/Moon button in the top-right header (or login page) anytime. Your preference persists automatically in your browser.",
        },
      },
    ],
    tips: [
      {
        id: "Gunakan menu Profil Saya untuk mengganti kata sandi secara berkala.",
        en: "Use My Profile to update your password regularly.",
      },
      {
        id: "Pendaftaran mandiri di /register selalu menghasilkan role Pengunjung yang terisolasi dari data konservasi.",
        en: "Self-registration at /register always assigns the Visitor role isolated from conservation data.",
      },
    ],
    links: [
      { href: "/notifications", label: { id: "Buka Notifikasi", en: "Open Notifications" } },
      { href: "/profile", label: { id: "Profil Saya", en: "My Profile" } },
    ],
  },
  {
    id: "tracking-incidents",
    number: "02",
    peakKind: "rotatablePage",
    peakBadge: { id: "Halaman 3D Dapat Diputar 360°", en: "360° Rotatable 3D Page" },
    title: {
      id: "Pelacakan Satwa, Perangkat & Laporan Insiden",
      en: "Wildlife Tracking, Devices & Incident Reports",
    },
    subtitle: {
      id: "Cara memantau pergerakan satwa di peta, mengelola kalung GPS/kamera jebak, dan menindaklanjuti insiden.",
      en: "Monitor wildlife movement on the map, manage GPS collars/camera traps, and process field incidents.",
    },
    summary: {
      id: "Modul lapangan menghubungkan data master (spesies, individu satwa, perangkat, zona geografis) dengan pembacaan GPS real-time, kunjungan zona otomatis, dan pelaporan insiden.",
      en: "Field operations link master data (species, individual animals, devices, geo-zones) with real-time GPS readings, automated zone visits, and incident reporting.",
    },
    readMinutes: 5,
    roles: [
      { id: "Konservasionis", en: "Conservationist" },
      { id: "Peneliti", en: "Ecologist" },
      { id: "Admin", en: "Admin" },
    ],
    steps: [
      {
        id: "live-map",
        badge: { id: "Peta", en: "Map" },
        heading: {
          id: "Pantau posisi terbaru di Live Map & Wildlife Explorer",
          en: "Monitor latest positions on Live Map & Wildlife Explorer",
        },
        body: {
          id: "Buka Live Map untuk melihat titik koordinat terbaru tiap satwa beserta poligon zona geografis (Zona Inti, Hutan Lindung, Koridor, Permukiman). Gunakan Wildlife Explorer untuk menelusuri riwayat jejak individu.",
          en: "Open Live Map to view latest animal coordinates alongside geo-zone polygons (Core Zone, Protected Forest, Corridor, Settlement). Use Wildlife Explorer to inspect individual movement tracks.",
        },
      },
      {
        id: "device-tokens",
        badge: { id: "Perangkat", en: "Devices" },
        heading: {
          id: "Kelola perangkat lapangan & token API khusus perangkat",
          en: "Manage field devices & dedicated device API tokens",
        },
        body: {
          id: "Di detail perangkat (/devices/[id]/detail), Peneliti/Admin dapat membuat token API khusus perangkat. Token ini tidak kedaluwarsa karena idle dan hanya boleh mengirim telemetri/GPS/foto milik perangkat tersebut.",
          en: "In device details (/devices/[id]/detail), Ecologists/Admins can issue device-scoped API tokens. These tokens never idle-expire and are restricted to that specific device's telemetry/GPS/captures.",
        },
      },
      {
        id: "incident-workflow",
        badge: { id: "Insiden", en: "Incidents" },
        heading: {
          id: "Alur status baku laporan insiden lapangan",
          en: "Standardized field incident status workflow",
        },
        body: {
          id: "Petugas lapangan mencatat insiden (konflik satwa, perambahan, perburuan, observasi) lengkap dengan koordinat dan media bukti. Status divalidasi baku: Menunggu -> Diselidiki -> Selesai atau Ditolak.",
          en: "Field officers log incidents (wildlife conflict, encroachment, poaching, observation) with coordinates and media evidence. Statuses are strictly validated: Pending -> Investigating -> Completed or Rejected.",
        },
      },
      {
        id: "exports",
        badge: { id: "Ekspor", en: "Export" },
        heading: {
          id: "Ekspor CSV & GeoJSON aman untuk analisis GIS",
          en: "Safe CSV & GeoJSON exports for GIS analysis",
        },
        body: {
          id: "Peneliti, Pengambil Kebijakan, dan Admin dapat mengekspor data GPS, zona, kunjungan zona, insiden, dan laporan agregat ke CSV (aman dari formula injection) atau GeoJSON.",
          en: "Ecologists, Policymakers, and Admins can export GPS, zones, zone visits, incidents, and aggregate reports to CSV (protected from formula injection) or GeoJSON.",
        },
      },
    ],
    tips: [
      {
        id: "Perangkat berstatus nonaktif atau hilang otomatis ditolak saat mencoba mengirim data.",
        en: "Devices marked inactive or lost are automatically rejected when attempting to ingest data.",
      },
      {
        id: "Mengubah koordinat insiden akan menghitung ulang zona geografis terkait secara otomatis.",
        en: "Updating incident coordinates automatically recalculates the matching geo-zone.",
      },
    ],
    links: [
      { href: "/tracking/live-map", label: { id: "Buka Live Map", en: "Open Live Map" } },
      { href: "/incidents", label: { id: "Daftar Insiden", en: "Incident List" } },
    ],
  },
  {
    id: "ai-pipeline",
    number: "03",
    peakKind: "neuralConsole",
    peakBadge: { id: "Konsol Pipeline AI 3D", en: "3D AI Pipeline Console" },
    title: {
      id: "Analisis AI Kamera Jebak, Audio & Wajah Staf",
      en: "AI Camera Trap, Audio & Staff Face Analysis",
    },
    subtitle: {
      id: "Mengunggah media lapangan, memahami skor AI, dan melakukan verifikasi petugas.",
      en: "Upload field media, interpret AI predictions, and perform officer verification.",
    },
    summary: {
      id: "Layanan AI lokal (YAMNet, MegaDetector, SpeciesNet, MegaDescriptor, YuNet/SFace) menganalisis gambar, video, dan suara secara gratis di CPU, dengan fallback otomatis ke Groq LLM bila layanan AI mati.",
      en: "The local AI service (YAMNet, MegaDetector, SpeciesNet, MegaDescriptor, YuNet/SFace) analyzes images, video, and audio for free on CPU, with automatic fallback to Groq LLM when offline.",
    },
    readMinutes: 5,
    roles: [
      { id: "Konservasionis", en: "Conservationist" },
      { id: "Peneliti", en: "Ecologist" },
      { id: "Admin", en: "Admin" },
    ],
    steps: [
      {
        id: "ai-upload",
        badge: { id: "Unggah", en: "Upload" },
        heading: {
          id: "Unggah foto, video, atau rekaman suara di AI Vision",
          en: "Upload photos, videos, or audio recordings in AI Vision",
        },
        body: {
          id: "Pilih berkas gambar (JPG/PNG/WEBP), video (MP4/MOV/WEBM — diambil 1 frame per 2 detik + trek suara), atau audio (WAV/MP3/M4A/OGG/FLAC) hingga 50 MB.",
          en: "Select image (JPG/PNG/WEBP), video (MP4/MOV/WEBM — sampled every 2s + audio track), or audio (WAV/MP3/M4A/OGG/FLAC) files up to 50 MB.",
        },
      },
      {
        id: "reid-faces",
        badge: { id: "Identifikasi", en: "Identification" },
        heading: {
          id: "Re-identifikasi individu satwa & pengenalan wajah staf",
          en: "Individual animal re-ID & staff face recognition",
        },
        body: {
          id: "MegaDescriptor mencocokkan individu satwa terhadap galeri foto referensi, sedangkan YuNet + SFace membedakan wajah staf terdaftar dari orang tak dikenal untuk mencegah alarm palsu.",
          en: "MegaDescriptor matches individual animals against reference photos, while YuNet + SFace distinguishes registered staff faces from unknown visitors to reduce false alarms.",
        },
      },
      {
        id: "ai-verify",
        badge: { id: "Verifikasi", en: "Verification" },
        heading: {
          id: "Wajib verifikasi petugas untuk hasil AI & ancaman",
          en: "Mandatory officer verification for AI & threat alerts",
        },
        body: {
          id: "Buka Verifikasi AI untuk memeriksa deteksi ancaman (tembakan, gergaji mesin, senjata, jerat, api) maupun kondisi fisik/perilaku dari Groq. Konfirmasi atau koreksi spesies/individu agar data pelatihan makin akurat.",
          en: "Open AI Verification to review threat detections (gunshot, chainsaw, weapon, snare, fire) and Groq physical/behavior estimates. Confirm or correct species/individuals to improve future accuracy.",
        },
      },
      {
        id: "ai-recap",
        badge: { id: "Rekap", en: "Recap" },
        heading: {
          id: "Rekap Data AI & cetak laporan PDF",
          en: "AI Data Recap & PDF report printing",
        },
        body: {
          id: "Halaman Rekap Data AI merangkum statistik deteksi per periode dan siap dicetak menjadi PDF melalui dialog cetak browser (A4).",
          en: "The AI Data Recap page summarizes detection statistics by period and is formatted for direct A4 PDF printing via the browser.",
        },
      },
    ],
    tips: [
      {
        id: "Daftarkan 10+ foto wajah staf dari berbagai sudut di menu Wajah Staf agar akurasi pengenalan optimal.",
        en: "Register 10+ staff face photos from varied angles in Staff Faces for optimal recognition accuracy.",
      },
      {
        id: "Jika prediksi berstatus gagal atau memakai fallback groq:, gunakan tombol Analisis Ulang setelah ai-service aktif.",
        en: "If a prediction failed or used groq: fallback, use Retry Analysis once ai-service is back online.",
      },
    ],
    links: [
      { href: "/ai/vision", label: { id: "Buka AI Vision", en: "Open AI Vision" } },
      { href: "/ai/vision/pending", label: { id: "Verifikasi AI", en: "AI Verification" } },
    ],
  },
  {
    id: "tourism-3d-world",
    number: "04",
    peakKind: "livingWorld",
    peakBadge: { id: "Dunia 3D Interaktif Leuser", en: "Interactive 3D Leuser World" },
    title: {
      id: "Wisata TNGL, Peta 3D & Pembayaran Otomatis",
      en: "TNGL Tourism, 3D Map & Automated Payment",
    },
    subtitle: {
      id: "Jelajahi rute 3D, pesan tiket resmi tarif PNBP, dan bayar instan tanpa antre verifikasi manual.",
      en: "Explore 3D trails, book official PNBP-rated tickets, and pay instantly without manual verification.",
    },
    summary: {
      id: "Pengunjung dapat menjelajahi rute wisata dalam 3D, melihat profil ketinggian dan jadwal pemandu, memesan tiket dengan tarif PP 36/2024 yang dihitung server, dan membayar otomatis via Simulator Gateway atau Midtrans.",
      en: "Visitors can explore tour routes in 3D, inspect elevation profiles and guide shifts, book tickets with server-calculated PP 36/2024 tariffs, and pay automatically via the Gateway Simulator or Midtrans.",
    },
    readMinutes: 5,
    roles: [
      { id: "Pengunjung", en: "Visitor" },
      { id: "Pengelola Wisata", en: "Tourism Admin" },
    ],
    steps: [
      {
        id: "map-3d-explore",
        badge: { id: "Peta 3D", en: "3D Map" },
        heading: {
          id: "Jelajahi rute dengan Satelit, Topografi, Peta & Fly-Through",
          en: "Explore trails with Satellite, Topography, Map & Fly-Through",
        },
        body: {
          id: "Buka Peta 3D untuk melihat relief Bukit Barisan. Pilih mode Satelit (dengan overlay Label), Topografi, atau Peta Jalan, atur skala relief (1x - 2.5x), dan tekan Fly-through untuk terbang mengikuti jalur.",
          en: "Open 3D Map to view Bukit Barisan terrain. Switch between Satellite (with Labels), Topography, or Street Map, adjust relief scale (1x - 2.5x), and press Fly-through to glide along the trail.",
        },
      },
      {
        id: "booking-pnbp",
        badge: { id: "Pemesanan", en: "Booking" },
        heading: {
          id: "Pilih shift & hitung tarif PNBP otomatis di server",
          en: "Pick a shift & calculate PNBP tariffs server-side",
        },
        body: {
          id: "Pilih rute dan tanggal kunjungan pada Jelajah Tur. Tarif WNI, Pelajar (min. 5 orang), WNA, Drone, dan jasa pemandu dihitung otomatis oleh server sesuai hari biasa atau Minggu/libur nasional.",
          en: "Choose a route and visit date in Explore Tours. WNI, Student (min. 5 people), WNA, Drone, and guide fees are computed server-side based on weekday vs Sunday/national holiday rates.",
        },
      },
      {
        id: "auto-payment",
        badge: { id: "Bayar Instan", en: "Instant Pay" },
        heading: {
          id: "Bayar via Simulator Gateway Otomatis (QRIS / VA / E-Wallet)",
          en: "Pay via Automated Gateway Simulator (QRIS / VA / E-Wallet)",
        },
        body: {
          id: "Di halaman detail pesanan, klik Bayar Sekarang untuk memilih QRIS Instan, Virtual Account (BCA/BNI/BRI/Mandiri), atau E-Wallet. Pembayaran langsung terverifikasi otomatis dan e-tiket QR segera terbit.",
          en: "On the booking detail page, click Pay Now to choose Instant QRIS, Virtual Account (BCA/BNI/BRI/Mandiri), or E-Wallet. Payments verify automatically and your QR e-ticket is issued immediately.",
        },
      },
      {
        id: "eticket-review",
        badge: { id: "E-Tiket", en: "E-Ticket" },
        heading: {
          id: "Tunjukkan E-Tiket QR saat check-in & tulis ulasan",
          en: "Show your QR E-Ticket at check-in & leave a review",
        },
        body: {
          id: "QR tiket berlaku satu kali pada tanggal kunjungan (zona waktu WIB). Setelah check-in, Anda dapat memberi rating rute dan pemandu pada halaman pesanan.",
          en: "Your QR ticket is single-use on the visit date (WIB timezone). After check-in, you can rate the route and guide on your booking page.",
        },
      },
    ],
    tips: [
      {
        id: "Batas waktu pembayaran adalah 60 menit; jika lewat, kuota shift otomatis dilepas untuk pengunjung lain.",
        en: "Payment window is 60 minutes; unpaid bookings expire automatically and release shift quota.",
      },
      {
        id: "Datanglah 30 menit lebih awal di titik kumpul yang tertera pada E-Tiket.",
        en: "Arrive 30 minutes early at the meeting point listed on your E-Ticket.",
      },
    ],
    links: [
      { href: "/tours", label: { id: "Jelajah Tur", en: "Explore Tours" } },
      { href: "/tours/map-3d", label: { id: "Buka Peta 3D", en: "Open 3D Map" } },
    ],
  },
  {
    id: "pos-checkin",
    number: "05",
    peakKind: "tactileDeck",
    peakBadge: { id: "Dek Kartu Taktil 3D", en: "3D Tactile Card Deck" },
    title: {
      id: "POS Loket (Walk-In) & Check-In Tiket",
      en: "Ticket Counter POS (Walk-In) & Check-In",
    },
    subtitle: {
      id: "Prosedur buka/tutup sesi kasir, penjualan tiket langsung, cetak struk thermal, dan validasi QR.",
      en: "Cashier session open/close workflow, walk-in sales, thermal receipt printing, and QR check-in.",
    },
    summary: {
      id: "Petugas Loket melayani pengunjung walk-in secara cepat dengan kuota yang tersinkronisasi bersama pemesanan online, lengkap dengan struk thermal 58/80 mm dan laporan X/Z.",
      en: "Counter staff serve walk-in visitors using shared shift quotas synchronized with online bookings, complete with 58/80 mm thermal receipts and X/Z reports.",
    },
    readMinutes: 4,
    roles: [
      { id: "Petugas Loket", en: "Counter Staff" },
      { id: "Admin", en: "Admin" },
    ],
    steps: [
      {
        id: "open-cashier",
        badge: { id: "Buka Kas", en: "Open Shift" },
        heading: {
          id: "Buka sesi kas dengan modal awal uang kembalian",
          en: "Open a cashier session with starting change",
        },
        body: {
          id: "Masuk ke Kasir (POS), isi nama loket dan jumlah modal awal. Satu kasir hanya boleh memiliki satu sesi terbuka pada saat yang sama.",
          en: "Open Cashier (POS), enter the counter name and opening cash amount. Each cashier may only have one open session at a time.",
        },
      },
      {
        id: "walkin-sale",
        badge: { id: "Jual Tiket", en: "Sell Ticket" },
        heading: {
          id: "Pilih rute, shift, dan metode bayar (Tunai / QRIS / EDC)",
          en: "Select route, shift, and payment method (Cash / QRIS / EDC)",
        },
        body: {
          id: "Harga dihitung server. Untuk tunai, kembalian dihitung otomatis. Aktifkan opsi langsung check-in bila pengunjung langsung masuk gerbang hari ini, lalu cetak struk 58/80 mm.",
          en: "Prices are computed server-side. Cash change calculates automatically. Enable instant check-in for same-day entry and print the 58/80 mm thermal receipt.",
        },
      },
      {
        id: "void-close",
        badge: { id: "Tutup Kas", en: "Close Shift" },
        heading: {
          id: "Void transaksi bermasalah & tutup kas dengan hitung fisik",
          en: "Void erroneous sales & close session with physical count",
        },
        body: {
          id: "Void hanya dapat dilakukan kasir penjual selama sesi masih terbuka dan wajib menyertakan alasan. Saat Tutup Kas, sistem mencatat selisih antara kas seharusnya dan hitungan fisik secara permanen.",
          en: "Only the selling cashier can void during an open session with a mandatory reason. On Close Shift, the system permanently records any variance between expected and counted cash.",
        },
      },
      {
        id: "qr-checkin",
        badge: { id: "Check-In", en: "Check-In" },
        heading: {
          id: "Validasi E-Tiket QR pengunjung online",
          en: "Validate online visitors' QR E-Tickets",
        },
        body: {
          id: "Di menu Check-in Tiket, pindai atau tempel kode QR pengunjung. Sistem memastikan tiket asli (HMAC), belum pernah dipakai, dan sesuai tanggal kunjungan hari ini (WIB).",
          en: "In Ticket Check-in, scan or paste the visitor's QR code. The system verifies HMAC authenticity, single-use status, and today's visit date (WIB).",
        },
      },
    ],
    tips: [
      {
        id: "Shift masih dapat dijual di loket hingga 30 menit setelah jam mulai.",
        en: "Shifts remain sellable at the counter up to 30 minutes after start time.",
      },
      {
        id: "Laporan Harian admin memisahkan pendapatan PNBP dan jasa pemandu untuk rekonsiliasi kas negara.",
        en: "The admin Daily Report separates PNBP revenue from guide fees for state treasury reconciliation.",
      },
    ],
    links: [
      { href: "/pos", label: { id: "Buka Kasir (POS)", en: "Open Cashier (POS)" } },
      { href: "/tourism/check-in", label: { id: "Check-in Tiket", en: "Ticket Check-in" } },
    ],
  },
  {
    id: "wildlife-3d-help",
    number: "06",
    peakKind: "orbitalAtlas",
    peakBadge: { id: "Atlas Orbital 3D", en: "3D Orbital Atlas" },
    title: {
      id: "Ensiklopedia Satwa 3D & Bantuan Cepat",
      en: "3D Wildlife Encyclopedia & Quick Help",
    },
    subtitle: {
      id: "Eksplorasi 8 satwa kunci Leuser dalam 3D/AR, pengelolaan model GLB, serta solusi kendala umum.",
      en: "Explore 8 key Leuser species in 3D/AR, manage GLB models, and troubleshoot common issues.",
    },
    summary: {
      id: "Ensiklopedia Satwa 3D menyajikan profil ekologi dan model 3D interaktif dengan titik keterangan bernomor tanpa membocorkan lokasi individu satwa demi mencegah perburuan liar.",
      en: "The 3D Wildlife Encyclopedia presents ecological profiles and interactive 3D models with numbered annotations while hiding individual animal locations to prevent poaching.",
    },
    readMinutes: 4,
    roles: [
      { id: "Semua 6 Role", en: "All 6 Roles" },
    ],
    steps: [
      {
        id: "explore-3d",
        badge: { id: "Viewer 3D", en: "3D Viewer" },
        heading: {
          id: "Putar, perbesar, dan klik titik keterangan di model 3D",
          en: "Rotate, zoom, and click annotation hotspots on 3D models",
        },
        body: {
          id: "Tersedia 8 satwa prioritas (Orangutan, Harimau, Badak, Gajah Sumatra, Rusa Sambar, Siamang, Rangkong Badak, Beruang Madu). Klik nomor hotspot untuk mengarahkan kamera langsung ke ciri anatomi satwa.",
          en: "Browse 8 priority species (Orangutan, Tiger, Rhino, Sumatran Elephant, Sambar Deer, Siamang, Rhinoceros Hornbill, Sun Bear). Click numbered hotspots to focus the camera on key traits.",
        },
      },
      {
        id: "manage-glb",
        badge: { id: "Kelola GLB", en: "Manage GLB" },
        heading: {
          id: "Unggah model .glb & tambah hotspot (Peneliti / Admin)",
          en: "Upload .glb models & place hotspots (Ecologist / Admin)",
        },
        body: {
          id: "Pemilik izin manage_master_data dapat mengunggah berkas .glb (maks. 30 MB, tanpa referensi URL eksternal) dan mengklik langsung permukaan model untuk menambahkan titik keterangan baru.",
          en: "Users with manage_master_data can upload .glb files (max 30 MB, no external URLs) and click directly on the model surface to place new annotation hotspots.",
        },
      },
      {
        id: "privacy-anti-poach",
        badge: { id: "Privasi", en: "Privacy" },
        heading: {
          id: "Keamanan lokasi individu satwa & daftar akun",
          en: "Individual location privacy & troubleshooting",
        },
        body: {
          id: "Katalog publik tidak pernah memuat koordinat GPS individu satwa. Jika terjadi error koneksi AI (port 8001) atau login gagal, pastikan layanan ai-service aktif dan database sudah di-migrate.",
          en: "The public catalog never exposes individual GPS coordinates. If AI connection errors (port 8001) or login failures occur, ensure ai-service is running and database migrations are up to date.",
        },
      },
    ],
    tips: [
      {
        id: "Model bawaan saat ini berlabel ilustratif; ganti dengan hasil pemindaian atau model berlisensi kapan saja.",
        en: "Built-in models are labeled illustrative; replace them with 3D scans or licensed models anytime.",
      },
      {
        id: "Gunakan tombol AR pada ponsel yang mendukung WebXR untuk melihat satwa di ruang nyata.",
        en: "Use the AR button on WebXR-capable mobile devices to view wildlife in your physical space.",
      },
    ],
    links: [
      { href: "/wildlife-3d", label: { id: "Buka Satwa 3D", en: "Open 3D Wildlife" } },
      { href: "/dashboard", label: { id: "Kembali ke Dashboard", en: "Back to Dashboard" } },
    ],
  },
];
