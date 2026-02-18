// Hourly forecast component showing next 24 hours
import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherInfo } from '@/utils/weatherCodes';

interface HourlyForecastProps {
  times: string[];
  temperatures: number[];
  weatherCodes: number[];
  maxHours?: number;
}

export function HourlyForecast({
  times,
  temperatures,
  weatherCodes,
  maxHours = 24,
}: HourlyForecastProps) {
  const hourlyData = times.slice(0, maxHours).map((time, index) => ({
    time,
    temperature: temperatures[index],
    weatherCode: weatherCodes[index],
  }));

  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hourly Forecast</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {hourlyData.map((hour, index) => {
          const weatherInfo = getWeatherInfo(hour.weatherCode);
          return (
            <View key={index} style={styles.hourItem}>
              <Text style={styles.time}>{formatTime(hour.time)}</Text>
              <Ionicons
                name={weatherInfo.icon as any}
                size={32}
                color="#fff"
                style={styles.icon}
              />
              <Text style={styles.temp}>{Math.round(hour.temperature)}°</Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scrollContent: {
    paddingHorizontal: 16,
  },
  hourItem: {
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 4,
    minWidth: 70,
  },
  time: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: 8,
  },
  icon: {
    marginVertical: 8,
  },
  temp: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginTop: 8,
  },
});
