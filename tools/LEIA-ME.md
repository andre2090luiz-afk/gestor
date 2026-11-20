# Como publicar

- `fonte/Gestor_PrintAR_3D.html` é o arquivo-fonte (JSX, editável).
- `index.html` é a versão publicada, já traduzida (abre rápido, sem Babel no navegador).

Gerar o index.html a partir da fonte:

    npm i @babel/standalone
    node tools/build.js fonte/Gestor_PrintAR_3D.html index.html

Ao mudar a versão, trocar também `CACHE` no `sw.js`.
