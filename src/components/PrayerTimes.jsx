import { useEffect, useMemo, useState } from 'react';
import { Clock3, LoaderCircle, LocateFixed, MapPinned } from 'lucide-react';
import { DEFAULT_STATE, DEFAULT_ZONE, MALAYSIA_ZONES } from '../data/malaysiaZones';

const PRAYER_KEYS = ['Fajr', 'Imsak', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function cleanTime(raw) {
  return raw ? raw.split(' ')[0] : '--:--';
}

function formatDdMmYyyy(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function parseToDate(timeValue) {
  const [hours, minutes] = timeValue.split(':').map(Number);
  const base = new Date();
  base.setHours(hours, minutes, 0, 0);
  return base;
}

function formatDuration(msLeft) {
  if (msLeft <= 0) {
    return '00:00:00';
  }

  const totalSeconds = Math.floor(msLeft / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds].map((num) => String(num).padStart(2, '0')).join(':');
}

export default function PrayerTimes({ locationConfig, setLocationConfig, onTimingsUpdate }) {
  const [todayData, setTodayData] = useState(null);
  const [tomorrowData, setTomorrowData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState('00:00:00');
  const [countdownLabel, setCountdownLabel] = useState('Seterusnya');

  const stateKeys = useMemo(() => Object.keys(MALAYSIA_ZONES), []);

  const manualZones = useMemo(() => {
    return MALAYSIA_ZONES[locationConfig.manualState] ?? [];
  }, [locationConfig.manualState]);

  useEffect(() => {
    if (locationConfig.mode !== 'geo') {
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolokasi tidak disokong oleh pelayar anda.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCoords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          label: 'Lokasi Semasa'
        };

        setLocationConfig((prev) => ({ ...prev, coords: nextCoords }));
        setError('');
      },
      () => {
        setError('Gagal akses geolokasi. Paparan beralih ke zon manual.');
        setLocationConfig((prev) => ({
          ...prev,
          mode: 'manual',
          manualState: DEFAULT_STATE,
          manualZoneId: DEFAULT_ZONE.id,
          coords: {
            lat: DEFAULT_ZONE.lat,
            lon: DEFAULT_ZONE.lon,
            label: `${DEFAULT_STATE} - ${DEFAULT_ZONE.name}`
          }
        }));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
  }, [locationConfig.mode, setLocationConfig]);

  useEffect(() => {
    if (!locationConfig.coords) {
      return;
    }

    const fetchTimings = async () => {
      setLoading(true);
      setError('');

      try {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const [todayResponse, tomorrowResponse] = await Promise.all([
          fetch(
            `https://api.aladhan.com/v1/timings/${formatDdMmYyyy(today)}?latitude=${locationConfig.coords.lat}&longitude=${locationConfig.coords.lon}&method=3`
          ),
          fetch(
            `https://api.aladhan.com/v1/timings/${formatDdMmYyyy(tomorrow)}?latitude=${locationConfig.coords.lat}&longitude=${locationConfig.coords.lon}&method=3`
          )
        ]);

        if (!todayResponse.ok || !tomorrowResponse.ok) {
          throw new Error('Respons API tidak berjaya');
        }

        const todayJson = await todayResponse.json();
        const tomorrowJson = await tomorrowResponse.json();

        setTodayData(todayJson.data);
        setTomorrowData(tomorrowJson.data);

        onTimingsUpdate?.({
          today: todayJson.data,
          tomorrow: tomorrowJson.data
        });
      } catch (err) {
        setError('Tidak dapat memuat waktu solat. Sila cuba lagi.');
      } finally {
        setLoading(false);
      }
    };

    fetchTimings();
  }, [locationConfig.coords, onTimingsUpdate]);

  useEffect(() => {
    if (!todayData || !tomorrowData) {
      return;
    }

    const updateCountdown = () => {
      const now = new Date();
      const imsakToday = parseToDate(cleanTime(todayData.timings.Imsak));
      const maghribToday = parseToDate(cleanTime(todayData.timings.Maghrib));
      const imsakTomorrow = parseToDate(cleanTime(tomorrowData.timings.Imsak));
      imsakTomorrow.setDate(imsakTomorrow.getDate() + 1);

      let target = imsakToday;
      let label = 'Sahur (Imsak)';

      if (now >= imsakToday && now < maghribToday) {
        target = maghribToday;
        label = 'Berbuka (Maghrib)';
      }

      if (now >= maghribToday) {
        target = imsakTomorrow;
        label = 'Sahur Esok (Imsak)';
      }

      setCountdown(formatDuration(target - now));
      setCountdownLabel(label);
    };

    updateCountdown();
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [todayData, tomorrowData]);

  const handleModeChange = (mode) => {
    if (mode === 'geo') {
      setLocationConfig((prev) => ({ ...prev, mode }));
      return;
    }

    const fallbackState = locationConfig.manualState || DEFAULT_STATE;
    const defaultZone =
      MALAYSIA_ZONES[fallbackState]?.find((zone) => zone.id === locationConfig.manualZoneId) ||
      MALAYSIA_ZONES[fallbackState]?.[0] ||
      MALAYSIA_ZONES[DEFAULT_STATE][0];

    setLocationConfig((prev) => ({
      ...prev,
      mode,
      manualState: fallbackState,
      manualZoneId: defaultZone.id,
      coords: {
        lat: defaultZone.lat,
        lon: defaultZone.lon,
        label: `${fallbackState} - ${defaultZone.name}`
      }
    }));
  };

  const handleStateChange = (nextState) => {
    const nextZone = MALAYSIA_ZONES[nextState][0];

    setLocationConfig((prev) => ({
      ...prev,
      manualState: nextState,
      manualZoneId: nextZone.id,
      coords: {
        lat: nextZone.lat,
        lon: nextZone.lon,
        label: `${nextState} - ${nextZone.name}`
      }
    }));
  };

  const handleZoneChange = (zoneId) => {
    const zone = manualZones.find((item) => item.id === zoneId);
    if (!zone) {
      return;
    }

    setLocationConfig((prev) => ({
      ...prev,
      manualZoneId: zoneId,
      coords: {
        lat: zone.lat,
        lon: zone.lon,
        label: `${prev.manualState} - ${zone.name}`
      }
    }));
  };

  return (
    <section className="card">
      <h2 className="section-title">
        <Clock3 className="h-5 w-5 text-gold-500" /> Waktu Solat & Countdown
      </h2>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleModeChange('geo')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            locationConfig.mode === 'geo' ? 'bg-palm-700 text-white' : 'bg-palm-100 text-palm-900'
          }`}
        >
          <LocateFixed className="h-4 w-4" /> Geolokasi
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('manual')}
          className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${
            locationConfig.mode === 'manual' ? 'bg-palm-700 text-white' : 'bg-palm-100 text-palm-900'
          }`}
        >
          <MapPinned className="h-4 w-4" /> Pilih Negeri/Zon
        </button>
      </div>

      {locationConfig.mode === 'manual' && (
        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1 block font-medium">Negeri</span>
            <select
              value={locationConfig.manualState}
              onChange={(event) => handleStateChange(event.target.value)}
              className="w-full rounded-xl border border-palm-100 bg-white px-3 py-2"
            >
              {stateKeys.map((stateName) => (
                <option key={stateName} value={stateName}>
                  {stateName}
                </option>
              ))}
            </select>
          </label>

          <label className="text-sm">
            <span className="mb-1 block font-medium">Zon</span>
            <select
              value={locationConfig.manualZoneId}
              onChange={(event) => handleZoneChange(event.target.value)}
              className="w-full rounded-xl border border-palm-100 bg-white px-3 py-2"
            >
              {manualZones.map((zone) => (
                <option key={zone.id} value={zone.id}>
                  {zone.id} - {zone.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}

      <div className="mb-4 rounded-2xl bg-palm-900 p-4 text-white sm:p-5">
        <p className="text-sm text-white/80">Countdown ke {countdownLabel}</p>
        <p className="mt-1 text-3xl font-bold tracking-wider">{countdown}</p>
        <p className="mt-2 text-xs text-white/80">Lokasi: {locationConfig.coords?.label ?? 'Memuatkan...'}</p>
      </div>

      {loading && (
        <div className="inline-flex items-center gap-2 text-sm text-palm-700">
          <LoaderCircle className="h-4 w-4 animate-spin" /> Memuat waktu solat...
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      {!loading && todayData && (
        <>
          <p className="mb-3 text-sm text-palm-700">
            {todayData.date.gregorian.weekday.en}, {todayData.date.gregorian.date} | {todayData.date.hijri.day}{' '}
            {todayData.date.hijri.month.en} {todayData.date.hijri.year}H
          </p>

          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {PRAYER_KEYS.map((key) => (
              <div key={key} className="rounded-xl border border-palm-100 bg-palm-50 px-3 py-2">
                <p className="text-xs text-palm-700">{key}</p>
                <p className="text-lg font-semibold text-palm-900">{cleanTime(todayData.timings[key])}</p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
