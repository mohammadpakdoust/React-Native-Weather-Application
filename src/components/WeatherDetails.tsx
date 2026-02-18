// Weather details component showing additional information
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface WeatherDetailsProps {
  humidity: number;
  windSpeed: number;
  precipitationProbability?: number;
  sunrise?: string;
  sunset?: string;
}

export function WeatherDetails({
  humidity,
  windSpeed,
  precipitationProbability,
  sunrise,
  sunset,
}: WeatherDetailsProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Details</Text>
      <View style={styles.grid}>
        <View style={styles.detailItem}>
          <Ionicons name="water" size={24} color="#fff" />
          <Text style={styles.detailLabel}>Humidity</Text>
          <Text style={styles.detailValue}>{humidity}%</Text>
        </View>

        <View style={styles.detailItem}>
          <Ionicons name="speedometer" size={24} color="#fff" />
          <Text style={styles.detailLabel}>Wind Speed</Text>
          <Text style={styles.detailValue}>{Math.round(windSpeed)} km/h</Text>
        </View>

        {precipitationProbability !== undefined && (
          <View style={styles.detailItem}>
            <Ionicons name="rainy" size={24} color="#fff" />
            <Text style={styles.detailLabel}>Precipitation</Text>
            <Text style={styles.detailValue}>{precipitationProbability}%</Text>
          </View>
        )}

        {sunrise && (
          <View style={styles.detailItem}>
            <Ionicons name="sunny" size={24} color="#fff" />
            <Text style={styles.detailLabel}>Sunrise</Text>
            <Text style={styles.detailValue}>{formatTime(sunrise)}</Text>
          </View>
        )}

        {sunset && (
          <View style={styles.detailItem}>
            <Ionicons name="moon" size={24} color="#fff" />
            <Text style={styles.detailLabel}>Sunset</Text>
            <Text style={styles.detailValue}>{formatTime(sunset)}</Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 16,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 12,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  detailItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    marginBottom: 12,
    alignItems: 'center',
  },
  detailLabel: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 8,
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
});
