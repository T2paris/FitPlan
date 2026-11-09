// Configuração dinâmica: injeta a chave da Google Maps API a partir do ficheiro .env.local
// (EXPO_PUBLIC_GOOGLE_MAPS_API_KEY). A chave nunca fica escrita no repositório.
const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';

module.exports = ({ config }) => ({
  ...config,
  plugins: [
    ...(config.plugins || []),
    [
      'react-native-maps',
      {
        androidGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
        iosGoogleMapsApiKey: GOOGLE_MAPS_API_KEY,
      },
    ],
  ],
});

