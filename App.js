import { StatusBar } from 'expo-status-bar';
import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

const DOA_RAMADHAN = [
  {
    title: 'Doa Berbuka Puasa',
    arabic: 'اللَّهُمَّ لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
    latin: 'Allahumma laka sumtu wa bika aamantu wa ‘ala rizqika aftartu.',
    meaning: 'Ya Allah, kerana-Mu aku berpuasa, dengan-Mu aku beriman, dan dengan rezeki-Mu aku berbuka.',
  },
  {
    title: 'Doa Malam Lailatulqadar',
    arabic: 'اللَّهُمَّ إِنَّكَ عَفُوٌّ تُحِبُّ الْعَفْوَ فَاعْفُ عَنِّي',
    latin: 'Allahumma innaka ‘afuwwun tuhibbul-‘afwa fa‘fu ‘anni.',
    meaning: 'Ya Allah, Engkau Maha Pemaaf dan suka memaafkan, maka maafkanlah aku.',
  },
  {
    title: 'Doa Mohon Kekuatan Ibadah',
    arabic: 'رَبِّ أَعِنِّي عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    latin: 'Rabbi a‘inni ‘ala dzikrika wa syukrika wa husni ‘ibadatik.',
    meaning: 'Ya Tuhanku, bantulah aku untuk mengingati-Mu, bersyukur kepada-Mu, dan beribadah dengan terbaik.',
  },
];

const TIPS_RAMADHAN = [
  'Niat puasa setiap malam dan jaga solat fardu tepat waktu.',
  'Utamakan sahur lewat sedikit sebelum Subuh untuk tenaga sepanjang hari.',
  'Minum air secukupnya antara berbuka hingga sahur (8 gelas secara berperingkat).',
  'Perbanyakkan sedekah dan bacaan al-Quran setiap hari.',
  'Kurangkan makanan manis berlebihan ketika berbuka untuk elak letih selepas makan.',
];

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

const PRAYER_LABELS = {
  Fajr: 'Subuh',
  Sunrise: 'Syuruk',
  Dhuhr: 'Zohor',
  Asr: 'Asar',
  Maghrib: 'Maghrib',
  Isha: 'Isyak',
};

function cleanTime(value) {
  return value?.split(' ')[0] ?? '-';
}

export default function App() {
  const [city, setCity] = useState('Kuala Lumpur');
  const [country, setCountry] = useState('Malaysia');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [timings, setTimings] = useState(null);
  const [hijriDate, setHijriDate] = useState('');

  const fetchPrayerTimes = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch(
        `https://api.aladhan.com/v1/timingsByCity?city=${encodeURIComponent(city)}&country=${encodeURIComponent(
          country,
        )}&method=11`,
      );
      const json = await response.json();

      if (json?.code !== 200 || !json?.data?.timings) {
        throw new Error('Data waktu solat tidak ditemui untuk lokasi ini.');
      }

      setTimings(json.data.timings);
      const hijri = json?.data?.date?.hijri;
      setHijriDate(hijri ? `${hijri.day} ${hijri.month.en} ${hijri.year}H` : '');
    } catch (err) {
      setError(err.message || 'Ralat semasa mendapatkan waktu solat.');
      setTimings(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPrayerTimes();
  }, []);

  const summary = useMemo(() => {
    if (!timings) {
      return { sahur: '-', berbuka: '-' };
    }

    return {
      sahur: cleanTime(timings.Fajr),
      berbuka: cleanTime(timings.Maghrib),
    };
  }, [timings]);

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>🌙 Ramadhan Companion</Text>
        <Text style={styles.subtitle}>Paparan waktu solat, berbuka, sahur & panduan Ramadhan.</Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Lokasi</Text>
          <TextInput value={city} onChangeText={setCity} placeholder="Bandar" style={styles.input} />
          <TextInput value={country} onChangeText={setCountry} placeholder="Negara" style={styles.input} />
          <Pressable style={styles.button} onPress={fetchPrayerTimes}>
            <Text style={styles.buttonText}>Kemaskini Waktu</Text>
          </Pressable>
          {hijriDate ? <Text style={styles.hijri}>Tarikh Hijri: {hijriDate}</Text> : null}
          {loading ? <ActivityIndicator style={styles.loader} /> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Waktu Utama Ramadhan</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.keyLabel}>Akhir Sahur (Subuh)</Text>
            <Text style={styles.value}>{summary.sahur}</Text>
          </View>
          <View style={styles.rowBetween}>
            <Text style={styles.keyLabel}>Berbuka (Maghrib)</Text>
            <Text style={styles.value}>{summary.berbuka}</Text>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Waktu Solat Harian</Text>
          {PRAYER_ORDER.map((prayer) => (
            <View key={prayer} style={styles.rowBetween}>
              <Text style={styles.keyLabel}>{PRAYER_LABELS[prayer]}</Text>
              <Text style={styles.value}>{cleanTime(timings?.[prayer])}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Koleksi Doa Ramadhan</Text>
          {DOA_RAMADHAN.map((item) => (
            <View key={item.title} style={styles.doaBlock}>
              <Text style={styles.doaTitle}>{item.title}</Text>
              <Text style={styles.arabic}>{item.arabic}</Text>
              <Text style={styles.latin}>{item.latin}</Text>
              <Text style={styles.meaning}>{item.meaning}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Tip Ramadhan</Text>
          {TIPS_RAMADHAN.map((tip) => (
            <Text key={tip} style={styles.tipItem}>• {tip}</Text>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f7f3e9',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
    gap: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: '#214134',
  },
  subtitle: {
    marginTop: 4,
    color: '#54615a',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
    gap: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#214134',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d6ded5',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: '#fbfdf8',
  },
  button: {
    marginTop: 2,
    backgroundColor: '#2f6f4f',
    borderRadius: 10,
    paddingVertical: 11,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '700',
  },
  hijri: {
    color: '#214134',
    fontWeight: '600',
  },
  loader: {
    marginTop: 4,
  },
  error: {
    color: '#b32e2e',
    fontWeight: '600',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#edf2ea',
    paddingVertical: 6,
  },
  keyLabel: {
    color: '#3f5248',
  },
  value: {
    fontWeight: '700',
    color: '#214134',
  },
  doaBlock: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#edf2ea',
  },
  doaTitle: {
    fontWeight: '700',
    color: '#214134',
  },
  arabic: {
    textAlign: 'right',
    fontSize: 20,
    marginTop: 8,
    lineHeight: 30,
    color: '#1f2f26',
  },
  latin: {
    marginTop: 6,
    fontStyle: 'italic',
    color: '#3f5248',
  },
  meaning: {
    marginTop: 6,
    color: '#46564d',
  },
  tipItem: {
    color: '#46564d',
    lineHeight: 21,
  },
});
