// Weather code mapping for Open-Meteo API
// Based on WMO Weather interpretation codes

export interface WeatherInfo {
    label: string;
    icon: string; // Ionicons name
    backgroundType: 'clear' | 'cloudy' | 'rain' | 'snow';
}

export const weatherCodeMap: Record<number, WeatherInfo> = {
    0: { label: 'Clear sky', icon: 'sunny', backgroundType: 'clear' },
    1: { label: 'Mainly clear', icon: 'sunny', backgroundType: 'clear' },
    2: { label: 'Partly cloudy', icon: 'partly-sunny', backgroundType: 'cloudy' },
    3: { label: 'Overcast', icon: 'cloudy', backgroundType: 'cloudy' },
    45: { label: 'Foggy', icon: 'cloud', backgroundType: 'cloudy' },
    48: { label: 'Depositing rime fog', icon: 'cloud', backgroundType: 'cloudy' },
    51: { label: 'Light drizzle', icon: 'rainy', backgroundType: 'rain' },
    53: { label: 'Moderate drizzle', icon: 'rainy', backgroundType: 'rain' },
    55: { label: 'Dense drizzle', icon: 'rainy', backgroundType: 'rain' },
    56: { label: 'Light freezing drizzle', icon: 'rainy', backgroundType: 'rain' },
    57: { label: 'Dense freezing drizzle', icon: 'rainy', backgroundType: 'rain' },
    61: { label: 'Slight rain', icon: 'rainy', backgroundType: 'rain' },
    63: { label: 'Moderate rain', icon: 'rainy', backgroundType: 'rain' },
    65: { label: 'Heavy rain', icon: 'rainy', backgroundType: 'rain' },
    66: { label: 'Light freezing rain', icon: 'rainy', backgroundType: 'rain' },
    67: { label: 'Heavy freezing rain', icon: 'rainy', backgroundType: 'rain' },
    71: { label: 'Slight snow', icon: 'snow', backgroundType: 'snow' },
    73: { label: 'Moderate snow', icon: 'snow', backgroundType: 'snow' },
    75: { label: 'Heavy snow', icon: 'snow', backgroundType: 'snow' },
    77: { label: 'Snow grains', icon: 'snow', backgroundType: 'snow' },
    80: { label: 'Slight rain showers', icon: 'rainy', backgroundType: 'rain' },
    81: { label: 'Moderate rain showers', icon: 'rainy', backgroundType: 'rain' },
    82: { label: 'Violent rain showers', icon: 'rainy', backgroundType: 'rain' },
    85: { label: 'Slight snow showers', icon: 'snow', backgroundType: 'snow' },
    86: { label: 'Heavy snow showers', icon: 'snow', backgroundType: 'snow' },
    95: { label: 'Thunderstorm', icon: 'thunderstorm', backgroundType: 'rain' },
    96: { label: 'Thunderstorm with slight hail', icon: 'thunderstorm', backgroundType: 'rain' },
    99: { label: 'Thunderstorm with heavy hail', icon: 'thunderstorm', backgroundType: 'rain' },
};

/**
 * Get weather information from weather code
 */
export function getWeatherInfo(code: number): WeatherInfo {
    return weatherCodeMap[code] || {
        label: 'Unknown',
        icon: 'help-circle',
        backgroundType: 'clear',
    };
}
