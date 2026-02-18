// Weather header component showing current conditions
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherInfo } from '@/utils/weatherCodes';

interface WeatherHeaderProps {
    cityName: string;
    temperature: number;
    feelsLike: number;
    weatherCode: number;
    admin1?: string;
    country?: string;
}

export function WeatherHeader({
    cityName,
    temperature,
    feelsLike,
    weatherCode,
    admin1,
    country,
}: WeatherHeaderProps) {
    const weatherInfo = getWeatherInfo(weatherCode);

    return (
        <View style={styles.container}>
            <Text style={styles.cityName}>{cityName}</Text>
            {(admin1 || country) && (
                <Text style={styles.location}>
                    {[admin1, country].filter(Boolean).join(', ')}
                </Text>
            )}

            <View style={styles.mainWeather}>
                <Ionicons name={weatherInfo.icon as any} size={80} color="#fff" />
                <Text style={styles.temperature}>{Math.round(temperature)}°</Text>
            </View>

            <Text style={styles.condition}>{weatherInfo.label}</Text>
            <Text style={styles.feelsLike}>Feels like {Math.round(feelsLike)}°</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingVertical: 20,
    },
    cityName: {
        fontSize: 32,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    location: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 16,
    },
    mainWeather: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    temperature: {
        fontSize: 72,
        fontWeight: '200',
        color: '#fff',
        marginLeft: 16,
    },
    condition: {
        fontSize: 24,
        color: '#fff',
        marginBottom: 8,
    },
    feelsLike: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
    },
});
