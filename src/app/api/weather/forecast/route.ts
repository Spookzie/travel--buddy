import { NextRequest, NextResponse } from 'next/server';

interface WeatherForecastRequest {
  lat: string;
  lon: string;
  startDate: string;
  days: number;
}

interface OpenWeatherForecastResponse {
  list: Array<{
    dt: number;
    main: {
      temp: number;
      temp_min: number;
      temp_max: number;
      humidity: number;
    };
    weather: Array<{
      main: string;
      description: string;
      icon: string;
    }>;
    wind: {
      speed: number;
    };
    pop: number; // Probability of precipitation
  }>;
  city: {
    name: string;
    coord: {
      lat: number;
      lon: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const { lat, lon, startDate, days }: WeatherForecastRequest = await request.json();

    // Validate input
    if (!lat || !lon || !startDate || !days) {
      return NextResponse.json(
        { error: 'Missing required parameters: lat, lon, startDate, days' },
        { status: 400 }
      );
    }

    // Validate days range (OpenWeatherMap free tier supports up to 5 days)
    if (days < 1 || days > 5) {
      return NextResponse.json(
        { error: 'Days must be between 1 and 5 for weather forecast (free tier limitation)' },
        { status: 400 }
      );
    }

    const apiKey = process.env.OPENWEATHER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenWeatherMap API key not configured' },
        { status: 500 }
      );
    }

