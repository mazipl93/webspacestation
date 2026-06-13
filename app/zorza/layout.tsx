import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terminal Zorzy Polarnej — Live Space Weather",
  description:
    "Zaawansowany terminal monitorowania zorzy polarnej: indeksy geomagnetyczne, wiatr słoneczny, prognoza Kp, mapa widoczności — dane NOAA w czasie rzeczywistym.",
};

export default function AuroraLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="aurora-root" style={{ fontFamily: "var(--font-geist-mono, monospace)" }}>
      {/* Leaflet CSS loaded via CDN for the map component */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin="anonymous"
      />
      {children}
    </div>
  );
}
