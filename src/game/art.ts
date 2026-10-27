// Pixel-art drawing for the game. Canvas art uses literal colours (it is artwork, not UI).
export const W = 320;
export const H = 240;
type C = CanvasRenderingContext2D;
export type Part = [string, number, number, number, number];
export const OUT = "#3b2445";

export function px(c: C, col: string, x: number, y: number, w: number, h: number) {
  c.fillStyle = col;
  c.fillRect(Math.round(x), Math.round(y), w, h);
}

/** Draws parts with a 1px outline around the whole silhouette. */
export function sprite(c: C, ox: number, oy: number, parts: Part[], outline = OUT) {
  const X = Math.round(ox);
  const Y = Math.round(oy);
  c.fillStyle = outline;
  for (const [, x, y, w, h] of parts) c.fillRect(X + x - 1, Y + y - 1, w + 2, h + 2);
  for (const [col, x, y, w, h] of parts) {
    c.fillStyle = col;
    c.fillRect(X + x, Y + y, w, h);
  }
}

export function glow(c: C, x: number, y: number, r: number, rgb: string, a: number) {
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}

// ---------------- characters ----------------
export type Look = {
  hair: string; hairHi: string; skin: string; top: string; top2: string;
  bottom: string; bottom2: string; shoe: string; acc: string; long: boolean; style: "me" | "ting";
};
export const ME_LOOK: Look = {
  hair: "#5b3424", hairHi: "#8d5c41", skin: "#fde3d3", top: "#fbf1df", top2: "#c9b3e6",
  bottom: "#d9bde3", bottom2: "#bf9dcc", shoe: "#8a5a44", acc: "#f59ab8", long: false, style: "me",
};
export const TING_LOOK: Look = {
  hair: "#3d2219", hairHi: "#6e4332", skin: "#fde3d3", top: "#2d2838", top2: "#ffffff",
  bottom: "#f5a3c0", bottom2: "#de7ca2", shoe: "#2d2838", acc: "#ffd36b", long: true, style: "ting",
};

export function drawChibi(c: C, x: number, y: number, L: Look, dir: number, frame: number, moving: boolean, alpha = 1) {
  c.save();
  c.globalAlpha = alpha;
  c.fillStyle = "rgba(40,20,60,0.25)";
  c.beginPath();
  c.ellipse(x, y, 7, 2, 0, 0, Math.PI * 2);
  c.fill();
  const bob = moving && frame % 2 === 1 ? -1 : 0;
  const lo = moving ? [0, -1, 0, 1][frame % 4]! : 0;
  const X = x - 8;
  const Y = y - 28 + bob;
  const back = dir === 1;
  const p: Part[] = [[L.hair, 1, 4, 14, L.long ? 19 : 12]];
  if (L.style === "me") {
    p.push([L.skin, 5, 24, 2, 2 + lo], [L.skin, 9, 24, 2, 2 - lo]);
    p.push([L.shoe, 4, 26 + lo, 3, 2], [L.shoe, 9, 26 - lo, 3, 2]);
    p.push([L.bottom, 3, 19, 10, 5], [L.bottom2, 3, 23, 10, 1], [L.bottom2, 6, 19, 1, 4], [L.bottom2, 9, 19, 1, 4]);
    p.push([L.top, 3, 14, 10, 6], [L.top, 1, 15, 2, 4], [L.top, 13, 15, 2, 4], [L.skin, 1, 19, 2, 1], [L.skin, 13, 19, 2, 1]);
    if (!back) p.push([L.top2, 7, 14, 2, 5], ["#e2b98f", 6, 16, 1, 1], ["#e2b98f", 6, 18, 1, 1]);
  } else {
    p.push([L.skin, 5, 22, 2, 3 + lo], [L.skin, 9, 22, 2, 3 - lo]);
    p.push([L.shoe, 4, 25 + lo, 3, 3], [L.shoe, 9, 25 - lo, 3, 3]);
    p.push([L.bottom, 4, 19, 8, 4], [L.bottom2, 5, 19, 1, 4], [L.bottom2, 8, 19, 1, 4], [L.bottom2, 10, 19, 1, 4]);
    p.push([L.top, 3, 14, 10, 6], [L.top, 1, 15, 2, 5], [L.top, 13, 15, 2, 5], [L.skin, 1, 20, 2, 1], [L.skin, 13, 20, 2, 1]);
    if (!back) p.push([L.top2, 6, 14, 4, 4], [L.acc, 7, 17, 2, 1]);
  }
  if (back) {
    p.push([L.hair, 2, 3, 12, 11], [L.hairHi, 4, 4, 6, 1]);
    p.push(L.long ? [L.hair, 3, 14, 10, 8] : [L.hair, 3, 14, 10, 2]);
  } else {
    const ex = dir === 2 ? -1 : dir === 3 ? 1 : 0;
    const blink = frame % 23 === 0 && !moving;
    p.push([L.skin, 3, 5, 10, 9]);
    p.push([L.hair, 2, 3, 12, 3], [L.hair, 2, 5, 2, L.long ? 15 : 9], [L.hair, 12, 5, 2, L.long ? 15 : 9]);
    p.push([L.hair, 5 + ex, 6, 2, 1], [L.hair, 9 + ex, 6, 2, 1], [L.hairHi, 4, 3, 4, 1]);
    if (blink) p.push(["#2a1620", 5 + ex, 10, 2, 1], ["#2a1620", 9 + ex, 10, 2, 1]);
    else p.push(["#2a1620", 5 + ex, 9, 2, 3], ["#2a1620", 9 + ex, 9, 2, 3], ["#ffffff", 5 + ex, 9, 1, 1], ["#ffffff", 9 + ex, 9, 1, 1]);
    p.push(["#f6a2b4", 4 + ex, 12, 2, 1], ["#f6a2b4", 10 + ex, 12, 2, 1], ["#c4566e", 7 + ex, 12, 2, 1]);
    if (L.style === "ting") p.push([L.acc, 2, 12, 1, 1], [L.acc, 13, 12, 1, 1]);
  }
  if (L.style === "me") p.push([L.acc, 11, 2, 4, 2], [L.acc, 12, 4, 2, 1]);
  else p.push([L.acc, 3, 3, 4, 1]);
  sprite(c, X, Y, p);
  c.restore();
}

