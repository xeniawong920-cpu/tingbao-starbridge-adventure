import * as A from "./art";

type C = CanvasRenderingContext2D;

export type Choice = { text: string; go: () => void };
export type Line = { name: string; text: string; choices?: Choice[] };
export type Quest = { id: string; text: string; done: boolean };

export type Obj = {
  id: string;
  x: number;
  y: number;
  label: string;
  r?: number;
  solid?: [number, number, number, number];
  visible?: () => boolean;
  draw: (c: C, t: number) => void;
  act?: () => void;
};

export type SceneDef = {
  name: string;
  sub: string;
  minX: number; maxX: number; minY: number; maxY: number;
  start: [number, number];
  objs: Obj[];
  onEnter: () => void;
  onStar?: (n: number) => void;
  blocked?: (x: number, y: number) => boolean;
  update?: () => void;
  drawExtra?: (c: C, t: number) => void;
};

export type Api = {
  say: (lines: Line[], onEnd?: () => void) => void;
  setQuests: (q: Quest[]) => void;
  qText: (id: string, text: string) => void;
  qDone: (id: string) => void;
  has: (f: string) => boolean;
  set: (f: string) => void;
  count: (f: string) => number;
  inc: (f: string) => number;
  give: (item: string) => void;
  hasItem: (item: string) => boolean;
  addStar: (x: number, y: number) => void;
  sceneStars: () => number;
  bonusStar: (x: number, y: number) => void;
  unlock: (id: string) => void;
  examine: (id: string) => number;
  toast: (s: string) => void;
  burst: (x: number, y: number) => void;
  flash: () => void;
  go: (scene: number) => void;
  ending: () => void;
  player: () => { x: number; y: number };
};

export const ACHIEVEMENTS = [
  { id: "curious", name: "好奇寶寶", desc: "調查了失物招領所的每個角落" },
  { id: "genius", name: "一次解開！", desc: "沒有出錯就打開了星之抽屜" },
  { id: "cat", name: "貓咪知己", desc: "陪睡覺的貓咪聊了三次" },
  { id: "secret", name: "星光收藏家", desc: "找到藏在巴黎花叢裡的秘密星星" },
  { id: "promise", name: "約定之星", desc: "在星光橋許下了約定" },
  { id: "buddy", name: "年度最佳旅伴！下次旅行繼續組隊！", desc: "完成給婷寶的生日冒險" },
];

export const SOUVENIRS = ["明信片", "貝雷帽", "馬卡龍", "旅行照片"];
const ME = "我";
const N = "旁白";

