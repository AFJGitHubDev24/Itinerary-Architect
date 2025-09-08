import React, { useEffect, useRef } from 'react';
import { Activity } from '../types';

// Let TypeScript know that L is a global object from the Leaflet script
declare const L: any;

interface MapViewProps {
  activities: Activity[];
}

const MapView: React.FC<MapViewProps> = ({ activities }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null); // To hold the map instance

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

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);
    }
    
    const map = mapInstanceRef.current;
    
    // Clear existing markers for re-renders (though in this design it's unmounted/mounted)
    map.eachLayer((layer: any) => {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    const locationsWithCoords = activities.filter(
        activity => typeof activity.latitude === 'number' && typeof activity.longitude === 'number'
    );
    
    if (locationsWithCoords.length === 0) {
        // If there are no coordinates, maybe center on a default location or do nothing.
        // For now, we just won't add markers. Let's set a default view.
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


  }, [activities]); // Re-run effect if activities change

  return (
    <div className="bg-white p-4 rounded-lg shadow-md border border-[#EAECEE]">
        <div ref={mapContainerRef} style={{ height: '450px', borderRadius: '8px' }} aria-label="Map showing itinerary locations"></div>
    </div>
  );
};

export default MapView;
