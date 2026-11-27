// PUKKA - organizador pessoal (versao web).
// Replica as areas do 12345.py e guarda tudo no localStorage.

const CHAVE = "pukka-v1";
const CHAVE_MATRIZ = "pukka-matriz";

// ---------------------------------------------------------------------------
// Definicao das areas (mesmos campos do programa de terminal)
// ---------------------------------------------------------------------------

const AREAS = {
    divida: {
        nome: "Dívidas",
        singular: "dívida",
        grupo: "dinheiro",
        campos: [
            { c: "nome", r: "Nome", t: "texto", obr: true, dica: "Nome da pessoa" },
            { c: "valor", r: "Valor", t: "inteiro", obr: true },
            { c: "acont", r: "Acontecimento", t: "texto", obr: true, dica: "Porque ele emprestou?" },
        ],
        titulo: (r) => r.nome,
        sucesso: () => "Dívida registada com sucesso.",
    },
    financa: {
        nome: "Finanças",
        singular: "registo",
        grupo: "dinheiro",
        campos: [
            { c: "valor_d", r: "Valor total das dívidas", t: "inteiro", obr: true },
            { c: "valor_l", r: "Valor que tens agora", t: "inteiro", obr: true },
            { c: "total", r: "Total", virtual: true, destaque: true },
        ],
        calcular: (reg) => {
            reg.total = (Number(reg.valor_l) || 0) - (Number(reg.valor_d) || 0);
            return reg;
        },
        titulo: (r) => "Saldo: " + r.total,
        sucesso: (r) => "Finança registada. Saldo: " + r.total,
    },
    imail: {
        nome: "Contas de email",
        singular: "email",
        grupo: "contas",
        semData: true,
        campos: [
            { c: "imail", r: "Email", t: "email", obr: true },
            { c: "senha", r: "Senha", t: "senha", obr: true },
        ],
        titulo: (r) => r.imail,
        sucesso: () => "Email guardado com sucesso.",
    },
    facebook: {
        nome: "Facebook",
        singular: "conta",
        grupo: "contas",
        campos: [
            { c: "nome", r: "Nome", t: "texto", obr: true, dica: "Nickname da conta" },
            { c: "numero", r: "Número", t: "texto" },
            { c: "imail", r: "Email", t: "email" },
            { c: "senha", r: "Senha", t: "senha" },
        ],
        titulo: (r) => r.nome,
        sucesso: () => "Conta de Facebook guardada com sucesso.",
    },
    outras: {
        nome: "Outras contas",
        singular: "conta",
        grupo: "contas",
        semData: true,
        campos: [
            { c: "nome", r: "Nome", t: "texto", obr: true, dica: "Nickname da conta" },
            { c: "numero", r: "Número", t: "texto" },
            { c: "web", r: "Site", t: "texto", dica: "Nome do site" },
            { c: "imail", r: "Email", t: "email" },
            { c: "senha", r: "Senha", t: "senha" },
        ],
        titulo: (r) => r.nome,
        sucesso: () => "Conta guardada com sucesso.",
    },
    contm: {
        nome: "Contactos (homens)",
        singular: "contacto",
        grupo: "contas",
        semData: true,
        ordenar: "nome",
        campos: [
            { c: "nome", r: "Nome", t: "texto", obr: true, dica: "Nome da pessoa" },
            { c: "numero", r: "Número", t: "texto", obr: true },
        ],
        titulo: (r) => r.nome,
        sucesso: () => "Contacto guardado com sucesso.",
    },
    contf: {
        nome: "Contactos (mulheres)",
        singular: "contacto",
        grupo: "contas",
        semData: true,
        ordenar: "nome",
        campos: [
            { c: "nome", r: "Nome", t: "texto", obr: true, dica: "Nome da pessoa" },
            { c: "numero", r: "Número", t: "texto", obr: true },
        ],
        titulo: (r) => r.nome,
        sucesso: () => "Contacto guardado com sucesso.",
    },
    propositos: {
        nome: "Propósitos",
        singular: "propósito",
        grupo: "agenda",
        campos: [
            { c: "nome", r: "Nome", t: "texto", obr: true, dica: "Nome do seu propósito" },
            { c: "assunto", r: "Assunto", t: "texto", obr: true, dica: "O que quer fazer?" },
            { c: "limite", r: "Limite", t: "texto", obr: true, dica: "Quando vai terminar?" },
        ],
        titulo: (r) => r.nome,
        sucesso: () => "Propósito guardado com sucesso.",
        vazio: "A lista ainda está vazia.",
    },
    acontecimento: {
        nome: "Acontecimentos",
        singular: "acontecimento",
        grupo: "agenda",
        campos: [
            { c: "nome", r: "Nome", t: "texto", obr: true, dica: "Nome do acontecimento" },
            { c: "assunto", r: "Assunto", t: "texto", obr: true, dica: "O que aconteceu?" },
        ],
        titulo: (r) => r.nome,
        sucesso: () => "Acontecimento guardado com sucesso.",
        vazio: "A lista ainda está vazia.",
    },
};

