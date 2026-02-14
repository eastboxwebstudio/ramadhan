import { useMemo, useState } from 'react';
import { BookHeart, HeartHandshake } from 'lucide-react';
import PrayerTimes from './components/PrayerTimes';
import RamadanCalendar from './components/RamadanCalendar';
import KlinikQuran from './components/KlinikQuran';
import dailyContent from './data/dailyContent.json';
import { DEFAULT_STATE, DEFAULT_ZONE } from './data/malaysiaZones';

export default function App() {
  const [locationConfig, setLocationConfig] = useState({
    mode: 'manual',
    manualState: DEFAULT_STATE,
    manualZoneId: DEFAULT_ZONE.id,
    coords: {
      lat: DEFAULT_ZONE.lat,
      lon: DEFAULT_ZONE.lon,
      label: `${DEFAULT_STATE} - ${DEFAULT_ZONE.name}`
    }
  });

  const [timingBundle, setTimingBundle] = useState(null);

  const dailyItem = useMemo(() => {
    const index = new Date().getDate() % dailyContent.length;
    return dailyContent[index];
  }, []);

  return (
    <main className="mx-auto min-h-screen w-full max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
      <header className="mb-5 rounded-3xl bg-gradient-to-r from-palm-700 to-palm-900 px-5 py-6 text-white shadow-soft sm:mb-7 sm:px-8">
        <p className="text-xs uppercase tracking-[0.25em] text-gold-300">Ramadhan Malaysia</p>
        <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Dashboard Ibadah Harian</h1>
        <p className="mt-2 max-w-2xl text-sm text-white/85">
          Aplikasi Ramadan untuk semakan waktu solat, kalendar Ramadan, motivasi harian, dan sesi Klinik Al-Quran.
        </p>
        {timingBundle?.today?.date && (
          <p className="mt-3 text-xs text-gold-100">
            {timingBundle.today.date.gregorian.date} | {timingBundle.today.date.hijri.day}{' '}
            {timingBundle.today.date.hijri.month.en} {timingBundle.today.date.hijri.year}H
          </p>
        )}
      </header>

      <div className="grid gap-4 sm:gap-5 lg:grid-cols-2">
        <PrayerTimes
          locationConfig={locationConfig}
          setLocationConfig={setLocationConfig}
          onTimingsUpdate={setTimingBundle}
        />

        <section className="card">
          <h2 className="section-title">
            <HeartHandshake className="h-5 w-5 text-gold-500" /> Doa Pilihan & Hadith Harian
          </h2>

          <div className="space-y-3 text-sm text-palm-900">
            <article className="rounded-xl bg-palm-50 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-palm-700">Doa Pilihan</p>
              <p>{dailyItem.doa}</p>
            </article>

            <article className="rounded-xl bg-gold-100/70 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-gold-500">Hadith of the Day</p>
              <p>{dailyItem.hadith}</p>
            </article>
          </div>

          <p className="mt-4 inline-flex items-center gap-2 text-xs text-palm-700">
            <BookHeart className="h-4 w-4" /> Kandungan dimuatkan dari fail JSON tempatan untuk prestasi pantas.
          </p>
        </section>
      </div>

      <div className="mt-4 grid gap-4 sm:mt-5 sm:gap-5 lg:grid-cols-[1.8fr_1fr]">
        <RamadanCalendar coords={locationConfig.coords} />
        <KlinikQuran joinUrl="https://meet.google.com/your-room-id" />
      </div>
    </main>
  );
}