// ---------------------------------------------------------------- scene 0
function shop(api: Api): SceneDef {
  const clues = () => api.count("clue");
  const clueText = () => `調查三件失物，找出抽屜密碼（${clues()}/3）`;
  const starText = (n: number) => `撿回散落的星星（${n}/4）`;
  const checkCurious = (id: string) => {
    if (api.examine(id) >= 8) api.unlock("curious");
  };
  const clue = (id: string, flag: string, name: string, before: string, text: string) => () => {
    checkCurious(id);
    if (!api.has("metOwl")) return api.say([{ name: N, text: before }]);
    if (api.has(flag)) return api.say([{ name, text }]);
    api.set(flag);
    api.inc("clue");
    api.say([{ name, text }, { name: N, text: `獲得線索！（${clues()}/3）` }], () => {
      api.qText("clues", clueText());
      if (clues() === 3) api.qDone("clues");
    });
  };

  const puzzle = (picked: string[]) => {
    const syms = ["☾ 月亮", "♥ 愛心", "★ 星星"];
    api.say([{
      name: "星之抽屜",
      text: `請選擇第 ${picked.length + 1} 個符號。　目前：${picked.join(" ") || "—"}`,
      choices: syms.map((s) => ({
        text: s,
        go: () => {
          const next = [...picked, s.charAt(0)];
          if (next.length < 3) return puzzle(next);
          if (next.join("") === "☾♥★") {
            api.set("drawerOpen");
            api.burst(262, 196);
            api.qDone("drawer");
            if (!api.has("mistake")) api.unlock("genius");
            api.give("旅行相簿");
            api.say([
              { name: N, text: "咔噠——抽屜緩緩打開，裡面放著一本旅行相簿。" },
              { name: ME, text: "是我準備送給婷寶的相簿！咦……照片怎麼都褪色了？" },
              { name: "貓頭鷹館長", text: "照片的顏色留在回憶裡了。穿過剛出現的星之門，回到那段法國旅行吧。" },
            ], () => {
              api.set("portal0");
              api.setQuests([...[]]);
              api.setQuests([
                { id: "owl", text: "和貓頭鷹館長說話", done: true },
                { id: "stars", text: starText(4), done: true },
                { id: "clues", text: "調查三件失物，找出抽屜密碼（3/3）", done: true },
                { id: "drawer", text: "打開星之抽屜", done: true },
                { id: "door", text: "走進地毯上的星之門", done: false },
              ]);
              api.toast("🔓 解鎖：法國旅行回憶");
            });
          } else {
            api.set("mistake");
            api.say([{ name: N, text: "咔……鎖沒有打開。再回想一下三件失物的線索吧。" }]);
          }
        },
      })),
    }]);
  };

  return {
    name: "第一章・星星失物招領所",
    sub: "一份寄錯地方的生日禮物",
    minX: 10, maxX: 310, minY: 116, maxY: 234,
    start: [160, 222],
    onEnter: () => {
      api.setQuests([{ id: "owl", text: "和服務台的貓頭鷹館長說話", done: false }]);
      api.say([
        { name: N, text: "深夜，城市另一端亮著一盞小燈——星星失物招領所。" },
        { name: ME, text: "聽說這裡能找回所有不見了的東西……去服務台問問吧。" },
      ]);
    },
    onStar: (n) => {
      api.qText("stars", starText(n));
      if (n === 4) api.qDone("stars");
    },
    objs: [
      {
        id: "owl", x: 160, y: 112, r: 30, label: "貓頭鷹館長", solid: [128, 96, 64, 18],
        draw: (c, t) => A.drawCounter(c, t),
        act: () => {
          if (!api.has("metOwl")) {
            api.say([
              { name: "貓頭鷹館長", text: "呼呼～歡迎光臨星星失物招領所！我是這裡的館長。" },
              { name: "貓頭鷹館長", text: "今晚收到一件很重要的失物：一本要寄去香港、送給「婷寶」的生日相簿。" },
              { name: ME, text: "那是我準備的禮物！我在英國，寄了好久都寄不到……原來在這裡！" },
              { name: "貓頭鷹館長", text: "相簿被鎖進了『星之抽屜』。抽屜要4顆星光才能啟動，密碼就藏在三件失物裡。" },
              {
                name: "貓頭鷹館長", text: "你願意親手把它找回來嗎？",
                choices: [
                  { text: "交給我吧！", go: () => afterOwl("好有精神！") },
                  { text: "為了婷寶，我會努力的。", go: () => afterOwl("真是溫柔的朋友。") },
                ],
              },
            ]);
          } else if (!api.has("drawerOpen")) {
            api.say([{ name: "貓頭鷹館長", text: `星星 ${api.sceneStars()}/4、線索 ${clues()}/3。音樂盒在左邊、雨傘架在右邊、信箱在左下角喔。` }]);
          } else api.say([{ name: "貓頭鷹館長", text: "星之門已經打開了。去吧，回憶在等你。" }]);
        },
      },
      { id: "music", x: 40, y: 150, label: "音樂盒", solid: [28, 138, 24, 14], draw: (c, t) => A.drawMusicBox(c, 40, 150, t),
        act: clue("music", "c1", "音樂盒", "一個舊音樂盒，好像在等待主人回來。", "♪ 叮叮噹～盒蓋內側刻著一彎月亮：「第一個符號是 ☾ 月亮」。") },
      { id: "umbrella", x: 284, y: 150, label: "雨傘架", solid: [276, 132, 16, 18], draw: (c) => A.drawUmbrellaStand(c, 284, 150),
        act: clue("umbrella", "c2", "粉紅雨傘", "幾把被遺忘的雨傘，大概來自很多個下雨天。", "傘柄綁著小紙條：「中間的符號是 ♥ 愛心」。") },
      { id: "letter", x: 40, y: 218, label: "信箱", solid: [32, 204, 16, 14], draw: (c) => A.drawLetterbox(c, 40, 218),
        act: clue("letter", "c3", "寄不出的信", "一個塞滿信件的信箱。", "信封上寫著「給遠方的朋友」，背面畫著：「最後一個符號是 ★ 星星」。") },
      {
        id: "drawer", x: 268, y: 218, r: 26, label: "星之抽屜", solid: [250, 196, 36, 22],
        draw: (c, t) => A.drawDrawer(c, 268, 218, api.has("drawerOpen"), t),
        act: () => {
          checkCurious("drawer");
          if (api.has("drawerOpen")) return api.say([{ name: N, text: "抽屜已經空了，只剩一點星光。" }]);
          if (!api.has("metOwl")) return api.say([{ name: N, text: "一個上了鎖的木抽屜，鎖上有三個空格。" }]);
          if (api.sceneStars() < 4 || clues() < 3)
            return api.say([{ name: N, text: `抽屜沒有反應。需要星光（${api.sceneStars()}/4）和完整的密碼線索（${clues()}/3）。` }]);
          api.say([{ name: N, text: "四顆星星飛進鎖孔，三個空格亮了起來……" }], () => puzzle([]));
        },
      },
      {
        id: "cat", x: 118, y: 196, r: 20, label: "睡覺的貓咪", draw: (c, t) => A.drawCat(c, 118, 196, t),
        act: () => {
          checkCurious("cat");
          const n = api.inc("cat");
          const lines = ["喵……（貓咪睡得很香）", "喵嗚？（尾巴輕輕擺了一下）", "呼嚕呼嚕……（貓咪蹭了蹭你的手，好像在說加油）"];
          api.say([{ name: "貓咪", text: lines[Math.min(n, 3) - 1]! }], () => { if (n === 3) api.unlock("cat"); });
        },
      },
      { id: "plantL", x: 16, y: 128, label: "盆栽", solid: [8, 116, 16, 12], draw: (c) => A.drawPlant(c, 16, 128),
        act: () => { checkCurious("plantL"); api.say([{ name: N, text: "盆栽上掛著小牌子：「每天澆水，也每天想念一個人。」" }]); } },
      { id: "plantR", x: 304, y: 128, label: "盆栽", solid: [296, 116, 16, 12], draw: (c) => A.drawPlant(c, 304, 128),
        act: () => { checkCurious("plantR"); api.say([{ name: N, text: "葉子上沾著一點星塵，閃閃的。" }]); } },
      { id: "shelfL", x: 96, y: 118, r: 18, label: "失物架", draw: () => {},
        act: () => { checkCurious("shelfL"); api.say([{ name: N, text: "架上有瓶子裝著別人遺失的東西：一句沒說出口的晚安、一個午後的陽光……" }]); } },
      { id: "shelfR", x: 224, y: 118, r: 18, label: "失物架", draw: () => {},
        act: () => { checkCurious("shelfR"); api.say([{ name: N, text: "標籤寫著「時差」，看來有人把八小時弄丟了。" }]); } },
      {
        id: "portal", x: 200, y: 186, r: 22, label: "星之門", visible: () => api.has("portal0"),
        draw: (c, t) => A.drawPortal(c, 200, 186, t),
        act: () => api.go(1),
      },
    ],
  };

  function afterOwl(praise: string) {
    api.say([
      { name: "貓頭鷹館長", text: `${praise}先撿回地上散落的4顆星星，再調查音樂盒、雨傘和信箱找出密碼。` },
    ], () => {
      api.set("metOwl");
      api.setQuests([
        { id: "owl", text: "和貓頭鷹館長說話", done: true },
        { id: "stars", text: starText(0), done: false },
        { id: "clues", text: clueText(), done: false },
        { id: "drawer", text: "打開星之抽屜", done: false },
      ]);
      ([[36, 184], [150, 140], [292, 190], [196, 226]] as const).forEach(([x, y]) => api.addStar(x, y));
      api.toast("✨ 星星出現了！");
    });
  }
}

