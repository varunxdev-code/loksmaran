import { COMMUNITIES } from "../taxonomy";
import type { Community } from "../types";
import { cached } from "./http";
import { nominatimSearch } from "./osm";

export type VillageGeo = Community & {
  coordinates: { lat: number; lng: number };
  osmUrl?: string;
};

export async function villageGeos(): Promise<VillageGeo[]> {
  return cached("village-geos", 60 * 60_000, async () => {
    const rows = await Promise.all(
      COMMUNITIES.map(async (c) => {
        if (c.coordinates) {
          return { ...c, coordinates: c.coordinates, osmUrl: `https://www.openstreetmap.org/#map=14/${c.coordinates.lat}/${c.coordinates.lng}` };
        }
        try {
          const hits = await nominatimSearch(`${c.name} ${c.state} India village`, 1);
          const hit = hits[0];
          if (hit?.lat && hit?.lon) {
            const coordinates = { lat: Number(hit.lat), lng: Number(hit.lon) };
            return {
              ...c,
              coordinates,
              osmUrl: hit.osm_id
                ? `https://www.openstreetmap.org/${hit.osm_type || "node"}/${hit.osm_id}`
                : `https://www.openstreetmap.org/#map=14/${coordinates.lat}/${coordinates.lng}`,
            };
          }
        } catch {
          /* keep fallback */
        }
        return { ...c, coordinates: c.coordinates || { lat: 22.97, lng: 78.66 } };
      }),
    );
    return rows;
  });
}
