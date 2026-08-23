'use client';

import { useEffect, useState } from 'react';
import { FaClock, FaCloud, FaSun, FaMoon, FaCloudRain } from 'react-icons/fa';

interface WeatherData {
  temp: number;
  code: number;
  isDay: boolean;
}

export default function LocalTimeWeather() {
  const [time, setTime] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);

  useEffect(() => {
    const updateTime = () => {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: 'Asia/Singapore',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      });
      setTime(formatter.format(new Date()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    const fetchWeather = async () => {
      try {
        const res = await fetch('https://api.open-meteo.com/v1/forecast?latitude=1.2897&longitude=103.8501&current_weather=true');
        const data = await res.json();

        if (data && data.current_weather) {
          setWeather({
            temp: Math.round(data.current_weather.temperature),
            code: data.current_weather.weathercode,
            isDay: data.current_weather.is_day === 1
          });
        }
      } catch (err) {
        console.error("Failed to fetch weather", err);
      }
    };

    fetchWeather();

    return () => clearInterval(interval);
  }, []);

  const getWeatherIcon = (code: number, isDay: boolean) => {
    if (code === 0) return isDay ? <FaSun className="text-white/80 text-[12px]" /> : <FaMoon className="text-white/80 text-[12px]" />;
    if (code >= 1 && code <= 3) return <FaCloud className="text-white/80 text-[12px]" />;
    if (code >= 51 && code <= 67) return <FaCloudRain className="text-white/80 text-[12px]" />;
    if (code >= 80 && code <= 99) return <FaCloudRain className="text-white/80 text-[12px]" />;
    return <FaCloud className="text-white/80 text-[12px]" />;
  };

  return (
    <>
      {time && (
        <div className="flex items-center gap-1 sm:gap-1.5 text-white text-[11px] sm:text-[13px] font-medium px-2 sm:px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:text-white hover:bg-white/10 transition-colors cursor-default whitespace-nowrap shrink-0">
          <FaClock className="text-white/80 text-[10px] sm:text-[12px]" />
          {time}
        </div>
      )}

      {weather && (
        <div className="flex items-center gap-1 sm:gap-1.5 text-white text-[11px] sm:text-[13px] font-medium px-2 sm:px-3 py-1 rounded-full bg-white/5 border border-white/5 hover:text-white hover:bg-white/10 transition-colors cursor-default whitespace-nowrap shrink-0">
          {getWeatherIcon(weather.code, weather.isDay)}
          {weather.temp}°C
        </div>
      )}
    </>
  );
}
