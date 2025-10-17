'use client';

import { useState, useEffect } from 'react';
import {
  MapContainer as LeafletMap,
  TileLayer,
  Marker,
  Popup,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export function EventMap({
  venue,
  address,
  coordinates,
}: {
  venue: string;
  address: string;
  coordinates?: [number, number];
}) {
  // Usar las coordenadas si están disponibles, de lo contrario usar la dirección para geocodificar
  const [mapPosition, setMapPosition] = useState<[number, number] | null>(
    coordinates || null
  );

  useEffect(() => {
    // Si ya tenemos coordenadas, no necesitamos geocodificar
    if (coordinates) {
      setMapPosition(coordinates);
      return;
    }

    // Código de geocodificación existente si no hay coordenadas...
  }, [coordinates, address, venue]);

  // Renderizar el mapa usando las coordenadas
  return (
    <div className='h-64 w-full rounded-lg overflow-hidden'>
      {mapPosition ? (
        <div className='h-full w-full'>
          {/* Renderizar el mapa con las coordenadas exactas */}
          <LeafletMap
            center={mapPosition}
            zoom={15}
            scrollWheelZoom={false}
            className='h-full w-full'
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
            />
            <Marker position={mapPosition}>
              <Popup>
                <b>{venue}</b>
                <br />
                {address}
              </Popup>
            </Marker>
          </LeafletMap>
        </div>
      ) : (
        <div className='flex items-center justify-center h-full bg-white/5'>
          <p className='text-gray-400'>No se pudo cargar el mapa</p>
        </div>
      )}
    </div>
  );
}
