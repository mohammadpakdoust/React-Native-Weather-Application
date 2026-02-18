# MCDA5550 React Native Weather App

A full-featured weather application built with React Native and Expo, displaying real-time weather, hourly forecasts, and allowing users to search and save locations. Weather data is powered by the free Open-Meteo API (no API key required).

---

## Features

### Screen 1 — Current Location Weather
- Automatically detects the user's location via `expo-location`
- Graceful permission handling; falls back to **Halifax, NS** if denied
- Displays current temperature, "feels like", and weather condition
- Ionicons weather icon mapped to Open-Meteo weather codes
- Animated background that reacts to weather conditions (rain, snow, clear, cloudy)
- Hourly forecast for the next 24 hours (horizontal scroll)
- Weather details: humidity, wind speed, precipitation probability, sunrise/sunset
- Pull-to-refresh

### Screen 2 — Search & Display Weather
- Live city search with geocoding (triggers after 3 characters)
- Debounced input (~500 ms) to minimise API calls
- Displays city suggestions from Open-Meteo Geocoding API
- Full weather view for the selected city
- **Save Location** button (max 5 saved cities, no duplicates)

### Screen 3 — Saved Locations
- Lists all saved cities (up to 5) with live weather
- Pull-to-refresh to update all saved locations
- Remove a location with a confirmation dialog
- Data persists across app launches via SQLite

---

## Technology Stack

| Category | Library / Tool |
|---|---|
| Framework | Expo SDK ~52.0.0 |
| Language | TypeScript |
| Navigation | expo-router (file-based, tab layout) |
| Location | expo-location |
| Storage | expo-sqlite |
| Animations | react-native-reanimated |
| Icons | @expo/vector-icons (Ionicons) |
| Weather API | Open-Meteo (free, no key) |

---

## Project Structure

```
ReactNativeWeatherApp/
├── app/
│   ├── _layout.tsx              # Root layout — DB initialisation
│   └── (tabs)/
│       ├── _layout.tsx          # Tab bar configuration
│       ├── index.tsx            # Screen 1: Current Location Weather
│       ├── search.tsx           # Screen 2: Search & Display Weather
│       └── saved.tsx            # Screen 3: Saved Locations
├── src/
│   ├── api/
│   │   └── openMeteo.ts         # Open-Meteo API calls (geocoding + forecast)
│   ├── components/
│   │   ├── AnimatedBackground.tsx   # Weather-reactive animated background
│   │   ├── AnimatedWeatherIcon.tsx  # Weather icon component
│   │   ├── HourlyForecast.tsx       # Horizontal hourly scroll
│   │   ├── LocationCard.tsx         # Saved location card
│   │   ├── WeatherDetails.tsx       # Humidity, wind, etc.
│   │   └── WeatherHeader.tsx        # City name, temp, icon
│   ├── db/
│   │   └── sqlite.ts            # SQLite CRUD operations
│   ├── hooks/
│   │   └── useDebounce.ts       # Debounce hook for search input
│   └── utils/
│       └── weatherCodes.ts      # WMO code → icon name + label + background type
├── assets/
│   └── weather/                 # Local weather icon images
├── app.json
├── babel.config.js
├── package.json
└── tsconfig.json
```

---

## API Reference

### Geocoding
```
GET https://geocoding-api.open-meteo.com/v1/search
  ?name={CITY}&count=8&language=en&format=json
```

### Forecast
```
GET https://api.open-meteo.com/v1/forecast
  ?latitude={lat}&longitude={lon}
  &current=temperature_2m,apparent_temperature,weather_code,
           wind_speed_10m,relative_humidity_2m
  &hourly=temperature_2m,apparent_temperature,weather_code,
          precipitation_probability,wind_speed_10m,relative_humidity_2m
  &daily=sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min
  &timezone=auto
```

---

## Weather Code Mapping (WMO)

| Code(s) | Condition | Icon (Ionicons) | Background |
|---|---|---|---|
| 0–1 | Clear sky | `sunny` | clear |
| 2 | Partly cloudy | `partly-sunny` | cloudy |
| 3 | Overcast | `cloudy` | cloudy |
| 45, 48 | Fog | `cloud` | cloudy |
| 51–57 | Drizzle | `rainy` | rain |
| 61–67 | Rain | `rainy` | rain |
| 71–77 | Snow | `snow` | snow |
| 80–82 | Rain showers | `rainy` | rain |
| 85–86 | Snow showers | `snow` | snow |
| 95–99 | Thunderstorm | `thunderstorm` | rain |

Full mapping in `src/utils/weatherCodes.ts`.

---

## SQLite Schema

```sql
CREATE TABLE saved_locations (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  name       TEXT    UNIQUE NOT NULL,
  latitude   REAL    NOT NULL,
  longitude  REAL    NOT NULL,
  country    TEXT    NOT NULL,
  admin1     TEXT,
  created_at TEXT    NOT NULL
);
```

- **iOS / Android**: Full persistent SQLite storage
- **Web**: In-memory fallback (data lost on refresh)

---

## Installation & Running

### Prerequisites
- Node.js v16+
- Expo Go app on your device ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent))

### Steps

```bash
# 1. Install dependencies
npm install

# 2. Start the dev server
npx expo start

# 3. Scan the QR code with Expo Go (Android) or Camera app (iOS)
```

### Run on a specific platform

```bash
npm run android   # USB-connected Android device or emulator
npm run ios       # iOS Simulator (macOS + Xcode required)
npm run web       # Browser (limited — SQLite not supported)
```

### USB Debugging (Android)
1. Enable **Developer Options** and **USB Debugging** on your device
2. Connect via USB
3. Run `npm run android` — Expo will detect the device automatically

---

## Animated Backgrounds

| Weather | Animation |
|---|---|
| Clear | Pulsing sun glow |
| Cloudy | Drifting clouds |
| Rain | Falling raindrops |
| Snow | Drifting snowflakes |

Implemented with `react-native-reanimated` for smooth 60 fps performance.

---

## Design Decisions

| Decision | Rationale |
|---|---|
| Fallback location: Halifax, NS | Canadian university context |
| Debounce: 500 ms | Balances UX responsiveness and API efficiency |
| Max 5 saved locations | Prevents DB bloat; keeps UI clean |
| Temperature in °C | Default Open-Meteo unit; appropriate for Canadian audience |
| Open-Meteo API | Free, no API key, reliable, CORS-friendly |
| Ionicons for weather | Consistent with Expo ecosystem; covers all WMO conditions |

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Location not detected | Check device location services and app permissions |
| App shows Halifax weather | Location permission was denied — grant it in Settings |
| Database errors (iOS) | Reset simulator or clear app data |
| Database errors (Android) | Clear app data in device Settings |
| Build errors | Run `npm install`, then `npx expo start -c` to clear cache |
| Expo Go version mismatch | Install the recommended Expo Go version when prompted |

---

## License

Created for educational purposes as part of **MCDA5550** coursework at Saint Mary's University.

## Credits

- Weather data: [Open-Meteo](https://open-meteo.com/)
- Icons: [@expo/vector-icons](https://icons.expo.fyi/) (Ionicons)
- Framework: [Expo](https://expo.dev/) / [React Native](https://reactnative.dev/)
