// Location card component for saved locations list
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getWeatherInfo } from '@/utils/weatherCodes';

interface LocationCardProps {
    name: string;
    country: string;
    admin1?: string | null;
    temperature?: number;
    weatherCode?: number;
    onPress?: () => void;
    onRemove?: () => void;
}

export function LocationCard({
    name,
    country,
    admin1,
    temperature,
    weatherCode,
    onPress,
    onRemove,
}: LocationCardProps) {
    const weatherInfo = weatherCode !== undefined ? getWeatherInfo(weatherCode) : null;

    return (
        <TouchableOpacity
            style={styles.container}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={styles.leftContent}>
                <Text style={styles.cityName}>{name}</Text>
                <Text style={styles.location}>
                    {[admin1, country].filter(Boolean).join(', ')}
                </Text>
            </View>

            <View style={styles.rightContent}>
                {weatherInfo && temperature !== undefined && (
                    <>
                        <Ionicons
                            name={weatherInfo.icon as any}
                            size={32}
                            color="#fff"
                            style={styles.icon}
                        />
                        <Text style={styles.temperature}>{Math.round(temperature)}°</Text>
                    </>
                )}

                {onRemove && (
                    <TouchableOpacity
                        style={styles.removeButton}
                        onPress={(e) => {
                            e.stopPropagation();
                            onRemove();
                        }}
                    >
                        <Ionicons name="trash-outline" size={20} color="#ef4444" />
                    </TouchableOpacity>
                )}
            </View>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
    },
    leftContent: {
        flex: 1,
    },
    cityName: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    location: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    rightContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 8,
    },
    temperature: {
        fontSize: 24,
        fontWeight: '600',
        color: '#fff',
        marginRight: 12,
    },
    removeButton: {
        padding: 8,
    },
});
