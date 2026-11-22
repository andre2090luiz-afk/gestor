import re, sys, colorsys, json
src, out = sys.argv[1], sys.argv[2]
lines = open(src).read().split("\n")
text = "\n".join(lines)

def parse(c):
    c = c.strip()
    if c.startswith("#"):
        h = c[1:]
        if len(h) in (3, 4): h = "".join(x*2 for x in h)
        if len(h) not in (6, 8): return None
        r, g, b = int(h[0:2],16), int(h[2:4],16), int(h[4:6],16)
        a = int(h[6:8],16)/255 if len(h) == 8 else 1
        return r, g, b, a
    m = re.match(r"rgba?\(([^)]*)\)", c)
    if not m: return None
    p = [x.strip() for x in m.group(1).split(",")]
    if len(p) < 3: return None
    try:
        r, g, b = [float(x) for x in p[:3]]; a = float(p[3]) if len(p) > 3 else 1
    except: return None
    return r, g, b, a
def hsl(r,g,b):
    h,l,s = colorsys.rgb_to_hls(r/255,g/255,b/255); return h,s,l
def rgb(h,s,l):
    r,g,b = colorsys.hls_to_rgb(h,l,s); return r*255,g*255,b*255
def fmt(r,g,b,a):
    a = round(a,3)
    if a >= 0.999: return "#%02X%02X%02X" % (round(r),round(g),round(b))
    return "rgba(%d,%d,%d,%s)" % (round(r),round(g),round(b),("%g"%a))

def light(c, role):
    p = parse(c)
    if not p: return None
    r,g,b,a = p
    if a == 0: return None
    h,s,l = hsl(r,g,b)
    neutral = s < 0.35 or l < 0.16
    if role == "fg":
        if neutral:
            if l < 0.32: return None            # texto escuro (sobre botao colorido) fica
            L = max(0.1, min(0.46, (1-l)*0.62))
            return fmt(*rgb(h or 0.5, min(s,0.2), L), a)
        if l <= 0.40: return None
        return fmt(*rgb(h, min(1,s*1.05), min(l,0.38)), a)
    if role == "bg":
        if neutral:
            if l > 0.8: return None              # fundos claros (PDF, papel) ficam
            L = 1-l; L = 0.93 + (L-0.75)*0.28; L = min(0.995, max(0.86, L))
            return fmt(*rgb(h or 0.5, min(s,0.18), L), min(1,a*1.6) if a < 0.5 else a)
        if a < 0.5: return fmt(*rgb(h, s, min(l,0.5)), min(0.9, a*1.15))
        return None
    if role == "line":
        if neutral:
            if l > 0.75: return None
            return fmt(*rgb(h or 0.5, min(s,0.2), max(0.55, 1-l)), a)
        return fmt(*rgb(h, s, min(l,0.45)), min(1, a*1.5+0.08))
    if role == "shadow":
        if neutral: return fmt(20,40,42, min(a,0.1))
        return fmt(*rgb(h,s,min(l,0.45)), a*0.45)
    return None

KEYS = {
 "color":"fg","caretColor":"fg","WebkitTextFillColor":"fg",
 "background":"bg","backgroundColor":"bg","backgroundImage":"bg","bg":"bg",
 "border":"line","borderColor":"line","borderTop":"line","borderBottom":"line","borderLeft":"line","borderRight":"line",
 "borderTopColor":"line","borderBottomColor":"line","borderLeftColor":"line","borderRightColor":"line","outline":"line","outlineColor":"line",
 "stroke":"line","fill":"fill","stopColor":"line","floodColor":"line",
 "boxShadow":"shadow","textShadow":"shadow","filter":"shadow",
}
CSSK = {"color":"fg","caret-color":"fg","background":"bg","background-color":"bg","background-image":"bg",
 "border":"line","border-color":"line","border-top":"line","border-bottom":"line","border-left":"line","border-right":"line",
 "border-top-color":"line","border-bottom-color":"line","border-left-color":"line","border-right-color":"line","outline":"line","outline-color":"line",
 "stroke":"line","fill":"fill","stop-color":"line","box-shadow":"shadow","text-shadow":"shadow","filter":"shadow","accent-color":"line","scrollbar-color":"line"}
COL = re.compile(r"#[0-9A-Fa-f]{8}\b|#[0-9A-Fa-f]{6}\b|#[0-9A-Fa-f]{3}\b|rgba?\([0-9.,\s]+\)")

vars_ = {}; order = []
def var_for(c, role):
    lv = light(c, role)
    if not lv: return None
    key = (fmt(*parse(c)), lv)
    if key not in vars_:
        n = "--t%d" % (len(vars_)+1); vars_[key] = n; order.append((n, key[0], lv))
    return "var(%s)" % vars_[key]

def saturated_bg_near(seg):
    for m in re.finditer(r"(background\w*|bg)\s*[:=]\s*[\"'`]([^\"'`]*)", seg):
        v = m.group(2)
        if "gradient" in v: return True
        for cm in COL.finditer(v):
            p = parse(cm.group(0))
            if p and p[3] > 0.6:
                h,s,l = hsl(*p[:3])
                if s > 0.45 and 0.3 < l < 0.8: return True
    return False

