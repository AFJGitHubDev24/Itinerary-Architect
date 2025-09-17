import React from 'react';
import { WeatherInfo } from '../types';
import { WeatherSunIcon, WeatherCloudIcon, WeatherRainIcon, WeatherSnowIcon, WeatherSunCloudIcon, WeatherThunderIcon } from './Icons';

interface WeatherDisplayProps {
  weather: WeatherInfo;
}

const WeatherIcon: React.FC<{ iconName: string }> = ({ iconName }) => {
    const iconMap: { [key: string]: React.ReactNode } = {
        sun: <WeatherSunIcon />,
        cloud: <WeatherCloudIcon />,
        rain: <WeatherRainIcon />,
        snow: <WeatherSnowIcon />,
        'sun-cloud': <WeatherSunCloudIcon />,
        thunder: <WeatherThunderIcon />,
    };

    return (
        <div className="w-12 h-12 text-white">
            {iconMap[iconName] || <WeatherSunIcon />}
        </div>
    );
}

const WeatherDisplay: React.FC<WeatherDisplayProps> = ({ weather }) => {
  return (
    <div 
        className="bg-black/40 backdrop-blur-sm p-3 rounded-lg text-white flex items-center gap-3 border border-white/20"
        style={{textShadow: '0 1px 3px rgba(0,0,0,0.5)'}}
        aria-label={`Weather forecast: ${weather.description} with a high of ${weather.maxTemp} and a low of ${weather.minTemp} degrees`}
    >
      <WeatherIcon iconName={weather.icon} />
      <div className="text-left">
        <p className="font-bold text-2xl">
          {weather.maxTemp}°<span className="opacity-70 font-normal"> / {weather.minTemp}°</span>
        </p>
        <p className="text-xs capitalize opacity-90">{weather.description}</p>
      </div>
    </div>
  );
};

export default WeatherDisplay;