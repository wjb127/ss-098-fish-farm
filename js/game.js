(() => {
  const SAVE = "ss098-mulgyeol-v2";
  const NAMES = ["초코","보리","달이","콩","구름","별이","모모","진주","단풍","하늬","토리","나비","솔","미르","은모래","콩이","라온","다래","윤슬","하람"];

  const SPECIES = {
    gold:    { id:"gold",    name:"금붕어", price:20,   drop:[1,3],   every:5.2, grow:1.2,  c1:"#f08a3a", c2:"#d45b2a", shape:"round" },
    guppy:   { id:"guppy",   name:"구피",   price:45,   drop:[2,5],   every:4.5, grow:1.4,  c1:"#2eb8a4", c2:"#e07aa8", shape:"fan" },
    neon:    { id:"neon",    name:"네온테트라", price:95, drop:[3,7], every:4.2, grow:1.5,  c1:"#1aa3c4", c2:"#e23d4a", shape:"slim" },
    betta:   { id:"betta",   name:"베타",   price:160,  drop:[5,10],  every:4.0, grow:1.1,  c1:"#e23d4a", c2:"#5b4cdb", shape:"betta" },
    angel:   { id:"angel",   name:"엔젤",   price:380,  drop:[10,17], every:3.7, grow:0.95, c1:"#ece8e0", c2:"#2a2a32", shape:"tall" },
    discus:  { id:"discus",  name:"디스커스", price:620, drop:[14,24], every:3.5, grow:0.9, c1:"#e07a3a", c2:"#5c3a2a", shape:"disc" },
    koi:     { id:"koi",     name:"코이",   price:980,  drop:[22,34], every:3.3, grow:0.85, c1:"#f7f3ee", c2:"#d23a2a", shape:"long" },
    arowana: { id:"arowana", name:"아로와나", price:1680, drop:[34,52], every:3.0, grow:0.75, c1:"#d4a054", c2:"#8a5a22", shape:"long" },
    dragon:  { id:"dragon",  name:"용왕어", price:2800, drop:[55,88], every:2.7, grow:0.65, c1:"#f2c14e", c2:"#3ad0e0", shape:"dragon" },
  };

  const TANK = [6, 8, 12, 16, 22];
  const TANK_COST = [0, 90, 260, 720, 1600];
  const FOODQ = [1, 1.4, 1.85, 2.3];
  const FOODQ_COST = [0, 120, 380, 900];
  const MAG_COST = [0, 200, 620];
  const LUCK = [1, 1.25, 1.55, 1.9];
  const LUCK_COST = [0, 150, 480, 1100];
  const BREED_COST = [0, 180, 540];
  const DECOS = {
    weed:   { name:"수초",  price:60,  desc:"성장이 조금 빨라집니다" },
    castle: { name:"성",    price:180, desc:"번식이 조금 잘 됩니다" },
    chest:  { name:"보물상자", price:260, desc:"동전 운이 조금 오릅니다" },
    lamp:   { name:"등불",  price:140, desc:"배고픔이 천천히 줄어듭니다" },
    coral:  { name:"산호",  price:220, desc:"가끔 진주가 나옵니다" },
  };

  const QUESTS = [
    { id:"coin5",  title:"첫 동전",     desc:"동전 5개를 줍기",           need: (s) => s.stats.picked >= 5,     rew:{ money:20, food:8 } },
    { id:"feed3",  title:"밥 시간",     desc:"밥 주기 3번",               need: (s) => s.stats.fed >= 3,        rew:{ money:15, food:10 } },
    { id:"guppy",  title:"새 친구",     desc:"구피 한 마리 들이기",       need: (s) => !!s.seen.guppy,          rew:{ money:40, food:5 } },
    { id:"adult",  title:"다 자랐어요", desc:"성어 만들기",               need: (s) => s.fish.some(f => f.growth >= 72), rew:{ money:50, food:8 } },
    { id:"baby",   title:"탄생",        desc:"치어가 태어나게 하기",       need: (s) => s.stats.born >= 1,       rew:{ money:80, food:12 } },
    { id:"tank",   title:"더 넓은 집",  desc:"수조 한 번 확장",           need: (s) => s.tankLv >= 1,           rew:{ money:70, food:10 } },
    { id:"deco",   title:"꾸미기",      desc:"장식 하나 놓기",             need: (s) => Object.values(s.deco).some(Boolean), rew:{ money:90, food:8 } },
    { id:"five",   title:"다섯 마리",   desc:"물고기 5마리 키우기",        need: (s) => s.fish.length >= 5,      rew:{ money:120, food:15 } },
    { id:"koi",    title:"비단잉어",    desc:"코이 들이기",               need: (s) => !!s.seen.koi,            rew:{ money:250, food:20 } },
    { id:"earn",   title:"부자 수조",   desc:"누적 동전 3,000 모으기",    need: (s) => s.stats.earned >= 3000,  rew:{ money:400, food:30 } },
  ];

  const canvas = document.getElementById("tank");
  const ctx = canvas.getContext("2d");
  const toastEl = document.getElementById("toast");
  const hintEl = document.getElementById("hint");
  const cardEl = document.getElementById("card");

  let W = 800, H = 500, dpr = 1, last = performance.now();
  let selected = null, shopTab = "fish", toastTimer = 0, hintTimer = 0;
  let combo = 0, comboT = 0, audio, muted;

  const state = blank();

  function blank() {
    return {
      money: 80, food: 20,
      tankLv: 0, foodLv: 0, magLv: 0, luckLv: 0, breedLv: 0,
      seen: { gold: true },
      deco: { weed:false, castle:false, chest:false, lamp:false, coral:false },
      quests: {},
      stats: { picked:0, fed:0, born:0, earned:0, cleaned:0 },
      fish: [], coins: [], bubbles: [], floaters: [], hearts: [],
      nextId: 1, breedCd: 0, dirt: 8, boost: 0, last: Date.now(), mute: false, tut: 0,
    };
  }

  function cap() { return TANK[state.tankLv]; }
  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[(Math.random() * arr.length) | 0]; }
  function stageOf(g) { return g < 34 ? "치어" : g < 72 ? "유어" : "성어"; }
  function stageMul(g) { return g < 34 ? 0.55 : g < 72 ? 0.82 : 1.18; }
  function buyOk(n) { return state.money >= n; }
  function spend(n) { state.money = Math.max(0, state.money - n); }
  function luck() { return LUCK[state.luckLv] * (state.deco.chest ? 1.08 : 1); }

  function toast(msg) {
    toastEl.textContent = msg; toastEl.classList.add("on");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove("on"), 1700);
  }
  function hint(msg) {
    hintEl.textContent = msg; hintEl.classList.add("on");
    clearTimeout(hintTimer);
    hintTimer = setTimeout(() => hintEl.classList.remove("on"), 3200);
  }

  function beep(kind) {
    if (state.mute) return;
    try {
      audio ||= new (window.AudioContext || window.webkitAudioContext)();
      if (audio.state === "suspended") audio.resume();
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.connect(g); g.connect(audio.destination);
      const now = audio.currentTime;
      const map = { coin:[880,0.07], feed:[320,0.09], buy:[520,0.12], baby:[660,0.16], ok:[440,0.08] };
      const [f, d] = map[kind] || [400, 0.08];
      o.frequency.value = f;
      o.type = kind === "coin" ? "triangle" : "sine";
      g.gain.setValueAtTime(0.05, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + d);
      o.start(now); o.stop(now + d);
    } catch {}
  }

  function uniqueName() {
    const used = new Set(state.fish.map((f) => f.name));
    const free = NAMES.filter((n) => !used.has(n));
    return free.length ? pick(free) : pick(NAMES) + (1 + ((Math.random() * 9) | 0));
  }

  function makeFish(spec, growth) {
    const s = SPECIES[spec];
    return {
      id: state.nextId++,
      spec, name: uniqueName(),
      x: rand(70, Math.max(90, W - 70)),
      y: rand(70, Math.max(90, H - 90)),
      vx: rand(-36, 36) || 18, vy: rand(-16, 16),
      tx: 0, ty: 0,
      t: rand(0, 20),
      hunger: 82,
      growth: growth ?? rand(6, 20),
      up: 0,
      dropIn: rand(s.every * 0.3, s.every),
    };
  }

  function addCoin(x, y, v, pearl) {
    state.coins.push({ x, y, v, vy: -26, life: 8, wob: rand(0, 6), pearl: !!pearl });
  }
  function collect(c) {
    const v = Math.max(1, Math.round(c.v * luck()));
    state.money += v;
    state.stats.picked++;
    state.stats.earned += v;
    comboT = 0.7; combo++;
    const extra = combo >= 5 ? Math.ceil(combo / 5) : 0;
    if (extra) state.money += extra;
    state.floaters.push({ x: c.x, y: c.y, t: 0, text: "+" + (v + extra) + (c.pearl ? " 진주" : "") });
    beep("coin");
    if (state.tut === 0) state.tut = 1;
  }

  function feed() {
    if (!state.fish.length) return toast("물고기가 없어요");
    if (state.food <= 0) return toast("밥이 없어요. 상점에서 사 주세요");
    const sorted = [...state.fish].sort((a, b) => a.hunger - b.hunger);
    const n = Math.min(state.food, sorted.length);
    state.food -= n;
    state.stats.fed++;
    for (let i = 0; i < n; i++) {
      sorted[i].hunger = Math.min(100, sorted[i].hunger + 58);
      state.hearts.push({ x: sorted[i].x, y: sorted[i].y - 12, t: 0 });
    }
    beep("feed");
    toast("밥을 줬어요");
    if (state.tut === 1) { state.tut = 2; hint("배가 부르면 자라고, 성어 둘이 있으면 새끼를 낳아요"); }
  }

  function clean() {
    if (state.dirt < 8) return toast("아직 깨끗해요");
    const cost = 8 + state.fish.length * 4;
    if (!buyOk(cost)) return toast("청소비 " + cost + "동전이 필요해요");
    spend(cost);
    state.dirt = 0;
    state.stats.cleaned++;
    beep("ok");
    toast("수조를 닦았어요");
    save();
  }

  function upCost(f) { return 22 * (f.up + 1) * (f.up + 1); }
  function sellValue(f) {
    const base = SPECIES[f.spec].price;
    return Math.max(8, Math.floor(base * (0.28 + f.growth / 220) * (1 + f.up * 0.12)));
  }
  function upgradeFish(f) {
    if (f.up >= 10) return toast("이미 최고예요");
    const cost = upCost(f);
    if (!buyOk(cost)) return toast("동전이 모자라요");
    spend(cost); f.up++; beep("buy"); toast(f.name + " 업그레이드 " + f.up);
    renderCard(); save();
  }
  function sellFish(f) {
    const v = sellValue(f);
    state.money += v;
    state.fish = state.fish.filter((x) => x.id !== f.id);
    if (selected === f.id) selected = null;
    beep("ok"); toast(f.name + "를 " + v + "동전에 보냈어요");
    renderCard(); hud(); save();
  }

  function tryBreed(dt) {
    state.breedCd = Math.max(0, state.breedCd - dt);
    if (state.breedCd > 0 || state.fish.length >= cap()) return;
    if (state.dirt > 72) return;
    const adults = state.fish.filter((f) => f.growth >= 72 && f.hunger > 60);
    const groups = {};
    adults.forEach((f) => { (groups[f.spec] ||= []).push(f); });
    const keys = Object.keys(groups).filter((k) => groups[k].length >= 2);
    if (!keys.length) return;
    const chance = 0.22 + state.breedLv * 0.12 + (state.deco.castle ? 0.08 : 0);
    if (Math.random() > chance) return;
    const spec = pick(keys);
    const pair = groups[spec];
    const a = pair[0], b = pair[1];
    const baby = makeFish(spec, 3);
    baby.x = (a.x + b.x) / 2; baby.y = (a.y + b.y) / 2;
    state.fish.push(baby);
    state.stats.born++;
    state.breedCd = Math.max(14, 30 - state.breedLv * 6);
    beep("baby");
    toast(SPECIES[spec].name + " 치어가 태어났어요");
    state.floaters.push({ x: baby.x, y: baby.y, t: 0, text: "탄생" });
  }

  function activeQuest() {
    return QUESTS.find((q) => !state.quests[q.id]);
  }
  function claimQuests() {
    QUESTS.forEach((q) => {
      if (state.quests[q.id] || !q.need(state)) return;
      state.quests[q.id] = true;
      state.money += q.rew.money;
      state.food += q.rew.food;
      toast("미션 완료 · " + q.title + " +" + q.rew.money);
      beep("buy");
    });
  }

  function resize() {
    const wrap = document.getElementById("tankWrap");
    dpr = Math.min(2, window.devicePixelRatio || 1);
    W = wrap.clientWidth; H = wrap.clientHeight;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + "px"; canvas.style.height = H + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function tick(dt) {
    comboT -= dt; if (comboT <= 0) combo = 0;
    state.dirt = Math.min(100, state.dirt + dt * (0.35 + state.fish.length * 0.04));
    if (state.boost > 0) state.boost = Math.max(0, state.boost - dt);
    const fq = FOODQ[state.foodLv] * (state.deco.weed ? 1.08 : 1) * (state.boost > 0 ? 1.6 : 1);
    const drain = (state.deco.lamp ? 0.85 : 1) * (state.dirt > 70 ? 1.35 : 1);

    state.fish.forEach((f) => {
      const s = SPECIES[f.spec];
      f.t += dt;
      f.hunger = Math.max(0, f.hunger - dt * 1.2 * drain);
      if (f.hunger > 30 && f.growth < 100) {
        f.growth = Math.min(100, f.growth + dt * 1.55 * s.grow * fq * (0.4 + f.hunger / 150));
      }
      if (!f.tx || Math.hypot(f.x - f.tx, f.y - f.ty) < 18) {
        f.tx = rand(50, W - 50); f.ty = rand(60, H - 80);
      }
      f.vx += (f.tx - f.x) * dt * 0.7;
      f.vy += (f.ty - f.y) * dt * 0.5;
      const lim = 70;
      const sp = Math.hypot(f.vx, f.vy) || 1;
      if (sp > lim) { f.vx *= lim / sp; f.vy *= lim / sp; }
      const spd = (f.hunger < 22 ? 0.5 : 1);
      f.x += f.vx * dt * spd;
      f.y += f.vy * dt * spd;
      const pad = 34;
      if (f.x < pad) { f.x = pad; f.vx = Math.abs(f.vx); }
      if (f.x > W - pad) { f.x = W - pad; f.vx = -Math.abs(f.vx); }
      if (f.y < 48) { f.y = 48; f.vy = Math.abs(f.vy); }
      if (f.y > H - 64) { f.y = H - 64; f.vy = -Math.abs(f.vy); }
      f.vx *= 0.98; f.vy *= 0.98;

      f.dropIn -= dt;
      if (f.dropIn <= 0) {
        const [lo, hi] = s.drop;
        let v = rand(lo, hi) * stageMul(f.growth) * (1 + f.up * 0.2);
        if (f.hunger < 22) v *= 0.4;
        const pearl = state.deco.coral && f.growth >= 72 && Math.random() < 0.06;
        addCoin(f.x, f.y - 12, pearl ? v * 4 + 40 : v, pearl);
        f.dropIn = s.every * rand(0.72, 1.18);
      }
    });

    state.coins.forEach((c) => {
      c.life -= dt; c.wob += dt * 3;
      c.y += c.vy * dt; c.vy += 30 * dt;
      if (c.vy > 20) c.vy = 20;
      if (c.y > H - 46) { c.y = H - 46; c.vy *= -0.28; }
      c.x += Math.sin(c.wob) * 14 * dt;
      const magT = state.magLv >= 2 ? 6.7 : state.magLv === 1 ? 5.5 : 0;
      if (magT && c.life < magT) { collect(c); c.life = 0; }
    });
    state.coins = state.coins.filter((c) => c.life > 0);

    if (state.bubbles.length < 20 && Math.random() < dt * 7) {
      state.bubbles.push({ x: rand(16, W - 16), y: H + 6, r: rand(2, 5), vy: rand(16, 34) });
    }
    state.bubbles.forEach((b) => { b.y -= b.vy * dt; b.x += Math.sin(b.y / 18) * 9 * dt; });
    state.bubbles = state.bubbles.filter((b) => b.y > -12);
    state.floaters.forEach((p) => { p.t += dt; p.y -= 30 * dt; });
    state.floaters = state.floaters.filter((p) => p.t < 0.95);
    state.hearts.forEach((h) => { h.t += dt; h.y -= 22 * dt; });
    state.hearts = state.hearts.filter((h) => h.t < 0.8);

    tryBreed(dt);
    claimQuests();
    hud();
  }

  function drawWater() {
    const dirty = state.dirt / 100;
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, dirty > 0.6 ? "#4a6a52" : "#1b7a8c");
    g.addColorStop(0.55, dirty > 0.6 ? "#2e5344" : "#125566");
    g.addColorStop(1, "#163c34");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    ctx.fillStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath(); ctx.ellipse(W * 0.38, 34, 170, 20, 0, 0, 7); ctx.fill();
    ctx.fillStyle = "#cbb37a";
    ctx.beginPath();
    ctx.moveTo(0, H - 26);
    ctx.quadraticCurveTo(W * 0.3, H - 40, W * 0.55, H - 24);
    ctx.quadraticCurveTo(W * 0.8, H - 14, W, H - 30);
    ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
    ctx.fillStyle = "#b3945e";
    for (let i = 0; i < 20; i++) {
      ctx.beginPath();
      ctx.arc((i * 47 + 12) % W, H - 16 + (i % 3) * 3, 3 + (i % 4), 0, 7);
      ctx.fill();
    }
    drawDeco();
  }

  function drawDeco() {
    const t = performance.now() / 700;
    const blades = state.deco.weed ? 9 : 5;
    for (let i = 0; i < blades; i++) {
      const x = 30 + i * (W / (blades + 0.2));
      ctx.strokeStyle = i % 2 ? "#1f6b4a" : "#2a8a5c";
      ctx.lineWidth = 3.5;
      ctx.beginPath(); ctx.moveTo(x, H - 24);
      for (let k = 1; k <= 7; k++) ctx.lineTo(x + Math.sin(t + i + k * 0.45) * 11, H - 24 - k * 14);
      ctx.stroke();
    }
    if (state.deco.castle) {
      const x = W * 0.72, y = H - 28;
      ctx.fillStyle = "#c9b89a";
      ctx.fillRect(x, y - 54, 54, 54);
      ctx.fillRect(x - 8, y - 70, 16, 20);
      ctx.fillRect(x + 46, y - 70, 16, 20);
      ctx.fillStyle = "#6e5a40";
      ctx.fillRect(x + 18, y - 28, 18, 28);
    }
    if (state.deco.chest) {
      ctx.fillStyle = "#8a5a22";
      ctx.fillRect(W * 0.18, H - 48, 36, 20);
      ctx.fillStyle = "#e6b325";
      ctx.fillRect(W * 0.18, H - 40, 36, 4);
    }
    if (state.deco.lamp) {
      ctx.fillStyle = "rgba(255,210,120,.18)";
      ctx.beginPath(); ctx.arc(W * 0.5, 70, 50, 0, 7); ctx.fill();
      ctx.strokeStyle = "#d8c48a"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(W * 0.5, 0); ctx.lineTo(W * 0.5, 58); ctx.stroke();
      ctx.fillStyle = "#f2d37a";
      ctx.beginPath(); ctx.arc(W * 0.5, 64, 8, 0, 7); ctx.fill();
    }
    if (state.deco.coral) {
      ctx.strokeStyle = "#d45b6a"; ctx.lineWidth = 4;
      const x = W * 0.88, y = H - 26;
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 10, y - 34); ctx.moveTo(x, y); ctx.lineTo(x + 12, y - 30); ctx.stroke();
    }
  }

  function drawFish(f) {
    const s = SPECIES[f.spec];
    const sc = stageMul(f.growth) * (1 + f.up * 0.05);
    const L = 48 * sc;
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(Math.atan2(f.vy, f.vx));
    if (f.hunger < 22) ctx.globalAlpha = 0.7;
    const tail = Math.sin(f.t * 7) * L * 0.12;
    ctx.fillStyle = s.c2;
    ctx.beginPath();
    ctx.moveTo(-L * 0.42, 0);
    const tw = s.shape === "fan" || s.shape === "betta" ? 0.5 : 0.32;
    ctx.lineTo(-L * 0.98, -L * tw + tail);
    ctx.lineTo(-L * 0.98, L * tw + tail);
    ctx.closePath(); ctx.fill();
    if (s.shape === "tall") {
      ctx.beginPath();
      ctx.moveTo(-L * 0.1, 0); ctx.lineTo(0, -L * 0.55); ctx.lineTo(L * 0.15, 0); ctx.fill();
    }
    ctx.fillStyle = s.c1;
    const bh = s.shape === "disc" ? 0.42 : s.shape === "slim" ? 0.16 : 0.26;
    ctx.beginPath(); ctx.ellipse(0, 0, L * 0.52, L * bh, 0, 0, 7); ctx.fill();
    if (s.shape === "slim") {
      ctx.strokeStyle = s.c2; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.moveTo(-L * 0.3, 0); ctx.lineTo(L * 0.3, 0); ctx.stroke();
    }
    if (s.shape === "dragon") {
      ctx.strokeStyle = s.c2; ctx.lineWidth = 1.5;
      ctx.beginPath(); ctx.moveTo(L * 0.4, -2); ctx.lineTo(L * 0.7, -10); ctx.moveTo(L * 0.4, 2); ctx.lineTo(L * 0.7, 10); ctx.stroke();
    }
    if (s.id === "koi" || s.id === "dragon") {
      ctx.fillStyle = s.c2;
      ctx.beginPath(); ctx.ellipse(L * 0.1, -L * 0.04, L * 0.14, L * 0.08, 0.3, 0, 7); ctx.fill();
    }
    ctx.fillStyle = "#fff";
    ctx.beginPath(); ctx.arc(L * 0.28, -L * 0.04, Math.max(2.1, L * 0.07), 0, 7); ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath(); ctx.arc(L * 0.31, -L * 0.04, Math.max(1.1, L * 0.035), 0, 7); ctx.fill();
    if (selected === f.id) {
      ctx.strokeStyle = "rgba(255,255,255,.75)"; ctx.lineWidth = 1.6;
      ctx.beginPath(); ctx.ellipse(0, 0, L * 0.72, L * 0.46, 0, 0, 7); ctx.stroke();
    }
    ctx.restore();
  }

  function draw() {
    drawWater();
    state.bubbles.forEach((b) => {
      ctx.strokeStyle = "rgba(220,245,255,.32)";
      ctx.beginPath(); ctx.arc(b.x, b.y, b.r, 0, 7); ctx.stroke();
    });
    state.fish.forEach(drawFish);
    state.coins.forEach((c) => {
      ctx.save(); ctx.translate(c.x, c.y);
      ctx.fillStyle = c.pearl ? "#d9f3ff" : "#e7c04a";
      ctx.beginPath(); ctx.arc(0, 0, c.pearl ? 12 : 11, 0, 7); ctx.fill();
      ctx.strokeStyle = c.pearl ? "#fff" : "#fff3b0"; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(0, 0, 7, 0, 7); ctx.stroke();
      ctx.restore();
    });
    ctx.font = "12px ui-sans-serif";
    ctx.fillStyle = "#fff";
    state.floaters.forEach((p) => {
      ctx.globalAlpha = 1 - p.t / 0.95;
      ctx.fillText(p.text, p.x - 12, p.y);
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = "#ff8aa0";
    state.hearts.forEach((h) => {
      ctx.globalAlpha = 1 - h.t / 0.8;
      ctx.fillText("♥", h.x - 5, h.y);
      ctx.globalAlpha = 1;
    });
    if (combo >= 3) {
      ctx.fillStyle = "#f3d37a";
      ctx.font = "bold 14px ui-sans-serif";
      ctx.fillText(combo + " 콤보", 14, 28);
    }
    if (state.boost > 0) {
      ctx.fillStyle = "#c9e6df";
      ctx.font = "12px ui-sans-serif";
      ctx.fillText("성장 촉진 " + Math.ceil(state.boost) + "초", 14, 46);
    }
  }

  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; tick(dt); draw(); requestAnimationFrame(loop);
  }

  function hud() {
    document.getElementById("money").textContent = "동전 " + Math.floor(state.money);
    document.getElementById("food").textContent = "밥 " + state.food;
    document.getElementById("cap").textContent = state.fish.length + "/" + cap();
    const q = activeQuest();
    document.getElementById("quest").textContent = q ? "미션 · " + q.title + " — " + q.desc : "미션 모두 끝. 수조를 계속 키우세요";
  }

  function renderCard() {
    const f = state.fish.find((x) => x.id === selected);
    if (!f) { cardEl.classList.remove("on"); return; }
    const s = SPECIES[f.spec];
    cardEl.classList.add("on");
    cardEl.innerHTML = `<h3>${f.name} · ${s.name}</h3>
      <p>${stageOf(f.growth)} · 업그레이드 ${f.up}/10 · 판매 ${sellValue(f)}동전</p>
      <div class="bar"><i style="width:${f.growth}%"></i></div>
      <div class="bar hunger"><i style="width:${f.hunger}%"></i></div>
      <input id="rename" maxlength="8" value="${f.name}" />
      <div class="row">
        <button class="pri" type="button" id="upFish">업글 ${upCost(f)}</button>
        <button type="button" id="sellFish">보내기</button>
        <button type="button" id="closeCard">닫기</button>
      </div>`;
    document.getElementById("upFish").onclick = () => upgradeFish(f);
    document.getElementById("sellFish").onclick = () => sellFish(f);
    document.getElementById("closeCard").onclick = () => { selected = null; renderCard(); };
    document.getElementById("rename").onchange = (e) => {
      const n = e.target.value.trim(); if (n) f.name = n;
    };
  }

  function shopItems() {
    if (shopTab === "fish") {
      return Object.values(SPECIES).map((s) => ({
        title: s.name,
        desc: "떨어뜨리는 동전 " + s.drop[0] + "–" + s.drop[1],
        extra: s.c1,
        price: s.price,
        can: buyOk(s.price) && state.fish.length < cap(),
        why: state.fish.length >= cap() ? "수조가 가득" : "구매",
        go() {
          if (state.fish.length >= cap()) return toast("수조가 가득해요");
          if (!buyOk(s.price)) return toast("동전이 모자라요");
          spend(s.price);
          state.fish.push(makeFish(s.id, 16));
          state.seen[s.id] = true;
          beep("buy"); toast(s.name + "를 들였어요");
          renderShop(); save();
        },
      }));
    }
    if (shopTab === "up") {
      const row = (title, desc, lv, max, costs, apply, whyMax) => ({
        title, desc, price: costs[lv + 1],
        can: lv < max && buyOk(costs[lv + 1] || 0),
        why: lv >= max ? whyMax : "업그레이드",
        go() {
          const c = costs[lv + 1]; if (c == null) return;
          if (!buyOk(c)) return toast("동전이 모자라요");
          spend(c); apply(); beep("buy"); renderShop(); save();
        },
      });
      return [
        row("수조 확장", "수용 " + cap() + " → " + (TANK[state.tankLv + 1] || "최대"), state.tankLv, TANK.length - 1, TANK_COST, () => { state.tankLv++; toast("수조가 넓어졌어요"); }, "최대"),
        row("고급 사료", "성장 ×" + FOODQ[state.foodLv], state.foodLv, FOODQ.length - 1, FOODQ_COST, () => { state.foodLv++; toast("사료가 좋아졌어요"); }, "최대"),
        row("자석", state.magLv === 0 ? "조금 뒤 자동으로 줍기" : "바로 줍기", state.magLv, 2, MAG_COST, () => { state.magLv++; toast("자석을 달았어요"); }, "최대"),
        row("행운", "동전 ×" + luck().toFixed(2), state.luckLv, LUCK.length - 1, LUCK_COST, () => { state.luckLv++; toast("운이 좋아졌어요"); }, "최대"),
        row("산란장", "번식이 잘 되고 대기 시간이 줄어요", state.breedLv, 2, BREED_COST, () => { state.breedLv++; toast("산란장을 만들었어요"); }, "최대"),
      ];
    }
    if (shopTab === "item") {
      return [
        { title:"사료 한 봉지", desc:"밥 25개", price:32, can:buyOk(32), why:"구매",
          go(){ if(!buyOk(32)) return toast("동전이 모자라요"); spend(32); state.food+=25; beep("buy"); toast("밥을 채웠어요"); renderShop(); save(); } },
        { title:"큰 사료 상자", desc:"밥 80개", price:90, can:buyOk(90), why:"구매",
          go(){ if(!buyOk(90)) return toast("동전이 모자라요"); spend(90); state.food+=80; beep("buy"); toast("밥을 잔뜩 채웠어요"); renderShop(); save(); } },
        { title:"성장 촉진", desc:"40초 동안 성장이 빨라집니다", price:75, can:buyOk(75)&&state.fish.length, why:"사용",
          go(){ if(!buyOk(75)) return toast("동전이 모자라요"); spend(75); state.boost=40; beep("buy"); toast("쑥쑥 자랄 거예요"); renderShop(); save(); } },
        { title:"활력제", desc:"배고픔을 모두 채웁니다", price:55, can:buyOk(55)&&state.fish.length, why:"사용",
          go(){ if(!buyOk(55)) return toast("동전이 모자라요"); spend(55); state.fish.forEach(f=>f.hunger=100); beep("feed"); toast("배부르게 만들었어요"); renderShop(); save(); } },
        { title:"청소솔", desc:"오물을 바로 지웁니다", price:40, can:buyOk(40)&&state.dirt>5, why:"사용",
          go(){ if(!buyOk(40)) return toast("동전이 모자라요"); spend(40); state.dirt=0; state.stats.cleaned++; beep("ok"); toast("반짝반짝"); renderShop(); save(); } },
      ];
    }
    if (shopTab === "deco") {
      return Object.entries(DECOS).map(([id, d]) => ({
        title: d.name,
        desc: state.deco[id] ? "이미 놓여 있어요 · " + d.desc : d.desc,
        price: d.price,
        can: !state.deco[id] && buyOk(d.price),
        why: state.deco[id] ? "보유" : "놓기",
        go() {
          if (state.deco[id]) return;
          if (!buyOk(d.price)) return toast("동전이 모자라요");
          spend(d.price); state.deco[id] = true; beep("buy"); toast(d.name + "을 놓았어요");
          renderShop(); save();
        },
      }));
    }
    return [];
  }

  function renderShop() {
    const grid = document.getElementById("shopGrid");
    if (shopTab === "book") {
      grid.innerHTML = Object.values(SPECIES).map((s) => {
        const have = !!state.seen[s.id];
        const n = state.fish.filter((f) => f.spec === s.id).length;
        return `<div class="item"><div class="swatch" style="background:linear-gradient(135deg,${s.c1},${s.c2})"></div>
          <h4>${have ? s.name : "???"}</h4>
          <p>${have ? (n ? "수조에 " + n + "마리" : "한 번 키워 봄") : "아직 만나지 못함"}</p></div>`;
      }).join("");
      return;
    }
    if (shopTab === "quest") {
      grid.innerHTML = QUESTS.map((q) => {
        const done = !!state.quests[q.id];
        const ready = !done && q.need(state);
        return `<div class="item ${done ? "done" : ""}"><h4>${q.title}</h4>
          <p>${q.desc} · 보상 ${q.rew.money}동전</p>
          <button type="button" disabled>${done ? "완료" : ready ? "곧 완료" : "진행 중"}</button></div>`;
      }).join("");
      return;
    }
    grid.innerHTML = shopItems().map((it, i) => `
      <div class="item">
        ${it.extra ? `<div class="swatch" style="background:${it.extra}"></div>` : ""}
        <h4>${it.title}</h4>
        <p>${it.desc}${it.price ? " · " + it.price + "동전" : ""}</p>
        <button type="button" data-i="${i}" ${it.can ? "" : "disabled"}>${it.why}${it.price && it.can ? " · " + it.price : ""}</button>
      </div>`).join("");
  }

  function openShop(tab) {
    shopTab = tab;
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("on", b.dataset.tab === tab));
    document.getElementById("shop").classList.add("on");
    renderShop();
  }

  function hit(x, y) {
    for (let i = state.coins.length - 1; i >= 0; i--) {
      const c = state.coins[i];
      if ((c.x - x) ** 2 + (c.y - y) ** 2 < 24 ** 2) {
        collect(c); state.coins.splice(i, 1); return;
      }
    }
    for (let i = state.fish.length - 1; i >= 0; i--) {
      const f = state.fish[i];
      const r = 24 * stageMul(f.growth);
      if ((f.x - x) ** 2 + (f.y - y) ** 2 < r * r) {
        selected = f.id; renderCard(); return;
      }
    }
    selected = null; renderCard();
  }

  function save() {
    const dump = {
      money: state.money, food: state.food,
      tankLv: state.tankLv, foodLv: state.foodLv, magLv: state.magLv, luckLv: state.luckLv, breedLv: state.breedLv,
      seen: state.seen, deco: state.deco, quests: state.quests, stats: state.stats,
      nextId: state.nextId, breedCd: state.breedCd, dirt: state.dirt, boost: state.boost,
      mute: state.mute, tut: state.tut, last: Date.now(),
      fish: state.fish.map((f) => ({
        id: f.id, spec: f.spec, name: f.name, hunger: f.hunger, growth: f.growth, up: f.up,
      })),
    };
    localStorage.setItem(SAVE, JSON.stringify(dump));
  }

  function load() {
    try {
      const raw = localStorage.getItem(SAVE) || localStorage.getItem("ss098-mulgyeol");
      if (!raw) return false;
      const d = JSON.parse(raw);
      Object.assign(state, {
        money: d.money ?? 80, food: d.food ?? 20,
        tankLv: d.tankLv ?? 0, foodLv: d.foodLv ?? 0, magLv: d.magLv ?? 0,
        luckLv: d.luckLv ?? 0, breedLv: d.breedLv ?? 0,
        seen: d.seen || { gold: true },
        deco: Object.assign({ weed:false, castle:false, chest:false, lamp:false, coral:false }, d.deco || {}),
        quests: d.quests || {},
        stats: Object.assign({ picked:0, fed:0, born:0, earned:0, cleaned:0 }, d.stats || {}),
        nextId: d.nextId || 1, breedCd: d.breedCd || 0, dirt: d.dirt ?? 8,
        boost: d.boost || 0, mute: !!d.mute, tut: d.tut ?? 0, last: d.last || Date.now(),
      });
      state.fish = (d.fish || []).map((f) => {
        const nf = makeFish(f.spec, f.growth);
        nf.id = f.id; nf.name = f.name; nf.hunger = f.hunger; nf.up = f.up || 0;
        return nf;
      });
      if (state.fish.length) state.nextId = Math.max(state.nextId, ...state.fish.map((f) => f.id)) + 1;
      return true;
    } catch { return false; }
  }

  function applyOffline() {
    const ago = Date.now() - (state.last || Date.now());
    if (ago < 90_000) return;
    const hrs = Math.min(8, ago / 3600000);
    const cps = state.fish.reduce((n, f) => {
      const s = SPECIES[f.spec];
      return n + ((s.drop[0] + s.drop[1]) / 2) / s.every * stageMul(f.growth) * (1 + f.up * 0.15);
    }, 0);
    const gain = Math.floor(cps * hrs * 3600 * 0.28 * luck());
    const foodUse = Math.min(state.food, Math.floor(hrs * state.fish.length * 1.2));
    if (gain <= 0) return;
    document.getElementById("offlineMsg").textContent =
      Math.round(hrs * 60) + "분 동안 수조가 혼자 있었어요. 동전 " + gain + "개를 모아 뒀고, 밥 " + foodUse + "개를 먹었습니다.";
    document.getElementById("offline").classList.add("on");
    document.getElementById("offlineOk").onclick = () => {
      state.money += gain; state.stats.earned += gain; state.food = Math.max(0, state.food - foodUse);
      document.getElementById("offline").classList.remove("on");
      hud(); save();
    };
  }

  canvas.addEventListener("pointerdown", (e) => {
    const r = canvas.getBoundingClientRect();
    hit(e.clientX - r.left, e.clientY - r.top);
  });
  document.getElementById("feedBtn").onclick = feed;
  document.getElementById("cleanBtn").onclick = clean;
  document.getElementById("shopBtn").onclick = () => openShop("fish");
  document.getElementById("questBtn").onclick = () => openShop("quest");
  document.getElementById("shopClose").onclick = () => document.getElementById("shop").classList.remove("on");
  document.getElementById("shop").addEventListener("click", (e) => { if (e.target.id === "shop") e.currentTarget.classList.remove("on"); });
  document.getElementById("tabs").addEventListener("click", (e) => {
    const b = e.target.closest("[data-tab]"); if (!b) return;
    shopTab = b.dataset.tab;
    document.querySelectorAll("#tabs button").forEach((x) => x.classList.toggle("on", x === b));
    renderShop();
  });
  document.getElementById("shopGrid").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-i]"); if (!b) return;
    shopItems()[+b.dataset.i]?.go(); hud();
  });
  document.getElementById("setBtn").onclick = () => {
    document.getElementById("muteBtn").textContent = state.mute ? "꺼짐" : "켜짐";
    document.getElementById("statsLine").textContent =
      "줍기 " + state.stats.picked + " · 출생 " + state.stats.born + " · 누적 " + Math.floor(state.stats.earned);
    document.getElementById("settings").classList.add("on");
  };
  document.getElementById("setClose").onclick = () => document.getElementById("settings").classList.remove("on");
  document.getElementById("muteBtn").onclick = () => {
    state.mute = !state.mute;
    document.getElementById("muteBtn").textContent = state.mute ? "꺼짐" : "켜짐";
    save();
  };
  document.getElementById("resetBtn").onclick = () => {
    if (!confirm("수조를 비우고 처음부터 할까요?")) return;
    localStorage.removeItem(SAVE);
    localStorage.removeItem("ss098-mulgyeol");
    location.reload();
  };

  window.addEventListener("resize", resize);
  window.addEventListener("beforeunload", save);

  const had = load();
  if (!had || !state.fish.length) {
    state.fish = [makeFish("gold", 42), makeFish("gold", 24)];
    hint("노란 동전을 눌러 모으고, 밥 주기로 키우세요");
  } else {
    applyOffline();
  }
  resize(); hud();
  setInterval(save, 3500);
  requestAnimationFrame(loop);
})();
