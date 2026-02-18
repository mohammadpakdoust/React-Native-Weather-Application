// Weather icon component using static images
import React from 'react';
import { Image, StyleSheet } from 'react-native';

interface AnimatedWeatherIconProps {
  weatherCode: number;
  size?: number;
}

export function AnimatedWeatherIcon({
  weatherCode,
  size = 120,
}: AnimatedWeatherIconProps) {
  const getWeatherImage = (code: number) => {
    // Map weather codes to local image files

    // Clear/Sunny (0, 1)
    if (code <= 1) {
      return require('../../assets/weather/sunny.png');
    }

    // Partly Cloudy (2)
    if (code === 2) {
      return require('../../assets/weather/partly-cloudy.png');
    }

    // Cloudy/Overcast (3, 45, 48)
    if (code === 3 || code === 45 || code === 48) {
      return require('../../assets/weather/cloudy.png');
    }

    // Rain/Drizzle (51-67, 80-82)
    if ((code >= 51 && code <= 67) || (code >= 80 && code <= 82)) {
      return require('../../assets/weather/rainy.png');
    }

    // Snow (71-77, 85-86)
    if ((code >= 71 && code <= 77) || (code >= 85 && code <= 86)) {
      return require('../../assets/weather/snowy.png');
    }

    // Thunderstorm (95-99)
    if (code >= 95 && code <= 99) {
      return require('../../assets/weather/thunderstorm.png');
    }

    // Default to sunny
    return require('../../assets/weather/sunny.png');
  };

  return (
    <Image
      source={getWeatherImage(weatherCode)}
      style={[styles.image, { width: size, height: size }]}
      resizeMode="contain"
    />
  );
}

const styles = StyleSheet.create({
  image: {
    // Image styling
  },
});
