# v5.0 — pendente de publicação (aprovado pelo André, entra na versão final)
- `Gestor_v5_0_fonte_sem_modo_teste.html`: fonte da v5.0 (gráficos novos, celular com barra embaixo, impressoras animadas, opção de animação em Aparência). Publicar com `node tools/build.js`.
- `abertura_logo.html`: abertura aprovada (logo impressa camada por camada, ~3 s, toque para pular). Integrar como overlay no `index.html` antes do `#root`, só ao abrir o app; usar a imagem uma vez (variável CSS) para não repetir o base64.
- `make_test.py` / `make_demo.py` / `demo_seed.js`: geram as versões TESTE (nuvem só leitura) e DEMO (dados fictícios).
- `engine.js` / `layers3.py`: animação das impressoras e recorte das camadas das fotos.