const GRUPOS = {
    dinheiro: { nome: "Dinheiro", simbolo: "$", areas: ["divida", "financa"] },
    contas: { nome: "Contas", simbolo: "#", areas: ["imail", "facebook", "outras", "contm", "contf"] },
    agenda: { nome: "Agenda", simbolo: "◷", areas: ["propositos", "acontecimento"] },
};

const MODOS = {
    adicionar: "Adicionar",
    ver: "Ver dados",
    remover: "Remover",
    editar: "Editar",
};

// ---------------------------------------------------------------------------
// Dados
// ---------------------------------------------------------------------------

function dadosVazios() {
    return {
        divida: [],
        financa: [],
        imail: [],
        facebook: [],
        outras: [],
        contm: [],
        contf: [],
        propositos: [],
        acontecimento: [],
        jogo: [],
    };
}

let dados = carregarDados();
let estado = {
    vista: "inicio",
    grupo: null,
    area: null,
    modo: null,
    edicao: null,
    aviso: null,
    resultadoJogo: null,
    senhasVisiveis: {},
};

function carregarDados() {
    const base = dadosVazios();
    let lido;

    try {
        lido = JSON.parse(localStorage.getItem(CHAVE) || "{}");
    } catch (erro) {
        return base;
    }

    if (!lido || typeof lido !== "object") {
        return base;
    }

    for (const chave of Object.keys(base)) {
        if (Array.isArray(lido[chave])) {
            base[chave] = lido[chave].filter((r) => r && typeof r === "object");
        }
    }

    return base;
}

function guardarDados() {
    localStorage.setItem(CHAVE, JSON.stringify(dados));
}

function proximoId(lista) {
    return lista.reduce((maior, r) => Math.max(maior, Number(r.id) || 0), 0) + 1;
}

function registosDe(area) {
    const lista = dados[area].slice();

    if (AREAS[area].ordenar === "nome") {
        lista.sort((a, b) => String(a.nome || "").localeCompare(String(b.nome || ""), "pt", { sensitivity: "base" }));
    } else {
        lista.sort((a, b) => (Number(a.id) || 0) - (Number(b.id) || 0));
    }

    return lista;
}

function agora() {
    const d = new Date();
    const dois = (n) => String(n).padStart(2, "0");
    return `${dois(d.getDate())}/${dois(d.getMonth() + 1)}/${d.getFullYear()} ${dois(d.getHours())}:${dois(d.getMinutes())}`;
}

// ---------------------------------------------------------------------------
// Utilitarios de DOM
// ---------------------------------------------------------------------------

const app = document.getElementById("app");
const botaoVoltar = document.getElementById("voltar");

function el(tag, classe, texto) {
    const elemento = document.createElement(tag);
    if (classe) {
        elemento.className = classe;
    }
    if (texto !== undefined && texto !== null) {
        elemento.textContent = String(texto);
    }
    return elemento;
}

function botao(texto, classe, aoClicar, atributos) {
    const b = el("button", classe, texto);
    b.type = "button";
    if (atributos) {
        for (const [chave, valor] of Object.entries(atributos)) {
            b.dataset[chave] = valor;
        }
    }
    b.addEventListener("click", aoClicar);
    return b;
}

function cartao(titulo) {
    const c = el("div", "cartao");
    if (titulo) {
        c.appendChild(el("h2", null, titulo));
    }
    return c;
}

function mostrarAviso() {
    if (!estado.aviso) {
        return null;
    }

    const aviso = el("div", "aviso " + (estado.aviso.tipo || "ok"), estado.aviso.texto);
    aviso.dataset.aviso = "1";
    return aviso;
}

function limparAviso() {
    estado.aviso = null;
}

// ---------------------------------------------------------------------------
// Navegacao
// ---------------------------------------------------------------------------

function irPara(vista, extra) {
    estado = Object.assign({}, estado, { vista }, extra || {});
    render();
}

function voltar() {
    limparAviso();

    if (estado.vista === "grupos") {
        irPara("inicio");
    } else if (estado.vista === "areas") {
        irPara("grupos", { grupo: null, modo: estado.modo });
    } else if (estado.vista === "lista") {
        irPara("areas", { area: null, modo: estado.modo });
    } else if (estado.vista === "form") {
        irPara("lista", { edicao: null });
    } else if (estado.vista === "jogo") {
        irPara("inicio");
    }
}

// ---------------------------------------------------------------------------
// Vistas
// ---------------------------------------------------------------------------