// ---------------- NPCs ----------------
export function drawOwl(c: C, x: number, y: number, t: number) {
  const b = Math.sin(t / 20) > 0 ? 0 : 1;
  const blink = t % 180 < 8;
  const X = x - 9, Y = y - 20 + b;
  const eyes: Part[] = blink
    ? [["#2a1620", 4, 8, 4, 1], ["#2a1620", 11, 8, 4, 1]]
    : [["#2a1620", 5, 7, 2, 2], ["#2a1620", 12, 7, 2, 2]];
  sprite(c, X, Y, [
    ["#8b6a4f", 2, 3, 14, 15], ["#a8835f", 3, 2, 4, 2], ["#a8835f", 11, 2, 4, 2],
    ["#6b4f3a", 1, 8, 2, 7], ["#6b4f3a", 15, 8, 2, 7], ["#efdcbc", 5, 11, 8, 6],
    ["#fff", 3, 5, 5, 5], ["#fff", 10, 5, 5, 5], ...eyes, ["#f2b33d", 8, 10, 2, 2],
    ["#5b4a8a", 2, 0, 14, 2], ["#5b4a8a", 5, -3, 8, 3], ["#ffd65a", 8, -2, 2, 1],
  ]);
}

export function drawPainter(c: C, x: number, y: number, t: number) {
  const b = Math.sin(t / 18) > 0 ? 0 : 1;
  const X = x - 8, Y = y - 27 + b;
  sprite(c, X, Y, [
    ["#c94f6d", 2, 0, 12, 3], ["#c94f6d", 10, -1, 3, 1], ["#fde3d3", 3, 3, 10, 9],
    ["#7a5238", 3, 3, 10, 2], ["#2a1620", 5, 7, 2, 2], ["#2a1620", 10, 7, 2, 2], ["#7a5238", 6, 10, 5, 1],
    ["#fff", 3, 12, 10, 8], ["#3f4f86", 3, 14, 10, 1], ["#3f4f86", 3, 17, 10, 1], ["#3f4f86", 1, 13, 2, 5],
    ["#3f4f86", 13, 13, 2, 5], ["#2d2838", 4, 20, 3, 5], ["#2d2838", 9, 20, 3, 5],
  ]);
  // easel
  sprite(c, x + 8, y - 26, [
    ["#a8754a", 2, 6, 1, 20], ["#a8754a", 13, 6, 1, 20], ["#fdf6e8", 0, 0, 16, 13],
    ["#f5a3c0", 2, 3, 5, 4], ["#9fc2e8", 8, 2, 6, 3], ["#ffd65a", 9, 7, 3, 3], ["#b5d6a7", 2, 9, 12, 2],
  ]);
}

export function drawBaker(c: C, x: number, y: number, t: number) {
  const b = Math.sin(t / 16) > 0 ? 0 : 1;
  const X = x - 8, Y = y - 28 + b;
  sprite(c, X, Y, [
    ["#fff", 3, 0, 10, 5], ["#fde3d3", 3, 5, 10, 8], ["#2a1620", 5, 8, 2, 2], ["#2a1620", 10, 8, 2, 2],
    ["#f6a2b4", 4, 11, 2, 1], ["#f6a2b4", 11, 11, 2, 1], ["#a8d0c0", 3, 13, 10, 8], ["#f9c9d8", 5, 14, 6, 7],
    ["#2d2838", 4, 21, 3, 5], ["#2d2838", 9, 21, 3, 5],
  ]);
}

