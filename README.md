# React Native Weather App

A mobile weather application built with **React Native, Expo, TypeScript, and SQLite**.

The app combines current-location weather, city search, hourly forecasts, saved locations, and offline-friendly local persistence.

## Features

- Current location weather with a Halifax fallback when permission is denied
- Current conditions and 24-hour hourly forecast
- Sunrise and sunset data
- Debounced city search through Open-Meteo geocoding
- Save up to five locations
- Persistent storage with SQLite on mobile
- Pull-to-refresh
- Weather-aware animated backgrounds
- No weather API key required

## Tech stack

| Area | Technology |
|---|---|
| Framework | React Native + Expo |
| Language | TypeScript |
| Navigation | Expo Router |
| Weather data | Open-Meteo |
| Location | expo-location |
| Persistence | expo-sqlite |
| Animation | react-native-reanimated |

## Architecture

```text
Expo / React Native UI
        ↓
Location + city search
        ↓
Open-Meteo APIs
        ↓
Weather mapping / presentation
        ↓
SQLite saved locations
```

## Project structure

```text
app/
├── _layout.tsx
└── (tabs)/
    ├── index.tsx
    ├── search.tsx
    └── saved.tsx

src/
├── api/
├── components/
├── db/
├── hooks/
└── utils/
```

## Run locally

```bash
npm install
npx expo start
```

Platform commands:

```bash
npm run android
npm run ios
npm run web
```

> Web support is limited because persistent SQLite storage is implemented for the mobile experience.

## Design choices

- **Open-Meteo:** no API key and a simple public weather/geocoding API
- **500 ms search debounce:** reduces unnecessary requests while keeping search responsive
- **Five-location limit:** keeps the saved-locations UI intentionally small
- **SQLite:** provides persistent local storage on mobile
- **Halifax fallback:** gives the app a usable default when location access is unavailable

## Testing

The project was tested on an Android physical device and with the Expo development workflow.

## Background

Originally developed for MCDA coursework at Saint Mary's University and retained as a mobile-development portfolio project.