function render() {
    app.textContent = "";
    botaoVoltar.classList.toggle("oculto", estado.vista === "inicio");

    const aviso = mostrarAviso();
    if (aviso) {
        app.appendChild(aviso);
    }

    if (estado.vista === "inicio") {
        vistaInicio();
    } else if (estado.vista === "grupos") {
        vistaGrupos();
    } else if (estado.vista === "areas") {
        vistaAreas();
    } else if (estado.vista === "lista") {
        vistaLista();
    } else if (estado.vista === "form") {
        vistaFormulario();
    } else if (estado.vista === "jogo") {
        vistaJogo();
    }

    window.scrollTo({ top: 0, behavior: "auto" });
}

function totalRegistos() {
    return Object.keys(AREAS).reduce((soma, area) => soma + dados[area].length, 0);
}

function vistaInicio() {
    const intro = el("div", "boas-vindas");
    intro.appendChild(el("div", "linha1", "Organizador pessoal"));
    intro.appendChild(el("div", "linha2", "dinheiro, contas e agenda num só lugar"));
    app.appendChild(intro);

    const menu = el("div", "menu-principal");

    const itens = [
        { acao: "adicionar", simbolo: "+", rotulo: "Adicionar" },
        { acao: "ver", simbolo: "▤", rotulo: "Ver dados", contagem: totalRegistos() + " registo(s)" },
        { acao: "remover", simbolo: "✕", rotulo: "Remover" },
        { acao: "editar", simbolo: "✎", rotulo: "Editar" },
        { acao: "jogos", simbolo: "▶", rotulo: "Jogos", contagem: dados.jogo.length + " partida(s)" },
    ];

    for (const item of itens) {
        const b = botao(null, null, () => {
            limparAviso();
            if (item.acao === "jogos") {
                estado.resultadoJogo = null;
                irPara("jogo");
            } else {
                irPara("grupos", { modo: item.acao, grupo: null, area: null });
            }
        }, { acao: item.acao });

        b.appendChild(el("span", "simbolo", item.simbolo));
        b.appendChild(el("span", "rotulo", item.rotulo));
        if (item.contagem) {
            b.appendChild(el("span", "contagem", item.contagem));
        }
        menu.appendChild(b);
    }

    app.appendChild(menu);
    app.appendChild(cartaoBackup());
}

function cartaoBackup() {
    const c = cartao("Cópia de segurança");
    const linha = el("div", "linha-botoes");

    linha.appendChild(botao("Exportar", "secundario", exportarTudo, { acao: "exportar" }));
    linha.appendChild(botao("Importar", "secundario", escolherImportacao, { acao: "importar" }));

    c.appendChild(linha);

    const ficheiro = el("input");
    ficheiro.type = "file";
    ficheiro.accept = ".json,application/json";
    ficheiro.id = "campo-ficheiro";
    ficheiro.className = "oculto";
    ficheiro.addEventListener("change", importarFicheiro);
    c.appendChild(ficheiro);

    return c;
}

function vistaGrupos() {
    const c = cartao(MODOS[estado.modo]);

    const lista = el("div", "menu-principal");

    for (const [chave, grupo] of Object.entries(GRUPOS)) {
        const quantidade = grupo.areas.reduce((soma, area) => soma + dados[area].length, 0);

        const b = botao(null, "secundario", () => {
            limparAviso();
            irPara("areas", { grupo: chave, modo: estado.modo, area: null });
        }, { grupo: chave });

        b.appendChild(el("span", "simbolo", grupo.simbolo));
        b.appendChild(el("span", "rotulo", grupo.nome));
        b.appendChild(el("span", "contagem", quantidade + " registo(s)"));
        lista.appendChild(b);
    }

    c.appendChild(lista);
    app.appendChild(c);
}

function vistaAreas() {
    const grupo = GRUPOS[estado.grupo];
    const c = cartao(MODOS[estado.modo] + " · " + grupo.nome);
    const lista = el("div", "menu-principal");

    for (const chave of grupo.areas) {
        const area = AREAS[chave];

        const b = botao(null, "secundario", () => {
            limparAviso();
            if (estado.modo === "adicionar") {
                irPara("form", { area: chave, edicao: null });
            } else {
                irPara("lista", { area: chave, edicao: null });
            }
        }, { area: chave });

        b.appendChild(el("span", "rotulo", area.nome));
        b.appendChild(el("span", "contagem", dados[chave].length + ""));
        lista.appendChild(b);
    }

    c.appendChild(lista);
    app.appendChild(c);
}

function tituloRegisto(area, registo) {
    const meta = AREAS[area];
    if (typeof meta.titulo === "function") {
        return meta.titulo(registo);
    }
    return meta.nome + " #" + registo.id;
}