export function drawVendor(c: C, x: number, y: number, t: number) {
  const b = Math.sin(t / 22) > 0 ? 0 : 1;
  const X = x - 8, Y = y - 28 + b;
  sprite(c, X, Y, [
    ["#6e4332", 2, 1, 12, 6], ["#fde3d3", 3, 4, 10, 9], ["#6e4332", 3, 3, 10, 2],
    ["#2a1620", 5, 8, 2, 2], ["#2a1620", 10, 8, 2, 2], ["#c4566e", 7, 11, 3, 1],
    ["#b9a3dc", 3, 13, 10, 8], ["#f5a3c0", 3, 13, 10, 2], ["#5b4a8a", 4, 21, 3, 5], ["#5b4a8a", 9, 21, 3, 5],
  ]);
}

export function drawCat(c: C, x: number, y: number, t: number) {
  const tail = Math.sin(t / 25) > 0 ? 0 : 1;
  sprite(c, x - 9, y - 9, [
    ["#f4b67a", 2, 3, 14, 6], ["#f4b67a", 1, 0, 3, 3], ["#f4b67a", 7, 0, 3, 3], ["#fbe3c4", 2, 5, 6, 4],
    ["#e08f52", 10, 3, 2, 2], ["#e08f52", 13, 4, 2, 2], ["#2a1620", 3, 4, 2, 1], ["#2a1620", 6, 4, 2, 1],
    ["#f4b67a", 16, 5 - tail, 3, 2],
  ]);
  if (t % 120 < 80) {
    c.fillStyle = "#7b5fa8";
    c.font = "bold 7px sans-serif";
    c.fillText("z", x + 6, y - 12 - ((t % 120) / 20));
  }
}

export function drawSpirit(c: C, x: number, y: number, t: number, awake: boolean) {
  const f = Math.sin(t / 15) * 2;
  const Y = y - 22 + f;
  glow(c, x, Y + 6, awake ? 22 : 12, "255,236,170", awake ? 0.6 : 0.25);
  c.save();
  c.globalAlpha = awake ? 1 : 0.45;
  sprite(c, x - 7, Y, [
    ["#ffd65a", 6, 0, 3, 14], ["#ffd65a", 0, 5, 15, 4], ["#ffd65a", 2, 2, 11, 10], ["#ffd65a", 1, 11, 4, 3], ["#ffd65a", 10, 11, 4, 3],
    ["#fff7c9", 4, 3, 3, 2], ["#2a1620", 5, 6, 1, awake ? 2 : 1], ["#2a1620", 9, 6, 1, awake ? 2 : 1], ["#f6a2b4", 3, 8, 2, 1], ["#f6a2b4", 10, 8, 2, 1],
  ], "#b8743a");
  c.restore();
}

// ---------------- items ----------------
export function drawStar(c: C, x: number, y: number, t: number) {
  const Y = y + Math.sin(t / 9 + x * 0.3) * 1.5;
  glow(c, x, Y, 11, "255,236,160", 0.75);
  sprite(c, x - 4, Y - 4, [
    ["#ffd65a", 3, -1, 2, 10], ["#ffd65a", -1, 3, 10, 2], ["#ffd65a", 1, 1, 6, 6], ["#fff7c9", 3, 2, 1, 2],
  ], "#b8743a");
}

export function drawHeart(c: C, x: number, y: number, col: string, s = 1) {
  c.fillStyle = col;
  const P = [[1, 0, 2, 1], [5, 0, 2, 1], [0, 1, 8, 2], [1, 3, 6, 1], [2, 4, 4, 1], [3, 5, 2, 1]];
  for (const [a, b, w, h] of P) c.fillRect(Math.round(x + a! * s - 4 * s), Math.round(y + b! * s - 3 * s), w! * s, h! * s);
}

export function drawPortal(c: C, x: number, y: number, t: number) {
  glow(c, x, y - 14, 30, "255,190,230", 0.55 + Math.sin(t / 12) * 0.15);
  c.save();
  c.strokeStyle = "#fff4fb";
  c.lineWidth = 2;
  c.beginPath();
  c.ellipse(x, y - 14, 11, 16, 0, 0, Math.PI * 2);
  c.stroke();
  c.fillStyle = "rgba(201,179,230,0.75)";
  c.fill();
  c.restore();
  for (let i = 0; i < 6; i++) {
    const a = t / 20 + (i * Math.PI) / 3;
    px(c, i % 2 ? "#ffd65a" : "#fff", x + Math.cos(a) * 14, y - 14 + Math.sin(a) * 19, 2, 2);
  }
}

export function drawLantern(c: C, x: number, y: number, lit: boolean, t: number) {
  if (lit) glow(c, x, y - 16, 24 + Math.sin(t / 10 + x) * 3, "255,220,140", 0.7);
  sprite(c, x - 4, y - 24, [
    ["#6f5fae", 3, 10, 2, 14], ["#d8c6f5", 0, 0, 8, 2], ["#d8c6f5", 1, 9, 6, 2],
    [lit ? "#ffe9a0" : "#5a5280", 1, 2, 6, 7], [lit ? "#fff9dc" : "#6d6597", 3, 4, 2, 3],
  ]);
}

