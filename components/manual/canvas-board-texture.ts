import * as THREE from 'three';
import type { AppLocale } from '@/lib/i18n';
import type { ManualStep } from './manual-data';

export type StepBoardTheme = 'mountain-day' | 'mountain-night' | 'space';

type Palette = {
  bgTop: string;
  bgBottom: string;
  border: string;
  accentBar: string;
  pillBg: string;
  pillText: string;
  badgeBg: string;
  badgeText: string;
  heading: string;
  body: string;
  divider: string;
  bullet: string;
  detail: string;
  footer: string;
};

const PALETTES: Record<StepBoardTheme, Palette> = {
  'mountain-day': {
    bgTop: '#f9fcf9',
    bgBottom: '#eaf3ec',
    border: '#2f6b47',
    accentBar: '#16a34a',
    pillBg: '#1b4332',
    pillText: '#ffffff',
    badgeBg: '#dcfce7',
    badgeText: '#166534',
    heading: '#0f291c',
    body: '#334155',
    divider: 'rgba(22, 101, 52, 0.2)',
    bullet: '#16a34a',
    detail: '#1e293b',
    footer: '#64748b',
  },
  'mountain-night': {
    bgTop: '#081712',
    bgBottom: '#0f261e',
    border: '#34d399',
    accentBar: '#10b981',
    pillBg: '#34d399',
    pillText: '#022c22',
    badgeBg: 'rgba(16, 185, 129, 0.18)',
    badgeText: '#a7f3d0',
    heading: '#ecfdf5',
    body: '#cbd5e1',
    divider: 'rgba(52, 211, 153, 0.25)',
    bullet: '#34d399',
    detail: '#e2e8f0',
    footer: '#94a3b8',
  },
  space: {
    bgTop: '#060c1f',
    bgBottom: '#0f172a',
    border: '#38bdf8',
    accentBar: '#38bdf8',
    pillBg: '#38bdf8',
    pillText: '#082f49',
    badgeBg: 'rgba(56, 189, 248, 0.18)',
    badgeText: '#bae6fd',
    heading: '#f0f9ff',
    body: '#cbd5e1',
    divider: 'rgba(56, 189, 248, 0.25)',
    bullet: '#38bdf8',
    detail: '#e2e8f0',
    footer: '#94a3b8',
  },
};

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = '';

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (ctx.measureText(candidate).width <= maxWidth) {
      current = candidate;
    } else {
      if (current) lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  return lines;
}

/**
 * Renders a manual sub-chapter (badge, heading, explanation, and detail bullets)
 * onto a high-resolution offscreen canvas for use as a 3D surface texture.
 */
export function createStepBoardTexture(
  step: ManualStep,
  index: number,
  locale: AppLocale,
  theme: StepBoardTheme,
  labelPrefix: string
): THREE.CanvasTexture {
  const width = 1280;
  const height = 820;
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    return new THREE.CanvasTexture(canvas);
  }

  const p = PALETTES[theme];
  const pad = 28;
  const cardX = pad;
  const cardY = pad;
  const cardW = width - pad * 2;
  const cardH = height - pad * 2;

  // Card background
  const grad = ctx.createLinearGradient(0, cardY, 0, cardY + cardH);
  grad.addColorStop(0, p.bgTop);
  grad.addColorStop(1, p.bgBottom);
  drawRoundedRect(ctx, cardX, cardY, cardW, cardH, 28);
  ctx.fillStyle = grad;
  ctx.fill();

  // Card border
  ctx.lineWidth = 4;
  ctx.strokeStyle = p.border;
  ctx.stroke();

  // Top accent strip
  drawRoundedRect(ctx, cardX + 44, cardY + 28, 84, 6, 3);
  ctx.fillStyle = p.accentBar;
  ctx.fill();

  const contentX = cardX + 44;
  const contentW = cardW - 88;
  let y = cardY + 60;

  // Step pill
  const stepLabel = `${labelPrefix} 0${index + 1}`;
  ctx.font = '700 21px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
  const stepPillW = ctx.measureText(stepLabel).width + 32;
  drawRoundedRect(ctx, contentX, y, stepPillW, 38, 19);
  ctx.fillStyle = p.pillBg;
  ctx.fill();
  ctx.fillStyle = p.pillText;
  ctx.textBaseline = 'middle';
  ctx.fillText(stepLabel, contentX + 16, y + 19);

  // Optional badge pill next to step pill
  if (step.badge) {
    const badgeText = step.badge[locale];
    ctx.font = '600 19px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
    const badgeW = Math.min(ctx.measureText(badgeText).width + 30, contentW - stepPillW - 14);
    const badgeX = contentX + stepPillW + 14;
    drawRoundedRect(ctx, badgeX, y, badgeW, 38, 19);
    ctx.fillStyle = p.badgeBg;
    ctx.fill();
    ctx.fillStyle = p.badgeText;
    ctx.fillText(badgeText, badgeX + 15, y + 19);
  }

  y += 62;
  ctx.textBaseline = 'top';

  // Heading
  ctx.font = '700 38px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
  ctx.fillStyle = p.heading;
  const headingLines = wrapLines(ctx, step.heading[locale], contentW).slice(0, 2);
  for (const line of headingLines) {
    ctx.fillText(line, contentX, y);
    y += 46;
  }

  y += 10;

  // Body paragraph
  ctx.font = '500 23px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
  ctx.fillStyle = p.body;
  const bodyLines = wrapLines(ctx, step.body[locale], contentW).slice(0, 4);
  for (const line of bodyLines) {
    ctx.fillText(line, contentX, y);
    y += 33;
  }

  y += 14;

  // Divider
  ctx.fillStyle = p.divider;
  ctx.fillRect(contentX, y, contentW, 2);
  y += 22;

  // Detailed bullet points
  ctx.font = '500 21px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
  const maxY = cardY + cardH - 52;
  for (const detail of step.details) {
    if (y + 28 > maxY) break;
    const bulletLines = wrapLines(ctx, detail[locale], contentW - 28).slice(0, 2);

    ctx.beginPath();
    ctx.arc(contentX + 8, y + 13, 5, 0, Math.PI * 2);
    ctx.fillStyle = p.bullet;
    ctx.fill();

    ctx.fillStyle = p.detail;
    for (const line of bulletLines) {
      if (y + 28 > maxY) break;
      ctx.fillText(line, contentX + 26, y);
      y += 29;
    }
    y += 8;
  }

  // Footer micro-caption
  ctx.font = '600 16px "Plus Jakarta Sans", "Inter", system-ui, sans-serif';
  ctx.fillStyle = p.footer;
  const footerText =
    locale === 'en'
      ? 'IN-WORLD 3D CANVAS · USE CONTROLS BELOW TO SWITCH SUB-CHAPTER OR ZOOM OUT'
      : 'KANVAS 3D DI DUNIA · GUNAKAN KONTROL DI BAWAH UNTUK PINDAH SUB-BAB ATAU ZOOM OUT';
  ctx.fillText(footerText, contentX, cardY + cardH - 36);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}