function linhasRegisto(area, registo) {
    const meta = AREAS[area];
    const linhas = [];

    if (!meta.semData) {
        linhas.push(["Data", registo.data || ""]);
    }

    for (const campo of meta.campos) {
        if (campo.virtual) {
            continue;
        }

        let valor = registo[campo.c] === undefined ? "" : registo[campo.c];

        if (campo.t === "senha" && valor !== "") {
            const chaveVisivel = area + ":" + registo.id;
            valor = estado.senhasVisiveis[chaveVisivel] ? valor : "••••••";
        }

        linhas.push([campo.r, valor]);
    }

    if (area === "financa") {
        linhas.push(["Total", registo.total]);
    }

    return linhas;
}

function vistaLista() {
    const area = estado.area;
    const meta = AREAS[area];
    const c = cartao(meta.nome + " · " + MODOS[estado.modo]);
    const registos = registosDe(area);

    if (registos.length === 0) {
        c.appendChild(el("div", "vazio", meta.vazio || "A lista está vazia."));
    } else {
        const lista = el("ul", "registos");

        for (const registo of registos) {
            const item = el("li");
            item.dataset.id = registo.id;

            const topo = el("div", "registo-topo");
            topo.appendChild(el("span", "registo-id", "ID " + registo.id));
            topo.appendChild(el("span", "registo-titulo", tituloRegisto(area, registo)));
            item.appendChild(topo);

            for (const [rotulo, valor] of linhasRegisto(area, registo)) {
                const linha = el("div", "registo-linha");
                linha.appendChild(el("span", "rotulo", rotulo));
                const valorEl = el("span", "valor" + (rotulo === "Total" ? " destaque" : ""), valor);
                linha.appendChild(valorEl);
                item.appendChild(linha);
            }

            if (area === "imail" || area === "facebook" || area === "outras") {
                const temSenha = (registo.senha || "") !== "";
                if (temSenha) {
                    const acoesSenha = el("div", "registo-acoes");
                    const chaveVisivel = area + ":" + registo.id;
                    const visivel = !!estado.senhasVisiveis[chaveVisivel];
                    acoesSenha.appendChild(botao(visivel ? "Ocultar senha" : "Ver senha", "mini", () => {
                        estado.senhasVisiveis[chaveVisivel] = !visivel;
                        render();
                    }, { acao: "senha" }));
                    item.appendChild(acoesSenha);
                }
            }

            if (estado.modo === "remover" || estado.modo === "editar") {
                const acoes = el("div", "registo-acoes");

                if (estado.modo === "editar") {
                    acoes.appendChild(botao("Editar", "mini", () => {
                        limparAviso();
                        irPara("form", { edicao: registo.id });
                    }, { acao: "editar" }));
                }

                if (estado.modo === "remover") {
                    acoes.appendChild(botao("Apagar", "mini perigo", () => {
                        apagarRegisto(area, registo);
                    }, { acao: "apagar" }));
                }

                item.appendChild(acoes);
            }

            lista.appendChild(item);
        }

        c.appendChild(lista);
        const total = el("p", "contagem-lista", registos.length + " registo(s).");
        c.appendChild(total);
    }

    app.appendChild(c);
}

function apagarRegisto(area, registo) {
    const meta = AREAS[area];
    const nome = tituloRegisto(area, registo);

    if (!window.confirm(`Apagar ${meta.singular} "${nome}" (ID ${registo.id})?`)) {
        return;
    }

    dados[area] = dados[area].filter((r) => Number(r.id) !== Number(registo.id));
    guardarDados();
    estado.aviso = { texto: "Removido com sucesso.", tipo: "ok" };
    render();
}