// ---------------------------------------------------------------- scene 1
const MEMORIES = [
  "回憶星星：那天的陽光很暖，街道很好看。",
  "回憶星星：兩個人拿著地圖，一起找路。",
  "回憶星星：互相幫對方拍照，要拍到滿意為止。",
  "回憶星星：一起品嚐了當地的甜點。",
  "回憶星星：說好了，下次還要一起旅行。",
];

function paris(api: Api): SceneDef {
  const got = () => SOUVENIRS.filter((s) => api.hasItem(s)).length;
  const souvText = () => `收集4件旅行紀念物（${got()}/4）`;
  const giveSouv = (item: string) => {
    api.give(item);
    api.qText("souv", souvText());
    if (got() === 4) api.qDone("souv");
    readyCheck();
  };
  const readyCheck = () => {
    if (got() === 4 && api.sceneStars() >= 5 && !api.has("readyHint")) {
      api.set("readyHint");
      api.toast("🎨 去找街頭畫家修復相簿吧！");
    }
  };

  return {
    name: "第二章・法國旅行的回憶",
    sub: "那年，我們一起去了法國",
    minX: 10, maxX: 310, minY: 132, maxY: 234,
    start: [160, 226],
    onEnter: () => {
      api.setQuests([
        { id: "stars", text: "撿回5顆回憶星星（0/5）", done: false },
        { id: "souv", text: souvText(), done: false },
        { id: "painter", text: "請街頭畫家修復旅行相簿", done: false },
      ]);
      ([[28, 172], [130, 160], [196, 150], [282, 182], [240, 228]] as const).forEach(([x, y]) => api.addStar(x, y));
      api.say([
        { name: ME, text: "這裡是……巴黎的街道。是我和婷寶一起旅行時的回憶。" },
        { name: ME, text: "褪色的照片變成了星星和紀念物，散落在街上。一件一件找回來吧！" },
        { name: N, text: "目標：收集5顆回憶星星、4件紀念物，再請街頭畫家修復相簿。" },
      ]);
    },
    onStar: (n) => {
      api.toast(MEMORIES[n - 1] ?? "回憶星星");
      api.qText("stars", `撿回5顆回憶星星（${n}/5）`);
      if (n === 5) api.qDone("stars");
      readyCheck();
    },
    objs: [
      {
        id: "painter", x: 50, y: 160, r: 28, label: "街頭畫家", solid: [38, 146, 40, 14],
        draw: (c, t) => A.drawPainter(c, 50, 160, t),
        act: () => {
          if (api.has("painted")) return api.say([{ name: "街頭畫家", text: "光之門就在那裡。Bon voyage！" }]);
          if (got() < 4 || api.sceneStars() < 5)
            return api.say([
              { name: "街頭畫家", text: "Bonjour！你的相簿褪色了？我能用畫筆把顏色畫回去。" },
              { name: "街頭畫家", text: `不過我需要旅行的紀念物（${got()}/4）和回憶的星光（${api.sceneStars()}/5）當顏料。` },
            ]);
          api.say([
            { name: "街頭畫家", text: "顏料都齊了！你想把哪個畫面畫在相簿封面？",
              choices: ["兩個人並肩的背影", "滿桌的甜點", "傍晚的街道"].map((s) => ({
                text: s,
                go: () => {
                  api.burst(60, 140);
                  api.say([
                    { name: "街頭畫家", text: `「${s}」……Magnifique！相簿的照片一張張亮了起來。` },
                    { name: "街頭畫家", text: "回憶不需要記得每一個細節，記得當時有多開心就夠了。" },
                    { name: "街頭畫家", text: "前面的光之門通往星光橋。她，就在橋的另一端。" },
                  ], () => {
                    api.set("painted");
                    api.qDone("painter");
                    api.setQuests([
                      { id: "stars", text: "撿回5顆回憶星星（5/5）", done: true },
                      { id: "souv", text: "收集4件旅行紀念物（4/4）", done: true },
                      { id: "painter", text: "請街頭畫家修復旅行相簿", done: true },
                      { id: "door", text: "走進廣場中央的光之門", done: false },
                    ]);
                    api.toast("🌉 解鎖：最終章・星光橋");
                  });
                },
              })) },
          ]);
        },
      },
      {
        id: "stall", x: 252, y: 162, r: 28, label: "甜點攤", solid: [230, 134, 44, 30],
        draw: (c, t) => A.drawStall(c, 252, 162, t),
        act: () => {
          if (api.hasItem("馬卡龍")) return api.say([{ name: "甜點師", text: "Merci！甜點要和重要的人分享才最好吃喔。" }]);
          api.say([{
            name: "甜點師", text: "Bonjour～要帶一盒馬卡龍當旅行紀念嗎？選個口味吧！",
            choices: ["草莓", "薰衣草", "開心果"].map((f) => ({
              text: f,
              go: () => api.say([{ name: "甜點師", text: `${f}口味，好選擇！這一盒送給你們兩位旅人。` }], () => giveSouv("馬卡龍")),
            })),
          }]);
        },
      },
      {
        id: "post", x: 300, y: 214, label: "郵筒", solid: [294, 202, 12, 12],
        draw: (c) => A.drawPostbox(c, 300, 214),
        act: () => {
          if (api.hasItem("明信片")) return api.say([{ name: N, text: "明信片已經好好收著了。" }]);
          api.say([{
            name: N, text: "郵筒旁有一張空白明信片。要寫甚麼給婷寶？",
            choices: ["希望你每天都開心！", "下次再一起旅行！", "謝謝你當我的旅伴。"].map((s) => ({
              text: s,
              go: () => api.say([{ name: ME, text: `「${s}」……寫好了，留作紀念吧。` }], () => giveSouv("明信片")),
            })),
          }]);
        },
      },
      {
        id: "cart", x: 150, y: 222, r: 26, label: "帽子小販", solid: [134, 206, 40, 14],
        draw: (c, t) => A.drawBeretCart(c, 150, 222, t),
        act: () => {
          if (api.hasItem("貝雷帽")) return api.say([{ name: "帽子小販", text: "那頂貝雷帽很適合你喔！" }]);
          if (api.sceneStars() < 3)
            return api.say([{ name: "帽子小販", text: `小姐，想要貝雷帽嗎？給我看看3顆回憶星星的光吧（${api.sceneStars()}/3）。` }]);
          api.say([
            { name: "帽子小販", text: "哇，好溫暖的星光！這頂貝雷帽是你的了——戴上它，就像回到旅行那天。" },
          ], () => giveSouv("貝雷帽"));
        },
      },
      {
        id: "photo", x: 70, y: 214, r: 18, label: "拍照點",
        draw: (c, t) => { if (!api.hasItem("旅行照片")) A.drawPhotoSpot(c, 70, 214, t); },
        act: () => {
          if (api.hasItem("旅行照片")) return api.say([{ name: N, text: "這個角度真的很好看。" }]);
          api.flash();
          api.say([{ name: ME, text: "以遠方的鐵塔做背景……喀嚓！拍得好好看，就像那時候一樣。" }], () => giveSouv("旅行照片"));
        },
      },
      { id: "bushA", x: 104, y: 196, label: "花叢", solid: [92, 186, 24, 10], draw: (c) => A.drawBush(c, 104, 196),
        act: () => api.say([{ name: N, text: "花開得很漂亮，空氣裡有甜甜的香味。" }]) },
      {
        id: "bushB", x: 214, y: 196, label: "花叢", solid: [202, 186, 24, 10], draw: (c, t) => {
          A.drawBush(c, 214, 196);
          if (!api.has("secret")) A.glow(c, 214, 188, 6 + Math.sin(t / 8) * 2, "255,236,160", 0.6);
        },
        act: () => {
          if (api.has("secret")) return api.say([{ name: N, text: "花叢裡已經沒有星光了。" }]);
          api.set("secret");
          api.bonusStar(214, 186);
          api.say([{ name: N, text: "花叢深處有東西在發光……是一顆秘密星星！" }], () => api.unlock("secret"));
        },
      },
      { id: "bench", x: 280, y: 140, r: 20, label: "長椅", solid: [266, 128, 28, 10], draw: (c) => A.drawBench(c, 280, 140),
        act: () => api.say([{ name: ME, text: "旅行時走累了，坐下來聊天的時間，好像也是很珍貴的回憶。" }]) },
      {
        id: "portal", x: 160, y: 190, r: 22, label: "光之門", visible: () => api.has("painted"),
        draw: (c, t) => A.drawPortal(c, 160, 190, t),
        act: () => api.go(2),
      },
    ],
  };
}

