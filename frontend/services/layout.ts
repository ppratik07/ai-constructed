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

  // e.g. "40x60", "12×18", "15*20"
  const dimMatch = cleaned.match(/(\d+\.?\d*)[x*×](\d+\.?\d*)/);
  if (dimMatch) {
    let w = parseFloat(dimMatch[1]);
    let h = parseFloat(dimMatch[2]);
    // If dimensions look like feet (both > 30), convert to metres
    if (w > 30 && h > 30) { w = +(w * 0.3048).toFixed(1); h = +(h * 0.3048).toFixed(1); }
    return { plotW: w, plotH: h };
  }

  // e.g. "1500sqft", "200sqm"
  const sqftMatch = cleaned.match(/(\d+\.?\d*)sq?f/);
  if (sqftMatch) {
    const sqm  = parseFloat(sqftMatch[1]) * 0.0929;
    const side = +(Math.sqrt(sqm)).toFixed(1);
    return { plotW: side, plotH: side };
  }
  const sqmMatch = cleaned.match(/(\d+\.?\d*)sq?m/);
  if (sqmMatch) {
    const side = +(Math.sqrt(parseFloat(sqmMatch[1]))).toFixed(1);
    return { plotW: side, plotH: side };
  }

  // Plain number — treat as sqft
  const numMatch = cleaned.match(/(\d+\.?\d*)/);
  if (numMatch) {
    const sqm  = parseFloat(numMatch[1]) * 0.0929;
    const side = +(Math.sqrt(sqm)).toFixed(1);
    return { plotW: side, plotH: side };
  }

  return { plotW: 12, plotH: 12 };
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
 * Always uses the treemap algorithm to guarantee 100 % plot coverage.
 * AI-provided x_m/y_m are intentionally ignored because the AI rarely
 * produces a perfectly tiling layout with zero gaps.
 */
export function layoutRooms(rooms: FloorRoom[], plotW: number, plotH: number): RoomRect[] {
  return treemapLayout(rooms, plotW, plotH);
}
