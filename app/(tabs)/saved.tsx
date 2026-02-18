// Screen 3: Saved Locations
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  getSavedLocations,
  removeSavedLocation,
  SavedLocation,
} from '@/db/sqlite';
import { getWeatherForecast } from '@/api/openMeteo';
import { LocationCard } from '@/components/LocationCard';

interface LocationWithWeather extends SavedLocation {
  temperature?: number;
  weatherCode?: number;
}

export default function SavedScreen() {
  const [locations, setLocations] = useState<LocationWithWeather[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSavedLocations = async () => {
    try {
      const savedLocations = await getSavedLocations();

      // Fetch weather for each location
      const locationsWithWeather = await Promise.all(
        savedLocations.map(async (location) => {
          try {
            const weather = await getWeatherForecast(
              location.latitude,
              location.longitude
            );
            return {
              ...location,
              temperature: weather.current.temperature,
              weatherCode: weather.current.weatherCode,
            };
          } catch (error) {
            console.error(
              `Error fetching weather for ${location.name}:`,
              error
            );
            return location;
          }
        })
      );

      setLocations(locationsWithWeather);
    } catch (error) {
      console.error('Error loading saved locations:', error);
      Alert.alert('Error', 'Failed to load saved locations.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRemoveLocation = (id: number, name: string) => {
    Alert.alert('Remove Location', `Are you sure you want to remove ${name}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeSavedLocation(id);
            await loadSavedLocations();
          } catch (error) {
            console.error('Error removing location:', error);
            Alert.alert('Error', 'Failed to remove location.');
          }
        },
      },
    ]);
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadSavedLocations();
  };

  // Reload locations when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadSavedLocations();
    }, [])
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.header}>
          <Text style={styles.title}>Saved Locations</Text>
        </View>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Saved Locations</Text>
        <Text style={styles.subtitle}>
          {locations.length} of 5 locations saved
        </Text>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#fff"
          />
        }
      >
        {locations.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="bookmark-outline"
              size={80}
              color="rgba(255, 255, 255, 0.3)"
            />
            <Text style={styles.emptyText}>No saved locations yet</Text>
            <Text style={styles.emptySubtext}>
              Search for cities and save them to see weather here
            </Text>
          </View>
        ) : (
          locations.map((location) => (
            <LocationCard
              key={location.id}
              name={location.name}
              country={location.country}
              admin1={location.admin1}
              temperature={location.temperature}
              weatherCode={location.weatherCode}
              onRemove={() => handleRemoveLocation(location.id, location.name)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1e3a8a',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});
