import type { FloorRoom } from '@/types';

export interface RoomRect extends FloorRoom {
  x: number;
  y: number;
}

export function parsePlotDimensions(plotSize: string): { plotW: number; plotH: number } {
  const cleaned = plotSize.toLowerCase().replace(/\s+/g, '');
  const dimMatch = cleaned.match(/(\d+\.?\d*)[x*×](\d+\.?\d*)/);
  if (dimMatch) {
    return { plotW: parseFloat(dimMatch[1]), plotH: parseFloat(dimMatch[2]) };
  }
  const numMatch = cleaned.match(/(\d+\.?\d*)/);
  if (numMatch) {
    const side = Math.sqrt(parseFloat(numMatch[1]));
    return { plotW: Math.round(side), plotH: Math.round(side) };
  }
  return { plotW: 15, plotH: 15 };
}

/** Shelf-packing algorithm: rows left-to-right, new row when width overflows. */
export function packRooms(rooms: FloorRoom[], plotW: number): RoomRect[] {
  if (rooms.length === 0) return [];

  const maxW = Math.max(plotW, ...rooms.map((r) => r.width_m));
  const sorted = [...rooms].sort(
    (a, b) => b.height_m * b.width_m - a.height_m * a.width_m
  );

  let x = 0, y = 0, rowH = 0;
  return sorted.map((room) => {
    if (x > 0 && x + room.width_m > maxW + 0.1) {
      x = 0;
      y += rowH;
      rowH = 0;
    }
    const rect: RoomRect = { ...room, x, y };
    x += room.width_m;
    rowH = Math.max(rowH, room.height_m);
    return rect;
  });
}
