import React, { useEffect, useRef } from 'react';
import { Activity } from '../types';

// Let TypeScript know that L is a global object from the Leaflet script
declare const L: any;

interface MapViewProps {
  activities: Activity[];
  theme: 'light' | 'dark';
}

const lightTileLayer = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const lightAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

const darkTileLayer = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const darkAttribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>';


const MapView: React.FC<MapViewProps> = ({ activities, theme }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // To hold the map instance
  const tileLayerRef = useRef<any>(null); // To hold the tile layer instance

  useEffect(() => {
    // Ensure Leaflet is loaded and the container ref is available
    if (typeof L === 'undefined' || !mapContainerRef.current) {
        console.error("Leaflet is not loaded or map container is not available.");
        return;
    }

    // Initialize map only once
    if (!mapInstanceRef.current) {
        const map = L.map(mapContainerRef.current);
        mapInstanceRef.current = map;
    }
    
    const map = mapInstanceRef.current;

    // Update tile layer based on theme
    if (tileLayerRef.current) {
        map.removeLayer(tileLayerRef.current);
    }
    
    const isDark = theme === 'dark';
    const newTileLayerUrl = isDark ? darkTileLayer : lightTileLayer;
    const newAttribution = isDark ? darkAttribution : lightAttribution;

    tileLayerRef.current = L.tileLayer(newTileLayerUrl, {
        attribution: newAttribution,
    }).addTo(map);
    
    // Clear existing markers for re-renders
    map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const locationsWithCoords = activities.filter(
        activity => typeof activity.latitude === 'number' && typeof activity.longitude === 'number'
    );
    
    if (locationsWithCoords.length === 0) {
        map.setView([20, 0], 2); // A generic world view
        return;
    }

    const markerGroup = L.featureGroup();

    locationsWithCoords.forEach(activity => {
        const marker = L.marker([activity.latitude!, activity.longitude!]);
        marker.bindPopup(`<b>${activity.title}</b><br>${activity.time}`);
        markerGroup.addLayer(marker);
    });

    markerGroup.addTo(map);
    
    // Fit map bounds to show all markers
    map.fitBounds(markerGroup.getBounds(), { padding: [50, 50] });

    // Invalidate size to fix potential grey-screen issue when container is shown/hidden
    setTimeout(() => {
        map.invalidateSize();
    }, 100);


  }, [activities, theme]); // Re-run effect if activities or theme change

  return (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-[#EAECEE] dark:border-gray-700">
        <div ref={mapContainerRef} style={{ height: '450px', borderRadius: '8px' }} aria-label="Map showing itinerary locations"></div>
    </div>
  );
};

export default MapView;