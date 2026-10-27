import { useCallback, useEffect, useRef, useState } from "react";

const W = 320;
const H = 240;

type Line = { name: string; text: string };
type Screen = "title" | "help" | "play" | "clear" | "ending";

type Level = {
  name: string;
  sub: string;
  stars: [number, number][];
  npc: { x: number; y: number; name: string; kind: "owl" | "baker" | "ting" };
  intro: Line[];
  talk: Line[];
  notYet: Line[];
};

const ME = "我";
const TING = "婷寶";

const LEVELS: Level[] = [
  {
    name: "第一章・星星失物招領所",
    sub: "有人把星光弄丟了……",
    stars: [[40, 90], [280, 100], [60, 200], [250, 205], [160, 150]],
    npc: { x: 160, y: 82, name: "貓頭鷹館長", kind: "owl" },
    intro: [
      { name: "貓頭鷹館長", text: "歡迎來到星星失物招領所！今晚有五顆星星從架子上跑掉了。" },
      { name: ME, text: "它們是要送給婷寶的生日星光嗎？我一定要找回來！" },
      { name: "貓頭鷹館長", text: "用方向鍵或 WASD 移動，碰到星星就能收集。找齊後回來找我吧。" },
    ],
    notYet: [{ name: "貓頭鷹館長", text: "還有星星在館內躲著喔，仔細找找角落。" }],
    talk: [
      { name: "貓頭鷹館長", text: "做得好！這些星星裡藏著你們的回憶。" },
      { name: "貓頭鷹館長", text: "其中一顆閃著法國的光——去巴黎找回下一段記憶吧！" },
    ],
  },
  {
    name: "第二章・巴黎的回憶",
    sub: "那年我們一起去法國旅行",
    stars: [[30, 120], [290, 130], [100, 210], [220, 215], [170, 105], [60, 170]],
    npc: { x: 240, y: 150, name: "麵包師傅", kind: "baker" },
    intro: [
      { name: ME, text: "是巴黎！還記得和婷寶一起在鐵塔下拍照、吃可頌的那天。" },
      { name: ME, text: "回憶化成了星星散落在塞納河邊，把它們都撿回來吧。" },
    ],
    notYet: [{ name: "麵包師傅", text: "Bonjour！河邊還有閃閃發亮的東西喔～" }],
    talk: [
      { name: "麵包師傅", text: "Bonjour ! 我記得你們，當時兩個女孩笑得好開心。" },
      { name: "麵包師傅", text: "這個馬卡龍形狀的星光鑰匙送給你，它能打開通往星光橋的路。" },
      { name: ME, text: "Merci beaucoup！婷寶，我來了！" },
    ],
  },
  {
    name: "最終章・星光橋",
    sub: "連接英國與香港的橋",
    stars: [[50, 130], [110, 175], [175, 130], [235, 175]],
    npc: { x: 280, y: 150, name: TING, kind: "ting" },
    intro: [
      { name: ME, text: "英國和香港之間，一萬公里的距離……今晚被星光連起來了。" },
      { name: ME, text: "點亮橋上的星星，走到婷寶身邊吧！" },
    ],
    notYet: [{ name: TING, text: "我看到你了！橋上的星星還沒全亮喔，加油～" }],
    talk: [
      { name: TING, text: "真的是你！你從英國一路走過來了嗎？" },
      { name: ME, text: "嗯！時差和距離都擋不住我。婷寶，生日快樂！" },
      { name: TING, text: "咦，橋中間出現了一個寶箱……" },
      { name: ME, text: "那是我為你準備的禮物，快去打開吧！" },
    ],
  },
];

// ---------- drawing helpers ----------
type Pal = { hair: string; top: string; top2: string; skirt: string; shoe: string };
const PAL_ME: Pal = { hair: "#5a3626", top: "#f6ead6", top2: "#d9b9a0", skirt: "#a8c3a0", shoe: "#8a5a44" };
const PAL_TING: Pal = { hair: "#3e2418", top: "#2b2b35", top2: "#f4a7bd", skirt: "#d8d0e6", shoe: "#222" };

function r(ctx: CanvasRenderingContext2D, c: string, x: number, y: number, w: number, h: number) {
  ctx.fillStyle = c;
  ctx.fillRect(Math.round(x), Math.round(y), w, h);
}

