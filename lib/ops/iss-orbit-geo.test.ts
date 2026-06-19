import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alignTrackToReference,
  continuousLongitude,
  finalizeOrbitSegments,
  prepareOrbitSegmentsForLeaflet,
  splitOrbitAtDateline,
  unwrapLongitude,
} from "./iss-orbit-geo";

describe("iss-orbit-geo", () => {
  it("continuousLongitude avoids dateline jumps", () => {
    assert.equal(continuousLongitude(179, 178), 179);
    assert.equal(continuousLongitude(-179, 178), 181);
    assert.equal(continuousLongitude(170, -170), -190);
  });

  it("alignTrackToReference keeps points near ref world copy", () => {
    const ref = -173;
    const aligned = alignTrackToReference(
      [
        { lat: 49, lon: -174 },
        { lat: 49.5, lon: 187 },
      ],
      ref,
    );
    for (const p of aligned) {
      assert.ok(Math.abs(p.lon - ref) <= 180, `lon ${p.lon} too far from ref`);
    }
  });

  it("splitOrbitAtDateline breaks long horizontal jumps", () => {
    const segments = splitOrbitAtDateline([
      { lat: 0, lon: 179 },
      { lat: 0, lon: -179 },
    ]);
    assert.equal(segments.length, 0);
  });

  it("finalizeOrbitSegments places ISS on track at ref", () => {
    const refLon = -173.2;
    const iss = { lat: 49.0, lon: refLon };
    const past = finalizeOrbitSegments(
      [
        { lat: 48, lon: -160 },
        { lat: 48.5, lon: -168 },
        iss,
      ],
      refLon,
    );
    const future = finalizeOrbitSegments(
      [
        iss,
        { lat: 49.5, lon: -178 },
        { lat: 50, lon: 172 },
      ],
      refLon,
    );

    const onTrack = (segs: { lat: number; lon: number }[][]) => {
      for (const seg of segs) {
        for (const p of seg) {
          const dLat = Math.abs(p.lat - iss.lat);
          let dLon = p.lon - iss.lon;
          while (dLon > 180) dLon -= 360;
          while (dLon < -180) dLon += 360;
          if (dLat < 0.01 && Math.abs(dLon) < 0.01) return true;
        }
      }
      return false;
    };

    assert.ok(onTrack(past), "past track should include ISS position");
    assert.ok(onTrack(future), "future track should include ISS position");

    const displayPast = prepareOrbitSegmentsForLeaflet(past, refLon);
    const displayFuture = prepareOrbitSegmentsForLeaflet(future, refLon);
    assert.ok(onTrack(displayPast), "leaflet past includes ISS");
    assert.ok(onTrack(displayFuture), "leaflet future includes ISS");
  });

  it("unwrapLongitude normalizes to [-180, 180]", () => {
    assert.equal(unwrapLongitude(190), -170);
    assert.equal(unwrapLongitude(-190), 170);
  });
});