export function drawCake(c: C, x: number, y: number, t: number, s: number) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  glow(c, 0, -10, 26, "255,214,235", 0.6);
  sprite(c, -12, -22, [
    ["#fdf6e8", 0, 20, 24, 2], ["#f9c9d8", 2, 12, 20, 8], ["#fff", 2, 12, 20, 2], ["#f59ab8", 2, 17, 20, 1],
    ["#fbe3ee", 5, 5, 14, 7], ["#fff", 5, 5, 14, 2], ["#e34b6a", 6, 3, 2, 2], ["#e34b6a", 11, 3, 2, 2], ["#e34b6a", 16, 3, 2, 2],
    ["#9fc2e8", 8, -3, 1, 6], ["#ffd65a", 12, -3, 1, 6], ["#b5d6a7", 15, -3, 1, 6],
  ]);
  const fl = Math.sin(t / 3) > 0 ? 1 : 0;
  for (const fx of [8, 12, 15]) {
    px(c, "#ffb347", fx - 12, -27 - fl, 1, 2);
    px(c, "#fff3b0", fx - 12, -26, 1, 1);
  }
  c.restore();
}

// ---------------- shop objects ----------------
export function drawCounter(c: C, t: number) {
  drawOwl(c, 160, 98, t);
  sprite(c, 128, 96, [["#a26b45", 0, 0, 64, 16], ["#c48a5c", 0, 0, 64, 3], ["#8a5638", 4, 6, 56, 1], ["#f5a3c0", 26, 7, 12, 6]]);
  px(c, "#fff", 30, 0, 0, 0);
  c.fillStyle = "#fff4fb";
  c.font = "bold 5px sans-serif";
  c.fillText("服務台", 152, 107);
  // bell
  sprite(c, 182, 90, [["#ffd65a", 0, 2, 6, 4], ["#ffd65a", 2, 0, 2, 2]], "#b8743a");
}

export function drawMusicBox(c: C, x: number, y: number, t: number) {
  sprite(c, x - 12, y - 12, [["#c9a27a", 0, 6, 24, 3], ["#a8754a", 2, 9, 2, 6], ["#a8754a", 20, 9, 2, 6]]);
  sprite(c, x - 7, y - 20, [["#f5a3c0", 0, 2, 14, 7], ["#fbe3ee", 0, 2, 14, 2], ["#ffd65a", 6, 0, 2, 2], ["#de7ca2", 2, 5, 10, 1]]);
  if (t % 90 < 45) { c.fillStyle = "#7b5fa8"; c.font = "7px sans-serif"; c.fillText("♪", x + 6, y - 22 - (t % 45) / 10); }
}

export function drawUmbrellaStand(c: C, x: number, y: number) {
  sprite(c, x - 8, y - 26, [
    ["#7f8fb0", 2, 6, 1, 18], ["#f5a3c0", 0, 0, 6, 8], ["#c94f6d", 9, 4, 1, 20], ["#b9a3dc", 7, -2, 6, 8],
    ["#5b4a8a", 0, 16, 16, 10], ["#7b5fa8", 0, 16, 16, 2],
  ]);
}

export function drawLetterbox(c: C, x: number, y: number) {
  sprite(c, x - 8, y - 22, [
    ["#7f8fb0", 7, 12, 2, 10], ["#f59ab8", 0, 0, 16, 12], ["#fbe3ee", 0, 0, 16, 2], ["#3b2445", 3, 5, 10, 1],
    ["#fff", 10, 7, 5, 3], ["#e34b6a", 12, 8, 1, 1],
  ]);
}

export function drawDrawer(c: C, x: number, y: number, open: boolean, t: number) {
  if (!open) glow(c, x, y - 12, 18, "255,214,120", 0.25 + Math.sin(t / 15) * 0.1);
  sprite(c, x - 18, y - 22, [
    ["#7a5238", 0, 0, 36, 22], ["#a26b45", 2, 2, 32, 8], ["#a26b45", 2, 12, 32 , 8],
    ["#ffd65a", 15, 5, 6, 2], ["#ffd65a", 15, 15, 6, 2],
  ]);
  c.fillStyle = open ? "#b5d6a7" : "#fff4fb";
  c.font = "5px sans-serif";
  c.fillText(open ? "已打開" : "☾ ? ?", x - 8, y - 23);
  if (open) glow(c, x, y - 18, 14, "255,240,180", 0.5);
}

