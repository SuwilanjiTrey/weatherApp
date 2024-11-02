import React, { useState, useEffect } from 'react';
import { Search, Cloud, Droplets, Wind, Thermometer, MapPin } from 'lucide-react';
import axios from 'axios';

const WeatherApp = () => {
  const [location, setLocation] = useState('');
  const [weather, setWeather] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOfDay, setTimeOfDay] = useState('morning');
  const [loading, setLoading] = useState(false);

  // Get user's location
  const getUserLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          try {
            // Fetch current weather
            const currentWeatherResponse = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            );

            // Fetch 5-day forecast
            const forecastResponse = await axios.get(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=metric&appid=${API_KEY}`
            );

            const currentData = currentWeatherResponse.data;
            const forecastData = processForecastData(forecastResponse.data);

            setWeather({
              location: currentData.name,
              temperature: currentData.main.temp,
              condition: currentData.weather[0].description,
              humidity: currentData.main.humidity,
              windSpeed: currentData.wind.speed,
              forecast: forecastData
            });
          } catch (error) {
            console.error("Error fetching weather data:", error);
            alert("Could not retrieve weather data based on location.");
          } finally {
            setLoading(false);
          }
        },
        (error) => {
          console.error("Error getting location:", error);
          alert("Could not access location. Please enter a city manually.");
          setLoading(false);
        }
      );
    }
  };

  // Process forecast data to get daily forecasts
  const processForecastData = (data) => {
    const dailyForecasts = {};
    
    // Group forecasts by day
    data.list.forEach(forecast => {
      const date = new Date(forecast.dt * 1000);
      const day = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      if (!dailyForecasts[day]) {
        dailyForecasts[day] = {
          temps: [],
          conditions: [],
          icon: forecast.weather[0].icon
        };
      }
      
      dailyForecasts[day].temps.push(forecast.main.temp);
      dailyForecasts[day].conditions.push(forecast.weather[0].description);
    });

    // Calculate daily averages and get most common condition
    return Object.entries(dailyForecasts).slice(0, 5).map(([day, data]) => ({
      day,
      temp: Math.round(data.temps.reduce((sum, temp) => sum + temp, 0) / data.temps.length),
      condition: mode(data.conditions),
      icon: data.icon
    }));
  };

  // Helper function to get most common value in array
  const mode = arr => {
    return arr.sort((a, b) =>
      arr.filter(v => v === a).length - arr.filter(v => v === b).length
    ).pop();
  };

  // Update time and background
  useEffect(() => {
    const updateTimeAndBackground = () => {
      const now = new Date();
      setCurrentTime(now);
      
      const hours = now.getHours();
      if (hours >= 17 && hours < 18) {
        setTimeOfDay('dusk');
      } else if (hours >= 18 || hours < 5) {
        setTimeOfDay('night');
      } else if (hours >= 5 && hours < 6) {
        setTimeOfDay('dawn');
      } else if (hours >= 6 && hours < 12) {
        setTimeOfDay('morning');
      } else {
        setTimeOfDay('afternoon');
      }
    };

    updateTimeAndBackground();
    const interval = setInterval(updateTimeAndBackground, 60000);

    return () => clearInterval(interval);
  }, []);

  const API_KEY = "ed75db6567717aba20f995419ce02eb9";

  const fetchWeather = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Fetch current weather
      const currentWeatherResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${location}&units=metric&appid=${API_KEY}`
      );
      
      // Fetch 5-day forecast
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${location}&units=metric&appid=${API_KEY}`
      );
      
      const currentData = currentWeatherResponse.data;
      const forecastData = processForecastData(forecastResponse.data);

      setWeather({
        location: currentData.name,
        temperature: currentData.main.temp,
        condition: currentData.weather[0].description,
        humidity: currentData.main.humidity,
        windSpeed: currentData.wind.speed,
        forecast: forecastData
      });

    } catch (error) {
      console.error("Error fetching weather data:", error);
      alert("Could not retrieve weather data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Background animations and gradient classes based on time of day
  const backgroundClasses = {
    dawn: 'bg-gradient-to-b from-purple-900 via-pink-500 to-orange-300 animate-dawn',
    morning: 'bg-gradient-to-b from-blue-400 via-blue-300 to-blue-200 animate-morning',
    afternoon: 'bg-gradient-to-b from-blue-500 via-blue-400 to-blue-300 animate-afternoon',
    dusk: 'bg-gradient-to-b from-orange-500 via-purple-500 to-blue-800 animate-dusk',
    night: 'bg-gradient-to-b from-blue-900 via-blue-800 to-blue-700 animate-night'
  };

  return (
    <div className={`min-h-screen ${backgroundClasses[timeOfDay]} transition-colors duration-1000 overflow-hidden`}>
      {/* Background Elements Layer */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Stars Layer */}
        {timeOfDay === 'night' && (
          <div className="absolute inset-0">
            {[...Array(100)].map((_, i) => (
              <div
                key={i}
                className={`absolute rounded-full animate-twinkle
                  ${i % 3 === 0 ? 'w-1 h-1' : i % 3 === 1 ? 'w-1.5 h-1.5' : 'w-2 h-2'}
                  ${i % 4 === 0 ? 'bg-white' : i % 4 === 1 ? 'bg-blue-200' : 'bg-yellow-100'}`}
                style={{
                  top: `${Math.random() * 70}%`, // Keep stars in upper 70% of screen
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                }}
              />
            ))}
          </div>
        )}

        {/* Sun */}
        {timeOfDay !== 'night' && (
          <div className={`absolute w-24 h-24 rounded-full bg-yellow-500 
            ${timeOfDay === 'dawn' ? 'animate-sunrise' : 
              timeOfDay === 'dusk' ? 'animate-sunset' : 
              'animate-sun-movement'}`}>
            <div className="absolute inset-0 animate-sun-rays">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-full h-1 bg-yellow-400 origin-center opacity-75"
                  style={{
                    transform: `rotate(${i * 30}deg)`,
                    left: '50%',
                    top: '50%',
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Moon */}
        {(timeOfDay === 'night' || timeOfDay === 'dawn' || timeOfDay === 'dusk') && (
          <div className={`absolute w-20 h-20 
            ${timeOfDay === 'dawn' ? 'animate-moonset' : 
              timeOfDay === 'dusk' ? 'animate-moonrise' : 
              'animate-moon-movement'}`}>
            <div className="relative w-full h-full">
              {/* Main moon circle */}
              <div className="absolute inset-0 rounded-full bg-gray-200 opacity-90" />
              {/* Craters */}
              <div className="absolute w-4 h-4 rounded-full bg-gray-300 opacity-50 top-4 left-4" />
              <div className="absolute w-3 h-3 rounded-full bg-gray-300 opacity-50 bottom-6 right-5" />
              <div className="absolute w-2 h-2 rounded-full bg-gray-300 opacity-50 top-8 right-4" />
            </div>
          </div>
        )}

        {/* Clouds Layer */}
        <div className="absolute inset-0 z-10">
          <div className="cloud-1" />
          <div className="cloud-2" />
          <div className="cloud-3" />
        </div>
      </div>

      {/* Content Layer */}
      <div className="relative z-20 w-full max-w-4xl mx-auto p-4 space-y-4">
        {/* Time display with improved visibility */}
        <div className="text-center mb-8 mt-4">
          <h1 className="text-4xl font-bold mb-2 text-white drop-shadow-lg">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </h1>
          <p className="text-xl text-white capitalize drop-shadow-md">{timeOfDay}</p>
        </div>

        {/* Search and location */}
        <div className="flex flex-col sm:flex-row gap-2 mb-4">
          <form onSubmit={fetchWeather} className="flex-1 flex gap-2">
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Enter location..."
              className="flex-1 p-2 border rounded-lg bg-white/80 backdrop-blur-sm"
            />
            <button
              type="submit"
              className="p-2 bg-blue-500 text-white rounded-lg flex items-center gap-2 hover:bg-blue-600 transition-colors"
              disabled={loading}
            >
              <Search size={20} />
              Search
            </button>
          </form>
          <button
            onClick={getUserLocation}
            className="p-2 bg-green-500 text-white rounded-lg flex items-center justify-center gap-2 hover:bg-green-600 transition-colors"
            disabled={loading}
          >
            <MapPin size={20} />
            Use My Location
          </button>
        </div>

        {loading && (
          <div className="text-center p-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto"></div>
          </div>
        )}

        {weather && !loading && (
          <div className="space-y-4 relative z-10">
            {/* Current Weather Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">{weather.location}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="flex items-center gap-2">
                  <Thermometer className="text-red-500" />
                  <span>{Math.round(weather.temperature)}°C</span>
                </div>
                <div className="flex items-center gap-2">
                  <Cloud className="text-gray-500" />
                  <span>{weather.condition}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Droplets className="text-blue-500" />
                  <span>{weather.humidity}%</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wind className="text-gray-500" />
                  <span>{weather.windSpeed} km/h</span>
                </div>
              </div>
            </div>

            {/* 5-Day Forecast Card */}
            <div className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold mb-4">5-Day Forecast</h2>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {weather.forecast.map((day) => (
                  <div key={day.day} className="text-center p-2 bg-white/50 rounded-lg backdrop-blur-sm">
                    <div className="font-medium">{day.day}</div>
                    <img 
                      src={`http://openweathermap.org/img/wn/${day.icon}@2x.png`}
                      alt={day.condition}
                      className="w-12 h-12 mx-auto"
                    />
                    <div className="text-2xl">{Math.round(day.temp)}°C</div>
                    <div className="text-sm text-gray-600">{day.condition}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default WeatherApp;