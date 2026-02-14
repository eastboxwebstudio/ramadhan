export const MALAYSIA_ZONES = {
  'Kuala Lumpur': [
    { id: 'WLY01', name: 'Kuala Lumpur & Putrajaya', lat: 3.139, lon: 101.6869 }
  ],
  Selangor: [
    { id: 'SGR01', name: 'Hulu Selangor', lat: 3.5711, lon: 101.5183 },
    { id: 'SGR02', name: 'Klang, Petaling, Shah Alam', lat: 3.0738, lon: 101.5183 }
  ],
  Johor: [
    { id: 'JHR01', name: 'Johor Bahru, Kota Tinggi, Mersing', lat: 1.4927, lon: 103.7414 },
    { id: 'JHR02', name: 'Kluang, Pontian', lat: 2.0305, lon: 103.3166 }
  ],
  Penang: [
    { id: 'PNG01', name: 'Seluruh Pulau Pinang', lat: 5.4164, lon: 100.3327 }
  ],
  Perak: [
    { id: 'PRK01', name: 'Kinta, Manjung, Perak Tengah', lat: 4.5975, lon: 101.0901 }
  ],
  Sabah: [
    { id: 'SBH01', name: 'Kota Kinabalu, Tuaran', lat: 5.9804, lon: 116.0735 }
  ],
  Sarawak: [
    { id: 'SWK01', name: 'Kuching, Samarahan', lat: 1.5533, lon: 110.3592 }
  ]
};

export const DEFAULT_STATE = 'Kuala Lumpur';
export const DEFAULT_ZONE = MALAYSIA_ZONES[DEFAULT_STATE][0];