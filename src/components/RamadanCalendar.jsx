import { useEffect, useState } from 'react';
import { CalendarDays, LoaderCircle, MoonStar } from 'lucide-react';

function cleanTime(raw) {
  return raw ? raw.split(' ')[0] : '--:--';
}

function formatDdMmYyyy(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

export default function RamadanCalendar({ coords }) {
  const [days, setDays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!coords) {
      return;
    }

    const fetchRamadanCalendar = async () => {
      setLoading(true);
      setError('');

      try {
        const todayStr = formatDdMmYyyy(new Date());
        const hijriRes = await fetch(`https://api.aladhan.com/v1/gToH?date=${todayStr}`);
        if (!hijriRes.ok) {
          throw new Error('Gagal dapatkan tarikh Hijri');
        }

        const hijriJson = await hijriRes.json();
        const hijriYear = hijriJson.data.hijri.year;

        const calendarRes = await fetch(
          `https://api.aladhan.com/v1/hijriCalendar/${hijriYear}/9?latitude=${coords.lat}&longitude=${coords.lon}&method=3`
        );

        if (!calendarRes.ok) {
          throw new Error('Gagal dapatkan kalendar Ramadan');
        }

        const calendarJson = await calendarRes.json();
        setDays(calendarJson.data || []);
      } catch {
        setError('Kalendar Ramadan belum dapat dimuatkan. Sila cuba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchRamadanCalendar();
  }, [coords]);

  return (
    <section className="card">
      <h2 className="section-title">
        <CalendarDays className="h-5 w-5 text-gold-500" /> Kalendar Ramadan
      </h2>

      <div className="mb-4 flex flex-wrap gap-2 text-xs sm:text-sm">
        <span className="rounded-full bg-gold-100 px-3 py-1 text-gold-500">17 Ramadan: Nuzul Al-Quran</span>
        <span className="rounded-full bg-palm-100 px-3 py-1 text-palm-900">21-30 Ramadan: 10 Malam Terakhir</span>
      </div>

      {loading && (
        <div className="inline-flex items-center gap-2 text-sm text-palm-700">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Memuat kalendar Ramadan...
        </div>
      )}

      {error && <p className="text-sm text-red-600">{error}</p>}

      {!loading && !error && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => {
            const hijriDay = Number(day.date.hijri.day);
            const isNuzul = hijriDay === 17;
            const isLastTenNights = hijriDay >= 21;

            return (
              <article
                key={day.date.gregorian.date}
                className={`rounded-xl border p-3 ${
                  isNuzul
                    ? 'border-gold-300 bg-gold-100/70'
                    : isLastTenNights
                    ? 'border-palm-200 bg-palm-50'
                    : 'border-palm-100 bg-white'
                }`}
              >
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-palm-900">Ramadan {hijriDay}</p>
                    <p className="text-xs text-palm-700">{day.date.gregorian.date}</p>
                  </div>
                  {(isNuzul || isLastTenNights) && <MoonStar className="h-4 w-4 text-gold-500" />}
                </div>

                <div className="space-y-1 text-sm">
                  <p>
                    Imsak: <span className="font-medium">{cleanTime(day.timings.Imsak)}</span>
                  </p>
                  <p>
                    Subuh: <span className="font-medium">{cleanTime(day.timings.Fajr)}</span>
                  </p>
                  <p>
                    Maghrib: <span className="font-medium">{cleanTime(day.timings.Maghrib)}</span>
                  </p>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}