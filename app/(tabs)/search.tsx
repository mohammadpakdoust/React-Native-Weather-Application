// Screen 2: Search & Display Weather
import React, { useState, useEffect } from 'react';
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
import { useDebounce } from '@/hooks/useDebounce';
import {
    searchCities,
    getWeatherForecast,
    GeocodingResult,
    WeatherForecast,
} from '@/api/openMeteo';
import { addSavedLocation, getSavedLocationsCount } from '@/db/sqlite';
import { WeatherHeader } from '@/components/WeatherHeader';
import { HourlyForecast } from '@/components/HourlyForecast';
import { WeatherDetails } from '@/components/WeatherDetails';

export default function SearchScreen() {
    const [searchQuery, setSearchQuery] = useState('');
    const [suggestions, setSuggestions] = useState<GeocodingResult[]>([]);
    const [loadingSuggestions, setLoadingSuggestions] = useState(false);
    const [selectedLocation, setSelectedLocation] = useState<GeocodingResult | null>(null);
    const [weather, setWeather] = useState<WeatherForecast | null>(null);
    const [loadingWeather, setLoadingWeather] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    // Fetch suggestions when debounced query changes
    useEffect(() => {
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
            const forecast = await getWeatherForecast(location.latitude, location.longitude);
            setWeather(forecast);
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
                            <Ionicons name="close-circle" size={20} color="rgba(255, 255, 255, 0.6)" />
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
                                            {[suggestion.admin1, suggestion.country].filter(Boolean).join(', ')}
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
                                style={[styles.saveButton, isSaving && styles.saveButtonDisabled]}
                                onPress={handleSaveLocation}
                                disabled={isSaving}
                            >
                                {isSaving ? (
                                    <ActivityIndicator size="small" color="#fff" />
                                ) : (
                                    <>
                                        <Ionicons name="bookmark" size={20} color="#fff" />
                                        <Text style={styles.saveButtonText}>Save Location</Text>
                                    </>
                                )}
                            </TouchableOpacity>
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
                            precipitationProbability={weather.hourly.precipitationProbability[0]}
                            sunrise={weather.daily.sunrise[0]}
                            sunset={weather.daily.sunset[0]}
                        />
                    </>
                )}

                {!loadingWeather && !weather && (
                    <View style={styles.centerContent}>
                        <Ionicons name="search-circle" size={80} color="rgba(255, 255, 255, 0.3)" />
                        <Text style={styles.emptyText}>Search for a city to see weather</Text>
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
    },
    saveButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#3b82f6',
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    saveButtonDisabled: {
        opacity: 0.6,
    },
    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
});
