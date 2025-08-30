# Weather Integration Setup

This guide explains how to set up the weather forecast functionality for your travel buddy application.

## Prerequisites

1. **OpenWeatherMap API Key**: You'll need a free API key from OpenWeatherMap
2. **Environment Variables**: Set up the required environment variables

## Getting OpenWeatherMap API Key

1. Go to [OpenWeatherMap](https://openweathermap.org/)
2. Sign up for a free account
3. Navigate to your API keys section
4. Copy your API key

## Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# OpenWeatherMap API Key
OPENWEATHER_API_KEY=your_actual_api_key_here

# Groq API Key (for trip planning)
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama3-70b-8192
```

## Features

The weather integration provides:

- **Date Selection**: Users can select trip start dates
- **Weather Forecast**: 5-day weather forecast for the destination (free tier limitation)
- **Daily Weather Display**: Weather information for each day of the trip
- **Weather Icons**: Visual representation of weather conditions
- **Temperature Range**: Min/max temperatures for each day
- **Additional Details**: Humidity, wind speed, and precipitation chance

## API Endpoints

- `POST /api/weather/forecast` - Fetches weather forecast for a location and date range

## Limitations

- OpenWeatherMap free tier supports up to 5 days of forecast
- Uses 3-hour interval forecasts grouped into daily summaries
- Weather data is fetched in real-time when planning trips
- Forecasts are displayed in the itinerary view for each day
- **Important**: Weather forecasts are only available for dates within the next 5 days from today
- If you select a start date more than 5 days in the future, weather data will not be available

## Usage Flow

1. User selects destination and places
2. User clicks "Plan Trip"
3. User selects trip start date and duration
4. Weather forecast is automatically fetched and displayed
5. User clicks "Generate Itinerary"
6. Weather information is included in the final itinerary
7. Weather details are shown for each day in the itinerary view

## Weather Data Display

Each day shows:
- Weather condition with emoji icon
- High/low temperatures
- Weather description
- Day temperature
- Humidity percentage
- Wind speed in km/h
- Precipitation chance (if > 0%)

## Troubleshooting

- Ensure your OpenWeatherMap API key is valid and has sufficient quota
- Check that the `.env.local` file is properly configured
- Verify that the API key is being loaded correctly
- Check browser console for any API errors
- **Weather not showing?** Make sure your trip start date is within the next 5 days
- **Future dates issue?** The free API only provides forecasts up to 5 days ahead
