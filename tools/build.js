// gera a versão rápida: JSX já traduzido (sem Babel no navegador)
const fs = require("fs");
const Babel = require(process.env.BABEL || "@babel/standalone");
const [src, out] = process.argv.slice(2);
let h = fs.readFileSync(src, "utf8");
const open = '<script type="text/babel" data-presets="react">';
const a = h.indexOf(open); if (a < 0) throw new Error("bloco babel não encontrado");
const b = h.lastIndexOf("</script>");
const code = h.slice(a + open.length, b);
const t0 = Date.now();
const js = Babel.transform(code, { presets: ["react"], compact: false, comments: false }).code;
if (js.includes("</script")) throw new Error("código compilado contém </script>");
h = h.slice(0, a) + "<script id=\"app\">\n" + js + "\n" + h.slice(b);
h = h.replace(/<script src="https:\/\/cdnjs[^"]*babel\.min\.js"><\/script>\n?/, "");
fs.writeFileSync(out, h);
console.log("ok", (Date.now() - t0) + "ms", Math.round(fs.statSync(src).size / 1024) + "KB ->", Math.round(fs.statSync(out).size / 1024) + "KB");