function vistaFormulario() {
    const area = estado.area;
    const meta = AREAS[area];
    const emEdicao = estado.edicao !== null && estado.edicao !== undefined;
    const registo = emEdicao
        ? dados[area].find((r) => Number(r.id) === Number(estado.edicao))
        : null;

    if (emEdicao && !registo) {
        estado.aviso = { texto: "Esse ID não existe.", tipo: "erro" };
        irPara("lista", { edicao: null });
        return;
    }

    const c = cartao((emEdicao ? "Editar " : "Adicionar ") + meta.nome.toLowerCase());

    if (meta.singular) {
        const dica = el("p", "subtitulo", emEdicao ? "Altere os campos e guarde." : "Preencha os campos.");
        c.appendChild(dica);
    }

    const form = el("form");
    form.id = "form-registo";
    const campos = {};

    for (const campo of meta.campos) {
        if (campo.virtual) {
            continue;
        }

        const label = el("label", null, campo.r + (campo.obr ? " *" : ""));
        label.setAttribute("for", "campo-" + campo.c);
        form.appendChild(label);

        const input = el("input");
        input.id = "campo-" + campo.c;
        input.name = campo.c;
        input.autocomplete = "off";

        if (campo.t === "inteiro") {
            input.type = "number";
            input.step = "1";
            input.inputMode = "numeric";
        } else if (campo.t === "email") {
            input.type = "email";
        } else if (campo.t === "senha") {
            input.type = "password";
        } else {
            input.type = "text";
        }

        if (campo.dica) {
            input.placeholder = campo.dica;
        }

        if (registo) {
            input.value = registo[campo.c] === undefined ? "" : registo[campo.c];
        }

        form.appendChild(input);
        campos[campo.c] = input;
    }

    // Pre-visualizacao do saldo nas financas.
    let dicaSaldo = null;
    if (area === "financa") {
        dicaSaldo = el("p", "dica", "Total (saldo): 0");
        form.appendChild(dicaSaldo);

        const actualizar = () => {
            const d = Number(campos.valor_d.value) || 0;
            const l = Number(campos.valor_l.value) || 0;
            dicaSaldo.textContent = "Total (saldo): " + (l - d);
        };

        campos.valor_d.addEventListener("input", actualizar);
        campos.valor_l.addEventListener("input", actualizar);
        actualizar();
    }

    const linha = el("div", "linha-botoes");
    const guardar = el("button", null, emEdicao ? "Guardar alterações" : "Guardar");
    guardar.type = "submit";
    guardar.dataset.acao = "guardar";
    linha.appendChild(guardar);

    if (emEdicao) {
        linha.appendChild(botao("Cancelar", "secundario", () => {
            limparAviso();
            irPara("lista", { edicao: null });
        }, { acao: "cancelar" }));
    }

    form.appendChild(linha);
    form.addEventListener("submit", (evento) => {
        evento.preventDefault();
        submeterFormulario(area, campos, emEdicao ? Number(estado.edicao) : null);
    });

    c.appendChild(form);
    app.appendChild(c);
}

function lerCampos(area, campos) {
    const meta = AREAS[area];
    const valores = {};

    for (const campo of meta.campos) {
        if (campo.virtual) {
            continue;
        }

        const input = campos[campo.c];
        let valor = campo.t === "senha" ? input.value : input.value.trim();

        if (campo.t === "email") {
            valor = valor.toLowerCase();
        }

        if (campo.obr && valor === "") {
            const mensagem = campo.t === "email"
                ? "O email não pode ficar vazio."
                : "O " + campo.r.toLowerCase() + " não pode ficar vazio.";
            return { erro: mensagem };
        }

        if (campo.t === "inteiro" && valor !== "") {
            if (!/^-?\d+$/.test(valor)) {
                return { erro: "Digite apenas números inteiros." };
            }
            valor = parseInt(valor, 10);
        }

        if (campo.t === "inteiro" && campo.obr && valor === "") {
            return { erro: "Digite apenas números inteiros." };
        }

        valores[campo.c] = valor;
    }

    return { valores };
}

function submeterFormulario(area, campos, idEdicao) {
    const meta = AREAS[area];
    const lido = lerCampos(area, campos);

    if (lido.erro) {
        estado.aviso = { texto: lido.erro, tipo: "erro" };
        render();
        return;
    }

    const valores = lido.valores;

    if (typeof meta.calcular === "function") {
        meta.calcular(valores);
    }

    if (idEdicao !== null) {
        const registo = dados[area].find((r) => Number(r.id) === idEdicao);

        if (!registo) {
            estado.aviso = { texto: "Esse ID não existe.", tipo: "erro" };
            irPara("lista", { edicao: null });
            return;
        }

        Object.assign(registo, valores);

        if (!meta.semData && !registo.data) {
            registo.data = agora();
        }

        estado.aviso = { texto: "Registo atualizado com sucesso.", tipo: "ok" };
    } else {
        const novo = Object.assign({ id: proximoId(dados[area]) }, valores);

        if (!meta.semData) {
            novo.data = agora();
        }

        dados[area].push(novo);
        estado.aviso = { texto: meta.sucesso(novo), tipo: "ok" };
    }

    guardarDados();
    estado.edicao = null;
    irPara("lista", { edicao: null });
}

// ---------------------------------------------------------------------------
// Jogos - pedra, papel e tesoura
// ---------------------------------------------------------------------------

const OPCOES_JOGO = ["pedra", "papel", "tesoura"];

function resultadoJogo(jogador, adversario) {
    if (jogador === adversario) {
        return "empate";
    }

    if (
        (jogador === "pedra" && adversario === "tesoura") ||
        (jogador === "papel" && adversario === "pedra") ||
        (jogador === "tesoura" && adversario === "papel")
    ) {
        return "venceu";
    }

    return "perdeu";
}

function calcularPlacar() {
    const placar = { vitorias: 0, derrotas: 0, empates: 0 };

    for (const partida of dados.jogo) {
        for (const adversario of [partida.ia, partida.bot]) {
            const r = resultadoJogo(partida.pessoa, adversario);
            if (r === "venceu") {
                placar.vitorias++;
            } else if (r === "perdeu") {
                placar.derrotas++;
            } else {
                placar.empates++;
            }
        }
    }

    placar.total = placar.vitorias + placar.derrotas + placar.empates;
    return placar;
}

