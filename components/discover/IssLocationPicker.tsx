"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Locate, MapPin, X } from "lucide-react";
import { cn } from "@/lib/cn";

export type IssLocation = {
  lat: number;
  lon: number;
  name: string;
};

type NominatimResult = {
  lat: string;
  lon: string;
  display_name: string;
  address?: {
    city?: string;
    town?: string;
    village?: string;
    county?: string;
    country?: string;
  };
};

function formatNominatimName(r: NominatimResult): string {
  const a = r.address;
  if (!a) return r.display_name.split(",")[0] ?? r.display_name;
  const city = a.city ?? a.town ?? a.village ?? a.county ?? "";
  const country = a.country ?? "";
  return [city, country].filter(Boolean).join(", ");
}

type DropdownPos = { top: number; left: number; width: number };

type Props = {
  location: IssLocation | null;
  onChange: (loc: IssLocation | null) => void;
  className?: string;
};

export default function IssLocationPicker({ location, onChange, className }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<NominatimResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const [dropPos, setDropPos] = useState<DropdownPos | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const inputWrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Pozycja dropdownu relative do viewportu (position: fixed)
  const updateDropPos = useCallback(() => {
    if (!inputWrapRef.current) return;
    const rect = inputWrapRef.current.getBoundingClientRect();
    setDropPos({
      top: rect.bottom + 4,
      left: rect.left,
      width: rect.width,
    });
  }, []);

  // Aktualizuj pozycję przy scrollu i resize
  useEffect(() => {
    if (!open) return;
    updateDropPos();
    window.addEventListener("scroll", updateDropPos, true);
    window.addEventListener("resize", updateDropPos);
    return () => {
      window.removeEventListener("scroll", updateDropPos, true);
      window.removeEventListener("resize", updateDropPos);
    };
  }, [open, updateDropPos]);

  // Zamknij po kliknięciu poza
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as Node;
      const drop = document.getElementById("iss-loc-dropdown");
      if (
        inputWrapRef.current &&
        !inputWrapRef.current.contains(target) &&
        (!drop || !drop.contains(target))
      ) {
        setOpen(false);
        setResults([]);
        if (!location) setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, location]);

  const search = useCallback((q: string) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) {
      setResults([]);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const url =
          `https://nominatim.openstreetmap.org/search` +
          `?q=${encodeURIComponent(q)}&format=json&limit=5&addressdetails=1&accept-language=pl`;
        const res = await fetch(url);
        if (!res.ok) return;
        const data = (await res.json()) as NominatimResult[];
        setResults(data);
      } catch {
        // brak wyników — zostają poprzednie
      } finally {
        setSearching(false);
      }
    }, 350);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    setOpen(true);
    search(v);
  };

  const handleFocus = () => {
    setOpen(true);
    updateDropPos();
    // jeśli lokalizacja była wybrana — pokaż jej nazwę do edycji
    if (location && !query) setQuery(location.name);
  };

  const handleSelect = (r: NominatimResult) => {
    const name = formatNominatimName(r);
    onChange({
      lat: parseFloat(r.lat),
      lon: parseFloat(r.lon),
      name,
    });
    setQuery(name);
    setOpen(false);
    setResults([]);
    setGpsError(null);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(null);
    setQuery("");
    setResults([]);
    setOpen(false);
    setGpsError(null);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      setOpen(false);
      setResults([]);
      if (!location) setQuery("");
    }
  };

  const handleGps = () => {
    if (!navigator.geolocation) {
      setGpsError("Twoja przeglądarka nie obsługuje geolokalizacji");
      return;
    }
    setGpsLoading(true);
    setGpsError(null);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lon } = pos.coords;
        try {
          const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?lat=${lat}&lon=${lon}&format=json&addressdetails=1&accept-language=pl`;
          const res = await fetch(url);
          if (res.ok) {
            const data = (await res.json()) as NominatimResult;
            const name = formatNominatimName(data);
            onChange({ lat, lon, name });
            setQuery(name);
          } else {
            const name = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
            onChange({ lat, lon, name });
            setQuery(name);
          }
        } catch {
          const name = `${lat.toFixed(2)}°N, ${lon.toFixed(2)}°E`;
          onChange({ lat, lon, name });
          setQuery(name);
        }
        setGpsLoading(false);
        setOpen(false);
        setResults([]);
      },
      (err) => {
        setGpsLoading(false);
        setGpsError(err.code === 1 ? "Brak zgody na lokalizację" : "Nie udało się pobrać lokalizacji");
      },
      { timeout: 10_000, maximumAge: 300_000 },
    );
  };

  const showDropdown = open && (results.length > 0 || (query.length >= 2 && !searching));

  return (
    <div className={cn("iss-loc-picker", className)}>
      <div ref={inputWrapRef} className="iss-loc-picker__row">
        {/* Pin icon — pokazuje się gdy lokalizacja wybrana */}
        {location ? (
          <MapPin size={11} aria-hidden className="iss-loc-picker__pin-icon" />
        ) : (
          <span className="iss-loc-picker__search-dot" aria-hidden />
        )}

        <input
          ref={inputRef}
          type="text"
          className={cn(
            "iss-loc-picker__input",
            location && "iss-loc-picker__input--selected",
          )}
          placeholder="wpisz swoją lokalizację"
          value={query}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          spellCheck={false}
          aria-label="Szukaj lokalizacji"
        />

        {searching && <span className="iss-loc-picker__spinner" aria-hidden />}

        {(location || query) && (
          <button
            className="iss-loc-picker__clear"
            onClick={handleClear}
            type="button"
            title="Wyczyść lokalizację"
          >
            <X size={10} aria-hidden />
          </button>
        )}

        <button
          className={cn("iss-loc-picker__gps", gpsLoading && "iss-loc-picker__gps--loading")}
          onClick={handleGps}
          disabled={gpsLoading}
          title="Użyj mojej lokalizacji"
          type="button"
          aria-label="Pobierz lokalizację GPS"
        >
          {gpsLoading ? (
            <span className="iss-loc-picker__spinner iss-loc-picker__spinner--gps" aria-hidden />
          ) : (
            <Locate size={12} aria-hidden />
          )}
        </button>
      </div>

      {gpsError && <p className="iss-loc-picker__error">{gpsError}</p>}

      {/* Dropdown — position:fixed żeby nie był clipped przez rodzica */}
      {showDropdown && dropPos && (
        <ul
          id="iss-loc-dropdown"
          className="iss-loc-picker__dropdown"
          style={{
            position: "fixed",
            top: dropPos.top,
            left: dropPos.left,
            width: dropPos.width,
          }}
          role="listbox"
        >
          {results.length > 0
            ? results.map((r, i) => (
                <li key={i} role="option" aria-selected={false}>
                  <button
                    className="iss-loc-picker__option"
                    onMouseDown={(e) => {
                      e.preventDefault(); // nie blur input przed klikiem
                      handleSelect(r);
                    }}
                    type="button"
                  >
                    <MapPin size={10} aria-hidden className="iss-loc-picker__option-pin" />
                    <span>{formatNominatimName(r)}</span>
                  </button>
                </li>
              ))
            : (
              <li className="iss-loc-picker__no-results">
                Brak wyników dla „{query}"
              </li>
            )}
        </ul>
      )}
    </div>
  );
}
