'use client';

import { useMemo, useState } from 'react';
import type { FloorRoom, RoomType } from '@/types';
import { parsePlotDimensions, layoutRooms, type RoomRect } from '@/services/layout';

// Soft pastel fills for each room type — light enough to read labels over
const ROOM_FILL: Record<RoomType, string> = {
  bedroom:  '#DBEAFE',
  living:   '#D1FAE5',
  kitchen:  '#FEF9C3',
  bathroom: '#EDE9FE',
  dining:   '#FCE7F3',
  utility:  '#FEE2E2',
  garage:   '#F3F4F6',
  corridor: '#FFF7ED',
  other:    '#F1F5F9',
};

const WALL_COLOR   = '#1E293B';   // near-black walls
const LABEL_COLOR  = '#0F172A';
const DIM_COLOR    = '#64748B';
const SVG_W        = 700;
const PAD          = 52;          // padding around the plan

// Abbreviate long room names to fit inside small rooms
function abbrev(name: string, rw: number, scale: number): string {
  const px = rw * scale;
  if (px >= 90) return name;
  if (px >= 52) return name.split(' ').map((w) => w[0]).join('').toUpperCase();
  return '';
}

export default function FloorPlanSVG({
  rooms,
  plotSize,
}: {
  rooms: FloorRoom[];
  plotSize: string;
}) {
  const floorNums = useMemo(
    () => [...new Set(rooms.map((r) => r.floor))].sort((a, b) => a - b),
    [rooms],
  );
  const [activeFloor, setActiveFloor] = useState(floorNums[0] ?? 1);

  const { plotW, plotH } = parsePlotDimensions(plotSize);
  const floorRooms = useMemo(
    () => rooms.filter((r) => r.floor === activeFloor),
    [rooms, activeFloor],
  );

  // Lay out rooms — fills 100 % of the plot via treemap if AI coords absent
  const rects = useMemo(
    () => layoutRooms(floorRooms, plotW, plotH),
    [floorRooms, plotW, plotH],
  );

  // Compute pixel scale to fit plotW × plotH into the canvas
  const drawW = SVG_W - PAD * 2;
  const drawH = Math.round(drawW * (plotH / Math.max(plotW, 0.1)));
  const scale  = drawW / Math.max(plotW, 0.1);
  const svgH   = drawH + PAD * 2 + 44; // 44 px for scale bar + north arrow
  const sx = (m: number) => PAD + m * scale;
  const sy = (m: number) => PAD + m * scale;

  const scaleBarM = Math.max(1, Math.round(plotW / 5));

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

      {/* Blueprint canvas */}
      <div className="overflow-x-auto rounded-xl border-2 border-slate-300 bg-[#f0f4ff] shadow-md">
        <svg
          width={SVG_W}
          height={svgH}
          viewBox={`0 0 ${SVG_W} ${svgH}`}
          className="block"
          style={{ fontFamily: 'system-ui, sans-serif' }}
        >
          {/* Plot floor fill */}
          <rect x={sx(0)} y={sy(0)} width={plotW * scale} height={plotH * scale} fill="#EEF2FF" />

          {/* Room fills – drawn first so walls sit on top */}
          {rects.map((r, i) => (
            <rect
              key={`fill-${i}`}
              x={sx(r.x)} y={sy(r.y)}
              width={r.rw * scale} height={r.rh * scale}
              fill={ROOM_FILL[r.room.type] ?? '#F8FAFC'}
            />
          ))}

          {/* Wall lines – drawn as shared borders between rooms */}
          {rects.map((r, i) => {
            const rx = sx(r.x), ry = sy(r.y);
            const rw = r.rw * scale, rh = r.rh * scale;
            return (
              <rect
                key={`wall-${i}`}
                x={rx} y={ry} width={rw} height={rh}
                fill="none"
                stroke={WALL_COLOR}
                strokeWidth={2.5}
              />
            );
          })}

          {/* Door arc – small quarter circle at top-left of each room */}
          {rects.map((r, i) => {
            const rx = sx(r.x), ry = sy(r.y);
            const rw = r.rw * scale, rh = r.rh * scale;
            const dr = Math.min(rw * 0.25, rh * 0.25, 22);
            if (dr < 8) return null;
            return (
              <g key={`door-${i}`}>
                {/* gap in wall */}
                <line
                  x1={rx} y1={ry + dr} x2={rx} y2={ry}
                  stroke={ROOM_FILL[r.room.type] ?? '#F8FAFC'}
                  strokeWidth={3}
                />
                {/* arc */}
                <path
                  d={`M ${rx} ${ry + dr} A ${dr} ${dr} 0 0 1 ${rx + dr} ${ry}`}
                  fill="none"
                  stroke={WALL_COLOR}
                  strokeWidth={1}
                />
              </g>
            );
          })}

          {/* Room labels */}
          {rects.map((r, i) => {
            const rx = sx(r.x), ry = sy(r.y);
            const rw = r.rw * scale, rh = r.rh * scale;
            const cx = rx + rw / 2;
            const cy = ry + rh / 2;
            const label = abbrev(r.room.name, r.rw, scale);
            if (!label) return null;
            const fs = Math.max(8, Math.min(13, rw / (label.length * 0.65)));
            const showDim = rh > 52 && rw > 60;
            return (
              <g key={`lbl-${i}`}>
                <text
                  x={cx} y={cy - (showDim ? 7 : 0)}
                  textAnchor="middle" dominantBaseline="middle"
                  fontSize={fs} fontWeight="700" fill={LABEL_COLOR}
                  style={{ letterSpacing: '0.03em' }}
                >
                  {label.toUpperCase()}
                </text>
                {showDim && (
                  <text
                    x={cx} y={cy + 9}
                    textAnchor="middle" dominantBaseline="middle"
                    fontSize={8} fill={DIM_COLOR}
                  >
                    {r.room.width_m.toFixed(1)}×{r.room.height_m.toFixed(1)}m
                  </text>
                )}
              </g>
            );
          })}

          {/* Outer plot boundary – thick */}
          <rect
            x={sx(0)} y={sy(0)}
            width={plotW * scale} height={plotH * scale}
            fill="none"
            stroke={WALL_COLOR} strokeWidth={4}
          />

          {/* Plot size label */}
          <text x={sx(0) + 4} y={sy(0) - 9} fontSize={10} fill="#1D4ED8" fontStyle="italic">
            {plotW}×{plotH} m
          </text>

          {/* Scale bar */}
          {(() => {
            const bx = PAD, by = PAD + drawH + 18;
            const bw = scaleBarM * scale;
            return (
              <g>
                <rect x={bx} y={by - 4} width={bw / 2} height={8} fill="#1E293B" />
                <rect x={bx + bw / 2} y={by - 4} width={bw / 2} height={8} fill="white" stroke="#1E293B" strokeWidth={1} />
                <text x={bx} y={by + 13} textAnchor="middle" fontSize={9} fill={DIM_COLOR}>0</text>
                <text x={bx + bw / 2} y={by + 13} textAnchor="middle" fontSize={9} fill={DIM_COLOR}>{Math.round(scaleBarM / 2)}</text>
                <text x={bx + bw} y={by + 13} textAnchor="middle" fontSize={9} fill={DIM_COLOR}>{scaleBarM}m</text>
              </g>
            );
          })()}

          {/* North arrow */}
          <g transform={`translate(${SVG_W - 34}, ${PAD + 18})`}>
            <polygon points="0,-14 -6,8 0,3 6,8" fill={WALL_COLOR} />
            <text x={0} y={23} textAnchor="middle" fontSize={10} fontWeight="bold" fill={WALL_COLOR}>N</text>
          </g>
        </svg>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 px-1 pb-1">
        {(Object.entries(ROOM_FILL) as [RoomType, string][]).map(([type, fill]) => (
          <div key={type} className="flex items-center gap-1.5">
            <div
              className="h-3 w-3 border border-slate-400 flex-shrink-0"
              style={{ backgroundColor: fill }}
            />
            <span className="text-xs text-slate-500 capitalize">{type}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