function drawChibi(ctx: CanvasRenderingContext2D, x: number, y: number, p: Pal, dir: number, frame: number, longHair: boolean) {
  const X = x - 8, Y = y - 24;
  r(ctx, "rgba(0,0,0,0.15)", X + 2, Y + 23, 12, 2);
  // hair back
  r(ctx, p.hair, X + 1, Y + 2, 14, longHair ? 17 : 13);
  // legs
  const step = frame % 2 === 0 ? 0 : 1;
  r(ctx, "#f3d3bf", X + 5, Y + 18, 2, 4 - step);
  r(ctx, "#f3d3bf", X + 9, Y + 18, 2, 3 + step);
  r(ctx, p.shoe, X + 5, Y + 22 - step, 2, 1);
  r(ctx, p.shoe, X + 9, Y + 21 + step, 2, 1);
  // body
  r(ctx, p.skirt, X + 4, Y + 16, 8, 3);
  r(ctx, p.top, X + 4, Y + 11, 8, 6);
  r(ctx, p.top2, X + 7, Y + 11, 2, 5);
  // face
  if (dir !== 1) {
    r(ctx, "#fde3d3", X + 3, Y + 3, 10, 8);
    r(ctx, p.hair, X + 2, Y + 1, 12, 3);
    r(ctx, p.hair, X + 3, Y + 4, 2, 1);
    r(ctx, p.hair, X + 10, Y + 4, 3, 1);
    const ex = dir === 2 ? -1 : dir === 3 ? 1 : 0;
    r(ctx, "#2a1a14", X + 5 + ex, Y + 6, 1, 2);
    r(ctx, "#2a1a14", X + 10 + ex, Y + 6, 1, 2);
    r(ctx, "#f7a3b0", X + 4 + ex, Y + 8, 2, 1);
    r(ctx, "#f7a3b0", X + 10 + ex, Y + 8, 2, 1);
  } else {
    r(ctx, p.hair, X + 2, Y + 1, 12, 10);
  }
  // side hair
  r(ctx, p.hair, X + 1, Y + 3, 2, longHair ? 14 : 9);
  r(ctx, p.hair, X + 13, Y + 3, 2, longHair ? 14 : 9);
  // hair clip
  r(ctx, longHair ? "#f4a7bd" : "#ffe08a", X + 11, Y + 2, 2, 1);
}

function drawOwl(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const b = Math.sin(t / 15) > 0 ? 0 : 1;
  const X = x - 9, Y = y - 22 + b;
  r(ctx, "#8b6a4f", X + 2, Y + 4, 14, 16);
  r(ctx, "#c9a882", X + 5, Y + 11, 8, 8);
  r(ctx, "#fff", X + 3, Y + 6, 5, 5);
  r(ctx, "#fff", X + 10, Y + 6, 5, 5);
  r(ctx, "#222", X + 5, Y + 8, 2, 2);
  r(ctx, "#222", X + 12, Y + 8, 2, 2);
  r(ctx, "#f2b33d", X + 8, Y + 10, 2, 2);
  r(ctx, "#3a2a55", X + 3, Y, 12, 3);
  r(ctx, "#ffe08a", X + 8, Y - 2, 2, 2);
}

function drawBaker(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const b = Math.sin(t / 18) > 0 ? 0 : 1;
  const X = x - 8, Y = y - 26 + b;
  r(ctx, "#fff", X + 3, Y, 10, 5);
  r(ctx, "#fde3d3", X + 3, Y + 5, 10, 7);
  r(ctx, "#222", X + 5, Y + 8, 1, 1);
  r(ctx, "#222", X + 10, Y + 8, 1, 1);
  r(ctx, "#6b4a35", X + 5, Y + 10, 6, 1);
  r(ctx, "#fff", X + 3, Y + 12, 10, 9);
  r(ctx, "#d7263d", X + 3, Y + 12, 10, 1);
  r(ctx, "#2b3a67", X + 4, Y + 21, 3, 4);
  r(ctx, "#2b3a67", X + 9, Y + 21, 3, 4);
  r(ctx, "#d9a35b", X + 12, Y + 13, 3, 9);
}

