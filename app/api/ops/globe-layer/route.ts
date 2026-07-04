import { NextResponse } from "next/server";
import {
  ISS_GLOBE_LAYERS,
  buildGibsWmsUrl,
  type IssGlobeLayerId,
} from "@/lib/ops/iss-globe-layers";

export const runtime = "nodejs";

const CACHE_SEC = 30 * 60;

function isLayerId(value: string | null): value is IssGlobeLayerId {
  return value === "none" || value === "clouds-viirs";
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const raw = searchParams.get("layer");
  if (!isLayerId(raw) || raw === "none") {
    return NextResponse.json({ error: "invalid layer" }, { status: 400 });
  }

  const def = ISS_GLOBE_LAYERS[raw];
  if (!def.enabled || !def.gibsLayer) {
    return NextResponse.json({ error: "layer disabled" }, { status: 404 });
  }

  try {
    let body: ArrayBuffer | null = null;
    let updatedAt = new Date().toISOString();

    for (let offset = 0; offset < 3 && !body; offset += 1) {
      const date = new Date();
      date.setUTCDate(date.getUTCDate() - offset);
      const upstream = buildGibsWmsUrl(
        def.gibsLayer,
        def.gibsWidth,
        def.gibsHeight,
        date,
      );
      const res = await fetch(upstream, {
        next: { revalidate: CACHE_SEC },
      });
      if (!res.ok) continue;
      const ct = res.headers.get("content-type") ?? "";
      if (!ct.includes("image/png")) continue;
      body = await res.arrayBuffer();
      updatedAt = date.toISOString().slice(0, 10) + "T12:00:00.000Z";
    }

    if (!body) {
      return NextResponse.json(
        { error: "upstream unavailable" },
        { status: 502 },
      );
    }

    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": `public, s-maxage=${CACHE_SEC}, stale-while-revalidate=600`,
        "X-Globe-Layer-Updated": updatedAt,
      },
    });
  } catch {
    return NextResponse.json({ error: "fetch failed" }, { status: 502 });
  }
}
