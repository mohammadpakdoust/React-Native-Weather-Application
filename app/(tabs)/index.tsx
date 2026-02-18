// Screen 1: Current Location Weather
import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Alert,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { AnimatedBackground } from '@/components/AnimatedBackground';
import { WeatherHeader } from '@/components/WeatherHeader';
import { HourlyForecast } from '@/components/HourlyForecast';
import { WeatherDetails } from '@/components/WeatherDetails';
import { getWeatherForecast, WeatherForecast } from '@/api/openMeteo';
import { getWeatherInfo } from '@/utils/weatherCodes';

// Fallback location: Halifax, NS
const FALLBACK_LOCATION = {
    latitude: 44.6488,
    longitude: -63.5752,
    name: 'Halifax',
    admin1: 'Nova Scotia',
    country: 'Canada',
};

export default function HomeScreen() {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [weather, setWeather] = useState<WeatherForecast | null>(null);
    const [locationName, setLocationName] = useState('');
    const [locationInfo, setLocationInfo] = useState<{
        admin1?: string;
        country?: string;
    }>({});
    const [backgroundType, setBackgroundType] = useState<
        'clear' | 'cloudy' | 'rain' | 'snow'
    >('clear');

    const fetchCurrentLocationWeather = async () => {
        setLoading(true);
        setError(null);

        try {
            // Request location permission
            const { status } = await Location.requestForegroundPermissionsAsync();

            if (status !== 'granted') {
                // Permission denied - use fallback
                Alert.alert(
                    'Location Permission Denied',
                    'Using Halifax, NS as fallback location. You can search for other cities in the Search tab.',
                    [{ text: 'OK' }]
                );
                await fetchWeatherForCoordinates(
                    FALLBACK_LOCATION.latitude,
                    FALLBACK_LOCATION.longitude,
                    FALLBACK_LOCATION.name,
                    FALLBACK_LOCATION.admin1,
                    FALLBACK_LOCATION.country
                );
                return;
            }

            // Get current location
            const location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            // Reverse geocode to get city name
            const [geocode] = await Location.reverseGeocodeAsync({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
            });

            const cityName = geocode?.city || geocode?.district || 'Unknown Location';
            const admin1 = geocode?.region;
            const country = geocode?.country;

            await fetchWeatherForCoordinates(
                location.coords.latitude,
                location.coords.longitude,
                cityName,
                admin1,
                country
            );
        } catch (err: any) {
            console.error('Error fetching location:', err);
            setError('Failed to get location. Using fallback.');

            // Use fallback on error
            await fetchWeatherForCoordinates(
                FALLBACK_LOCATION.latitude,
                FALLBACK_LOCATION.longitude,
                FALLBACK_LOCATION.name,
                FALLBACK_LOCATION.admin1,
                FALLBACK_LOCATION.country
            );
        }
    };

    const fetchWeatherForCoordinates = async (
        lat: number,
        lon: number,
        name: string,
        admin1?: string,
        country?: string
    ) => {
        try {
            const forecast = await getWeatherForecast(lat, lon);
            setWeather(forecast);
            setLocationName(name);
            setLocationInfo({ admin1, country });

            // Set background type based on weather code
            const weatherInfo = getWeatherInfo(forecast.current.weatherCode);
            setBackgroundType(weatherInfo.backgroundType);
        } catch (err: any) {
            console.error('Error fetching weather:', err);
            setError('Failed to fetch weather data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCurrentLocationWeather();
    }, []);

    if (loading) {
        return (
            <View style={styles.container}>
                <AnimatedBackground type="clear" />
                <View style={styles.centerContent}>
                    <ActivityIndicator size="large" color="#fff" />
                    <Text style={styles.loadingText}>Getting your location...</Text>
                </View>
                <StatusBar style="light" />
            </View>
        );
    }

    if (error && !weather) {
        return (
            <View style={styles.container}>
                <AnimatedBackground type="clear" />
                <View style={styles.centerContent}>
                    <Ionicons name="alert-circle" size={64} color="#fff" />
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity
                        style={styles.retryButton}
                        onPress={fetchCurrentLocationWeather}
                    >
                        <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                </View>
                <StatusBar style="light" />
            </View>
        );
    }

    if (!weather) {
        return null;
    }

    return (
        <View style={styles.container}>
            <AnimatedBackground type={backgroundType} />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.header}>
                    <TouchableOpacity
                        style={styles.refreshButton}
                        onPress={fetchCurrentLocationWeather}
                    >
                        <Ionicons name="refresh" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>

                <WeatherHeader
                    cityName={locationName}
                    temperature={weather.current.temperature}
                    feelsLike={weather.current.apparentTemperature}
                    weatherCode={weather.current.weatherCode}
                    admin1={locationInfo.admin1}
                    country={locationInfo.country}
                />

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
            </ScrollView>

            <StatusBar style="light" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 10,
    },
    refreshButton: {
        padding: 8,
    },
    centerContent: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#fff',
    },
    errorText: {
        marginTop: 16,
        fontSize: 16,
        color: '#fff',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 24,
    },
    retryButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
});