    // Check if the start date is in the future
    const selectedStartDate = new Date(startDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to start of day
    selectedStartDate.setHours(0, 0, 0, 0);
    
    const daysFromToday = Math.ceil((selectedStartDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // If start date is more than 5 days in the future, we can't provide forecast
    if (daysFromToday > 5) {
      return NextResponse.json({
        success: false,
        error: 'Weather forecast not available for selected dates',
        message: `Your trip starts ${daysFromToday} days from now, but the free weather API only provides forecasts up to 5 days ahead. Please select a start date within the next 5 days.`,
        selectedStartDate: startDate,
        daysFromToday,
        maxDaysAhead: 5
      });
    }

    // If start date is in the past, adjust to today
    if (daysFromToday < 0) {
      return NextResponse.json({
        success: false,
        error: 'Invalid start date',
        message: 'Trip start date cannot be in the past. Please select a future date.',
        selectedStartDate: startDate,
        daysFromToday
      });
    }

    // Use the free 5-day forecast API (3-hour intervals)
    const weatherUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    const response = await fetch(weatherUrl);
    
    if (!response.ok) {
      const errorData = await response.text();
      console.error('OpenWeatherMap API error:', errorData);
      return NextResponse.json(
        { error: 'Failed to fetch weather data' },
        { status: 500 }
      );
    }

    const data: OpenWeatherForecastResponse = await response.json();
    
    // Group 3-hour forecasts into daily forecasts
    const dailyForecasts = new Map<string, {
      temps: number[];
      minTemp: number;
      maxTemp: number;
      weather: { [key: string]: number };
      humidity: number[];
      windSpeed: number[];
      precipitation: number[];
    }>();

    // Process 3-hour forecasts and group by day
    data.list.forEach((forecast) => {
      const date = new Date(forecast.dt * 1000);
      const dateKey = date.toISOString().split('T')[0];
      
      if (!dailyForecasts.has(dateKey)) {
        dailyForecasts.set(dateKey, {
          temps: [],
          minTemp: forecast.main.temp_min,
          maxTemp: forecast.main.temp_max,
          weather: {},
          humidity: [],
          windSpeed: [],
          precipitation: []
        });
      }
      
      const dayData = dailyForecasts.get(dateKey)!;
      dayData.temps.push(forecast.main.temp);
      dayData.minTemp = Math.min(dayData.minTemp, forecast.main.temp_min);
      dayData.maxTemp = Math.max(dayData.maxTemp, forecast.main.temp_max);
      dayData.humidity.push(forecast.main.humidity);
      dayData.windSpeed.push(forecast.wind.speed);
      dayData.precipitation.push(forecast.pop);
      
      // Count weather conditions
      const weatherMain = forecast.weather[0].main;
      dayData.weather[weatherMain] = (dayData.weather[weatherMain] || 0) + 1;
    });

    // Get the most common weather condition for each day
    const getMostCommonWeather = (weatherCounts: { [key: string]: number }) => {
      let maxCount = 0;
      let mostCommon = 'Clear';
      
      Object.entries(weatherCounts).forEach(([weather, count]) => {
        if (count > maxCount) {
          maxCount = count;
          mostCommon = weather;
        }
      });
      
      return mostCommon;
    };

    // Create forecasts starting from the selected start date
    const forecasts = [];
    
    for (let i = 0; i < days; i++) {
      // Calculate the date for this iteration without mutating the original
      const currentDate = new Date(selectedStartDate);
      currentDate.setDate(selectedStartDate.getDate() + i);
      const dateKey = currentDate.toISOString().split('T')[0];
      const dayData = dailyForecasts.get(dateKey);
      
      if (dayData) {
        const mostCommonWeather = getMostCommonWeather(dayData.weather);
        
        // Get weather description based on most common condition
        const getWeatherDescription = (weatherMain: string) => {
          switch (weatherMain.toLowerCase()) {
            case 'clear':
              return 'clear sky';
            case 'clouds':
              return 'scattered clouds';
            case 'rain':
              return 'light rain';
            case 'snow':
              return 'light snow';
            case 'thunderstorm':
              return 'thunderstorm';
            case 'drizzle':
              return 'light drizzle';
            case 'mist':
            case 'fog':
              return 'mist';
            default:
              return 'partly cloudy';
          }
        };

        forecasts.push({
          date: dateKey,
          temp: {
            min: Math.round(dayData.minTemp),
            max: Math.round(dayData.maxTemp),
            day: Math.round(dayData.temps[Math.floor(dayData.temps.length / 2)]), // Middle of day temp
            night: Math.round(dayData.temps[0]) // First forecast of the day (usually early morning)
          },
          weather: {
            main: mostCommonWeather,
            description: getWeatherDescription(mostCommonWeather),
            icon: mostCommonWeather.toLowerCase() === 'clear' ? '01d' : '02d' // Basic icon mapping
          },
          humidity: Math.round(dayData.humidity.reduce((a, b) => a + b, 0) / dayData.humidity.length),
          windSpeed: Math.round(dayData.windSpeed.reduce((a, b) => a + b, 0) / dayData.windSpeed.length * 3.6), // Convert m/s to km/h
          precipitation: Math.round(dayData.precipitation.reduce((a, b) => a + b, 0) / dayData.precipitation.length * 100) // Convert probability to percentage
        });
      } else {
        // If we don't have data for this date, create a placeholder
        forecasts.push({
          date: dateKey,
          temp: {
            min: 0,
            max: 0,
            day: 0,
            night: 0
          },
          weather: {
            main: 'Unknown',
            description: 'forecast not available',
            icon: '02d'
          },
          humidity: 0,
          windSpeed: 0,
          precipitation: 0,
          unavailable: true
        });
      }
    }

    // Calculate the actual end date for the trip
    const endDate = new Date(selectedStartDate);
    endDate.setDate(selectedStartDate.getDate() + days - 1);
    const endDateString = endDate.toISOString().split('T')[0];

    // Debug logging
    console.log('Weather API Debug:', {
      selectedStartDate: startDate,
      endDate: endDateString,
      daysFromToday,
      tripDuration: days,
      forecastDates: forecasts.map(f => f.date),
      availableDays: forecasts.filter(f => !f.unavailable).length,
      unavailableDays: forecasts.filter(f => f.unavailable).length,
      dailyForecastKeys: Array.from(dailyForecasts.keys()),
      selectedStartDateObj: selectedStartDate.toISOString(),
      todayObj: today.toISOString()
    });

    return NextResponse.json({
      success: true,
      forecasts,
      location: { lat, lon },
      tripDuration: days,
      selectedStartDate: startDate,
      endDate: endDateString,
      daysFromToday,
      note: 'Using free tier API (5-day forecast limit)',
      availableDays: forecasts.filter(f => !f.unavailable).length,
      unavailableDays: forecasts.filter(f => f.unavailable).length,
      availableDateRange: {
        from: Array.from(dailyForecasts.keys())[0] || 'No data',
        to: Array.from(dailyForecasts.keys()).slice(-1)[0] || 'No data'
      },
      message: daysFromToday > 0 
        ? `Weather forecast for ${startDate} to ${endDateString} (${days} days)`
        : `Weather forecast for today and next ${days} days`
    });

  } catch (error) {
    console.error('Weather forecast error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