stats = {"done":0, "skip_nokey":0, "skip_same":0}
skipped = {}
# ---- CSS (linhas 30..931) ----
def fix_css(block):
    def rep(m):
        start = m.start()
        decl_start = max(block.rfind(";", 0, start), block.rfind("{", 0, start))
        decl = block[decl_start+1:start]
        if ":" not in decl: stats["skip_nokey"] += 1; return m.group(0)
        prop = decl.split(":")[0].strip().lower()
        role = CSSK.get(prop)
        if role == "fill": role = "line"
        if not role: stats["skip_nokey"] += 1; return m.group(0)
        if role == "fg" and parse(m.group(0))[:3] in [(255,255,255)]:
            rb = block.rfind("{",0,start); re_ = block.find("}", start)
            if saturated_bg_near(block[rb:re_].replace("background:", "background:\"").replace(";", "\";")): return m.group(0)
        v = var_for(m.group(0), role)
        if not v: stats["skip_same"] += 1; return m.group(0)
        stats["done"] += 1; return v
    return COL.sub(rep, block)

# ---- JSX ----
def fix_js_line(ln, ctxseg):
    def rep(m):
        s = m.start()
        before = ln[:s]
        # inicio da string que contem a cor
        qpos = max(before.rfind('"'), before.rfind("'"), before.rfind("`"))
        pre = ln[:qpos] if qpos >= 0 else before
        keys = list(re.finditer(r"([A-Za-z]+)\s*(?::|=(?!=|>))\s*\{?\{?\s*", pre))
        role = None
        for km in reversed(keys):
            k = km.group(1)
            if k in KEYS: role = KEYS[k]; kname = k; break
            if k in ("style", "className", "key", "title", "onClick", "d", "points", "x", "y", "cx", "cy", "r", "width", "height"): break
            # outra chave qualquer entre a chave de estilo e a cor => nao e estilo
            if pre[km.end():].strip() and not re.match(r"^[\s\w.!?()<>=&|+\-*/,`'\"${}:]*$", pre[km.end():]): break
            break
        if not role:
            stats["skip_nokey"] += 1; skipped[m.group(0)] = skipped.get(m.group(0),0)+1; return m.group(0)
        if role == "fill":
            role = "fg" if re.search(r"<text\b|tick=|label", ln) else "line"
        if role == "fg" and parse(m.group(0))[:3] == (255,255,255) and saturated_bg_near(ctxseg): return m.group(0)
        v = var_for(m.group(0), role)
        if not v: stats["skip_same"] += 1; return m.group(0)
        stats["done"] += 1; return v
    return COL.sub(rep, ln)

res = []
css_start = next(i for i,l in enumerate(lines) if l.strip() == "<style>")
css_end = next(i for i,l in enumerate(lines) if l.strip() == "</style>")
js_start = next(i for i,l in enumerate(lines) if l.startswith('<script type="text/babel"'))
cat_a = next(i for i,l in enumerate(lines) if "const buildInteractiveCatalog" in l)
cat_b = next(i for i in range(cat_a, len(lines)) if lines[i] == "  };")
excl = set(range(cat_a, cat_b+1))
# regioes sem tema (PDFs etc): marcadas com /* tema:off */ ... /* tema:on */
off = False
css_block = "\n".join(lines[css_start+1:css_end])
css_fixed = "\n".join(l if "/*fixo*/" in l else fix_css(l) for l in css_block.split("\n"))
new = lines[:css_start+1] + css_fixed.split("\n") + lines[css_end:]
lines = new
js_start = next(i for i,l in enumerate(lines) if l.startswith('<script type="text/babel"'))
cat_a = next(i for i,l in enumerate(lines) if "const buildInteractiveCatalog" in l)
cat_b = next(i for i in range(cat_a, len(lines)) if lines[i] == "  };")
for i in range(js_start+1, len(lines)):
    l = lines[i]
    if "tema:off" in l: off = True
    if "tema:on" in l: off = False
    if off or cat_a <= i <= cat_b or "<script" in l and i != js_start: continue
    if not COL.search(l): continue
    seg = "\n".join(lines[max(0,i-2):i+3])
    lines[i] = fix_js_line(l, seg)
out_text = "\n".join(lines)
rootcss = "  :root{" + ";".join("%s:%s" % (n, d) for n, d, lv in order) + "}\n  html[data-theme=light]{" + ";".join("%s:%s" % (n, lv) for n, d, lv in order) + "}"
manual = open(sys.argv[3]).read() if len(sys.argv) > 3 else ""
out_text = out_text.replace("<style>\n", "<style>\n" + rootcss + "\n", 1)
out_text = out_text.replace("</style>", manual + "\n</style>", 1)
open(out, "w").write(out_text)
print(json.dumps(stats), len(order))
print(sorted(skipped.items(), key=lambda x:-x[1])[:40])
