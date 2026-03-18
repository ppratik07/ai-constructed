import { PDFDocument, rgb, StandardFonts, type PDFPage, type PDFFont } from 'pdf-lib';
import type { Project, CostBreakdown } from '@/types';

const BRAND_BLUE = rgb(0.118, 0.251, 0.627); // #1e40af
const TEXT_DARK = rgb(0.11, 0.11, 0.11);
const TEXT_MUTED = rgb(0.45, 0.45, 0.45);
const LIGHT_BG = rgb(0.965, 0.973, 0.988); // blue-50 tone

function wrapText(
  page: PDFPage,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  fontSize: number,
  font: PDFFont,
  lineHeight: number,
  color = TEXT_DARK
): number {
  const paragraphs = text.split('\n');
  let currentY = y;

  for (const para of paragraphs) {
    const words = para.trim().split(' ');
    let line = '';

    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(test, fontSize) > maxWidth && line) {
        page.drawText(line, { x, y: currentY, size: fontSize, font, color });
        currentY -= lineHeight;
        line = word;
      } else {
        line = test;
      }
    }
    if (line) {
      page.drawText(line, { x, y: currentY, size: fontSize, font, color });
      currentY -= lineHeight;
    }
    currentY -= lineHeight * 0.3; // paragraph gap
  }

  return currentY;
}

export async function generateProjectPdf(
  project: Project,
  cost: CostBreakdown
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();

  const bold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const oblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);

  // ── Header band ──────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: height - 85, width, height: 85, color: BRAND_BLUE });

  page.drawText('AI-Constructed', {
    x: 44, y: height - 38, size: 22, font: bold, color: rgb(1, 1, 1),
  });
  page.drawText('Construction Plan Report', {
    x: 44, y: height - 60, size: 11, font: regular, color: rgb(0.8, 0.87, 1),
  });

  const dateStr = new Date(project.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric',
  });
  const dateW = regular.widthOfTextAtSize(dateStr, 9);
  page.drawText(dateStr, {
    x: width - dateW - 44, y: height - 50, size: 9, font: regular, color: rgb(0.8, 0.87, 1),
  });

  let y = height - 118;

  // ── Section helper ────────────────────────────────────────────
  function sectionHeader(title: string) {
    page.drawText(title, { x: 44, y, size: 11, font: bold, color: BRAND_BLUE });
    y -= 6;
    page.drawRectangle({ x: 44, y, width: width - 88, height: 1.5, color: BRAND_BLUE });
    y -= 14;
  }

  // ── Project Details ───────────────────────────────────────────
  sectionHeader('PROJECT DETAILS');

  const details: [string, string][] = [
    ['Plot Size', project.plot_size],
    ['Number of Floors', String(project.floors)],
    ['Architectural Style', project.style],
    ['Project ID', project.id],
  ];

  for (const [label, value] of details) {
    page.drawText(label, { x: 44, y, size: 10, font: bold, color: TEXT_MUTED });
    page.drawText(value, { x: 200, y, size: 10, font: regular, color: TEXT_DARK });
    y -= 18;
  }

  y -= 16;

  // ── AI-Generated Plan ─────────────────────────────────────────
  if (project.plan_description) {
    sectionHeader('AI-GENERATED CONSTRUCTION PLAN');

    // Light background panel
    const planText = project.plan_description;
    const estLines = Math.ceil(planText.length / 85) + planText.split('\n').length * 2;
    const panelHeight = Math.min(estLines * 14 + 24, 320);

    page.drawRectangle({
      x: 40, y: y - panelHeight + 10, width: width - 80, height: panelHeight,
      color: LIGHT_BG,
    });

    y = wrapText(page, planText, 50, y, width - 108, 9.5, regular, 14);
    y -= 20;
  }

  // ── Cost Estimation ───────────────────────────────────────────
  sectionHeader('COST ESTIMATION');

  const costItems: [string, number, string][] = [
    ['Materials (60%)', cost.materials, 'Structural materials, finishes, fixtures'],
    ['Labor (30%)', cost.labor, 'Construction crew, specialists'],
    ['Contingency (10%)', cost.other, 'Permits, overheads, contingency'],
  ];

  for (const [label, amount, note] of costItems) {
    page.drawText(label, { x: 60, y, size: 10, font: bold, color: TEXT_DARK });
    const amtStr = `$${amount.toLocaleString()}`;
    const amtW = bold.widthOfTextAtSize(amtStr, 10);
    page.drawText(amtStr, { x: width - 44 - amtW, y, size: 10, font: bold, color: TEXT_DARK });
    y -= 14;
    page.drawText(note, { x: 60, y, size: 8.5, font: oblique, color: TEXT_MUTED });
    y -= 20;
  }

  y -= 4;
  page.drawRectangle({ x: 44, y, width: width - 88, height: 1, color: rgb(0.8, 0.8, 0.8) });
  y -= 18;

  // Total row
  page.drawRectangle({ x: 44, y: y - 6, width: width - 88, height: 34, color: BRAND_BLUE });
  page.drawText('TOTAL ESTIMATED COST', {
    x: 60, y: y + 6, size: 11, font: bold, color: rgb(1, 1, 1),
  });
  const totalStr = `$${cost.total.toLocaleString()}`;
  const totalW = bold.widthOfTextAtSize(totalStr, 13);
  page.drawText(totalStr, {
    x: width - 60 - totalW, y: y + 5, size: 13, font: bold, color: rgb(1, 1, 1),
  });
  y -= 36;

  // ── Disclaimer ────────────────────────────────────────────────
  y -= 12;
  page.drawText(
    '* Estimates are indicative. Actual costs may vary based on location, materials, and contractor rates.',
    { x: 44, y, size: 7.5, font: oblique, color: TEXT_MUTED }
  );

  // ── Footer ────────────────────────────────────────────────────
  page.drawRectangle({ x: 0, y: 0, width, height: 32, color: rgb(0.95, 0.95, 0.95) });
  page.drawText('Generated by AI-Constructed SaaS — Powered by OpenAI', {
    x: 44, y: 11, size: 8, font: regular, color: TEXT_MUTED,
  });
  const pageNum = regular.widthOfTextAtSize('Page 1', 8);
  page.drawText('Page 1', {
    x: width - pageNum - 44, y: 11, size: 8, font: regular, color: TEXT_MUTED,
  });

  return pdfDoc.save();
}
