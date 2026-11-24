import sys,re
src,out=sys.argv[1],sys.argv[2]
s=open(src).read()
def rep(o,n,c=1):
    global s
    assert s.count(o)==c,(o[:70],s.count(o)); s=s.replace(o,n)
# 1) chaves locais separadas (nao mistura com o Gestor de verdade)
s=s.replace('"gestor3d-','"gestor3dteste-')
# 2) nuvem somente leitura
rep('async function cloudPutData(uid, light, updatedISO) { const { error }','async function cloudPutData(uid, light, updatedISO) { if (TEST_MODE) return; const { error }')
rep('async function cloudUploadPhotos(uid, entries) { for (','async function cloudUploadPhotos(uid, entries) { if (TEST_MODE) return; for (')
rep('        const { error } = await sb.from("profiles").update(patch).eq("id",','        if (TEST_MODE) { notify("Modo teste: aprovação de usuários desligada nesta versão."); return; }\n        const { error } = await sb.from("profiles").update(patch).eq("id",')
rep('const APP_VERSION = "4.72";','const APP_VERSION = "5.0-teste";\nconst TEST_MODE = true; /* versão de avaliação: lê a nuvem, nunca grava nela */')
# 3) sem service worker
s=s.replace('navigator.serviceWorker.register("sw.js")','Promise.reject()')
# 4) faixa MODO TESTE
rep('      <div className="neo-bg no-print" /><div className="neo-scan no-print" />','      <div className="neo-bg no-print" /><div className="neo-scan no-print" />\n      <div className="neo-testbar no-print">🧪 MODO TESTE v5.0 — lê os dados da nuvem, mas <b>não grava nada nela</b>. O que você mudar aqui fica só neste navegador.</div>')
rep('  @keyframes neoSheet{','  /*fixo*/ .neo-testbar{position:fixed;top:0;left:0;right:0;z-index:9500;text-align:center;font:600 11.5px Inter,sans-serif;color:#1A1300;background:repeating-linear-gradient(135deg,#FFD166 0 14px,#FFC94A 14px 28px);padding:4px 10px;box-shadow:0 2px 10px rgba(0,0,0,.25);}\n  body{padding-top:24px;} .app-aside{top:24px !important;}\n  @media (max-width: 820px){ .neo-testbar{font-size:10.5px;} body{padding-top:34px;} }\n  @keyframes neoSheet{')
s=s.replace('<title>','<title>[TESTE] ',1)
open(out,'w').write(s)


# ---- modo demonstração ----
seed=open('/tmp/claude-0/-home-claude/273c7b77-8ae0-5857-b859-7c6bfc7b30fe/scratchpad/demo/demo_seed.js').read()
rep('const sb = (typeof window !== "undefined" && window.supabase && SB_URL) ?','const sb = DEMO_MODE ? null : (typeof window !== "undefined" && window.supabase && SB_URL) ?')
rep('const TEST_MODE = true;','const TEST_MODE = true; const DEMO_MODE = true;')
rep('🧪 MODO TESTE v5.0 — lê os dados da nuvem, mas <b>não grava nada nela</b>. O que você mudar aqui fica só neste navegador.','🧪 DEMONSTRAÇÃO v5.0 — <b>dados fictícios</b>, nada vai para a nuvem. <a style={{ color: "#1A1300", textDecoration: "underline", cursor: "pointer", marginLeft: 6 }} onClick={() => { try { localStorage.removeItem("gestor3dteste-demo"); } catch (e) {} location.reload(); }}>Restaurar exemplo</a>')
inject = """<script>
""" + seed + """
(function () { try {
  if (localStorage.getItem("gestor3dteste-demo") !== "1") {
    localStorage.setItem("gestor3dteste-data-v1", JSON.stringify(window.__buildDemoData()));
    localStorage.removeItem("gestor3dteste-actions-v1");
    localStorage.setItem("gestor3dteste-last-backup", String(Date.now() - 2 * 864e5));
    localStorage.setItem("gestor3dteste-last-autobackup", String(Date.now()));
    localStorage.setItem("gestor3dteste-demo", "1");
  }
} catch (e) {} })();
</script>
"""
k=s.index('<script>\n/* v4.69: tema claro/escuro')
s=s[:k]+inject+s[k:]
s=s.replace('<title>[TESTE] ','<title>[DEMO] ',1)
open(out,'w').write(s)
print('ok demo')