function drawStar(ctx: CanvasRenderingContext2D, x: number, y: number, t: number) {
  const b = Math.round(Math.sin(t / 8 + x) * 2);
  const Y = y + b;
  r(ctx, "rgba(255,230,140,0.35)", x - 6, Y - 6, 12, 12);
  r(ctx, "#ffd84d", x - 1, Y - 5, 2, 10);
  r(ctx, "#ffd84d", x - 5, Y - 1, 10, 2);
  r(ctx, "#ffd84d", x - 3, Y - 3, 6, 6);
  r(ctx, "#fff6c2", x - 1, Y - 2, 2, 2);
}

function drawChest(ctx: CanvasRenderingContext2D, x: number, y: number, open: number, t: number) {
  const X = x - 12, Y = y - 16;
  if (open > 0) {
    const g = Math.min(open / 40, 1);
    ctx.fillStyle = `rgba(255,230,150,${0.5 * g})`;
    ctx.beginPath();
    ctx.moveTo(x - 8, Y + 6);
    ctx.lineTo(x - 30 * g, Y - 60 * g);
    ctx.lineTo(x + 30 * g, Y - 60 * g);
    ctx.lineTo(x + 8, Y + 6);
    ctx.fill();
    for (let i = 0; i < 6; i++) drawStar(ctx, x + Math.sin(i * 1.7 + t / 10) * 20 * g, Y - open * 0.8 - i * 8, t + i * 5);
  }
  r(ctx, "#8a4f2a", X, Y + 6, 24, 12);
  r(ctx, "#f2c14e", X, Y + 10, 24, 2);
  r(ctx, "#f2c14e", X + 10, Y + 8, 4, 6);
  const lid = open > 0 ? Math.min(open, 8) : 0;
  r(ctx, "#a8643a", X, Y - lid, 24, 7);
  r(ctx, "#f2c14e", X, Y + 5 - lid, 24, 1);
}

function drawBg(ctx: CanvasRenderingContext2D, lv: number, t: number) {
  if (lv === 0) {
    r(ctx, "#2c2448", 0, 0, W, 60);
    for (let i = 0; i < 6; i++) {
      r(ctx, "#6b4a35", 10 + i * 52, 14, 44, 40);
      r(ctx, "#8b6a4f", 12 + i * 52, 28, 40, 2);
      r(ctx, "#8b6a4f", 12 + i * 52, 42, 40, 2);
      r(ctx, ["#f4a7bd", "#a8c3a0", "#9ec5e8", "#ffe08a"][i % 4], 16 + i * 52, 20, 6, 8);
      r(ctx, ["#9ec5e8", "#f4a7bd", "#ffe08a", "#a8c3a0"][i % 4], 30 + i * 52, 34, 8, 8);
    }
    for (let y = 60; y < H; y += 12)
      for (let x = 0; x < W; x += 12) r(ctx, (x + y) % 24 === 0 ? "#f7e6d6" : "#f1d9c6", x, y, 12, 12);
    r(ctx, "#c58b9b", 0, 58, W, 3);
    ctx.fillStyle = "#4a3a6a";
    ctx.font = "8px sans-serif";
    ctx.fillText("★ 星星失物招領所 ★", 118, 9);
  } else if (lv === 1) {
    r(ctx, "#bfe0f2", 0, 0, W, 80);
    r(ctx, "#fff", 30 + ((t / 6) % 360) - 40, 18, 30, 6);
    r(ctx, "#fff", 200 + ((t / 9) % 200) - 40, 30, 24, 5);
    // eiffel
    ctx.fillStyle = "#7a6a5a";
    ctx.beginPath();
    ctx.moveTo(80, 8); ctx.lineTo(60, 80); ctx.lineTo(100, 80); ctx.fill();
    r(ctx, "#bfe0f2", 74, 62, 12, 18);
    r(ctx, "#7a6a5a", 66, 50, 28, 3);
    r(ctx, "#7a6a5a", 72, 30, 16, 2);
    // buildings
    for (let i = 0; i < 5; i++) {
      r(ctx, "#efe1c7", 130 + i * 38, 40, 34, 40);
      r(ctx, "#5b6b84", 130 + i * 38, 34, 34, 6);
      r(ctx, "#8ab0cf", 136 + i * 38, 48, 6, 8);
      r(ctx, "#8ab0cf", 152 + i * 38, 48, 6, 8);
    }
    r(ctx, "#d9c9a8", 0, 80, W, 20);
    r(ctx, "#6fa6c9", 0, 100, W, 12);
    r(ctx, "#9cc6de", ((t / 2) % W), 104, 20, 1);
    for (let y = 112; y < H; y += 10)
      for (let x = 0; x < W; x += 10) r(ctx, (x + y) % 20 === 0 ? "#e9dcc2" : "#e2d2b5", x, y, 10, 10);
    r(ctx, "#d7263d", 200, 112, 60, 6);
    r(ctx, "#fff", 200, 112, 10, 6); r(ctx, "#fff", 220, 112, 10, 6); r(ctx, "#fff", 240, 112, 10, 6);
  } else {
    r(ctx, "#141838", 0, 0, W, H);
    for (let i = 0; i < 40; i++) {
      const s = (i * 73) % W, h = (i * 37) % 110;
      r(ctx, Math.sin(t / 10 + i) > 0.3 ? "#fff6c2" : "#6b70a8", s, h, 1, 1);
    }
    // UK side
    r(ctx, "#2a2f55", 0, 90, 40, 150);
    r(ctx, "#3a4070", 10, 50, 12, 40);
    r(ctx, "#ffe08a", 13, 58, 6, 6);
    r(ctx, "#3a4070", 14, 42, 4, 8);
    // HK side
    for (let i = 0; i < 4; i++) {
      r(ctx, "#2a2f55", 284 + i * 9, 60 + (i % 2) * 18, 8, 180);
      for (let k = 0; k < 6; k++) r(ctx, "#f4a7bd", 286 + i * 9, 66 + (i % 2) * 18 + k * 8, 2, 2);
    }
    r(ctx, "#0e1230", 0, 200, W, 40);
    // bridge
    const glow = 0.6 + Math.sin(t / 20) * 0.2;
    ctx.fillStyle = `rgba(255,216,120,${glow * 0.25})`;
    ctx.fillRect(20, 112, 280, 86);
    r(ctx, "#8f86c9", 20, 120, 280, 70);
    for (let x = 20; x < 300; x += 14) r(ctx, "#a69de0", x, 120, 12, 70);
    r(ctx, "#ffe08a", 20, 116, 280, 3);
    r(ctx, "#ffe08a", 20, 190, 280, 3);
    ctx.fillStyle = "#fff6c2";
    ctx.font = "7px sans-serif";
    ctx.fillText("英國 UK", 4, 108);
    ctx.fillText("香港 HK", 284, 54);
  }
}

