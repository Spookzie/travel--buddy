import React, { useState } from "react";
import { ArrowLeft, Calendar, MapPin, Clock, ChevronDown, ChevronUp, Star, Info, Cloud, Thermometer, Droplets, Wind } from "lucide-react";
import { Itinerary, EnrichedPlace, WeatherForecast } from "./types";

interface Props {
  itinerary: Itinerary;
  onBack: () => void;
  onPanToLocation: (lat: number, lng: number) => void;
  onPlaceClick?: (place: EnrichedPlace) => void; // New prop for place selection
}

const ItineraryView: React.FC<Props> = ({ itinerary, onBack, onPanToLocation, onPlaceClick }) => {
  const [expandedDays, setExpandedDays] = useState<number[]>([1]); // First day expanded by default

  const toggleDayExpansion = (day: number) => {
    setExpandedDays(prev =>
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handlePlaceClick = (lat: string, lon: string) => {
    const latNum = parseFloat(lat);
    const lonNum = parseFloat(lon);
    if (!isNaN(latNum) && !isNaN(lonNum)) {
      onPanToLocation(latNum, lonNum);
    }
  };

  const handlePlaceSelect = (place: EnrichedPlace) => {
    if (onPlaceClick) {
      onPlaceClick(place);
    }
  };

  // Helper function to render rating stars
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-3 h-3 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-3 h-3 text-gray-300" />);
    }
    
    return (
      <div className="flex items-center space-x-1">
        {stars}
        <span className="text-xs text-gray-600 ml-1">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Helper function to format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  // Helper function to get weather icon
  const getWeatherIcon = (weatherMain: string) => {
    switch (weatherMain.toLowerCase()) {
      case 'clear':
        return (
          <svg className="w-6 h-6 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case 'clouds':
        return (
          <svg className="w-6 h-6 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
      case 'rain':
        return (
          <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M7 18a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
            <path d="M8 20a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case 'snow':
        return (
          <svg className="w-6 h-6 text-blue-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M8 18a1 1 0 100-2 1 1 0 000 2zm4 0a1 1 0 100-2 1 1 0 000 2z" />
            <path d="M10 20a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case 'thunderstorm':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M10 12a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1zM8 16a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case 'drizzle':
        return (
          <svg className="w-6 h-6 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M7 18a1 1 0 100-2 1 1 0 000 2zm6 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      case 'mist':
      case 'fog':
        return (
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
            <path d="M3 18a1 1 0 100-2 1 1 0 000 2zm14 0a1 1 0 100-2 1 1 0 000 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 16a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 16h-8z" />
          </svg>
        );
    }
  };

  // Helper function to render weather info
  const renderWeatherInfo = (weather: WeatherForecast) => {
    if (weather.unavailable) {
      return (
        <div className="bg-gray-50 rounded-lg p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cloud className="w-4 h-4 text-gray-500" />
              <span className="text-sm font-medium text-gray-700">Weather</span>
            </div>
            <div className="text-sm text-gray-500">
              Forecast not available
            </div>
          </div>
          
          <div className="text-xs text-gray-500 text-center">
            Weather data is not available for this date
          </div>
        </div>
      );
    }

    return (
      <div className="bg-blue-50 rounded-lg p-3 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cloud className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-gray-900">Weather</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-lg">{getWeatherIcon(weather.weather.main)}</span>
            <span className="text-sm font-semibold text-gray-900">
              {weather.temp.max}° / {weather.temp.min}°
            </span>
          </div>
        </div>
        
        <div className="text-xs text-gray-600 text-center">
          {weather.weather.description}
        </div>
        
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="flex items-center space-x-1 justify-center">
            <Thermometer className="w-3 h-3 text-red-500" />
            <span className="text-gray-600">{weather.temp.day}°</span>
          </div>
          <div className="flex items-center space-x-1 justify-center">
            <Droplets className="w-3 h-3 text-blue-500" />
            <span className="text-gray-600">{weather.humidity}%</span>
          </div>
          <div className="flex items-center space-x-1 justify-center">
            <Wind className="w-3 h-3 text-gray-500" />
            <span className="text-gray-600">{weather.windSpeed} km/h</span>
          </div>
        </div>
        
        {weather.precipitation > 0 && (
          <div className="text-xs text-center text-blue-600">
            {weather.precipitation}% chance of rain
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="absolute top-6 right-6 z-10 w-96 bg-white rounded-xl shadow-lg border border-gray-200 max-h-[40rem] overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back</span>
        </button>
        <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-green-500" />
          <span>Your Itinerary</span>
        </h3>
      </div>

      {/* Trip Summary */}
      {itinerary.startDate && (
        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Trip Start:</span>
            <span className="font-medium text-gray-900">
              {formatDate(itinerary.startDate)}
            </span>
          </div>
          <div className="flex items-center justify-between text-sm mt-1">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900">
              {itinerary.days} day{itinerary.days !== 1 ? 's' : ''}
            </span>
          </div>
        </div>
      )}

      {/* Itinerary Content */}
      <div className="max-h-96 overflow-y-auto">
        {itinerary.itinerary.length > 0 ? (
          <div className="p-4 space-y-4">
            {itinerary.itinerary.map((day) => {
              const isExpanded = expandedDays.includes(day.day);
              const dayWeather = itinerary.weatherForecast?.[day.day - 1];
              const dayDate = itinerary.startDate ? 
                new Date(itinerary.startDate) : null;
              if (dayDate) {
                dayDate.setDate(dayDate.getDate() + day.day - 1);
              }
              
              return (
                <div
                  key={day.day}
                  className="border border-gray-200 rounded-lg overflow-hidden"
                >
                  {/* Day Header */}
                  <button
                    onClick={() => toggleDayExpansion(day.day)}
                    className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        {day.day}
                      </div>
                      <div className="text-left">
                        <h4 className="text-sm font-semibold text-gray-900">
                          Day {day.day}
                        </h4>
                        <div className="flex items-center space-x-2">
                          <p className="text-xs text-gray-500">
                            {day.places.length} place{day.places.length !== 1 ? 's' : ''}
                          </p>
                          {dayDate && (
                            <span className="text-xs text-blue-600 font-medium">
                              {formatDate(dayDate.toISOString())}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    )}
                  </button>

                  {/* Day Content */}
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {/* Weather Information */}
                      {dayWeather && (
                        <div className="mb-3">
                          {renderWeatherInfo(dayWeather)}
                        </div>
                      )}
                      
                      {/* Places */}
                      {day.places.length > 0 ? (
                        <div className="space-y-2">
                          <h5 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                            Places to Visit
                          </h5>
                          {day.places.map((place, index) => (
                            <div key={index} className="space-y-2">
                              {/* Place Card - Clickable for details */}
                              <button
                                onClick={() => handlePlaceSelect(place)}
                                className="w-full p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition-all text-left group cursor-pointer"
                              >
                                <div className="flex items-start space-x-3">
                                  <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 group-hover:bg-green-200 transition-colors">
                                    <MapPin className="w-3 h-3 text-green-600" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <h6 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                      {place.name}
                                    </h6>
                                    
                                    {/* Rating */}
                                    {place.rating && (
                                      <div className="mt-1">
                                        {renderRating(place.rating)}
                                      </div>
                                    )}
                                    
                                    {/* Description */}
                                    {place.description && (
                                      <p className="text-xs text-gray-600 mt-2 leading-relaxed line-clamp-2">
                                        {place.description}
                                      </p>
                                    )}
                                    
                                    {/* Time and Type */}
                                    <div className="flex items-center space-x-2 mt-2">
                                      <span className="text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full capitalize">
                                        {place.time}
                                      </span>
                                      {place.type && (
                                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                                          {place.type}
                                        </span>
                                      )}
                                    </div>
                                    
                                    {/* Category and Address */}
                                    <div className="flex items-center space-x-2 mt-2">
                                      {place.category && (
                                        <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                          {place.category}
                                        </span>
                                      )}
                                      {place.address && (
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                          <MapPin className="w-3 h-3" />
                                          <span>{place.address}</span>
                                        </div>
                                      )}
                                    </div>
                                    
                                    <p className="text-xs text-blue-600 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                      Click for details
                                    </p>
                                  </div>
                                </div>
                              </button>
                              
                              {/* Map Button - Separate from details button */}
                              <button
                                onClick={() => handlePlaceClick(place.lat, place.lon)}
                                className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors text-left text-xs text-gray-600 flex items-center space-x-2"
                              >
                                <MapPin className="w-3 h-3 text-gray-500" />
                                <span>View on map</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Clock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm">No places planned for this day</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              No Itinerary Available
            </h4>
            <p className="text-sm text-gray-500">
              There was an issue generating your itinerary. Please try again.
            </p>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            {itinerary.itinerary.length} day{itinerary.itinerary.length !== 1 ? 's' : ''} planned
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setExpandedDays(itinerary.itinerary.map(d => d.day))}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Expand All
            </button>
            <button
              onClick={() => setExpandedDays([])}
              className="px-3 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            >
              Collapse All
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ItineraryView;