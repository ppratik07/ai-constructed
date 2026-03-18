import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';

function buildPrompt(plot_size: string, floors: number, style: string): string {
  return `You are a professional architect and construction planner.

Generate a detailed construction plan for the following project:

- Plot Size: ${plot_size}
- Number of Floors: ${floors}
- Architectural Style: ${style}

Please provide:
1. Room layout and distribution across floors
2. Structural description (foundation, walls, roof type)
3. Key architectural features matching the ${style} style
4. Recommended materials
5. Special considerations

Keep the response professional, structured, and concise (within 400 words).`;
}

async function generateWithOpenRouter(prompt: string): Promise<string> {
  const openai = new OpenAI({
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
  });
  const completion = await openai.chat.completions.create({
    model: 'meta-llama/llama-3.3-8b-instruct:free',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
  });
  return completion.choices[0]?.message?.content ?? 'Plan generation failed.';
}

async function generateWithGemini(prompt: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  const result = await model.generateContent(prompt);
  return result.response.text();
}

async function generateWithOpenAI(prompt: string): Promise<string> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [{ role: 'user', content: prompt }],
    max_tokens: 600,
    temperature: 0.7,
  });
  return completion.choices[0]?.message?.content ?? 'Plan generation failed.';
}

export async function generateConstructionPlan(
  plot_size: string,
  floors: number,
  style: string
): Promise<string> {
  const prompt = buildPrompt(plot_size, floors, style);

  if (process.env.OPENROUTER_API_KEY) {
    return generateWithOpenRouter(prompt);
  }

  if (process.env.GEMINI_API_KEY) {
    return generateWithGemini(prompt);
  }

  if (process.env.OPENAI_API_KEY) {
    return generateWithOpenAI(prompt);
  }

  throw new Error('No AI provider configured. Set GEMINI_API_KEY or OPENAI_API_KEY.');
}

// ── Room Layout Generation ──────────────────────────────────────

import type { FloorRoom, RoomType } from '@/types';

async function callAI(prompt: string, maxTokens = 1000, temperature = 0.2): Promise<string> {
  if (process.env.OPENROUTER_API_KEY) {
    const openai = new OpenAI({
      apiKey: process.env.OPENROUTER_API_KEY,
      baseURL: 'https://openrouter.ai/api/v1',
    });
    const c = await openai.chat.completions.create({
      model: 'meta-llama/llama-3.3-8b-instruct:free',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });
    return c.choices[0]?.message?.content ?? '';
  }
  if (process.env.GEMINI_API_KEY) {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
    return (await model.generateContent(prompt)).response.text();
  }
  if (process.env.OPENAI_API_KEY) {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const c = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: maxTokens,
      temperature,
    });
    return c.choices[0]?.message?.content ?? '';
  }
  throw new Error('No AI provider configured.');
}

const VALID_TYPES: RoomType[] = [
  'bedroom', 'living', 'kitchen', 'bathroom', 'dining',
  'utility', 'garage', 'corridor', 'other',
];

function validateType(t: string): RoomType {
  return (VALID_TYPES as string[]).includes(t) ? (t as RoomType) : 'other';
}

function defaultLayout(numFloors: number): FloorRoom[] {
  const ground: FloorRoom[] = [
    { name: 'Living Room',  width_m: 6,   height_m: 5,   floor: 1, type: 'living' },
    { name: 'Kitchen',      width_m: 4,   height_m: 4,   floor: 1, type: 'kitchen' },
    { name: 'Dining Room',  width_m: 4,   height_m: 3.5, floor: 1, type: 'dining' },
    { name: 'Bathroom',     width_m: 3,   height_m: 2.5, floor: 1, type: 'bathroom' },
    { name: 'Corridor',     width_m: 5,   height_m: 1.5, floor: 1, type: 'corridor' },
  ];
  const upper = (f: number): FloorRoom[] => [
    { name: 'Master Bedroom', width_m: 5, height_m: 4.5, floor: f, type: 'bedroom' },
    { name: 'Bedroom 2',      width_m: 4, height_m: 4,   floor: f, type: 'bedroom' },
    { name: 'Bedroom 3',      width_m: 4, height_m: 4,   floor: f, type: 'bedroom' },
    { name: 'Bathroom',       width_m: 3, height_m: 2.5, floor: f, type: 'bathroom' },
    { name: 'Corridor',       width_m: 5, height_m: 1.5, floor: f, type: 'corridor' },
  ];
  const result = [...ground];
  for (let f = 2; f <= numFloors; f++) result.push(...upper(f));
  return result;
}

export async function generateRoomLayout(
  plot_size: string,
  floors: number,
  style: string,
  planDescription?: string,
): Promise<FloorRoom[]> {
  const roomContext = planDescription
    ? 'Use EXACTLY the rooms listed in this construction plan (same names, same floors):\n' +
      planDescription.slice(0, 1500) + '\n\n'
    : '';
  const prompt =
    'Return ONLY a valid JSON array. No explanation, no markdown, no code fences.\n\n' +
    roomContext +
    'Project: Plot size ' + plot_size + ', ' + floors + ' floor(s), ' + style + ' style.\n\n' +
    'Each room object MUST have ALL of these fields:\n' +
    '  name      — room name (string)\n' +
    '  x_m       — X position in metres from the top-left origin (number)\n' +
    '  y_m       — Y position in metres from the top-left origin (number)\n' +
    '  width_m   — east-west dimension in metres (number)\n' +
    '  height_m  — north-south dimension in metres (number)\n' +
    '  floor     — floor number, 1 = ground (number)\n' +
    '  type      — one of: bedroom, living, kitchen, bathroom, dining, utility, garage, corridor, other\n\n' +
    'CRITICAL LAYOUT RULES:\n' +
    '  1. Rooms must share walls — adjacent rooms have zero gap between them.\n' +
    '  2. Rooms must fill EVERY square metre of the plot — no empty space.\n' +
    '  3. Logically group rooms: bedrooms together, kitchen near dining, corridor connecting rooms.\n' +
    '  4. Room sizes must be proportional to the sqft values mentioned in the plan.\n' +
    '  5. The total footprint must exactly match the plot dimensions for each floor.\n\n' +
    'Respond with ONLY the JSON array, nothing else.';


  let raw = '';
  try {
    raw = await callAI(prompt, 1000, 0.2);
  } catch {
    return defaultLayout(floors);
  }

  // Extract JSON array even if AI wraps it in markdown code blocks
  const match = raw.match(/\[[\s\S]*\]/);
  if (!match) return defaultLayout(floors);

  try {
    const parsed = JSON.parse(match[0]) as unknown[];
    const rooms: FloorRoom[] = parsed
      .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null)
      .map((r) => ({
        name:     String(r.name ?? 'Room'),
        width_m:  Math.max(0.5, Number(r.width_m ?? 4)),
        height_m: Math.max(0.5, Number(r.height_m ?? 4)),
        floor:    Math.max(1, Number(r.floor ?? 1)),
        type:     validateType(String(r.type ?? 'other')),
        ...(typeof r.x_m === 'number' ? { x_m: Number(r.x_m) } : {}),
        ...(typeof r.y_m === 'number' ? { y_m: Number(r.y_m) } : {}),
      }));
    return rooms.length >= 3 ? rooms : defaultLayout(floors);
  } catch {
    return defaultLayout(floors);
  }
}

