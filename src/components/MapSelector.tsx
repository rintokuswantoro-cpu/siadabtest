import React, { useState, useCallback, useEffect } from 'react';
import { APIProvider, Map, AdvancedMarker, useMap, useMapsLibrary } from '@vis.gl/react-google-maps';
import { Button } from '@/components/ui/button';
import { MapPin, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const API_KEY = process.env.GOOGLE_MAPS_PLATFORM_KEY || '';

interface MapSelectorProps {
  onLocationSelect: (lat: number, lng: number, address: string) => void;
  defaultPos?: { lat: number, lng: number };
}

function SearchBox({ onPlaceSelect }: { onPlaceSelect: (place: google.maps.places.PlaceResult) => void }) {
  const map = useMap();
  const placesLib = useMapsLibrary('places');
  const [input, setInput] = useState('');
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    if (!placesLib || !map) return;

    const inputElement = document.getElementById('pac-input') as HTMLInputElement;
    const ac = new placesLib.Autocomplete(inputElement, {
      fields: ['geometry', 'formatted_address', 'name'],
      componentRestrictions: { country: 'id' } // Restricted to Indonesia
    });

    ac.bindTo('bounds', map);
    setAutocomplete(ac);

    ac.addListener('place_changed', () => {
      const place = ac.getPlace();
      if (!place.geometry || !place.geometry.location) return;

      if (place.geometry.viewport) {
        map.fitBounds(place.geometry.viewport);
      } else {
        map.setCenter(place.geometry.location);
        map.setZoom(17);
      }
      onPlaceSelect(place);
    });
  }, [placesLib, map, onPlaceSelect]);

  return (
    <div className="absolute top-4 left-4 right-4 z-10 flex gap-2">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          id="pac-input"
          placeholder="Cari lokasi kejadian..."
          className="pl-9 bg-white/95 backdrop-blur-sm border-none shadow-lg"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
      </div>
    </div>
  );
}

export function MapSelector({ onLocationSelect, defaultPos }: MapSelectorProps) {
  const [markerPos, setMarkerPos] = useState<google.maps.LatLngLiteral | null>(defaultPos || null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handleMapClick = useCallback((e: any) => {
    if (e.detail.latLng) {
      setMarkerPos(e.detail.latLng);
    }
  }, []);

  const handleGetCurrentLocation = () => {
    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newPos = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setMarkerPos(newPos);
        setLoadingLocation(false);
      },
      (err) => {
        console.error(err);
        setLoadingLocation(false);
      }
    );
  };

  useEffect(() => {
    if (markerPos) {
      // In a real app, I'd use Geocoding API to get address here
      // For now, I'll pass a placeholder address or let the user see the coordinates
      // I'll call geocoding in a real implementation
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: markerPos }, (results, status) => {
        if (status === 'OK' && results?.[0]) {
          onLocationSelect(markerPos.lat, markerPos.lng, results[0].formatted_address);
        } else {
          onLocationSelect(markerPos.lat, markerPos.lng, `${markerPos.lat.toFixed(6)}, ${markerPos.lng.toFixed(6)}`);
        }
      });
    }
  }, [markerPos, onLocationSelect]);

  if (!API_KEY) {
    return (
      <div className="p-4 border rounded-lg bg-muted text-center">
        <p className="text-sm font-medium">Google Maps API Key Required</p>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] rounded-xl overflow-hidden border border-border shadow-inner">
      <APIProvider apiKey={API_KEY} version="weekly">
        <Map
          defaultCenter={defaultPos || { lat: -3.9882, lng: 122.5149 }} // Kendari, Sultra
          defaultZoom={13}
          onClick={handleMapClick}
          mapId="SULTRA_MAP_ID"
          internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          gestureHandling={'greedy'}
          disableDefaultUI={true}
        >
          <SearchBox onPlaceSelect={(place) => {
            if (place.geometry?.location) {
              setMarkerPos({
                lat: place.geometry.location.lat(),
                lng: place.geometry.location.lng()
              });
            }
          }} />
          {markerPos && <AdvancedMarker position={markerPos} />}
        </Map>
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4 shadow-lg bg-white/90 hover:bg-white"
          onClick={handleGetCurrentLocation}
          disabled={loadingLocation}
          type="button"
        >
          <MapPin className="mr-2 h-4 w-4" />
          {loadingLocation ? 'Mencari...' : 'Gunakan Lokasi Saya'}
        </Button>
      </APIProvider>
    </div>
  );
}
