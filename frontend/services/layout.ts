import type { FloorRoom } from '@/types';

export interface RoomRect {
  room: FloorRoom;
  x: number;
  y: number;
  rw: number; // rendered width  (may be stretched to fill the plot)
  rh: number; // rendered height (may be stretched to fill the plot)
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

/**
 * Treemap-style recursive slice:
 * Rooms are sorted by area and recursively assigned sub-rectangles of the
 * remaining space proportional to their area. This guarantees 100 % plot
 * coverage with no gaps — exactly how a real floor plan looks.
 */
export function treemapLayout(rooms: FloorRoom[], plotW: number, plotH: number): RoomRect[] {
  if (rooms.length === 0) return [];
  const sorted = [...rooms].sort(
    (a, b) => b.width_m * b.height_m - a.width_m * a.height_m,
  );
  return sliceRect(sorted, 0, 0, plotW, plotH);
}

function sliceRect(
  rooms: FloorRoom[],
  x: number, y: number, w: number, h: number,
): RoomRect[] {
  if (rooms.length === 0) return [];
  if (rooms.length === 1) {
    return [{ room: rooms[0], x, y, rw: w, rh: h }];
  }
  const totalArea = rooms.reduce((s, r) => s + r.width_m * r.height_m, 0);
  const firstFrac = (rooms[0].width_m * rooms[0].height_m) / totalArea;
  if (w >= h) {
    const splitW = w * firstFrac;
    return [
      { room: rooms[0], x, y, rw: splitW, rh: h },
      ...sliceRect(rooms.slice(1), x + splitW, y, w - splitW, h),
    ];
  } else {
    const splitH = h * firstFrac;
    return [
      { room: rooms[0], x, y, rw: w, rh: splitH },
      ...sliceRect(rooms.slice(1), x, y + splitH, w, h - splitH),
    ];
  }
}

/**
 * Use AI-provided x_m/y_m coordinates when all rooms have them.
 * Falls back to treemap layout to guarantee full plot coverage.
 */
export function layoutRooms(rooms: FloorRoom[], plotW: number, plotH: number): RoomRect[] {
  if (rooms.length === 0) return [];
  const hasCoords = rooms.every(
    (r) => typeof r.x_m === 'number' && typeof r.y_m === 'number',
  );
  if (hasCoords) {
    // Scale AI coordinates to fit the actual plot
    const aiMaxX = Math.max(...rooms.map((r) => r.x_m! + r.width_m));
    const aiMaxY = Math.max(...rooms.map((r) => r.y_m! + r.height_m));
    const sf = Math.min(plotW / aiMaxX, plotH / aiMaxY, 1.5);
    return rooms.map((r) => ({
      room: r,
      x: r.x_m! * sf,
      y: r.y_m! * sf,
      rw: r.width_m * sf,
      rh: r.height_m * sf,
    }));
  }
  return treemapLayout(rooms, plotW, plotH);
}
