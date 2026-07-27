"use client";

import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from "react-leaflet";
import { useEffect } from "react";
import { getTierInfo } from "@/lib/ranking";
import type { RankedBarDTO } from "@/lib/types";

interface MapViewProps {
  bars: RankedBarDTO[];
  selectedBarId: string | null;
  onSelect: (barId: string) => void;
}

const CHICAGO_CENTER: [number, number] = [41.8781, -87.6298];

function FlyToSelected({ bars, selectedBarId }: Omit<MapViewProps, "onSelect">) {
  const map = useMap();

  useEffect(() => {
    const bar = bars.find((b) => b.id === selectedBarId);
    if (bar) {
      map.flyTo([bar.lat, bar.lng], Math.max(map.getZoom(), 14), {
        duration: 0.5,
      });
    }
  }, [selectedBarId, bars, map]);

  return null;
}

export default function MapView({ bars, selectedBarId, onSelect }: MapViewProps) {
  const center: [number, number] =
    bars.length > 0
      ? [
          bars.reduce((sum, b) => sum + b.lat, 0) / bars.length,
          bars.reduce((sum, b) => sum + b.lng, 0) / bars.length,
        ]
      : CHICAGO_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={12}
      scrollWheelZoom
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {bars.map((bar) => {
        const tier = getTierInfo(bar.verificationCount);
        const isSelected = bar.id === selectedBarId;
        return (
          <CircleMarker
            key={bar.id}
            center={[bar.lat, bar.lng]}
            radius={isSelected ? 12 : 9}
            pathOptions={{
              color: tier.markerColor,
              fillColor: tier.markerColor,
              fillOpacity: isSelected ? 1 : 0.75,
              weight: isSelected ? 3 : 1.5,
            }}
            eventHandlers={{ click: () => onSelect(bar.id) }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{bar.name}</p>
                <p className="text-zinc-500">{tier.label}</p>
                <p>{bar.verificationCount} verifications</p>
              </div>
            </Popup>
          </CircleMarker>
        );
      })}
      <FlyToSelected bars={bars} selectedBarId={selectedBarId} />
    </MapContainer>
  );
}
