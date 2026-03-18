'use client';

import { useMemo, useState } from 'react';
import type { FloorRoom, RoomType } from '@/types';
import { parsePlotDimensions, packRooms } from '@/services/layout';

const ROOM_COLORS: Record<RoomType, { fill: string; stroke: string; text: string }> = {
  bedroom:  { fill: '#DBEAFE', stroke: '#2563EB', text: '#1E40AF' },
  living:   { fill: '#D1FAE5', stroke: '#059669', text: '#065F46' },
  kitchen:  { fill: '#FEF3C7', stroke: '#D97706', text: '#78350F' },
  bathroom: { fill: '#EDE9FE', stroke: '#7C3AED', text: '#4C1D95' },
  dining:   { fill: '#FCE7F3', stroke: '#DB2777', text: '#831843' },
  utility:  { fill: '#FEE2E2', stroke: '#EF4444', text: '#991B1B' },
  garage:   { fill: '#F3F4F6', stroke: '#6B7280', text: '#374151' },
  corridor: { fill: '#FFFBEB', stroke: '#CA8A04', text: '#713F12' },
  other:    { fill: '#F1F5F9', stroke: '#94A3B8', text: '#475569' },
};

const SVG_W = 640;
const PAD = 44;
const SCALE_BAR_H = 36;

export default function FloorPlanSVG({
  rooms,
  plotSize,
}: {
  rooms: FloorRoom[];
  plotSize: string;
}) {
  const floorNums = useMemo(
    () => [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b),
    [rooms]
  );
  const [activeFloor, setActiveFloor] = useState(floorNums[0] ?? 1);

  const { plotW, plotH } = parsePlotDimensions(plotSize);
  const floorRooms = useMemo(
    () => rooms.filter((r) => r.floor === activeFloor),
    [rooms, activeFloor]
  );
  const packed = useMemo(() => packRooms(floorRooms, plotW), [floorRooms, plotW]);

  const maxX = Math.max(plotW, ...packed.map((r) => r.x + r.width_m));
  const maxY = Math.max(plotH, ...packed.map((r) => r.y + r.height_m));

  const scaleX = (SVG_W - PAD * 2) / maxX;
  const scaleY = (SVG_W * 0.65 - PAD * 2) / maxY;
  const scale = Math.min(scaleX, scaleY, 32);

  const svgH = maxY * scale + PAD * 2 + SCALE_BAR_H;
  const sx = (m: number) => PAD + m * scale;
  const sy = (m: number) => PAD + m * scale;
  const scaleBarM = maxX >= 10 ? 5 : 2;

  return (
    <div className="space-y-3">
      {/* Floor selector */}
      {floorNums.length > 1 && (
        <div className="flex gap-2">
          {floorNums.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFloor(f)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                activeFloor === f
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f === 1 ? 'Ground Floor' : `Floor ${f}`}
            </button>
          ))}
        </div>
      )}

      {/* SVG canvas */}
      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <svg
          width={SVG_W}
          height={svgH}
          viewBox={`0 0 ${SVG_W} ${svgH}`}
          className="block"
        >
          {/* Light grid */}
          {Array.from({ length: Math.ceil(maxX) + 1 }).map((_, i) => (
            <line key={`vg${i}`} x1={sx(i)} y1={PAD} x2={sx(i)} y2={PAD + maxY * scale} stroke="#E2E8F0" strokeWidth={0.5} />
          ))}
          {Array.from({ length: Math.ceil(maxY) + 1 }).map((_, i) => (
            <line key={`hg${i}`} x1={PAD} y1={sy(i)} x2={PAD + maxX * scale} y2={sy(i)} stroke="#E2E8F0" strokeWidth={0.5} />
          ))}

          {/* Plot boundary */}
          <rect
            x={sx(0)} y={sy(0)}
            width={plotW * scale} height={plotH * scale}
            fill="#F8FAFF"
            stroke="#1D4ED8" strokeWidth={2} strokeDasharray="7 3"
          />
          <text x={sx(0) + 5} y={sy(0) - 7} fontSize={9} fill="#1D4ED8" fontStyle="italic">
            Plot boundary — {plotW}×{plotH} units
          </text>

          {/* Rooms */}
          {packed.map((room, i) => {
            const col = ROOM_COLORS[room.type] ?? ROOM_COLORS.other;
            const rx = sx(room.x);
            const ry = sy(room.y);
            const rw = room.width_m * scale;
            const rh = room.height_m * scale;
            const cx = rx + rw / 2;
            const cy = ry + rh / 2;
            const showFull = rw >= 72 && rh >= 38;
            const showAbbr = !showFull && rw >= 28 && rh >= 20;

            return (
              <g key={i}>
                <rect
                  x={rx} y={ry} width={rw} height={rh}
                  fill={col.fill} stroke={col.stroke} strokeWidth={1.5} rx={3}
                />
                {showFull && (
                  <>
                    <text x={cx} y={cy - 8} textAnchor="middle" dominantBaseline="middle"
                      fontSize={11} fontWeight="700" fill={col.text}>
                      {room.name}
                    </text>
                    <text x={cx} y={cy + 8} textAnchor="middle" dominantBaseline="middle"
                      fontSize={9} fill={col.text} opacity={0.7}>
                      {room.width_m}×{room.height_m}m
                    </text>
                  </>
                )}
                {showAbbr && (
                  <text x={cx} y={cy} textAnchor="middle" dominantBaseline="middle"
                    fontSize={9} fontWeight="700" fill={col.text}>
                    {room.name.split(' ').map((w) => w[0]).join('').toUpperCase()}
                  </text>
                )}
              </g>
            );
          })}

          {/* Scale bar */}
          {(() => {
            const bx = PAD, by = PAD + maxY * scale + 16;
            const bw = scaleBarM * scale;
            return (
              <g>
                <line x1={bx} y1={by} x2={bx + bw} y2={by} stroke="#64748B" strokeWidth={2} />
                <line x1={bx}      y1={by - 4} x2={bx}      y2={by + 4} stroke="#64748B" strokeWidth={1.5} />
                <line x1={bx + bw} y1={by - 4} x2={bx + bw} y2={by + 4} stroke="#64748B" strokeWidth={1.5} />
                <text x={bx}           y={by + 13} textAnchor="middle" fontSize={8} fill="#94A3B8">0</text>
                <text x={bx + bw / 2}  y={by + 13} textAnchor="middle" fontSize={9} fill="#64748B">{scaleBarM} m</text>
                <text x={bx + bw}      y={by + 13} textAnchor="middle" fontSize={8} fill="#94A3B8">{scaleBarM}</text>
              </g>
            );
          })()}

          {/* North arrow */}
          <g transform={`translate(${SVG_W - 30}, ${PAD + 14})`}>
            <polygon points="0,-12 -5,8 0,4 5,8" fill="#475569" />
            <text x={0} y={22} textAnchor="middle" fontSize={9} fontWeight="bold" fill="#475569">N</text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1 pb-1">
        {(Object.entries(ROOM_COLORS) as [RoomType, (typeof ROOM_COLORS)[RoomType]][]).map(
          ([type, col]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div
                className="h-3 w-3 rounded-sm border flex-shrink-0"
                style={{ backgroundColor: col.fill, borderColor: col.stroke }}
              />
              <span className="text-xs text-slate-500 capitalize">{type}</span>
            </div>
          )
        )}
      </div>
    </div>
  );
}
