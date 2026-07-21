"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { whatsappNumber, telHref, type Dealer } from "@/lib/dealer-types";

const greenIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#1F5C3D;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const goldIcon = L.divIcon({
  className: "",
  html: `<span style="display:block;width:18px;height:18px;border-radius:9999px;background:#C89A4B;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)"></span>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

function FitBounds({ pins }: { pins: Dealer[] }) {
  const map = useMap();
  useEffect(() => {
    if (pins.length > 1) {
      const bounds = L.latLngBounds(pins.map((p) => [p.latitude!, p.longitude!]));
      if (bounds.isValid()) {
        map.fitBounds(bounds, { padding: [30, 30] });
      }
    }
  }, [map, pins]);
  return null;
}

export default function DealerMap({ dealers }: { dealers: Dealer[] }) {
  const pins = dealers.filter((d) => d.latitude != null && d.longitude != null);

  return (
    <div className="overflow-hidden rounded-3xl border border-line">
      <MapContainer
        className="h-[420px] w-full md:h-[520px]"
        scrollWheelZoom={false}
        center={[-29, 24]}
        zoom={5}
      >
        <TileLayer
          attribution="&copy; OpenStreetMap contributors"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {pins.map((d) => {
          const wa = whatsappNumber(d.phone, d.country);
          return (
            <Marker
              key={d.id}
              position={[d.latitude!, d.longitude!]}
              icon={d.isDepot ? goldIcon : greenIcon}
            >
              <Popup>
                <div className="text-sm">
                  <strong>{d.areas[0] || d.name}</strong>
                  {d.name && <div>{d.name}</div>}
                  {d.business && <div>{d.business}</div>}
                  <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1">
                    {d.phone && (
                      <a
                        href={telHref(d.phone)}
                        className="text-forest underline"
                      >
                        Call
                      </a>
                    )}
                    {wa && (
                      <a
                        href={`https://wa.me/${wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-forest underline"
                      >
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              </Popup>
            </Marker>
          );
        })}
        <FitBounds pins={pins} />
      </MapContainer>
    </div>
  );
}
