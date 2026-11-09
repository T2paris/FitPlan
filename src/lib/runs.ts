import Storage from 'expo-sqlite/kv-store';

export type Coord = { latitude: number; longitude: number };

export type Split = { km: number; seconds: number; elev: number };

export type Run = {
  id: string;
  title: string;
  startedAt: number;
  distanceKm: number;
  movingSec: number;
  elevGain: number;
  kcal: number;
  route: Coord[];
  splits: Split[];
};

const KEY = 'ft_runs_v1';
export const KCAL_PER_KM = 65;

export function loadRuns(): Run[] {
  try {
    const raw = Storage.getItemSync(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveRuns(runs: Run[]) {
  try {
    Storage.setItemSync(KEY, JSON.stringify(runs));
  } catch {}
}

export function clearRuns() {
  try {
    Storage.removeItemSync(KEY);
  } catch {}
}

/** Distância em metros entre duas coordenadas (Haversine). */
export function distanceMeters(a: Coord, b: Coord) {
  const R = 6371000;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLon = ((b.longitude - a.longitude) * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.latitude * Math.PI) / 180) * Math.cos((b.latitude * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

/** 3725 -> "1:02:05" ; 125 -> "2:05" */
export function formatDuration(totalSec: number) {
  const s = Math.max(0, Math.round(totalSec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return h > 0
    ? `${h}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`
    : `${m}:${String(sec).padStart(2, '0')}`;
}

/** Segundos por km -> "5:03" (ou "--:--" se inválido). */
export function formatPace(secPerKm: number) {
  if (!isFinite(secPerKm) || secPerKm <= 0 || secPerKm > 3600) return '--:--';
  const s = Math.round(secPerKm);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

export function avgPace(distanceKm: number, movingSec: number) {
  return distanceKm > 0.02 ? movingSec / distanceKm : 0;
}

