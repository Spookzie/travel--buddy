import React from "react";
import { MapPin, Star, Clock, Tag, X } from "lucide-react";
import { EnrichedPlace } from "./types";

interface Props {
  place: EnrichedPlace;
  onClose: () => void;
  onPanToLocation?: (lat: number, lng: number) => void;
}

const EnrichedPlaceCard: React.FC<Props> = ({ place, onClose, onPanToLocation }) => {
  const handleViewOnMap = () => {
    if (onPanToLocation) {
      const latNum = parseFloat(place.lat);
      const lonNum = parseFloat(place.lon);
      if (!isNaN(latNum) && !isNaN(lonNum)) {
        onPanToLocation(latNum, lonNum);
      }
    }
  };

  // Helper function to render rating stars
  const renderRating = (rating?: number) => {
    if (!rating) return null;
    
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<Star key="half" className="w-4 h-4 fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - Math.ceil(rating);
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="w-4 h-4 text-gray-300" />);
    }
    
    return (
      <div className="flex items-center space-x-1">
        {stars}
        <span className="text-sm text-gray-600 ml-2">({rating.toFixed(1)})</span>
      </div>
    );
  };

  // Helper function to get time color
  const getTimeColor = (time: string) => {
    switch (time) {
      case 'morning':
        return 'bg-orange-100 text-orange-700';
      case 'afternoon':
        return 'bg-blue-100 text-blue-700';
      case 'evening':
        return 'bg-purple-100 text-purple-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="absolute top-6 right-6 w-96 bg-white rounded-2xl shadow-xl z-20 overflow-hidden">
      {/* Header with close button */}
      <div className="relative bg-gradient-to-r from-blue-500 to-purple-600 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">{place.name}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 bg-white bg-opacity-20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-opacity-30 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        
        {/* Time badge */}
        <div className="mt-2">
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getTimeColor(place.time)}`}>
            <Clock className="w-3 h-3 mr-1" />
            {place.time.charAt(0).toUpperCase() + place.time.slice(1)}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        {/* Rating */}
        {place.rating && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Rating</span>
            {renderRating(place.rating)}
          </div>
        )}

        {/* Description */}
        {place.description && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">About</h3>
            <p className="text-gray-600 text-sm leading-relaxed">{place.description}</p>
          </div>
        )}

        {/* Type and Category */}
        <div className="flex flex-wrap gap-2">
          {place.type && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
              <Tag className="w-3 h-3 mr-1" />
              {place.type}
            </span>
          )}
          {place.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
              {place.category}
            </span>
          )}
          {place.subcategory && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700">
              {place.subcategory}
            </span>
          )}
        </div>

        {/* Address */}
        {place.address && (
          <div className="flex items-start space-x-2">
            <MapPin className="w-4 h-4 text-gray-400 mt-0.5 flex-shrink-0" />
            <span className="text-sm text-gray-600">{place.address}</span>
          </div>
        )}

        {/* Coordinates */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">Location</span>
            <button
              onClick={handleViewOnMap}
              className="text-blue-600 text-sm hover:text-blue-700 transition-colors font-medium"
            >
              View on map
            </button>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            📍 {parseFloat(place.lat).toFixed(4)}, {parseFloat(place.lon).toFixed(4)}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex space-x-2 pt-2">
          <button
            onClick={handleViewOnMap}
            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <MapPin className="w-4 h-4 mr-2 inline" />
            Center Map
          </button>
        </div>
      </div>
    </div>
  );
};

export default EnrichedPlaceCard;
