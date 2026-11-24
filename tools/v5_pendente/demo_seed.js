/* Dados FICTÍCIOS de demonstração (gerados na hora, relativos à data de hoje) */
window.__buildDemoData = function () {
  var rnd = (function (s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; })(20261124);
  var pick = function (a) { return a[Math.floor(rnd() * a.length)]; };
  var ri = function (a, b) { return a + Math.floor(rnd() * (b - a + 1)); };
  var today = new Date(); today.setHours(12, 0, 0, 0);
  var iso = function (d) { return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
  var addD = function (n) { var d = new Date(today); d.setDate(d.getDate() + n); return d; };
  var ym = function (d) { return iso(d).slice(0, 7); };
  var svg = function (bg, fg, shape) {
    var body = {
      vaso: '<path d="M70 40h60l-6 18c22 18 26 52 10 80H66c-16-28-12-62 10-80z" fill="' + fg + '"/><path d="M84 60c-8 22-8 50 2 76" stroke="#fff" stroke-opacity=".35" stroke-width="6" fill="none"/>',
      chaveiro: '<circle cx="100" cy="98" r="44" fill="' + fg + '"/><circle cx="100" cy="98" r="18" fill="' + bg + '"/><circle cx="100" cy="42" r="10" fill="none" stroke="#ccc" stroke-width="5"/>',
      estatua: '<rect x="62" y="136" width="76" height="16" rx="4" fill="' + fg + '"/><path d="M80 136l6-56h28l6 56z" fill="' + fg + '"/><circle cx="100" cy="62" r="20" fill="' + fg + '"/>',
      cruz: '<rect x="90" y="36" width="20" height="116" rx="3" fill="' + fg + '"/><rect x="62" y="64" width="76" height="18" rx="3" fill="' + fg + '"/>',
      bola: '<circle cx="100" cy="98" r="52" fill="' + fg + '"/><path d="M100 72l20 14-8 24h-24l-8-24z" fill="#111"/>',
      placa: '<rect x="40" y="62" width="120" height="70" rx="10" fill="' + fg + '"/><rect x="56" y="86" width="88" height="10" rx="5" fill="#fff" fill-opacity=".8"/><rect x="70" y="104" width="60" height="8" rx="4" fill="#fff" fill-opacity=".5"/>',
      luminaria: '<path d="M60 128h80l-12-70H72z" fill="' + fg + '"/><rect x="74" y="128" width="52" height="16" rx="4" fill="#333"/><ellipse cx="100" cy="58" rx="28" ry="6" fill="#fff" fill-opacity=".5"/>'
    }[shape];
    var s = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 180"><defs><radialGradient id="g" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#fff" stop-opacity=".25"/><stop offset="1" stop-color="' + bg + '"/></radialGradient></defs><rect width="200" height="180" fill="' + bg + '"/><rect width="200" height="180" fill="url(#g)"/><ellipse cx="100" cy="156" rx="60" ry="8" fill="#000" fill-opacity=".25"/>' + body + '</svg>';
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s);
  };
  var filaments = [
    ["f1", "PLA Preto", "PLA", "Preto", "#1A1A1A", 820], ["f2", "PLA Branco", "PLA", "Branco", "#F2F2F2", 640], ["f3", "PLA Laranja", "PLA", "Laranja", "#F5821F", 450],
    ["f4", "PLA Vermelho", "PLA", "Vermelho", "#E53935", 300], ["f5", "PLA Azul", "PLA", "Azul", "#1E6FE0", 710], ["f6", "PLA Verde", "PLA", "Verde", "#2E9E4F", 180],
    ["f7", "PLA Dourado Seda", "PLA Seda", "Dourado", "#D4AF37", 520], ["f8", "PLA Rosa Seda", "PLA Seda", "Rosa", "#F08AB8", 900], ["f9", "PETG Transparente", "PETG", "Transparente", "#CFE8EF", 950],
    ["f10", "PLA Roxo", "PLA", "Roxo", "#7B3FE4", 380], ["f11", "PLA Amarelo", "PLA", "Amarelo", "#F5D020", 140]
  ].map(function (f) { return { id: f[0], name: f[1], type: f[2], color: f[3], colorHex: f[4], qtyG: 1000, stockG: f[5], price: f[2] === "PETG" ? 95 : f[2] === "PLA Seda" ? 110 : 89, minG: 250 }; });
  var printers = [
    { id: "pr1", name: "Kobra X", price: 3400, lifeH: 6000, watts: 160, hoursUsed: 640, lastMaintH: 420, date: iso(addD(-170)) },
    { id: "pr2", name: "Kobra 4", price: 2600, lifeH: 6000, watts: 140, hoursUsed: 410, lastMaintH: 300, date: iso(addD(-120)) },
    { id: "pr3", name: "Kobra 3 Combo", price: 2900, lifeH: 6000, watts: 150, hoursUsed: 190, lastMaintH: 120, date: iso(addD(-60)) }
  ];
  var materials = [
    { id: "m1", name: "Argola para chaveiro", category: "Material", unitCost: 0.25, stock: 180, minStock: 50, movements: [] },
    { id: "m2", name: "Fita LED 5V (50 cm)", category: "Material", unitCost: 9.9, stock: 6, minStock: 4, movements: [] },
    { id: "m3", name: "Ímã de neodímio", category: "Material", unitCost: 0.6, stock: 40, minStock: 30, movements: [] },
    { id: "m4", name: "Caixinha kraft P", category: "Embalagem", unitCost: 1.8, stock: 35, minStock: 20, movements: [] },
    { id: "m5", name: "Saquinho com fecho", category: "Embalagem", unitCost: 0.3, stock: 12, minStock: 50, movements: [] }
  ];
  var niches = ["Decoração", "Chaveiros", "Personalizados", "Natal", "Religioso", "Times de futebol", "Utilidades"];
  var P = function (id, name, niche, shape, fil, more, hours, grams, cost, price, extra) {
    var fl = filaments.find(function (f) { return f.id === fil; });
    var p = { id: id, name: name, niche: niche, niches: [niche], cost: cost, salePrice: price, hours: hours, grams: grams, filamentId: fil, active: true, image: svg("#0F2224", fl.colorHex, shape) };
    if (more) p.moreFils = more.map(function (m, i) { return { id: id + "m" + i, filamentId: m[0], grams: m[1] }; });
    for (var k in (extra || {})) p[k] = extra[k];
    return p;
  };
  var projects = [
    P("p1", "Vaso Geométrico", "Decoração", "vaso", "f3", null, 3.5, 85, 9.8, 39.9),
    P("p2", "Vaso Espiral Seda", "Decoração", "vaso", "f8", null, 4.2, 110, 13.5, 54.9),
    P("p3", "Chaveiro Pilates", "Chaveiros", "chaveiro", "f6", null, 0.6, 9, 1.4, 8, { extras: [{ materialId: "m1", qty: 1 }] }),
    P("p4", "Chaveiro Nome Personalizado", "Chaveiros", "chaveiro", "f5", [["f2", 3]], 0.8, 12, 1.9, 12, { extras: [{ materialId: "m1", qty: 1 }] }),
    P("p5", "Papai Noel Decorativo", "Natal", "estatua", "f4", [["f2", 18]], 5.5, 120, 16.2, 69.9),
    P("p6", "Árvore de Natal LED", "Natal", "luminaria", "f6", [["f7", 10]], 6, 140, 28, 98, { extras: [{ materialId: "m2", qty: 1 }] }),
    P("p7", "Crucifixo de Parede", "Religioso", "cruz", "f7", null, 2.4, 48, 6.9, 34.9),
    P("p8", "Nossa Senhora 15 cm", "Religioso", "estatua", "f2", [["f5", 8]], 4.8, 95, 12.4, 59.9),
    P("p9", "Bola Flamengo", "Times de futebol", "bola", "f4", [["f1", 20]], 3.2, 70, 8.9, 44.9),
    P("p10", "Escudo Corinthians", "Times de futebol", "placa", "f1", [["f2", 15]], 2.6, 60, 7.5, 39.9),
    P("p11", "Placa Nome Pet", "Personalizados", "placa", "f2", [["f1", 10]], 2, 45, 5.8, 29.9),
    P("p12", "Luminária Lua", "Personalizados", "luminaria", "f2", null, 7.5, 160, 24, 89.9, { extras: [{ materialId: "m2", qty: 1 }] }),
    P("p13", "Suporte de Celular", "Utilidades", "placa", "f1", null, 1.8, 40, 4.6, 24.9),
    P("p14", "Organizador de Mesa", "Utilidades", "vaso", "f10", null, 5, 130, 14.8, 49.9),
    P("p15", "Topo de Bolo Personalizado", "Personalizados", "placa", "f7", null, 1.4, 22, 4.2, 35)
  ];
  projects[13].active = false;
  var clients = ["Maria Souza", "João Pereira", "Ana Lima", "Carlos Mendes", "Fernanda Rocha", "Lucas Martins", "Juliana Alves", "Rafael Costa", "Patrícia Gomes", "Bruno Ribeiro",
    "Camila Fernandes", "Diego Carvalho", "Larissa Nunes", "Thiago Barbosa", "Aline Teixeira", "Marcos Vieira", "Studio Pilates Bem Estar", "Pet Shop Amigo Fiel", "Paróquia São José", "Escolinha Craque do Futuro"]
    .map(function (n, i) { return { id: "c" + (i + 1), name: n, phone: "6699" + String(1000000 + i * 37731).slice(0, 7), city: pick(["Colíder", "Sinop", "Alta Floresta", "Nova Canaã do Norte"]), niches: [pick(niches)], instagram: i % 3 === 0 ? "@" + n.split(" ")[0].toLowerCase() + "_mt" : "" }; });
  var orders = [], quotes = [], expenses = [], qn = 30;
  var oid = 0;
  var mkOrder = function (dDays, proj, cli, qty, status, extra) {
    var d = addD(dDays), p = projects.find(function (x) { return x.id === proj; });
    var o = { id: "o" + (++oid), projectId: proj, clientId: cli || "", qty: qty, date: iso(d), dueDate: iso(addD(dDays + ri(3, 10))), price: (p.salePrice * qty).toFixed(2), cost: (p.cost * qty).toFixed(2), status: status, dest: "venda", processed: status === "Entregue" || status === "Concluído", paid: status === "Entregue" ? rnd() > (dDays < -35 ? 0.03 : 0.4) : false, printerId: pick(printers).id };
    for (var k in (extra || {})) o[k] = extra[k];
    if (o.dest !== "venda") { o.price = o.dest === "brinde" ? "" : o.price; o.paid = false; }
    orders.push(o); return o;
  };
  /* histórico de 6 meses com crescimento */
  for (var m = 5; m >= 0; m--) {
    var n = [7, 9, 11, 13, 16, 12][5 - m];
    for (var i = 0; i < n; i++) {
      var dd = -(m * 30) - ri(0, 27);
      if (dd > -2) dd = -ri(2, 9);
      var pr = pick(projects.filter(function (p) { return p.active; }));
      var q = pr.id === "p3" || pr.id === "p4" ? ri(5, 40) : ri(1, 4);
      var dest = rnd() < 0.06 ? "brinde" : rnd() < 0.06 ? "estoque" : "venda";
      mkOrder(dd, pr.id, dest === "venda" ? pick(clients).id : "", q, "Entregue", { dest: dest });
    }
  }
  /* em aberto: produção, aprovados, atrasados */
  var o1 = mkOrder(-3, "p5", "c3", 2, "Em produção", { dueDate: iso(addD(2)), printerId: "pr1" });
  var o2 = mkOrder(-2, "p9", "c19", 3, "Em produção", { dueDate: iso(addD(4)), printerId: "pr2" });
  var o3 = mkOrder(-1, "p3", "c17", 30, "Em produção", { dueDate: iso(addD(3)), printerId: "pr3", prints: [{ id: "pp1", date: iso(addD(-1)), qty: 12, printerId: "pr3" }] });
  mkOrder(-6, "p6", "c5", 1, "Em produção", { dueDate: iso(addD(-1)), printerId: "pr1" });
  mkOrder(-1, "p12", "c8", 1, "Aprovado", { dueDate: iso(addD(6)), printerId: "pr2" });
  mkOrder(0, "p11", "c18", 4, "Aprovado", { dueDate: iso(addD(5)), printerId: "pr3" });
  mkOrder(-4, "p7", "c19", 6, "Aprovado", { dueDate: iso(addD(7)), printerId: "pr1" });
  mkOrder(-8, "p2", "c11", 1, "Concluído", { dueDate: iso(addD(1)) });
  /* imprimindo agora (aparece nas impressoras do Comando) */
  o1.printing = [{ partId: "", printerId: "pr1", qty: 1, at: new Date(Date.now() - 2.1 * 3600000).toISOString() }];
  o2.printing = [{ partId: "", printerId: "pr2", qty: 1, at: new Date(Date.now() - 1.2 * 3600000).toISOString() }];
  o3.printing = [{ partId: "", printerId: "pr3", qty: 6, at: new Date(Date.now() - 2.3 * 3600000).toISOString() }];
  /* orçamentos */
  var Q = function (dDays, cli, items, status, extra) {
    var q = { id: "q" + qn, code: "ORC-" + String(qn).padStart(4, "0"), date: iso(addD(dDays)), clientId: cli, status: status, validUntil: iso(addD(dDays + 7)),
      items: items.map(function (it, i) { var p = projects.find(function (x) { return x.id === it[0]; }); return { id: "i" + i, projectId: it[0], qty: it[1], unitPrice: p.salePrice }; }),
      events: [{ d: iso(addD(dDays)), t: "pdf" }, { d: iso(addD(dDays)), t: "wa" }] };
    for (var k in (extra || {})) q[k] = extra[k];
    qn++; quotes.push(q); return q;
  };
  Q(-40, "c2", [["p9", 2]], "Aprovado"); Q(-33, "c6", [["p1", 1], ["p13", 2]], "Recusado"); Q(-25, "c17", [["p3", 50]], "Aprovado", { discount: 30 });
  Q(-20, "c10", [["p8", 1]], "Expirado"); Q(-14, "c19", [["p7", 6], ["p8", 2]], "Aprovado"); Q(-9, "c12", [["p10", 3]], "Recusado");
  Q(-5, "c4", [["p6", 2], ["p5", 1]], "Pendente"); Q(-3, "c14", [["p15", 2]], "Pendente"); Q(-2, "c20", [["p9", 10], ["p10", 10]], "Pendente", { discount: 50, notes: "50% de entrada para iniciar" });
  Q(-1, "c9", [["p12", 1]], "Pendente"); Q(0, "c13", [["p4", 25]], "Pendente");
  /* gastos */
  var eid = 0, E = function (dDays, cat, desc, value, extra) { var e = { id: "e" + (++eid), date: iso(addD(dDays)), category: cat, desc: desc, value: value.toFixed(2) }; for (var k in (extra || {})) e[k] = extra[k]; expenses.push(e); };
  for (var mm = 5; mm >= 0; mm--) {
    var base = -mm * 30;
    E(base - 2, "Filamento", "Compra: " + pick(filaments).name + " (2 kg)", 178 + ri(0, 30), { units: 2000 });
    E(base - 14, "Filamento", "Compra: " + pick(filaments).name, 89 + ri(0, 20), { units: 1000 });
    if (mm % 2 === 0) E(base - 9, "Embalagem", "Caixinhas kraft (50 un)", 85);
    if (mm % 2 === 1) E(base - 18, "Material", "Argolas e ímãs", 42 + ri(0, 15));
    E(base - 21, "Marketing", "Impulsionamento Instagram", 50);
    if (mm === 2) E(base - 5, "Manutenção", "Bico 0.4 + correia Kobra X", 74);
    if (mm === 4) E(base - 11, "Ferramenta", "Espátula + alicate de corte", 59);
  }
  E(-170, "Equipamento", "Compra: Kobra X", 3400); E(-120, "Equipamento", "Compra: Kobra 4", 2600); E(-60, "Equipamento", "Compra: Kobra 3 Combo", 2900);
  E(-4, "Calibração", "Testes de calibração · Kobra 3", 6.5);
  var ymNow = ym(today), ymPrev = ym(addD(-30));
  var fixedCosts = [
    { id: "fx1", name: "Internet", day: 10, value: 119.9, paidMonths: [ymPrev, ymNow] },
    { id: "fx2", name: "Energia (parte da loja)", day: Math.min(28, today.getDate() + 2), value: 140, paidMonths: [ymPrev] },
    { id: "fx3", name: "MEI (DAS)", day: 20, value: 75.6, paidMonths: [ymPrev] },
    { id: "fx4", name: "Canva Pro", day: 5, value: 34.9, paidMonths: [ymPrev, ymNow] }
  ];
  var cashflow = [
    { id: "k1", date: iso(addD(-12)), kind: "in", value: "25.00", desc: "Frete pago pelo cliente" },
    { id: "k2", date: iso(addD(-6)), kind: "out", value: "18.00", cat: "Outro", desc: "Correios — envio Sinop" }
  ];
  var products = [{ id: "s1", projectId: "p3", qty: 14 }, { id: "s2", projectId: "p1", qty: 3 }, { id: "s3", projectId: "p9", qty: 2 }, { id: "s4", projectId: "p13", qty: 5 }];
  var kits = [{ id: "kt1", name: "Kit Torcedor", niches: ["Times de futebol"], niche: "Times de futebol", items: [{ id: "a", projectId: "p9", qty: 1 }, { id: "b", projectId: "p10", qty: 1 }], price: 74.9, active: true },
    { id: "kt2", name: "Kit Natal Completo", niches: ["Natal"], niche: "Natal", items: [{ id: "a", projectId: "p5", qty: 1 }, { id: "b", projectId: "p6", qty: 1 }], price: 149.9, active: true }];
  return {
    settings: { defaultMargin: 100, kwhPrice: 0.95, niches: niches, laborRate: 25, failureRate: 8, prodHoursPerDay: 10, quoteValidityDays: 7, maintMarginPct: 5, ownerName: "André", lowStockG: 250, monthlyGoal: 1500, finalMultiplier: 5, resaleMultiplier: 3, maintEveryH: 300 },
    storeInfo: { name: "PrintAR 3D", tagline: "suas ideias, impressas em 3D", phone: "(66) 9 9999-0000", email: "contato@exemplo.com", city: "Colíder - MT", instagram: "@printar_3d", pix: { type: "email", key: "contato@exemplo.com", name: "PrintAR 3D", city: "Colider" } },
    filaments: filaments, printers: printers, projects: projects, clients: clients, orders: orders, products: products, cashflow: cashflow,
    expenses: expenses, prodMoves: [], materials: materials, quotes: quotes, kits: kits, fixedCosts: fixedCosts
  };
};