export function drawPlant(c: C, x: number, y: number) {
  sprite(c, x - 8, y - 22, [
    ["#7bb38e", 6, 0, 4, 8], ["#7bb38e", 1, 4, 6, 6], ["#93c9a2", 9, 3, 6, 7], ["#7bb38e", 4, 8, 8, 4],
    ["#f5a3c0", 3, 5, 2, 2], ["#ffd65a", 11, 5, 2, 2], ["#c48a5c", 3, 12, 10, 10], ["#a26b45", 3, 12, 10, 2],
  ]);
}

// ---------------- paris objects ----------------
export function drawStall(c: C, x: number, y: number, t: number) {
  drawBaker(c, x, y - 12, t);
  sprite(c, x - 22, y - 30, [
    ["#a8754a", 1, 4, 2, 26], ["#a8754a", 41, 4, 2, 26], ["#fbe3ee", 0, 0, 44, 6], ["#f59ab8", 0, 0, 6, 6], ["#f59ab8", 12, 0, 6, 6], ["#f59ab8", 24, 0, 6, 6], ["#f59ab8", 36, 0, 6, 6],
    ["#c48a5c", 0, 18, 44, 12], ["#fdf6e8", 0, 18, 44, 3],
  ]);
  const cols = ["#f5a3c0", "#c9b3e6", "#b5d6a7", "#ffd65a", "#9fc2e8"];
  for (let i = 0; i < 8; i++) sprite(c, x - 18 + i * 5, y - 15, [[cols[i % 5]!, 0, 0, 4, 3]]);
}

export function drawPostbox(c: C, x: number, y: number) {
  sprite(c, x - 6, y - 24, [
    ["#5d6f92", 5, 14, 2, 10], ["#f4c430", 0, 0, 12, 14], ["#ffe07a", 0, 0, 12, 2], ["#3b2445", 2, 5, 8, 1], ["#3f4f86", 3, 8, 6, 3],
  ]);
}

export function drawBeretCart(c: C, x: number, y: number, t: number) {
  drawVendor(c, x + 12, y - 4, t);
  sprite(c, x - 16, y - 18, [
    ["#c48a5c", 0, 6, 26, 10], ["#a26b45", 0, 6, 26, 2], ["#3b2445", 3, 16, 4, 3], ["#3b2445", 19, 16, 4, 3],
    ["#c94f6d", 2, 2, 7, 4], ["#5b4a8a", 10, 2, 7, 4], ["#2d2838", 18, 2, 7, 4],
  ]);
}

export function drawPhotoSpot(c: C, x: number, y: number, t: number) {
  c.save();
  c.globalAlpha = 0.7 + Math.sin(t / 10) * 0.2;
  c.strokeStyle = "#fff4fb";
  c.lineWidth = 1;
  c.setLineDash([2, 2]);
  c.beginPath();
  c.ellipse(x, y, 12, 4, 0, 0, Math.PI * 2);
  c.stroke();
  c.restore();
  sprite(c, x - 5, y - 18 + Math.sin(t / 12) * 1.5, [["#3b2445", 0, 2, 10, 7], ["#c9b3e6", 3, 3, 4, 4], ["#3b2445", 2, 0, 3, 2], ["#fff", 4, 4, 1, 1]], "#fff4fb");
}

export function drawBush(c: C, x: number, y: number) {
  sprite(c, x - 12, y - 16, [
    ["#c48a5c", 0, 8, 24, 8], ["#7bb38e", 1, 0, 22, 9], ["#93c9a2", 4, -2, 8, 4], ["#93c9a2", 13, -1, 8, 4],
    ["#f5a3c0", 4, 2, 2, 2], ["#fff", 10, 1, 2, 2], ["#f5a3c0", 17, 3, 2, 2], ["#ffd65a", 13, 5, 2, 2],
  ]);
}

export function drawBench(c: C, x: number, y: number) {
  sprite(c, x - 14, y - 14, [
    ["#a26b45", 0, 0, 28, 3], ["#a26b45", 0, 5, 28, 3], ["#3b2445", 2, 8, 2, 6], ["#3b2445", 24, 8, 2, 6],
  ]);
}

