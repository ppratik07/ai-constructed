import type { CostBreakdown } from '@/types';

// Base cost per square foot in USD
const COST_PER_SQFT = 150;

/**
 * Parses plot size string into square footage.
 * Supports formats: "2000 sqft", "2000", "40x50", "40 x 50", "40*50"
 */
export function parseSqft(plotSize: string): number {
  const cleaned = plotSize
    .toLowerCase()
    .replace(/sq\.?\s*ft\.?|sqft/gi, '')
    .trim();

  const multiplyMatch = cleaned.match(/(\d+\.?\d*)\s*[x*×]\s*(\d+\.?\d*)/);
  if (multiplyMatch) {
    return parseFloat(multiplyMatch[1]) * parseFloat(multiplyMatch[2]);
  }

  const numMatch = cleaned.match(/\d+\.?\d*/);
  return numMatch ? parseFloat(numMatch[0]) : 0;
}

export function estimateCost(plotSize: string, floors: number): CostBreakdown {
  const sqftPerFloor = parseSqft(plotSize);
  const totalSqft = sqftPerFloor * Math.max(1, floors);
  const total = totalSqft * COST_PER_SQFT;

  return {
    total: Math.round(total),
    materials: Math.round(total * 0.6),
    labor: Math.round(total * 0.3),
    other: Math.round(total * 0.1),
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}