// ---------------------------------------------------------------- scene 2
const LANTERNS: [number, number][] = [[50, 146], [96, 206], [142, 146], [188, 206], [234, 146]];

function bridge(api: Api): SceneDef {
  const lit = () => api.count("lit");
  return {
    name: "最終章・星光橋",
    sub: "連接英國與香港的橋",
    minX: 18, maxX: 302, minY: 144, maxY: 196,
    start: [30, 174],
    onEnter: () => {
      api.setQuests([
        { id: "lanterns", text: "點亮橋上的5盞星燈（0/5）", done: false },
        { id: "spirit", text: "回答星光精靈的問題", done: false },
        { id: "meet", text: "走到橋的另一端", done: false },
      ]);
      api.say([
        { name: ME, text: "這就是星光橋……我站的這端是英國，另一端是香港。" },
        { name: ME, text: "那邊好像有人影……是婷寶！可是星光屏障擋住了路。" },
        { name: N, text: "點亮橋上的5盞星燈，喚醒守護橋的星光精靈吧。" },
      ]);
    },
    blocked: (x) => !api.has("barrierOff") && x > 252,
    update: () => {
      const p = api.player();
      if (api.has("barrierOff") && p.x > 272 && !api.has("ended")) {
        api.set("ended");
        api.qDone("meet");
        api.ending();
      }
    },
    drawExtra: (c, t) => {
      A.drawChibi(c, 296, 176, A.TING_LOOK, 2, Math.floor(t / 30), false, api.has("barrierOff") ? 0.95 : 0.55);
      c.fillStyle = "#fff4fb";
      c.font = "bold 6px sans-serif";
      c.fillText("婷寶", 289, 142);
      if (!api.has("barrierOff")) {
        for (let y = 130; y < 200; y += 3) {
          const a = 0.35 + Math.sin(t / 8 + y) * 0.25;
          c.fillStyle = `rgba(255,214,235,${a})`;
          c.fillRect(258 + Math.sin(t / 10 + y / 6) * 2, y, 2, 2);
        }
      }
    },
    objs: [
      ...LANTERNS.map(([x, y], i): Obj => ({
        id: `lantern${i}`, x, y: y + 2, r: 22, label: "星燈",
        draw: (c, t) => A.drawLantern(c, x, y, api.has(`lit${i}`), t),
        act: () => {
          if (api.has(`lit${i}`)) return api.say([{ name: N, text: "星燈溫柔地亮著。" }]);
          api.set(`lit${i}`);
          const n = api.inc("lit");
          api.bonusStar(x, y - 18);
          api.qText("lanterns", `點亮橋上的5盞星燈（${n}/5）`);
          api.toast(["英國的燈亮了 ✦", "思念的燈亮了 ✦", "時差的燈亮了 ✦", "旅行的燈亮了 ✦", "香港的燈亮了 ✦"][i]!);
          if (n === 5) {
            api.qDone("lanterns");
            api.say([{ name: N, text: "五盞星燈全部亮起，橋中央的星光精靈醒過來了！" }]);
          }
        },
      })),
      {
        id: "spirit", x: 176, y: 176, r: 26, label: "星光精靈",
        draw: (c, t) => A.drawSpirit(c, 176, 176, t, lit() === 5),
        act: () => {
          if (lit() < 5) return api.say([{ name: "星光精靈", text: "Zzz……點亮……所有星燈……" }]);
          if (api.has("barrierOff")) return api.say([{ name: "星光精靈", text: "去吧，她在等你。" }]);
          api.say([
            { name: "星光精靈", text: "你從英國一路走到這裡了呢。最後，我想問你一個問題。" },
            {
              name: "星光精靈", text: "這座橋上要掛一顆新的星星，你想為它取甚麼名字？",
              choices: [
                { text: "友情之星", go: () => answer("友情之星", false) },
                { text: "回憶之星", go: () => answer("回憶之星", false) },
                { text: "約定之星", go: () => answer("約定之星", true) },
              ],
            },
          ]);
        },
      },
    ],
  };

  function answer(name: string, promise: boolean) {
    api.burst(176, 150);
    api.say([
      { name: "星光精靈", text: `「${name}」……真好聽。這顆星會一直掛在英國和香港之間的天空。` },
      { name: "星光精靈", text: "星光屏障解除了。去吧，走到她身邊。" },
    ], () => {
      if (promise) api.unlock("promise");
      api.set("barrierOff");
      api.qDone("spirit");
      api.qText("meet", "走到橋的另一端，和婷寶相遇");
    });
  }
}

export function makeScene(i: number, api: Api): SceneDef {
  return i === 0 ? shop(api) : i === 1 ? paris(api) : bridge(api);
}

export const SCENE_NAMES = ["第一章・星星失物招領所", "第二章・法國旅行的回憶", "最終章・星光橋"];
export const SCENE_SUBS = ["一份寄錯地方的生日禮物", "那年，我們一起去了法國", "連接英國與香港的橋"];