// ---------------- backgrounds (static, cached) ----------------
function shopBg(c: C) {
  px(c, "#dccaf0", 0, 0, W, 100);
  for (let x = 0; x < W; x += 10) px(c, "#d1bdea", x, 0, 4, 84);
  for (let y = 6; y < 80; y += 16) for (let x = ((y / 16) % 2) * 10 + 3; x < W; x += 20) px(c, "#f4ecfd", x, y, 1, 1);
  px(c, "#9a78b8", 0, 84, W, 16);
  px(c, "#b796d1", 0, 84, W, 2);
  for (let x = 4; x < W; x += 26) { px(c, "#8a68a8", x, 88, 20, 9); px(c, "#a888c4", x + 1, 89, 18, 1); }
  px(c, "#6e4f8c", 0, 98, W, 2);
  for (const wx of [18, 262]) {
    px(c, "#fbf1df", wx - 2, 14, 44, 44);
    const gr = c.createLinearGradient(0, 16, 0, 56);
    gr.addColorStop(0, "#1b1f55"); gr.addColorStop(1, "#5b3f86");
    c.fillStyle = gr; c.fillRect(wx, 16, 40, 40);
    px(c, "#fbf1df", wx + 19, 16, 2, 40); px(c, "#fbf1df", wx, 35, 40, 2);
    px(c, "#f5a3c0", wx - 4, 12, 8, 50); px(c, "#f5a3c0", wx + 36, 12, 8, 50);
    px(c, "#de7ca2", wx - 4, 12, 48, 4);
    px(c, "#fbf1df", wx - 4, 58, 48, 3);
  }
  glow(c, 30, 26, 8, "255,244,210", 0.9); px(c, "#fff4d2", 27, 23, 6, 6);
  // shelves
  px(c, "#7a5238", 76, 20, 168, 64); px(c, "#5e3e2a", 76, 20, 168, 2);
  const items = ["#f5a3c0", "#9fc2e8", "#ffd65a", "#b5d6a7", "#c9b3e6", "#f4b67a"];
  for (let row = 0; row < 3; row++) {
    const sy = 24 + row * 20;
    px(c, "#a26b45", 78, sy + 15, 164, 3);
    for (let i = 0; i < 12; i++) {
      const ix = 82 + i * 13 + (row % 2) * 4;
      const col = items[(i + row * 2) % items.length]!;
      if ((i + row) % 3 === 0) { glow(c, ix + 3, sy + 9, 7, "255,236,160", 0.35); sprite(c, ix, sy + 5, [["#e7f1fb", 0, 0, 7, 10], [col, 1, 4, 5, 5], ["#fff", 2, 1, 2, 2]]); }
      else if ((i + row) % 3 === 1) sprite(c, ix, sy + 3, [[col, 0, 0, 3, 12], [items[(i + 3) % 6]!, 4, 2, 3, 10]]);
      else sprite(c, ix, sy + 8, [[col, 0, 0, 8, 7], ["#fff", 0, 2, 8, 1]]);
    }
  }
  // banner
  sprite(c, 108, 3, [["#f59ab8", 0, 0, 104, 13], ["#fbe3ee", 0, 0, 104, 2], ["#de7ca2", -6, 4, 6, 9], ["#de7ca2", 104, 4, 6, 9]]);
  c.fillStyle = "#fff"; c.font = "bold 9px sans-serif"; c.textAlign = "center";
  c.fillText("★ 星星失物招領所 ★", 160, 13); c.textAlign = "left";
  // floor
  for (let y = 100; y < H; y += 10) {
    px(c, (y / 10) % 2 ? "#efd5b6" : "#ead0af", 0, y, W, 10);
    px(c, "#d8b48e", 0, y + 9, W, 1);
    for (let x = ((y / 10) % 3) * 22; x < W; x += 66) px(c, "#d8b48e", x, y, 1, 9);
  }
  // rug
  c.fillStyle = "#e58fae"; c.beginPath(); c.ellipse(160, 186, 72, 27, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#f6bfd2"; c.beginPath(); c.ellipse(160, 186, 66, 23, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#fbe0ea"; c.beginPath(); c.ellipse(160, 186, 48, 15, 0, 0, Math.PI * 2); c.fill();
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; px(c, "#ffd65a", 160 + Math.cos(a) * 57, 186 + Math.sin(a) * 19, 2, 2); }
}

