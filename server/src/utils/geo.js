export function toPoint(lng, lat) {
  const Lng = Number(lng);
  const Lat = Number(lat);
  if (Number.isNaN(Lng) || Number.isNaN(Lat)) return null;
  return { type: "Point", coordinates: [Lng, Lat] };
}
