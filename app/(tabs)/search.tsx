// Screen 2: Search & Display Weather
import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useDebounce } from '@/hooks/useDebounce';
import {
  searchCities,
  getWeatherForecast,
  GeocodingResult,
  WeatherForecast,
} from '@/api/openMeteo';
import {
  addSavedLocation,
  getSavedLocations,
  getSavedLocationsCount,
} from '@/db/sqlite';
import { WeatherHeader } from '@/components/WeatherHeader';
import { HourlyForecast } from '@/components/HourlyForecast';
import { WeatherDetails } from '@/components/WeatherDetails';

const MAX_LOCATIONS = 5;

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  const [selectedLocation, setSelectedLocation] =
    useState<GeocodingResult | null>(null);
  const [weather, setWeather] = useState<WeatherForecast | null>(null);
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [savedCount, setSavedCount] = useState(0);
  const [isAlreadySaved, setIsAlreadySaved] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Refresh saved count + duplicate check whenever screen is focused
  const refreshSavedState = useCallback(async () => {
    try {
      const count = await getSavedLocationsCount();
      setSavedCount(count);

      if (selectedLocation) {
        const all = await getSavedLocations();
        const duplicate = all.some(
          (loc) =>
            loc.name === selectedLocation.name &&
            Math.abs(loc.latitude - selectedLocation.latitude) < 0.001 &&
            Math.abs(loc.longitude - selectedLocation.longitude) < 0.001
        );
        setIsAlreadySaved(duplicate);
      }
    } catch (error) {
      console.error('Error refreshing saved state:', error);
    }
  }, [selectedLocation]);

  useFocusEffect(
    useCallback(() => {
      refreshSavedState();
    }, [refreshSavedState])
  );

  // Fetch suggestions when debounced query changes
  React.useEffect(() => {
    const fetchSuggestions = async () => {
      if (debouncedSearchQuery.length < 3) {
        setSuggestions([]);
        return;
      }

      setLoadingSuggestions(true);
      try {
        const results = await searchCities(debouncedSearchQuery);
        setSuggestions(results);
      } catch (error) {
        console.error('Error fetching suggestions:', error);
        setSuggestions([]);
      } finally {
        setLoadingSuggestions(false);
      }
    };

    fetchSuggestions();
  }, [debouncedSearchQuery]);

  const handleSelectLocation = async (location: GeocodingResult) => {
    setSelectedLocation(location);
    setSuggestions([]);
    setSearchQuery('');
    setLoadingWeather(true);

    try {
      const forecast = await getWeatherForecast(
        location.latitude,
        location.longitude
      );
      setWeather(forecast);

      // Check duplicate for newly selected location
      const all = await getSavedLocations();
      const duplicate = all.some(
        (loc) =>
          loc.name === location.name &&
          Math.abs(loc.latitude - location.latitude) < 0.001 &&
          Math.abs(loc.longitude - location.longitude) < 0.001
      );
      setIsAlreadySaved(duplicate);
    } catch (error) {
      console.error('Error fetching weather:', error);
      Alert.alert('Error', 'Failed to fetch weather data. Please try again.');
    } finally {
      setLoadingWeather(false);
    }
  };

  const handleSaveLocation = async () => {
    if (!selectedLocation) return;

    setIsSaving(true);
    try {
      const result = await addSavedLocation(
        selectedLocation.name,
        selectedLocation.latitude,
        selectedLocation.longitude,
        selectedLocation.country,
        selectedLocation.admin1
      );

      if (result.success) {
        Alert.alert('Success', result.message);
        await refreshSavedState();
      } else {
        Alert.alert('Cannot Save', result.message);
      }
    } catch (error) {
      console.error('Error saving location:', error);
      Alert.alert('Error', 'Failed to save location. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Determine save button state
  const limitReached = savedCount >= MAX_LOCATIONS;
  const saveDisabled = isSaving || limitReached || isAlreadySaved;

  const saveButtonLabel = () => {
    if (isSaving) return null; // shows spinner
    if (isAlreadySaved) return 'Already Saved';
    if (limitReached) return 'Limit Reached (5/5)';
    return 'Save Location';
  };

  const saveButtonIcon = () => {
    if (isAlreadySaved) return 'bookmark';
    if (limitReached) return 'ban';
    return 'bookmark-outline';
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.header}>
        <Text style={styles.title}>Search Weather</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={20} color="rgba(255, 255, 255, 0.6)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search city (min 3 characters)..."
            placeholderTextColor="rgba(255, 255, 255, 0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="words"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons
                name="close-circle"
                size={20}
                color="rgba(255, 255, 255, 0.6)"
              />
            </TouchableOpacity>
          )}
        </View>

        {loadingSuggestions && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#fff" />
          </View>
        )}

        {suggestions.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <ScrollView style={styles.suggestionsList}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={styles.suggestionItem}
                  onPress={() => handleSelectLocation(suggestion)}
                >
                  <Ionicons name="location" size={20} color="#fff" />
                  <View style={styles.suggestionText}>
                    <Text style={styles.suggestionName}>{suggestion.name}</Text>
                    <Text style={styles.suggestionLocation}>
                      {[suggestion.admin1, suggestion.country]
                        .filter(Boolean)
                        .join(', ')}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {loadingWeather && (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Loading weather...</Text>
          </View>
        )}

        {!loadingWeather && weather && selectedLocation && (
          <>
            <WeatherHeader
              cityName={selectedLocation.name}
              temperature={weather.current.temperature}
              feelsLike={weather.current.apparentTemperature}
              weatherCode={weather.current.weatherCode}
              admin1={selectedLocation.admin1}
              country={selectedLocation.country}
            />

            <View style={styles.saveButtonContainer}>
              <TouchableOpacity
                style={[
                  styles.saveButton,
                  saveDisabled && styles.saveButtonDisabled,
                ]}
                onPress={handleSaveLocation}
                disabled={saveDisabled}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <>
                    <Ionicons
                      name={saveButtonIcon() as any}
                      size={20}
                      color="#fff"
                    />
                    <Text style={styles.saveButtonText}>
                      {saveButtonLabel()}
                    </Text>
                  </>
                )}
              </TouchableOpacity>

              {/* Saved count indicator */}
              <Text style={styles.savedCountText}>
                Saved: {savedCount} / {MAX_LOCATIONS}
              </Text>
            </View>

            <HourlyForecast
              times={weather.hourly.time}
              temperatures={weather.hourly.temperature}
              weatherCodes={weather.hourly.weatherCode}
              maxHours={24}
            />

            <WeatherDetails
              humidity={weather.current.humidity}
              windSpeed={weather.current.windSpeed}
              precipitationProbability={
                weather.hourly.precipitationProbability[0]
              }
              sunrise={weather.daily.sunrise[0]}
              sunset={weather.daily.sunset[0]}
            />
          </>
        )}

        {!loadingWeather && !weather && (
          <View style={styles.centerContent}>
            <Ionicons
              name="search-circle"
              size={80}
              color="rgba(255, 255, 255, 0.3)"
            />
            <Text style={styles.emptyText}>
              Search for a city to see weather
            </Text>
          </View>
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
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#fff',
  },
  loadingContainer: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  suggestionsContainer: {
    marginTop: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 12,
    maxHeight: 300,
  },
  suggestionsList: {
    padding: 8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  suggestionText: {
    marginLeft: 12,
    flex: 1,
  },
  suggestionName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 2,
  },
  suggestionLocation: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#fff',
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  saveButtonContainer: {
    paddingHorizontal: 20,
    marginVertical: 16,
    alignItems: 'center',
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 24,
    width: '100%',
  },
  saveButtonDisabled: {
    opacity: 0.5,
    backgroundColor: '#64748b',
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  savedCountText: {
    marginTop: 8,
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.6)',
  },
});