function parisBg(c: C) {
  const sky = c.createLinearGradient(0, 0, 0, 120);
  sky.addColorStop(0, "#c6b3ec"); sky.addColorStop(0.55, "#f7c4da"); sky.addColorStop(1, "#fde3cf");
  c.fillStyle = sky; c.fillRect(0, 0, W, 124);
  glow(c, 250, 44, 40, "255,240,210", 0.8); px(c, "#fff3dc", 242, 36, 16, 16);
  // far skyline
  for (let x = 0; x < W; x += 14) { const h = 18 + ((x * 37) % 22); px(c, "#cdb8e6", x, 112 - h, 14, h); }
  px(c, "#cdb8e6", 168, 70, 14, 30); px(c, "#cdb8e6", 171, 64, 8, 8);
  // tower (generic Paris silhouette)
  for (let y = 16; y < 114; y++) {
    const k = (y - 16) / 98; const w = Math.round(2 + k * k * 40);
    px(c, "#8f7aa8", 60 - w / 2, y, w, 1);
  }
  px(c, "#c6b3ec", 54, 98, 12, 16); px(c, "#c6b3ec", 56, 94, 8, 4);
  px(c, "#7a6592", 44, 76, 32, 2); px(c, "#7a6592", 52, 50, 16, 2); px(c, "#7a6592", 59, 10, 2, 6);
  // buildings
  for (let i = 0; i < 6; i++) {
    const bx = 96 + i * 38;
    const face = i % 2 ? "#f6ead8" : "#f1dfc8";
    px(c, "#7f8fb0", bx, 40, 38, 14); px(c, "#93a3c4", bx, 40, 38, 2);
    px(c, "#fdf6e8", bx + 14, 43, 9, 9); px(c, "#9fb6d6", bx + 16, 45, 5, 6);
    px(c, face, bx, 54, 38, 70); px(c, "#e0cdb2", bx + 37, 54, 1, 70);
    for (let r = 0; r < 2; r++) for (let k = 0; k < 3; k++) {
      const wx = bx + 4 + k * 12, wy = 60 + r * 20;
      px(c, "#fdf6e8", wx - 1, wy - 1, 8, 13); px(c, "#9fb6d6", wx, wy, 6, 11); px(c, "#c4d6ec", wx, wy, 6, 2);
      px(c, "#3b2445", wx - 2, wy + 11, 10, 1); px(c, "#3b2445", wx - 2, wy + 8, 1, 3); px(c, "#3b2445", wx + 7, wy + 8, 1, 3);
      if ((k + r + i) % 2 === 0) { px(c, "#7bb38e", wx - 1, wy + 9, 8, 2); px(c, "#f5a3c0", wx, wy + 8, 2, 2); px(c, "#fff", wx + 4, wy + 8, 2, 2); }
    }
  }
  // café awning
  for (let x = 230; x < W; x += 8) { px(c, (x / 8) % 2 ? "#f59ab8" : "#fff", x, 98, 8, 8); px(c, (x / 8) % 2 ? "#f59ab8" : "#fff", x + 1, 106, 6, 2); }
  c.fillStyle = "#c94f6d"; c.font = "bold 7px sans-serif"; c.fillText("CAFÉ", 262, 96);
  // sidewalk + cobblestones
  px(c, "#cbbfae", 0, 116, W, 10); px(c, "#a99c8a", 0, 124, W, 2);
  for (let y = 126; y < H; y += 6) {
    px(c, "#e6d9c7", 0, y, W, 6);
    for (let x = (y / 6) % 2 ? -5 : 0; x < W; x += 11) { px(c, "#d6c7b2", x + 1, y + 1, 9, 4); px(c, "#efe5d6", x + 2, y + 1, 4, 1); }
  }
  // lamp posts
  for (const lx of [112, 214]) sprite(c, lx - 3, 74, [["#3b2445", 2, 8, 2, 46], ["#3b2445", 0, 52, 6, 3], ["#fff3c4", 0, 0, 6, 8], ["#3b2445", -1, -2, 8, 2]]);
}

function bridgeBg(c: C) {
  const sky = c.createLinearGradient(0, 0, 0, 140);
  sky.addColorStop(0, "#0f1440"); sky.addColorStop(0.45, "#2a2366"); sky.addColorStop(0.8, "#6b3f86"); sky.addColorStop(1, "#e48bb0");
  c.fillStyle = sky; c.fillRect(0, 0, W, 140);
  for (let i = 0; i < 160; i++) {
    const x = (i * 97) % W, y = (i * 53) % 100;
    const band = Math.abs(y - (x * 0.25 + 10)) < 14;
    px(c, band ? "#e8dcff" : "#8a86c8", x, y, 1, 1);
  }
  glow(c, 64, 34, 30, "255,240,210", 0.5); px(c, "#fff4d2", 56, 26, 16, 16); px(c, "#efe0b8", 60, 30, 3, 3); px(c, "#efe0b8", 66, 36, 2, 2);
  // mountains
  c.fillStyle = "#3a2d6e"; c.beginPath(); c.moveTo(150, 128); c.lineTo(210, 100); c.lineTo(250, 116); c.lineTo(290, 92); c.lineTo(320, 110); c.lineTo(320, 128); c.fill();
  const water = c.createLinearGradient(0, 120, 0, H);
  water.addColorStop(0, "#3a2d6e"); water.addColorStop(1, "#0d1135");
  c.fillStyle = water; c.fillRect(0, 124, W, 116);
  // UK end
  px(c, "#2c2458", 0, 110, 24, 130); px(c, "#4a7a63", 0, 110, 24, 3);
  sprite(c, 3, 34, [["#4b4180", 0, 14, 12, 64], ["#5c51a0", 1, 14, 2, 64], ["#ffe9a8", 2, 20, 8, 8], ["#4b4180", 2, 6, 8, 8], ["#4b4180", 4, 0, 4, 6]]);
  px(c, "#3b2445", 6, 23, 1, 3); px(c, "#3b2445", 6, 24, 3, 1);
  sprite(c, 16, 98, [["#d94a5c", 0, 0, 6, 12], ["#ffe9a8", 1, 2, 4, 4]]);
  // HK end
  const hk: [number, number, string][] = [[296, 54, "#f59ab8"], [304, 70, "#7fe0f0"], [312, 46, "#ffd65a"]];
  px(c, "#2c2458", 294, 110, 26, 130);
  for (const [bx, by, neon] of hk) {
    px(c, "#3a3170", bx, by, 8, 140);
    for (let wy = by + 4; wy < 128; wy += 6) { px(c, neon, bx + 1, wy, 2, 2); px(c, "#e8dcff", bx + 5, wy + 2, 1, 1); }
  }
  // bridge deck
  c.fillStyle = "#4b3f86";
  for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(60 + i * 66, 206, 26, 12, 0, Math.PI, 0); c.lineTo(86 + i * 66, 240); c.lineTo(34 + i * 66, 240); c.fill(); }
  px(c, "#b9a6e6", 20, 134, 280, 68);
  for (let y = 134; y < 202; y += 12) { px(c, "#a693d8", 20, y, 280, 1); for (let x = 20 + ((y / 12) % 2) * 8; x < 300; x += 16) px(c, "#a693d8", x, y, 1, 12); }
  for (let x = 30; x < 300; x += 40) { px(c, "#cfc0f2", x, 150, 2, 2); px(c, "#cfc0f2", x + 20, 180, 2, 2); }
  for (const ry of [126, 198]) {
    px(c, "#f3e6ff", 20, ry, 280, 4); px(c, "#d8c6f5", 20, ry + 4, 280, 2);
    for (let x = 22; x < 300; x += 20) px(c, "#d8c6f5", x, ry - 4, 3, 6);
  }
  c.fillStyle = "#fff4fb"; c.font = "bold 7px sans-serif";
  c.fillText("英國 UK", 2, 232); c.fillText("香港 HK", 284, 232);
}