function jogar(escolha) {
    const ia = OPCOES_JOGO[Math.floor(Math.random() * OPCOES_JOGO.length)];
    const bot = OPCOES_JOGO[Math.floor(Math.random() * OPCOES_JOGO.length)];

    const partida = { pessoa: escolha, ia, bot };
    dados.jogo.push(partida);
    guardarDados();

    estado.resultadoJogo = {
        partida,
        contraIa: resultadoJogo(escolha, ia),
        contraBot: resultadoJogo(escolha, bot),
    };

    render();
}

function zerarJogo() {
    if (dados.jogo.length === 0) {
        estado.aviso = { texto: "O histórico já está vazio.", tipo: "erro" };
        render();
        return;
    }

    if (!window.confirm(`Isto vai apagar ${dados.jogo.length} partida(s) e o placar. Continuar?`)) {
        return;
    }

    dados.jogo = [];
    guardarDados();
    estado.resultadoJogo = null;
    estado.aviso = { texto: "Placar e histórico apagados.", tipo: "ok" };
    render();
}

function vistaJogo() {
    const placar = calcularPlacar();

    // Placar
    const cPlacar = cartao("Placar");
    const placarEl = el("div", "placar");

    const linhas = [
        ["Vitórias", placar.vitorias],
        ["Derrotas", placar.derrotas],
        ["Empates", placar.empates],
        ["Total", placar.total],
    ];

    for (const [rotulo, numero] of linhas) {
        const caixa = el("div", "caixa");
        caixa.appendChild(el("span", null, rotulo));
        caixa.appendChild(el("span", "numero", numero));
        placarEl.appendChild(caixa);
    }

    if (placar.total > 0) {
        const caixa = el("div", "caixa");
        caixa.appendChild(el("span", null, "Aproveitamento"));
        caixa.appendChild(el("span", "numero", Math.round((placar.vitorias / placar.total) * 100) + "%"));
        placarEl.appendChild(caixa);
    }

    cPlacar.appendChild(placarEl);
    app.appendChild(cPlacar);

    // Jogar
    const cJogar = cartao("Jogar pedra, papel e tesoura");
    const opcoes = el("div", "opcoes-jogo");

    for (const escolha of OPCOES_JOGO) {
        opcoes.appendChild(botao(escolha, "secundario", () => {
            limparAviso();
            jogar(escolha);
        }, { jogada: escolha }));
    }

    cJogar.appendChild(opcoes);

    if (estado.resultadoJogo) {
        const { partida, contraIa, contraBot } = estado.resultadoJogo;

        const resultado = el("div", "resultado-jogo");
        const colunas = [
            ["Você", partida.pessoa],
            ["IA", partida.ia],
            ["Bot", partida.bot],
        ];

        for (const [quem, jogada] of colunas) {
            const caixa = el("div", "caixa");
            caixa.appendChild(el("div", "quem", quem));
            caixa.appendChild(el("div", "jogada", jogada));
            resultado.appendChild(caixa);
        }

        cJogar.appendChild(resultado);

        const veredicto = el("div", "veredicto");
        const linhaIa = el("div");
        linhaIa.appendChild(el("span", null, "Contra a IA: você "));
        linhaIa.appendChild(el("span", contraIa, contraIa + "."));
        const linhaBot = el("div");
        linhaBot.appendChild(el("span", null, "Contra o bot: você "));
        linhaBot.appendChild(el("span", contraBot, contraBot + "."));
        veredicto.appendChild(linhaIa);
        veredicto.appendChild(linhaBot);
        cJogar.appendChild(veredicto);
    }

    app.appendChild(cJogar);

    // Historico
    const cHist = cartao("Partidas registadas");

    if (dados.jogo.length === 0) {
        cHist.appendChild(el("div", "vazio", "Nenhuma partida registada."));
    } else {
        const lista = el("ul", "registos historico");

        dados.jogo.forEach((partida, indice) => {
            const item = el("li");
            item.appendChild(el("span", "ordem", indice + 1 + "."));
            item.appendChild(el("span", null,
                `Você: ${partida.pessoa} | IA: ${partida.ia} | Bot: ${partida.bot}`));
            lista.appendChild(item);
        });

        cHist.appendChild(lista);
        cHist.appendChild(el("p", "contagem-lista", dados.jogo.length + " partida(s)."));
    }

    const linha = el("div", "linha-botoes");
    linha.appendChild(botao("Zerar placar", "perigo", zerarJogo, { acao: "zerar" }));
    cHist.appendChild(linha);
    app.appendChild(cHist);
}

// ---------------------------------------------------------------------------
// Backup
// ---------------------------------------------------------------------------

