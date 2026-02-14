import { useEffect, useState } from 'react';
import { BookOpenCheck } from 'lucide-react';

function isKlinikActive(now) {
  const start = new Date(now);
  start.setHours(22, 30, 0, 0);

  const end = new Date(now);
  end.setHours(23, 0, 0, 0);

  return now >= start && now < end;
}

export default function KlinikQuran({ joinUrl }) {
  const [active, setActive] = useState(isKlinikActive(new Date()));

  useEffect(() => {
    const tick = () => setActive(isKlinikActive(new Date()));

    tick();
    const interval = setInterval(tick, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="card">
      <h2 className="section-title">
        <BookOpenCheck className="h-5 w-5 text-gold-500" /> Klinik Al-Quran
      </h2>

      <p className="mb-4 text-sm text-palm-800">
        Sesi pembetulan bacaan Al-Quran berlangsung setiap hari dari <strong>10:30 PM hingga 11:00 PM</strong>.
      </p>

      {active ? (
        <a
          href={joinUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex w-full items-center justify-center rounded-xl bg-green-600 px-4 py-3 text-center text-sm font-semibold text-white transition hover:bg-green-700 sm:w-auto"
        >
          Join Now
        </a>
      ) : (
        <div className="space-y-2">
          <p className="text-sm font-medium text-palm-900">Sesi Seterusnya: 10:30 PM</p>
          <button
            type="button"
            disabled
            className="w-full cursor-not-allowed rounded-xl bg-slate-300 px-4 py-3 text-sm font-semibold text-slate-600 sm:w-auto"
          >
            Join Now
          </button>
        </div>
      )}
    </section>
  );
}