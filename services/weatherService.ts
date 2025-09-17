import { WeatherInfo } from '../types';

// WMO Weather interpretation codes
// See: https://open-meteo.com/en/docs
const weatherCodeMap: { [key: number]: { description: string; icon: string; } } = {
  0: { description: 'Clear sky', icon: 'sun' },
  1: { description: 'Mainly clear', icon: 'sun-cloud' },
  2: { description: 'Partly cloudy', icon: 'sun-cloud' },
  3: { description: 'Overcast', icon: 'cloud' },
  45: { description: 'Fog', icon: 'cloud' },
  48: { description: 'Depositing rime fog', icon: 'cloud' },
  51: { description: 'Light drizzle', icon: 'rain' },
  53: { description: 'Moderate drizzle', icon: 'rain' },
  55: { description: 'Dense drizzle', icon: 'rain' },
  56: { description: 'Light freezing drizzle', icon: 'rain' },
  57: { description: 'Dense freezing drizzle', icon: 'rain' },
  61: { description: 'Slight rain', icon: 'rain' },
  63: { description: 'Moderate rain', icon: 'rain' },
  65: { description: 'Heavy rain', icon: 'rain' },
  66: { description: 'Light freezing rain', icon: 'rain' },
  67: { description: 'Heavy freezing rain', icon: 'rain' },
  71: { description: 'Slight snow fall', icon: 'snow' },
  73: { description: 'Moderate snow fall', icon: 'snow' },
  75: { description: 'Heavy snow fall', icon: 'snow' },
  77: { description: 'Snow grains', icon: 'snow' },
  80: { description: 'Slight rain showers', icon: 'rain' },
  81: { description: 'Moderate rain showers', icon: 'rain' },
  82: { description: 'Violent rain showers', icon: 'rain' },
  85: { description: 'Slight snow showers', icon: 'snow' },
  86: { description: 'Heavy snow showers', icon: 'snow' },
  95: { description: 'Thunderstorm', icon: 'thunder' },
  96: { description: 'Thunderstorm with slight hail', icon: 'thunder' },
  99: { description: 'Thunderstorm with heavy hail', icon: 'thunder' },
};

export const mapWeatherCode = (code: number): { description: string; icon: string } => {
  return weatherCodeMap[code] || { description: 'Clear sky', icon: 'sun' };
};

export async function getWeatherForecast(
  latitude: number,
  longitude: number,
  startDate: string,
  endDate: string
): Promise<WeatherInfo[] | null> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&start_date=${startDate}&end_date=${endDate}&daily=weather_code,temperature_2m_max,temperature_2m_min&timezone=auto`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Weather API request failed with status ${response.status}`);
    }
    const data = await response.json();

    if (!data.daily || !data.daily.time) {
        console.error("Weather API response is malformed:", data);
        return null;
    }

    const dailyForecasts: WeatherInfo[] = data.daily.time.map((date: string, index: number) => {
        const code = data.daily.weather_code[index];
        const { description, icon } = mapWeatherCode(code);
        return {
            date,
            maxTemp: Math.round(data.daily.temperature_2m_max[index]),
            minTemp: Math.round(data.daily.temperature_2m_min[index]),
            weatherCode: code,
            description,
            icon,
        };
    });

    return dailyForecasts;
  } catch (error) {
    console.error("Error fetching weather forecast:", error);
    return null; // Fail gracefully
  }
}