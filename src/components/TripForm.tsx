import React, { useState } from "react";
import { ArrowLeft, Calendar, DollarSign, Sparkles, Loader, Cloud } from "lucide-react";
import { Place, Destination, Itinerary, TripRequest, WeatherForecast } from "./types";

interface Props {
  destination: Destination;
  selectedPlaces: Place[];
  onTripPlanned: (itinerary: Itinerary) => void;
  onBack: () => void;
}

const TripForm: React.FC<Props> = ({ destination, selectedPlaces, onTripPlanned, onBack }) => {
  const [days, setDays] = useState(3);
  const [budget, setBudget] = useState<"low" | "moderate" | "luxury">("moderate");
  const [startDate, setStartDate] = useState(() => {
    // Default to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [weatherForecast, setWeatherForecast] = useState<WeatherForecast[] | null>(null);
  const [showWeather, setShowWeather] = useState(false);
  const [weatherError, setWeatherError] = useState<string | null>(null);
  const [weatherEndDate, setWeatherEndDate] = useState<string | null>(null);

  const budgetOptions = [
    { value: "low", label: "Budget", icon: "💰", description: "Affordable options" },
    { value: "moderate", label: "Moderate", icon: "💳", description: "Mid-range experiences" },
    { value: "luxury", label: "Luxury", icon: "💎", description: "Premium experiences" }
  ] as const;

  // Fetch weather forecast when dates or days change
  const fetchWeatherForecast = async () => {
    if (days > 5) {
      setWeatherForecast(null);
      return;
    }

    try {
      const response = await fetch('/api/weather/forecast', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          lat: destination.latitude.toString(),
          lon: destination.longitude.toString(),
          startDate,
          days
        })
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Weather API Response:', data);
        if (data.success) {
          setWeatherForecast(data.forecasts);
          setWeatherError(null);
          setWeatherEndDate(data.endDate || null);
          console.log('Weather dates:', {
            startDate,
            endDate: data.endDate,
            forecastDates: data.forecasts.map((f: any) => f.date)
          });
        } else {
          console.warn('Weather forecast not available:', data.error);
          setWeatherForecast(null);
          setWeatherError(data.message || data.error);
          setWeatherEndDate(null);
        }
      } else {
        console.warn('Weather forecast request failed:', response.status);
        setWeatherForecast(null);
        setWeatherError('Failed to fetch weather data');
        setWeatherEndDate(null);
      }
    } catch (error) {
      console.error('Failed to fetch weather forecast:', error);
      setWeatherForecast(null);
    }
  };

  // Update weather when dates or days change
  React.useEffect(() => {
    fetchWeatherForecast();
  }, [startDate, days, destination.latitude, destination.longitude]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const tripRequest: TripRequest = {
      destination: {
        name: destination.name,
        lat: destination.latitude.toString(),
        lon: destination.longitude.toString()
      },
      places: selectedPlaces.map(place => ({
        name: place.name,
        lat: place.lat.toString(),
        lon: place.lon.toString(),
        type: place.type
      })),
      days: days,
      budget: budget,
      startDate: startDate
    };

    try {
      const response = await fetch('/api/trip/plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tripRequest)
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`Failed to plan trip: ${response.status} - ${errorData}`);
      }

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.success && data.itinerary) {
        // Add weather forecast to the itinerary
        const itineraryWithWeather = {
          ...data.itinerary,
          startDate: startDate,
          weatherForecast: weatherForecast
        };
        onTripPlanned(itineraryWithWeather);
      } else {
        throw new Error('Invalid response format from trip planning service');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to plan trip');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to calculate end date
  const calculateEndDate = (startDate: string, days: number) => {
    const start = new Date(startDate);
    const end = new Date(start);
    end.setDate(start.getDate() + days - 1);
    return end.toISOString().split('T')[0];
  };

  // Helper function to get weather icon
  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return (
          <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case 'clouds':
        return (
          <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
      case 'rain':
        return (
          <svg className="w-5 h-5 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M7 18a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
            <path d="M8 20a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case 'snow':
        return (
          <svg className="w-5 h-5 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M8 18a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
            <path d="M10 20a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case 'thunderstorm':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M10 12a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM8 16a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case 'drizzle':
        return (
          <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M7 18a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case 'mist':
      case 'fog':
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M3 18a1 1 0 100-2 1 1 0 000 2zm14 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
    }
  };

  return (
    <div className="absolute top-6 right-6 z-10 w-96 bg-white rounded-xl shadow-lg border border-gray-200 max-h-[90vh] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          disabled={loading}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-blue-500" />
          <span>Plan Your Trip</span>
        </h3>
      </div>

      <form onSubmit={handleSubmit} className="p-4 space-y-6">
        {/* Destination Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-900 mb-2">{destination.name}</h4>
          <p className="text-sm text-gray-600 mb-2">
            {selectedPlaces.length} place{selectedPlaces.length !== 1 ? 's' : ''} selected:
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedPlaces.slice(0, 3).map((place, index) => (
              <span
                key={place.id}
                className="inline-block px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                {place.name}
              </span>
            ))}
            {selectedPlaces.length > 3 && (
              <span className="inline-block px-2 py-1 bg-gray-200 text-gray-600 text-xs rounded-full">
                +{selectedPlaces.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Start Date Selection */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>Trip Start Date</span>
          </label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            disabled={loading}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900"
          />
        </div>

        {/* Days Selection */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <Calendar className="w-4 h-4" />
            <span>Trip Duration</span>
          </label>
          <div className="flex items-center space-x-4">
            <button
              type="button"
              onClick={() => setDays(Math.max(1, days - 1))}
              disabled={loading || days <= 1}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
            >
              -
            </button>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">{days}</div>
              <div className="text-xs text-gray-500">day{days !== 1 ? 's' : ''}</div>
            </div>
            <button
              type="button"
              onClick={() => setDays(Math.min(14, days + 1))}
              disabled={loading || days >= 14}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center text-gray-600"
            >
              +
            </button>
          </div>
          <div className="text-xs text-gray-500 text-center">
            Choose between 1-14 days
          </div>
        </div>

        {/* Weather Forecast Preview */}
        {days <= 5 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <Cloud className="w-4 h-4" />
                <span>Weather Forecast</span>
              </label>
              {weatherForecast && !weatherError && (
                <button
                  type="button"
                  onClick={() => setShowWeather(!showWeather)}
                  className="text-xs text-blue-600 hover:text-blue-800"
                >
                  {showWeather ? 'Hide' : 'Show'}
                </button>
              )}
            </div>
            
            {weatherError ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <div className="text-xs text-yellow-800 font-medium mb-1">
                  ⚠️ Weather Forecast Limitation
                </div>
                <div className="text-xs text-yellow-700">
                  {weatherError}
                </div>
                <div className="text-xs text-yellow-600 mt-2">
                  Tip: Select a start date within the next 5 days for weather forecasts.
                </div>
              </div>
            ) : weatherForecast ? (
              showWeather && (
                <div className="bg-blue-50 rounded-lg p-3 space-y-2">
                  <div className="text-xs text-gray-600 mb-2">
                    {formatDate(startDate)} - {weatherEndDate ? formatDate(weatherEndDate) : formatDate(calculateEndDate(startDate, days))}
                  </div>
                  <div className="text-xs text-blue-600 text-center mb-2">
                    Weather data available for your selected dates
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {weatherForecast.slice(0, 3).map((forecast, index) => (
                      <div key={index} className="text-center">
                        <div className="text-xs text-gray-600">{formatDate(forecast.date)}</div>
                        {forecast.unavailable ? (
                          <div className="text-lg font-semibold text-gray-400">N/A</div>
                        ) : (
                          <>
                            <div className="text-lg font-semibold">{forecast.temp.max}°</div>
                            <div className="flex justify-center mt-1">
                              {getWeatherIcon(forecast.weather.main)}
                            </div>
                          </>
                        )}
                        <div className="text-xs text-gray-500">
                          {forecast.unavailable ? 'No data' : forecast.weather.description}
                        </div>
                      </div>
                    ))}
                  </div>
                  {days > 3 && (
                    <div className="text-xs text-gray-500 text-center">
                      +{days - 3} more days
                    </div>
                  )}
                  {weatherForecast.some(f => f.unavailable) && (
                    <div className="text-xs text-blue-600 text-center mt-2">
                      Some dates may not have weather data available
                    </div>
                  )}
                </div>
              )
            ) : (
              <div className="bg-gray-50 rounded-lg p-3 text-center">
                <div className="text-xs text-gray-500">
                  {days > 5 ? 'Weather forecast available for trips up to 5 days' : 'Weather forecast loading...'}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Budget Selection */}
        <div className="space-y-3">
          <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
            <DollarSign className="w-4 h-4" />
            <span>Budget Level</span>
          </label>
          <div className="space-y-2">
            {budgetOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${budget === option.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:bg-gray-50'
                  }`}
              >
                <input
                  type="radio"
                  value={option.value}
                  checked={budget === option.value}
                  onChange={(e) => setBudget(e.target.value as typeof budget)}
                  disabled={loading}
                  className="sr-only"
                />
                <div className="text-lg">{option.icon}</div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">
                    {option.label}
                  </div>
                  <div className="text-xs text-gray-500">
                    {option.description}
                  </div>
                </div>
                {budget === option.value && (
                  <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  </div>
                )}
              </label>
            ))}
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-100 border border-red-200 rounded-lg">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || selectedPlaces.length === 0}
          className={`w-full py-3 px-4 rounded-lg text-sm font-medium transition-colors flex items-center justify-center space-x-2 ${loading || selectedPlaces.length === 0
            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
        >
          {loading ? (
            <>
              <Loader className="w-4 h-4 animate-spin" />
              <span>Creating Your Itinerary...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              <span>Generate Itinerary</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default TripForm;