// ---------- component ----------
export function StarGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const keys = useRef<Record<string, boolean>>({});
  const [screen, setScreen] = useState<Screen>("title");
  const [level, setLevel] = useState(0);
  const [stars, setStars] = useState(0);
  const [total, setTotal] = useState(0);
  const [dialog, setDialog] = useState<Line[]>([]);
  const [hint, setHint] = useState("");

  const g = useRef({
    px: 40, py: 200, dir: 0, frame: 0, t: 0,
    stars: [] as [number, number][],
    talked: false, chest: false, chestOpen: 0,
    level: 0, playing: false, dialog: false, onDialogEnd: null as null | (() => void),
  });

  const sayLines = useCallback((lines: Line[], onEnd?: () => void) => {
    g.current.dialog = true;
    g.current.onDialogEnd = onEnd ?? null;
    setDialog(lines);
  }, []);

  const advance = useCallback(() => {
    setDialog((d) => {
      if (d.length <= 1) {
        g.current.dialog = false;
        const cb = g.current.onDialogEnd;
        g.current.onDialogEnd = null;
        if (cb) setTimeout(cb, 0);
        return [];
      }
      return d.slice(1);
    });
  }, []);

  const startLevel = useCallback((lv: number) => {
    const L = LEVELS[lv];
    Object.assign(g.current, {
      px: 30, py: lv === 2 ? 160 : 200, dir: 0, level: lv,
      stars: L.stars.map((s) => [...s] as [number, number]),
      talked: false, chest: false, chestOpen: 0, playing: true,
    });
    setLevel(lv);
    setStars(0);
    setTotal(L.stars.length);
    setScreen("play");
    setHint("");
    sayLines(L.intro);
  }, [sayLines]);

  const interact = useCallback(() => {
    const s = g.current;
    if (s.dialog) return advance();
    if (!s.playing) return;
    const L = LEVELS[s.level];
    if (s.chest && Math.hypot(s.px - 160, s.py - 165) < 26 && s.chestOpen === 0) {
      s.chestOpen = 1;
      return;
    }
    if (Math.hypot(s.px - L.npc.x, s.py - L.npc.y) < 28) {
      if (s.stars.length > 0) return sayLines(L.notYet);
      if (s.level === 2) {
        if (!s.talked) sayLines(L.talk, () => { s.talked = true; s.chest = true; setHint("走到寶箱旁按「調查」打開它"); });
        return;
      }
      sayLines(L.talk, () => { s.playing = false; setScreen("clear"); });
    }
  }, [advance, sayLines]);

  // keyboard
  useEffect(() => {
    const map: Record<string, string> = {
      ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down",
      ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right",
    };
    const down = (e: KeyboardEvent) => {
      if (map[e.code]) { keys.current[map[e.code]] = true; e.preventDefault(); }
      if (e.code === "Space" || e.code === "Enter") { e.preventDefault(); if (!e.repeat) interact(); }
    };
    const up = (e: KeyboardEvent) => { if (map[e.code]) keys.current[map[e.code]] = false; };
    window.addEventListener("keydown", down);
    window.addEventListener("keyup", up);
    return () => { window.removeEventListener("keydown", down); window.removeEventListener("keyup", up); };
  }, [interact]);

  // loop
  useEffect(() => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      const s = g.current;
      s.t++;
      const L = LEVELS[s.level];
      if (s.playing && !s.dialog && s.chestOpen === 0) {
        let dx = 0, dy = 0;
        if (keys.current.up) { dy = -1; s.dir = 1; }
        if (keys.current.down) { dy = 1; s.dir = 0; }
        if (keys.current.left) { dx = -1; s.dir = 2; }
        if (keys.current.right) { dx = 1; s.dir = 3; }
        if (dx || dy) {
          const sp = 1.4 / (dx && dy ? 1.414 : 1);
          s.px = Math.max(10, Math.min(W - 10, s.px + dx * sp));
          const minY = s.level === 0 ? 80 : s.level === 1 ? 120 : 140;
          const maxY = s.level === 2 ? 192 : H - 4;
          s.py = Math.max(minY, Math.min(maxY, s.py + dy * sp));
          if (s.t % 10 === 0) s.frame++;
        }
        const before = s.stars.length;
        s.stars = s.stars.filter(([x, y]) => Math.hypot(x - s.px, y - (s.py - 10)) > 12);
        if (s.stars.length !== before) {
          setStars(L.stars.length - s.stars.length);
          if (s.stars.length === 0) setHint(`星星集齊了！去找${L.npc.name}吧`);
        }
        const near = Math.hypot(s.px - L.npc.x, s.py - L.npc.y) < 28;
        if (near && s.stars.length === 0 && !s.talked) setHint(`按「調查」和${L.npc.name}說話`);
      }
      if (s.chestOpen > 0) {
        s.chestOpen++;
        if (s.chestOpen === 130) {
          s.playing = false;
          setScreen("ending");
        }
      }
      // draw
      ctx.clearRect(0, 0, W, H);
      drawBg(ctx, s.level, s.t);
      s.stars.forEach(([x, y]) => drawStar(ctx, x, y, s.t));
      const ents: { y: number; d: () => void }[] = [];
      const n = L.npc;
      if (n.kind === "owl") ents.push({ y: n.y, d: () => drawOwl(ctx, n.x, n.y, s.t) });
      if (n.kind === "baker") ents.push({ y: n.y, d: () => drawBaker(ctx, n.x, n.y, s.t) });
      if (n.kind === "ting") ents.push({ y: n.y, d: () => drawChibi(ctx, n.x, n.y, PAL_TING, 2, Math.floor(s.t / 30), true) });
      if (s.chest) ents.push({ y: 165, d: () => drawChest(ctx, 160, 165, s.chestOpen, s.t) });
      ents.push({ y: s.py, d: () => drawChibi(ctx, s.px, s.py, PAL_ME, s.dir, s.frame, false) });
      ents.sort((a, b) => a.y - b.y).forEach((e) => e.d());
      if (s.playing && Math.hypot(s.px - n.x, s.py - n.y) < 28 && !s.dialog) {
        r(ctx, "#fff", n.x - 3, n.y - 36, 7, 7);
        ctx.fillStyle = "#d4507a"; ctx.font = "7px sans-serif"; ctx.fillText("!", n.x - 1, n.y - 30);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const press = (k: string, v: boolean) => () => { keys.current[k] = v; };
  const padBtn = (k: string, label: string, cls: string) => (
    <button
      aria-label={label}
      className={`pad-btn ${cls}`}
      onPointerDown={(e) => { e.preventDefault(); press(k, true)(); }}
      onPointerUp={press(k, false)}
      onPointerLeave={press(k, false)}
      onPointerCancel={press(k, false)}
    >
      {label}
    </button>
  );

  return (
    <div className="game-shell">
      <div className="game-frame">
        <canvas ref={canvasRef} width={W} height={H} className="game-canvas" />

        {screen === "play" && (
          <div className="hud">
            <span>{LEVELS[level].name}</span>
            <span className="hud-stars">★ {stars} / {total}</span>
          </div>
        )}
        {screen === "play" && hint && dialog.length === 0 && <div className="hint">{hint}</div>}

        {dialog.length > 0 && (
          <button className="dialog" onClick={advance}>
            <span className="dialog-name">{dialog[0].name}</span>
            <span className="dialog-text">{dialog[0].text}</span>
            <span className="dialog-next">▼ 點擊 / 空白鍵繼續</span>
          </button>
        )}

        {screen === "title" && (
          <div className="overlay">
            <p className="overlay-kicker">✦ A Birthday Adventure ✦</p>
            <h1 className="title-main">星星失物招領所</h1>
            <h2 className="title-sub">給婷寶的星光</h2>
            <div className="overlay-actions">
              <button className="btn-game" onClick={() => startLevel(0)}>開始冒險</button>
              <button className="btn-game-ghost" onClick={() => setScreen("help")}>遊戲說明</button>
            </div>
          </div>
        )}

        {screen === "help" && (
          <div className="overlay">
            <h2 className="title-sub">遊戲說明</h2>
            <ul className="help-list">
              <li>⌨️ 方向鍵 / WASD：移動角色</li>
              <li>␣ 空白鍵 / Enter：調查、對話</li>
              <li>📱 手機：使用下方方向鍵與「調查」按鈕</li>
              <li>★ 收集每一關的星星，再和 NPC 說話即可過關</li>
            </ul>
            <button className="btn-game" onClick={() => setScreen("title")}>返回</button>
          </div>
        )}

        {screen === "clear" && (
          <div className="overlay">
            <p className="overlay-kicker">STAGE CLEAR</p>
            <h2 className="title-sub">{LEVELS[level].name} 完成！</h2>
            <p className="overlay-text">收集了 {total} 顆星星 ★</p>
            <button className="btn-game" onClick={() => startLevel(level + 1)}>
              前往 {LEVELS[level + 1]?.name}
            </button>
          </div>
        )}

        {screen === "ending" && (
          <div className="overlay ending">
            <div className="confetti" aria-hidden>
              {Array.from({ length: 24 }).map((_, i) => (
                <i key={i} style={{ left: `${(i * 41) % 100}%`, animationDelay: `${(i % 8) * 0.35}s` }}>
                  {i % 3 === 0 ? "★" : i % 3 === 1 ? "♥" : "✦"}
                </i>
              ))}
            </div>
            <p className="overlay-kicker">Happy Birthday</p>
            <h1 className="title-main">婷寶，生日快樂！</h1>
            <p className="overlay-text">
              寶箱裡是我們所有的星光回憶——<br />
              巴黎的陽光、一起笑過的每一天。<br />
              英國和香港雖然隔著一萬公里，<br />
              但只要抬頭看星星，我們就在同一片天空下。<br />
              願你新的一歲閃閃發亮 ✨
            </p>
            <div className="overlay-actions">
              <button className="btn-game" onClick={() => startLevel(0)}>再玩一次</button>
              <button className="btn-game-ghost" onClick={() => setScreen("title")}>回到標題</button>
            </div>
          </div>
        )}
      </div>

      <div className="controls">
        <div className="dpad">
          {padBtn("up", "▲", "pad-up")}
          {padBtn("left", "◀", "pad-left")}
          {padBtn("right", "▶", "pad-right")}
          {padBtn("down", "▼", "pad-down")}
        </div>
        <button className="action-btn" onPointerDown={(e) => { e.preventDefault(); interact(); }}>
          調查
        </button>
      </div>
      <p className="controls-tip">電腦：方向鍵 / WASD 移動・空白鍵調查</p>
    </div>
  );
}
