"use client";

import { useEffect, useMemo, useState } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";

const STORE_LATITUDE = 29.952070485013405;
const STORE_LONGITUDE = 30.960877742832103;

function distanceInKm(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
) {
  const earthRadius = 6371;

  const toRadians = (value: number) => (value * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(lat1)) *
      Math.cos(toRadians(lat2)) *
      Math.sin(dLon / 2) ** 2;

  return (
    earthRadius *
    2 *
    Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  );
}

/* =========================================================
   MARKER
========================================================= */

const markerIcon = L.divIcon({
  className: "comfort-map-marker",
  html: `
    <div
      style="
        width:42px;
        height:42px;
        border-radius:9999px;
        background:#171717;
        border:3px solid #ffffff;
        box-shadow:0 5px 18px rgba(0,0,0,.30);
        display:flex;
        align-items:center;
        justify-content:center;
        font-size:21px;
      "
    >
      📍
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

/* =========================================================
   MAP CLICK
========================================================= */

function LocationClickHandler({
  onSelect,
}: {
  onSelect: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(event) {
      onSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  return null;
}

/* =========================================================
   CENTER MAP
========================================================= */

function MapCenter({
  latitude,
  longitude,
}: {
  latitude: number;
  longitude: number;
}) {
  const map = useMap();

  useEffect(() => {
    map.setView([latitude, longitude], 17, {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

/* =========================================================
   IMPORTANT:
   FIX LEAFLET MAP SIZE AFTER CONTAINER LOAD
========================================================= */

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    let frameId = 0;

    const resize = () => {
      window.cancelAnimationFrame(frameId);

      frameId = window.requestAnimationFrame(() => {
        if (!container.isConnected) return;

        const { width, height } = container.getBoundingClientRect();

        // Skip resizing while the map is hidden or has no dimensions.
        if (width === 0 || height === 0) return;

        map.invalidateSize({
          pan: false,
          animate: false,
          debounceMoveend: true,
        });
      });
    };

    // Resize immediately and after the browser completes layout.
    resize();

    const timers = [100, 300, 700, 1200].map((delay) =>
      window.setTimeout(resize, delay)
    );

    // Watch the map container itself, not only the browser window.
    const observer = new ResizeObserver(() => {
      resize();
    });

    observer.observe(container);
    window.addEventListener("resize", resize);

    return () => {
      window.cancelAnimationFrame(frameId);
      timers.forEach((timer) => window.clearTimeout(timer));
      observer.disconnect();
      window.removeEventListener("resize", resize);
    };
  }, [map]);

  return null;
}

/* =========================================================
   MAP CONTROLS
========================================================= */

function MapControls() {
  const map = useMap();

  function zoomIn() {
    map.zoomIn();
  }

  function zoomOut() {
    map.zoomOut();
  }

  function resetView() {
    map.setView(
      [STORE_LATITUDE, STORE_LONGITUDE],
      13,
      {
        animate: true,
      }
    );
  }

  return (
    <div
      className="
        absolute
        bottom-5
        left-5
        z-[1000]
        flex
        flex-col
        overflow-hidden
        rounded-xl
        border
        border-gray-200
        bg-white
        shadow-lg
      "
    >
      {/* ZOOM IN */}
      <button
        type="button"
        onClick={zoomIn}
        aria-label="تكبير الخريطة"
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          border-b
          border-gray-200
          text-xl
          font-medium
          text-[#171717]
          transition
          hover:bg-gray-50
          active:bg-gray-100
        "
      >
        +
      </button>

      {/* ZOOM OUT */}
      <button
        type="button"
        onClick={zoomOut}
        aria-label="تصغير الخريطة"
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          border-b
          border-gray-200
          text-xl
          font-medium
          text-[#171717]
          transition
          hover:bg-gray-50
          active:bg-gray-100
        "
      >
        −
      </button>

      {/* RESET */}
      <button
        type="button"
        onClick={resetView}
        aria-label="إظهار منطقة المتجر"
        className="
          flex
          h-11
          w-11
          items-center
          justify-center
          text-sm
          font-bold
          text-[#171717]
          transition
          hover:bg-gray-50
          active:bg-gray-100
        "
      >
        ⌖
      </button>
    </div>
  );
}

/* =========================================================
   LOCATION PICKER
========================================================= */

export default function LocationPicker({
  latitude,
  longitude,
  onLocationChange,
}: {
  latitude: number | null;
  longitude: number | null;
  onLocationChange: (location: {
    latitude: number;
    longitude: number;
    distanceKm: number;
  }) => void;
}) {
  const [locating, setLocating] = useState(false);

  const selectedPosition = useMemo<[number, number] | null>(() => {
    if (latitude === null || longitude === null) {
      return null;
    }

    return [latitude, longitude];
  }, [latitude, longitude]);

  /* =========================================================
     SELECT LOCATION
  ========================================================= */

  function selectLocation(lat: number, lng: number) {
    const distanceKm = distanceInKm(
      STORE_LATITUDE,
      STORE_LONGITUDE,
      lat,
      lng
    );

    onLocationChange({
      latitude: lat,
      longitude: lng,
      distanceKm,
    });
  }

  /* =========================================================
     CURRENT LOCATION
  ========================================================= */

  function useCurrentLocation() {
    if (!navigator.geolocation) {
      alert("المتصفح لا يدعم تحديد الموقع.");
      return;
    }

    setLocating(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        selectLocation(
          position.coords.latitude,
          position.coords.longitude
        );

        setLocating(false);
      },
      () => {
        setLocating(false);

        alert(
          "تعذر تحديد موقعك. يمكنك تحديد الموقع يدويًا من الخريطة."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
      }
    );
  }

  /* =========================================================
     MAP CENTER
  ========================================================= */

  const center: [number, number] = selectedPosition ?? [
    STORE_LATITUDE,
    STORE_LONGITUDE,
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

      {/* =====================================================
          MAP
      ===================================================== */}

      <div className="relative h-[300px] w-full sm:h-[560px]">

<MapContainer
  center={center}
  zoom={selectedPosition ? 17 : 13}
  minZoom={9}
  maxZoom={19}
  scrollWheelZoom={true}
  doubleClickZoom={true}
  dragging={true}
  touchZoom={true}
  zoomControl={false}
  attributionControl={true}
  className="w-full"
  style={{
    width: "100%",
    height: "280px",
    minHeight: "280px",
    background: "#e5e3df",
  }}
>



          {/* =================================================
              TILE LAYER
          ================================================= */}

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            tileSize={256}
            updateWhenIdle={false}
            updateWhenZooming={true}
            keepBuffer={4}
            detectRetina={true}
          />

          {/* FIX MAP SIZE */}
          <MapResizeHandler />

          {/* CLICK ON MAP */}
          <LocationClickHandler
            onSelect={selectLocation}
          />

          {/* CUSTOM CONTROLS */}
          <MapControls />

          {/* SELECTED MARKER */}
          {selectedPosition && (
            <Marker
              position={selectedPosition}
              icon={markerIcon}
            />
          )}

          {/* CENTER AFTER LOCATION SELECTION */}
          {selectedPosition && (
            <MapCenter
              latitude={latitude!}
              longitude={longitude!}
            />
          )}

        </MapContainer>

        {/* =================================================
            INSTRUCTION CARD
        ================================================= */}

        <div
          className="
            absolute
            left-4
            top-4
            z-[1000]
            max-w-[270px]
            rounded-2xl
            border
            border-white/70
            bg-white/95
            px-4
            py-3
            text-right
            shadow-lg
            backdrop-blur
          "
        >
          <p className="text-sm font-bold text-[#171717]">
            حدد موقع التوصيل
          </p>

          <p className="mt-1 text-[11px] leading-5 text-gray-500">
            حرّك الخريطة وابحث عن منطقتك، ثم اضغط على مكان منزلك.
          </p>
        </div>

        {/* =================================================
            CURRENT LOCATION BUTTON
        ================================================= */}

        <button
          type="button"
          onClick={useCurrentLocation}
          disabled={locating}
          className="
            absolute
            bottom-5
            right-5
            z-[1000]
            flex
            items-center
            gap-2
            rounded-xl
            border
            border-gray-200
            bg-white
            px-4
            py-3
            text-sm
            font-semibold
            text-[#171717]
            shadow-lg
            transition
            hover:bg-gray-50
            active:scale-[0.98]
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <span className="text-base">
            {locating ? "⏳" : "📍"}
          </span>

          <span>
            {locating
              ? "جاري تحديد الموقع..."
              : "استخدم موقعي الحالي"}
          </span>
        </button>

      </div>

      {/* =====================================================
          BOTTOM INFO
      ===================================================== */}

      <div
        className="
          flex
          flex-col
          gap-3
          border-t
          border-gray-200
          bg-white
          px-5
          py-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <p className="text-sm font-semibold text-[#171717]">
            موقع التوصيل
          </p>

          <p className="mt-1 text-xs text-gray-500">
            حرّك الخريطة أو استخدم أزرار التكبير للوصول للمكان بدقة.
          </p>
        </div>

        {latitude !== null && longitude !== null ? (
          <div
            className="
              inline-flex
              w-fit
              items-center
              gap-2
              rounded-full
              bg-green-50
              px-4
              py-2
              text-xs
              font-semibold
              text-green-700
            "
          >
            <span>✓</span>

            <span>
              تم تحديد الموقع
            </span>
          </div>
        ) : (
          <div
            className="
              inline-flex
              w-fit
              items-center
              rounded-full
              bg-gray-100
              px-4
              py-2
              text-xs
              font-medium
              text-gray-500
            "
          >
            لم يتم تحديد الموقع
          </div>
        )}
      </div>

    </div>
  );
}