function exportarTudo() {
    const conteudo = JSON.stringify(
        Object.assign({ versao: 1, exportado: agora() }, dados),
        null,
        2
    );

    const ficheiro = new Blob([conteudo], { type: "application/json" });
    const endereco = URL.createObjectURL(ficheiro);
    const link = document.createElement("a");
    const hoje = new Date().toISOString().slice(0, 10);

    link.href = endereco;
    link.download = "pukka-" + hoje + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(endereco), 1000);
    estado.aviso = { texto: "Ficheiro exportado.", tipo: "ok" };
    render();
}

function escolherImportacao() {
    const campo = document.getElementById("campo-ficheiro");
    if (campo) {
        campo.click();
    }
}

function importarFicheiro(evento) {
    const ficheiro = evento.target.files && evento.target.files[0];

    if (!ficheiro) {
        return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
        let lido;

        try {
            lido = JSON.parse(String(leitor.result));
        } catch (erro) {
            estado.aviso = { texto: "O ficheiro não é um JSON válido.", tipo: "erro" };
            render();
            return;
        }

        // Aceita tambem o kgf1.json antigo (lista de partidas).
        if (Array.isArray(lido)) {
            const partidas = lido.filter((p) => p && p.pessoa && p.ia && p.bot);
            if (partidas.length === 0) {
                estado.aviso = { texto: "Não encontrei dados válidos no ficheiro.", tipo: "erro" };
                render();
                return;
            }
            lido = { jogo: partidas };
        }

        if (!lido || typeof lido !== "object") {
            estado.aviso = { texto: "O ficheiro não tem o formato esperado.", tipo: "erro" };
            render();
            return;
        }

        if (!window.confirm("Substituir todos os dados atuais pelos do ficheiro?")) {
            return;
        }

        const base = dadosVazios();
        let importados = 0;

        for (const chave of Object.keys(base)) {
            if (Array.isArray(lido[chave])) {
                base[chave] = lido[chave].filter((r) => r && typeof r === "object");
                importados += base[chave].length;
            }
        }

        dados = base;
        guardarDados();
        estado.aviso = { texto: importados + " registo(s) importado(s).", tipo: "ok" };
        estado.vista = "inicio";
        render();
    };

    leitor.onerror = () => {
        estado.aviso = { texto: "Não foi possível ler o ficheiro.", tipo: "erro" };
        render();
    };

    leitor.readAsText(ficheiro);
    evento.target.value = "";
}

// ---------------------------------------------------------------------------
// Fundo matrix
// ---------------------------------------------------------------------------

const canvasMatriz = document.getElementById("fundo-matriz");
const ctxMatriz = canvasMatriz && canvasMatriz.getContext ? canvasMatriz.getContext("2d") : null;
const botaoMatriz = document.getElementById("botao-matriz");
const GLIFOS = "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホ0123456789";

let colunasMatriz = [];
let animacaoMatriz = null;
let ultimoPasso = 0;
let matrizAtiva = false;
let medidas = { largura: 0, altura: 0, passo: 16 };

function matrizPreferida() {
    const guardado = localStorage.getItem(CHAVE_MATRIZ);
    if (guardado === "0") return false;
    if (guardado === "1") return true;

    const reduzir = window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    return !(reduzir && reduzir.matches);
}

function novoGlifo() {
    return GLIFOS[Math.floor(Math.random() * GLIFOS.length)];
}

function criarColuna(x, abaixo) {
    return {
        x,
        y: abaixo ? -Math.random() * 240 : Math.random() * (medidas.altura || 800),
        comprimento: 50 + Math.random() * 140,
        velocidade: 1.1 + Math.random() * 3.0,
        glifo: novoGlifo(),
    };
}

function prepararMatriz() {
    const largura = window.innerWidth;
    const altura = window.innerHeight;
    const densidade = Math.min(window.devicePixelRatio || 1, 2);

    canvasMatriz.width = Math.floor(largura * densidade);
    canvasMatriz.height = Math.floor(altura * densidade);
    canvasMatriz.style.width = largura + "px";
    canvasMatriz.style.height = altura + "px";

    ctxMatriz.setTransform(densidade, 0, 0, densidade, 0, 0);

    const passo = largura < 480 ? 15 : 18;
    const total = Math.ceil(largura / passo);

    medidas = { largura, altura, passo };
    colunasMatriz = Array.from(
        { length: total },
        (_, indice) => criarColuna(indice * passo + passo / 2, false)
    );

    ctxMatriz.fillStyle = "#050506";
    ctxMatriz.fillRect(0, 0, largura, altura);
}

