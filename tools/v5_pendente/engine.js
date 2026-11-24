/* motor da animação da impressora (1–4 carretéis, cores e formas) */
(function () {
const NS = "http://www.w3.org/2000/svg";
const SHAPES = {
  vaso: { H: 92, at: (t) => [{ k: "o", x: 0, r: t < 0.06 ? 20 : 19 + Math.sin(Math.min(1, (t - 0.04) / 0.9) * Math.PI) * 15 - (t > 0.9 ? 4 : 0) }] },
  estatua: { H: 104, at: (t) => t < 0.14 ? [{ k: "b", x: 0, r: 23 }] : t < 0.66 ? [{ k: "o", x: 0, r: 17 - (t - 0.14) * 12 }] : t < 0.72 ? [{ k: "o", x: 0, r: 8 }] : [{ k: "o", x: 0, r: Math.max(5, 15 * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.86) / 0.14, 2)))) }] },
  cruz: { H: 112, at: (t) => t < 0.12 ? [{ k: "b", x: 0, r: 26 }] : t >= 0.6 && t < 0.75 ? [{ k: "b", x: 0, r: 30 }] : [{ k: "b", x: 0, r: 8 }] },
  bola: { H: 70, at: (t) => [{ k: "o", x: 0, r: Math.max(6, 35 * Math.sqrt(Math.max(0, 1 - Math.pow(2 * t - 1, 2)))) }] },
  discos: { H: 10, at: () => [-1, 0, 1].map((i) => ({ k: "o", x: i * 34, r: 14 })) },
};
const el = (tag, a, p) => { const e = document.createElementNS(NS, tag); for (const k in a) e.setAttribute(k, a[k]); if (p) p.appendChild(e); return e; };
const shade = (hex, f) => { const h = hex.replace("#", ""); const n = parseInt(h.length === 3 ? h.replace(/./g, "$&$&") : h, 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255; if (f > 0) { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; } else { r *= 1 + f; g *= 1 + f; b *= 1 + f; } return `rgb(${r | 0},${g | 0},${b | 0})`; };
let uidN = 0;
window.makePrinter = function (svg, VARS) {
  const u = "a" + (++uidN);
  svg.setAttribute("viewBox", "95 60 945 1180");
  const defs = el("defs", {}, svg);
  defs.innerHTML = `<filter id="${u}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;
  const root = el("g", {}, svg);
  let cur = null, V = null, colors = [], shapeName = "vaso", S = 1.4, N = 30, sh = null, gradIds = [];
  const layers = {};
  function build(v) {
    V = VARS[v]; root.innerHTML = "";
    el("image", { href: V.bg, x: 95, y: 60, width: 945, height: 1180 }, root);
    layers.sp = el("g", {}, root);
    layers.bedG = el("g", {}, root);
    const B = V.spr.bed; el("image", { href: B[0], x: B[1], y: B[2], width: B[3], height: B[4] }, layers.bedG);
    layers.piece = el("g", {}, layers.bedG);
    layers.cable = el("path", { fill: "none", stroke: "#17191B", "stroke-width": 20, "stroke-linecap": "round" }, root);
    layers.cable2 = el("path", { fill: "none", stroke: "#5A6064", "stroke-width": 13, "stroke-dasharray": "2.5 3.5", "stroke-opacity": .55, "stroke-linecap": "round" }, root);
    layers.ganG = el("g", {}, root);
    const Gn = V.spr.gantry; el("image", { href: Gn[0], x: Gn[1], y: Gn[2], width: Gn[3], height: Gn[4] }, layers.ganG);
    layers.tubes = el("g", {}, root);
    layers.headG = el("g", {}, root);
    const Hd = V.spr.head; el("image", { href: Hd[0], x: Hd[1], y: Hd[2], width: Hd[3], height: Hd[4] }, layers.headG);
    const [sx, sy, sw, shh] = V.scr;
    el("rect", { x: sx, y: sy, width: sw, height: shh, rx: 9, fill: "#06090A" }, layers.headG);
    layers.pct = el("text", { x: sx + sw / 2, y: sy + shh * 0.55, "text-anchor": "middle", "font-family": "JetBrains Mono,ui-monospace,monospace", "font-weight": 700, "font-size": 22, fill: "#46E6E0" }, layers.headG);
    layers.dots = el("g", {}, layers.headG);
    layers.noz = el("g", {}, layers.headG);
    layers.glow = el("circle", { cx: V.noz[0], cy: V.noz[1], r: 22, fill: `url(#${u}gl)` }, layers.noz);
    const P = V.spr.panel; el("image", { href: P[0], x: P[1], y: P[2], width: P[3], height: P[4] }, root);
    const bg = el("g", { transform: `translate(${V.bar[0]} ${V.bar[1]}) rotate(${V.bar[3]})` }, root);
    el("rect", { x: -2, y: -4.5, width: V.bar[2] + 4, height: 9, rx: 4.5, fill: "#0B2526" }, bg);
    layers.bar = el("rect", { x: 0, y: -3, width: 7, height: 7, rx: 3.5, fill: "#46E6E0" }, bg);
    layers.led = el("rect", { x: V.led[0], y: V.led[1], width: V.led[2], height: V.led[3], rx: 8, fill: "#46E6E0" }, root);
  }
  function setJob(cols, shape) {
    idle = false;
    const v = "v" + Math.max(1, Math.min(4, cols.length));
    if (v !== cur) { cur = v; build(v); }
    colors = cols.slice(); shapeName = shape; sh = SHAPES[shape] || SHAPES.vaso;
    S = Math.min(1.6, 132 / sh.H); N = shape === "discos" ? 5 : 34;
    // gradientes
    let g = `<filter id="${u}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;
    g += `<radialGradient id="${u}gl"><stop offset="0" stop-color="#F0FFFE"/><stop offset=".35" stop-color="${colors[0]}" stop-opacity=".9"/><stop offset="1" stop-color="${colors[0]}" stop-opacity="0"/></radialGradient>`;
    colors.forEach((c, i) => { g += `<linearGradient id="${u}g${i}" x1="0" x2="1"><stop offset="0" stop-color="${shade(c, -.25)}"/><stop offset=".12" stop-color="${shade(c, .45)}"/><stop offset=".24" stop-color="${c}"/><stop offset=".66" stop-color="${c}"/><stop offset="1" stop-color="${shade(c, -.55)}"/></linearGradient>`; });
    // carretéis: 1ª cor no da frente (direita)
    V.spools.forEach((s, i) => { g += `<filter id="${u}t${i}" color-interpolation-filters="sRGB"><feFlood flood-color="${colors[i] || colors[colors.length - 1]}"/><feComposite in2="SourceAlpha" operator="in" result="f"/><feBlend in="f" in2="SourceGraphic" mode="multiply"/></filter>`; });
    defs.innerHTML = g;
    layers.sp.innerHTML = V.spools.map((s, i) => `<image href="${s[4]}" x="${s[0]}" y="${s[1]}" width="${s[2]}" height="${s[3]}" filter="url(#${u}t${i})" preserveAspectRatio="none"/>`).join("");
    layers.dots.innerHTML = colors.slice(0, 4).map((c, i, a) => `<circle cx="${V.scr[0] + V.scr[2] / 2 - (a.length - 1) * 7 + i * 14}" cy="${V.scr[1] + V.scr[3] * 0.55 + 16}" r="4" fill="${c}" stroke="#fff" stroke-opacity=".5"/>`).join("");
    // cores dos tubos: da esquerda para a direita = carretéis da esquerda para a direita
    const n = V.spools.length; const byLeft = V.spools.map((s, i) => ({ x: s[0], c: colors[i] || colors[colors.length - 1] })).sort((a, b) => a.x - b.x).map((o) => o.c);
    tubeCols = V.starts.map((_, i) => byLeft[i] || "#D7F3F8");
  }
  let tubeCols = [], idle = false;
  function setIdle() {
    if (cur !== "v1") { cur = "v1"; build("v1"); }
    idle = true; colors = ["#3FD1CE"]; sh = SHAPES.vaso; S = 1.4; N = 30; tubeCols = V.starts.map(() => "#9FB4B4");
    defs.innerHTML = `<filter id="${u}b" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>`;
    layers.sp.innerHTML = ""; layers.dots.innerHTML = "";
  }
  const U = [0.937, -0.35];
  function frame(p, T) {
    const base = V.base, CX = V.noz[0], NOZY = V.noz[1], HF = sh.H * S;
    const moving = p < 1 && !idle;
    const h = HF * p, lh = HF / N, done = Math.max(p > 0 ? 1 : 0, Math.round(N * p));
    const prims = sh.at(Math.min(.999, (Math.max(0, done - 1) + .5) / N));
    // trajetória do bico: percorre o contorno das primitivas da camada atual
    const ph = T * 2 * Math.PI * 0.9;
    const xs = prims.map((q) => q.x * S), rr = Math.max(...prims.map((q) => q.r * S));
    const span = (Math.max(...xs) - Math.min(...xs)) / 2 + rr * 0.85, mid = (Math.max(...xs) + Math.min(...xs)) / 2;
    const dx = moving ? mid + span * Math.cos(ph) : -100;
    const by = moving ? rr * 0.42 * Math.sin(ph * (prims.length > 1 ? 3 : 1)) : 0;
    const bx = U[0] * by, byy = U[1] * by;
    const dz = (base - h - 7) - NOZY;
    layers.bedG.setAttribute("transform", `translate(${bx.toFixed(2)} ${byy.toFixed(2)})`);
    layers.ganG.setAttribute("transform", `translate(0 ${dz.toFixed(2)})`);
    layers.headG.setAttribute("transform", `translate(${dx.toFixed(2)} ${dz.toFixed(2)})`);
    // peça
    let g = `<ellipse cx="${CX}" cy="${base + 4}" rx="${(span + rr) * 0.9}" ry="${9 * S}" fill="#000" opacity=".4" filter="url(#${u}b)"/>`;
    const gl = [], gr = [];
    for (let l = 0; l < N; l++) {
      const ps = sh.at((l + .5) / N), y = base - (l + 1) * lh;
      const ci = Math.min(colors.length - 1, Math.floor(l / N * colors.length));
      ps.forEach((q) => { const r = q.r * S, x = CX + q.x * S;
        if (l < done) {
          g += `<rect x="${(x - r).toFixed(1)}" y="${y.toFixed(1)}" width="${(2 * r).toFixed(1)}" height="${(lh + .6).toFixed(1)}" fill="url(#${u}g${ci})"/>`;
          if (l === 0) g += `<ellipse cx="${x}" cy="${base}" rx="${r}" ry="${q.k === "b" ? r * .18 : r * .3}" fill="url(#${u}g${ci})"/>`;
          if (l === done - 1) g += `<ellipse cx="${x}" cy="${y}" rx="${r}" ry="${q.k === "b" ? r * .18 : r * .3}" fill="${colors[ci]}"/><ellipse cx="${x}" cy="${y}" rx="${r}" ry="${q.k === "b" ? r * .18 : r * .3}" fill="#fff" opacity=".25"/>`;
        } else if (ps.length === 1) { gl.push([x - r, y]); gr.push([x + r, y]); } });
    }
    if (gl.length > 1 && moving) g = `<polygon points="${[...gl, ...gr.reverse()].map((q) => q.map((v) => v.toFixed(1)).join(",")).join(" ")}" fill="rgba(63,209,206,.05)" stroke="rgba(63,209,206,.5)" stroke-width="1.6" stroke-dasharray="5 4"/>` + g;
    if (moving) { const ci = Math.min(colors.length - 1, Math.floor(p * colors.length)); g += `<circle cx="${(CX + dx - bx).toFixed(1)}" cy="${(base - h).toFixed(1)}" r="7" fill="${colors[ci]}" opacity=".6" filter="url(#${u}b)"/>`; }
    layers.piece.innerHTML = idle ? "" : g;
    // tubos
    layers.tubes.innerHTML = V.starts.map((s, i) => {
      const e = V.inlet[Math.min(V.inlet.length - 1, Math.round(i * (V.inlet.length - 1) / Math.max(1, V.starts.length - 1)))];
      const ex = e[0] + dx, ey = e[1] + dz, c = tubeCols[i];
      const d = `M${s[0]},${s[1]} C${s[0] + (s[0] - CX) * .15},${s[1] + 60 + dz * .25} ${ex},${ey - 90} ${ex},${ey}`;
      return `<path d="${d}" fill="none" stroke="#C9D3D5" stroke-width="11" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#F4F8F8" stroke-width="8" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c}" stroke-width="3.2" stroke-linecap="round" stroke-opacity=".95"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".7" stroke-width="1.6" stroke-linecap="round" transform="translate(-3 0)"/>`;
    }).join("");
    // cabo
    const c = V.cable, a = [c[0][0], c[0][1] + dz], b = c[c.length - 1];
    const cd = `M${a[0]},${a[1]} C${a[0] + 4},${a[1] + 90} ${b[0] + 14},${b[1] - 150} ${b[0]},${b[1]}`;
    layers.cable.setAttribute("d", cd); layers.cable2.setAttribute("d", cd);
    layers.noz.setAttribute("opacity", moving ? 1 : 0);
    const k = .75 + .25 * Math.sin(T * 9); layers.glow.setAttribute("r", (19 + 5 * k).toFixed(1)); layers.glow.setAttribute("opacity", (.6 + .35 * k).toFixed(2));
    layers.pct.textContent = idle ? "—" : Math.round(p * 100) + "%";
    layers.bar.setAttribute("width", Math.max(7, V.bar[2] * p).toFixed(1));
    layers.led.setAttribute("opacity", (.3 + .4 * (.5 + .5 * Math.sin(T * 2.6))).toFixed(2));
  }
  return { setJob, setIdle, frame, layers };
};
})();
