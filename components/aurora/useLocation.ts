"use client";

import { useEffect, useRef, useState } from "react";

export interface UserLocation {
  lat: number;
  lon: number;
  city?: string;
  loading: boolean;
  error?: string;
}

export interface WeatherData {
  cloudCover: number;
  sunrise: string;
  sunset: string;
  loading: boolean;
}

export function useUserLocation(): UserLocation {
  const [loc, setLoc] = useState<UserLocation>({ lat: 52, lon: 21, loading: true });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLoc({ lat: 52, lon: 21, loading: false, error: "Brak geolokalizacji" });
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLoc({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          loading: false,
        });
      },
      () => {
        setLoc({ lat: 52, lon: 21, loading: false, error: "Odmowa dostępu" });
      },
      { timeout: 5000 }
    );
  }, []);

  return loc;
}

export function useWeather(lat: number, lon: number, enabled: boolean): WeatherData {
  const [weather, setWeather] = useState<WeatherData>({
    cloudCover: 50,
    sunrise: "--:--",
    sunset: "--:--",
    loading: true,
  });
  const lastFetchRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) return;

    const fetch_ = async () => {
      try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=cloudcover&daily=sunrise,sunset&current_weather=true&forecast_days=1&timezone=auto`;
        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        const hour = new Date().getHours();
        const cc = data.hourly?.cloudcover?.[hour] ?? 50;
        const sunrise = data.daily?.sunrise?.[0]?.slice(-5) ?? "--:--";
        const sunset = data.daily?.sunset?.[0]?.slice(-5) ?? "--:--";
        setWeather({ cloudCover: cc, sunrise, sunset, loading: false });
        lastFetchRef.current = Date.now();
      } catch {
        setWeather((prev) => ({ ...prev, loading: false }));
      }
    };

    fetch_();
    const id = setInterval(fetch_, 10 * 60_000);
    return () => clearInterval(id);
  }, [lat, lon, enabled]);

  return weather;
}
