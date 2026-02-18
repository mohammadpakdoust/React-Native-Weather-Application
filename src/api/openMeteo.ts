// Open-Meteo API integration for geocoding and weather forecast

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string;
}

export interface CurrentWeather {
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
}

export interface HourlyWeather {
  time: string[];
  temperature: number[];
  apparentTemperature: number[];
  weatherCode: number[];
  precipitationProbability: number[];
  windSpeed: number[];
  humidity: number[];
}

export interface DailyWeather {
  sunrise: string[];
  sunset: string[];
  weatherCode: number[];
  temperatureMax: number[];
  temperatureMin: number[];
}

export interface WeatherForecast {
  current: CurrentWeather;
  hourly: HourlyWeather;
  daily: DailyWeather;
  timezone: string;
}

const GEOCODING_API = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_API = 'https://api.open-meteo.com/v1/forecast';

/**
 * Search for cities by name using Open-Meteo Geocoding API
 */
export async function searchCities(query: string): Promise<GeocodingResult[]> {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const url = `${GEOCODING_API}?name=${encodeURIComponent(query)}&count=8&language=en&format=json`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding API error: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results) {
      return [];
    }

    return data.results.map((result: any) => ({
      id: result.id,
      name: result.name,
      latitude: result.latitude,
      longitude: result.longitude,
      country: result.country,
      admin1: result.admin1,
    }));
  } catch (error) {
    console.error('Error fetching geocoding data:', error);
    throw error;
  }
}

/**
 * Fetch weather forecast for given coordinates
 */
export async function getWeatherForecast(
  latitude: number,
  longitude: number
): Promise<WeatherForecast> {
  try {
    const params = new URLSearchParams({
      latitude: latitude.toString(),
      longitude: longitude.toString(),
      current:
        'temperature_2m,apparent_temperature,weather_code,wind_speed_10m,relative_humidity_2m',
      hourly:
        'temperature_2m,apparent_temperature,weather_code,precipitation_probability,wind_speed_10m,relative_humidity_2m',
      daily:
        'sunrise,sunset,weather_code,temperature_2m_max,temperature_2m_min',
      timezone: 'auto',
    });

    const url = `${FORECAST_API}?${params.toString()}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error: ${response.status}`);
    }

    const data = await response.json();

    return {
      current: {
        temperature: data.current.temperature_2m,
        apparentTemperature: data.current.apparent_temperature,
        weatherCode: data.current.weather_code,
        windSpeed: data.current.wind_speed_10m,
        humidity: data.current.relative_humidity_2m,
      },
      hourly: {
        time: data.hourly.time,
        temperature: data.hourly.temperature_2m,
        apparentTemperature: data.hourly.apparent_temperature,
        weatherCode: data.hourly.weather_code,
        precipitationProbability: data.hourly.precipitation_probability,
        windSpeed: data.hourly.wind_speed_10m,
        humidity: data.hourly.relative_humidity_2m,
      },
      daily: {
        sunrise: data.daily.sunrise,
        sunset: data.daily.sunset,
        weatherCode: data.daily.weather_code,
        temperatureMax: data.daily.temperature_2m_max,
        temperatureMin: data.daily.temperature_2m_min,
      },
      timezone: data.timezone,
    };
  } catch (error) {
    console.error('Error fetching weather data:', error);
    throw error;
  }
}