function desenharMatriz(agoraMs) {
    if (!matrizAtiva) {
        return;
    }

    animacaoMatriz = window.requestAnimationFrame(desenharMatriz);

    if (agoraMs - ultimoPasso < 50) {
        return;
    }

    ultimoPasso = agoraMs;

    const { largura, altura, passo } = medidas;

    ctxMatriz.fillStyle = "rgba(5, 5, 6, 0.16)";
    ctxMatriz.fillRect(0, 0, largura, altura);

    ctxMatriz.lineCap = "round";
    ctxMatriz.textAlign = "center";
    ctxMatriz.textBaseline = "middle";
    ctxMatriz.font = passo + "px monospace";

    for (const coluna of colunasMatriz) {
        const inicio = coluna.y - coluna.comprimento;

        const gradiente = ctxMatriz.createLinearGradient(0, inicio, 0, coluna.y);
        gradiente.addColorStop(0, "rgba(255, 43, 43, 0)");
        gradiente.addColorStop(0.7, "rgba(255, 43, 43, 0.30)");
        gradiente.addColorStop(1, "rgba(255, 43, 43, 0.85)");

        ctxMatriz.strokeStyle = gradiente;
        ctxMatriz.lineWidth = Math.max(1.5, passo * 0.20);
        ctxMatriz.beginPath();
        ctxMatriz.moveTo(coluna.x, inicio);
        ctxMatriz.lineTo(coluna.x, coluna.y);
        ctxMatriz.stroke();

        ctxMatriz.fillStyle = "#ffd9d9";
        ctxMatriz.fillText(coluna.glifo, coluna.x, coluna.y);

        coluna.y += coluna.velocidade;

        if (inicio > altura + 40) {
            const nova = criarColuna(coluna.x, true);
            coluna.y = nova.y;
            coluna.comprimento = nova.comprimento;
            coluna.velocidade = nova.velocidade;
            coluna.glifo = novoGlifo();
        }
    }
}

function ligarMatriz() {
    if (!ctxMatriz) return;

    prepararMatriz();
    matrizAtiva = true;
    ultimoPasso = 0;
    animacaoMatriz = window.requestAnimationFrame(desenharMatriz);

    botaoMatriz.setAttribute("aria-pressed", "true");
    botaoMatriz.textContent = "MATRIX";
}

function desligarMatriz() {
    matrizAtiva = false;

    if (animacaoMatriz) {
        window.cancelAnimationFrame(animacaoMatriz);
        animacaoMatriz = null;
    }

    if (ctxMatriz) {
        ctxMatriz.clearRect(0, 0, medidas.largura, medidas.altura);
    }

    botaoMatriz.setAttribute("aria-pressed", "false");
    botaoMatriz.textContent = "MATRIX OFF";
}

if (ctxMatriz && botaoMatriz) {
    if (matrizPreferida()) {
        ligarMatriz();
    } else {
        desligarMatriz();
    }

    botaoMatriz.addEventListener("click", () => {
        if (matrizAtiva) {
            desligarMatriz();
            localStorage.setItem(CHAVE_MATRIZ, "0");
        } else {
            ligarMatriz();
            localStorage.setItem(CHAVE_MATRIZ, "1");
        }
    });

    let redimensionar = null;
    window.addEventListener("resize", () => {
        clearTimeout(redimensionar);
        redimensionar = setTimeout(() => {
            if (matrizAtiva) prepararMatriz();
        }, 250);
    });

    document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
            if (animacaoMatriz) {
                window.cancelAnimationFrame(animacaoMatriz);
                animacaoMatriz = null;
            }
        } else if (matrizAtiva) {
            ultimoPasso = 0;
            animacaoMatriz = window.requestAnimationFrame(desenharMatriz);
        }
    });
}

// ---------------------------------------------------------------------------
// Efeito de toque
// ---------------------------------------------------------------------------

function criarOnda(evento) {
    const alvo = evento.target;
    if (!alvo || typeof alvo.closest !== "function") return;

    const alvoBotao = alvo.closest("button");
    if (!alvoBotao || alvoBotao.disabled) return;

    const caixa = alvoBotao.getBoundingClientRect
        ? alvoBotao.getBoundingClientRect()
        : { left: 0, top: 0, width: 0, height: 0 };

    const x = (typeof evento.clientX === "number" ? evento.clientX : caixa.left + caixa.width / 2) - caixa.left;
    const y = (typeof evento.clientY === "number" ? evento.clientY : caixa.top + caixa.height / 2) - caixa.top;
    const tamanho = Math.max(caixa.width, caixa.height, 44) * 2.4;

    const onda = document.createElement("span");
    onda.className = "ripple";
    onda.style.width = tamanho + "px";
    onda.style.height = tamanho + "px";
    onda.style.left = x + "px";
    onda.style.top = y + "px";

    alvoBotao.appendChild(onda);

    const remover = () => {
        if (onda.parentNode) onda.parentNode.removeChild(onda);
    };

    onda.addEventListener("animationend", remover, { once: true });
    setTimeout(remover, 700);
}

document.addEventListener("click", criarOnda);

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------

botaoVoltar.addEventListener("click", voltar);
render();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
}
