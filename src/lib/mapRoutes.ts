import routes from '../data/routes.json';
import journeyRoutes from '../data/journey-routes.json';
import type { Day, Leg } from '../types';

const mapRoutes = { ...routes, ...journeyRoutes } as unknown as Record<string, Leg>;

/** Keep separate road legs separate, especially on days with a flight. */
export function mapLines(day: Day): [number, number][][] {
  return (day.mapRouteIds ?? [day.routeId ?? day.id])
    .map(id => mapRoutes[id]?.line).filter((line): line is [number, number][] => !!line && line.length > 1);
}

export function mapPin(day: Day): [number, number] | undefined {
  if (day.completed && day.at) return day.at;
  return mapLines(day).at(-1)?.at(-1) ?? day.at;
}