export function buildBg(scene: number): HTMLCanvasElement {
  const cv = document.createElement("canvas");
  cv.width = W; cv.height = H;
  const c = cv.getContext("2d")!;
  if (scene === 0) shopBg(c); else if (scene === 1) parisBg(c); else bridgeBg(c);
  return cv;
}

export type Shoot = { x: number; y: number; life: number };

/** Animated background layers drawn every frame. */
export function drawFx(c: C, scene: number, t: number, shoots: Shoot[]) {
  if (scene === 0) {
    for (const wx of [18, 262]) for (let i = 0; i < 6; i++) {
      const on = Math.sin(t / 14 + i * 2 + wx) > 0.4;
      if (on) px(c, "#fff7c9", wx + 4 + ((i * 13) % 34), 19 + ((i * 7) % 32), 1, 1);
    }
    if (t % 240 < 30) { const k = (t % 240) / 30; px(c, "#ffffff", 262 + k * 36, 18 + k * 14, 3, 1); }
    for (const lx of [100, 220]) {
      px(c, "#5e3e2a", lx, 0, 1, 18);
      glow(c, lx, 26, 34 + Math.sin(t / 20) * 3, "255,226,170", 0.4);
      sprite(c, lx - 6, 16, [["#f5a3c0", 0, 0, 12, 6], ["#fff3c4", 2, 6, 8, 3]]);
    }
  } else if (scene === 1) {
    for (let i = 0; i < 4; i++) {
      const cx = ((t / (8 + i * 3) + i * 90) % 380) - 40;
      px(c, "#fff", cx, 14 + i * 9, 26, 5); px(c, "#fff", cx + 5, 11 + i * 9, 14, 3);
    }
    for (let i = 0; i < 3; i++) {
      const bx = ((t / 3 + i * 40) % 400) - 40, by = 30 + i * 6 + Math.sin(t / 10 + i) * 2;
      px(c, "#5b4a8a", bx, by, 2, 1); px(c, "#5b4a8a", bx + 3, by, 2, 1); px(c, "#5b4a8a", bx + 2, by + 1, 1, 1);
    }
    for (const lx of [112, 214]) glow(c, lx, 78, 22, "255,236,180", 0.45);
  } else {
    for (let i = 0; i < 30; i++) if (Math.sin(t / 12 + i * 3.3) > 0.7) px(c, "#fff7c9", (i * 71) % W, (i * 29) % 110, 2, 2);
    for (let i = 0; i < 8; i++) px(c, "#8f86d9", ((t / 2 + i * 45) % W), 210 + (i % 3) * 9, 10, 1);
  }
  if (scene !== 1 && Math.random() < (scene === 2 ? 0.02 : 0.004)) shoots.push({ x: Math.random() * 240 + 40, y: Math.random() * 40, life: 30 });
  for (const s of shoots) {
    s.x += 4; s.y += 2; s.life--;
    if (scene === 0) continue;
    c.strokeStyle = `rgba(255,255,255,${s.life / 30})`;
    c.lineWidth = 1;
    c.beginPath(); c.moveTo(s.x, s.y); c.lineTo(s.x - 14, s.y - 7); c.stroke();
  }
  for (let i = shoots.length - 1; i >= 0; i--) if (shoots[i]!.life <= 0) shoots.splice(i, 1);
}
