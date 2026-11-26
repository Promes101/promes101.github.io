// "Pessoas" - versao estatica para GitHub Pages.
// Os dados ficam no localStorage deste navegador.

const CHAVE = "pessoas-dd-v1";

const lista = document.getElementById("lista");
const contador = document.getElementById("contador");
const aviso = document.getElementById("aviso");
const form = document.getElementById("form");
const campoId = document.getElementById("campo-id");
const campoNome = document.getElementById("campo-nome");
const campoIdade = document.getElementById("campo-idade");
const tituloForm = document.getElementById("titulo-form");
const botaoGuardar = document.getElementById("botao-guardar");
const botaoCancelar = document.getElementById("botao-cancelar");
const campoBusca = document.getElementById("campo-busca");

let pessoas = carregar();
let termo = "";
let temporizadorAviso = null;

function carregar() {
    let dados;
    try {
        dados = JSON.parse(localStorage.getItem(CHAVE) || "[]");
    } catch (erro) {
        return [];
    }

    if (!Array.isArray(dados)) {
        return [];
    }

    return dados
        .filter((p) => p && typeof p.nome === "string")
        .map((p) => ({
            id: Number(p.id) || 0,
            nome: p.nome,
            idade: Number(p.idade) || 0,
        }));
}

function guardar() {
    localStorage.setItem(CHAVE, JSON.stringify(pessoas));
}

function proximoId() {
    return pessoas.reduce((maior, p) => Math.max(maior, p.id), 0) + 1;
}

function mostrarAviso(texto, tipo) {
    aviso.textContent = texto;
    aviso.className = "aviso visivel " + tipo;

    clearTimeout(temporizadorAviso);
    temporizadorAviso = setTimeout(() => {
        aviso.className = "aviso";
    }, 4000);
}

function filtrar() {
    if (termo === "") {
        return pessoas.slice();
    }

    const alvo = termo.toLowerCase();
    return pessoas.filter((p) => p.nome.toLowerCase().includes(alvo));
}

function criarBotao(texto, classe, aoClicar) {
    const botao = document.createElement("button");
    botao.type = "button";
    botao.className = classe;
    botao.textContent = texto;
    botao.addEventListener("click", aoClicar);
    return botao;
}

function render() {
    const visiveis = filtrar();

    lista.textContent = "";

    if (visiveis.length === 0) {
        const vazio = document.createElement("li");
        vazio.className = "vazio";
        vazio.textContent = pessoas.length === 0
            ? "Ainda nao ha pessoas. Adicione a primeira acima."
            : "Nenhuma pessoa encontrada.";
        lista.appendChild(vazio);
    }

    for (const pessoa of visiveis) {
        const item = document.createElement("li");

        const dados = document.createElement("div");
        dados.className = "dados";

        const nome = document.createElement("div");
        nome.className = "nome";
        nome.textContent = pessoa.nome;

        const detalhe = document.createElement("div");
        detalhe.className = "detalhe";
        detalhe.textContent = pessoa.idade + " ano(s) - ID " + pessoa.id;

        dados.append(nome, detalhe);

        const acoes = document.createElement("div");
        acoes.className = "acoes";
        acoes.appendChild(criarBotao("Editar", "mini", () => editar(pessoa.id)));
        acoes.appendChild(criarBotao("Apagar", "mini perigo", () => apagar(pessoa.id)));

        item.append(dados, acoes);
        lista.appendChild(item);
    }

    contador.textContent = visiveis.length + " de " + pessoas.length;
}

function editar(id) {
    const pessoa = pessoas.find((p) => p.id === id);
    if (!pessoa) {
        return;
    }

    campoId.value = String(pessoa.id);
    campoNome.value = pessoa.nome;
    campoIdade.value = String(pessoa.idade);

    tituloForm.textContent = "Editar pessoa";
    botaoGuardar.textContent = "Guardar alteracoes";
    botaoCancelar.classList.remove("oculto");

    campoNome.focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function sairDoModoEdicao() {
    campoId.value = "";
    campoNome.value = "";
    campoIdade.value = "";
    tituloForm.textContent = "Adicionar pessoa";
    botaoGuardar.textContent = "Adicionar";
    botaoCancelar.classList.add("oculto");
}

function apagar(id) {
    const pessoa = pessoas.find((p) => p.id === id);
    if (!pessoa) {
        return;
    }

    if (!confirm("Apagar " + pessoa.nome + " (ID " + pessoa.id + ")?")) {
        return;
    }

    pessoas = pessoas.filter((p) => p.id !== id);
    guardar();
    render();
    mostrarAviso("Pessoa apagada.", "ok");
}

form.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const nome = campoNome.value.trim();
    const idadeTexto = campoIdade.value.trim();

    if (nome === "") {
        mostrarAviso("O nome nao pode ficar vazio.", "erro");
        campoNome.focus();
        return;
    }

    const idade = Number(idadeTexto);

    if (!Number.isInteger(idade) || idade < 0 || idade > 130) {
        mostrarAviso("A idade tem de ser um numero inteiro entre 0 e 130.", "erro");
        campoIdade.focus();
        return;
    }

    const idEdicao = Number(campoId.value);

    if (idEdicao > 0) {
        const pessoa = pessoas.find((p) => p.id === idEdicao);

        if (!pessoa) {
            mostrarAviso("Esse ID nao existe.", "erro");
            sairDoModoEdicao();
            return;
        }

        pessoa.nome = nome;
        pessoa.idade = idade;
        mostrarAviso("Pessoa atualizada.", "ok");
    } else {
        pessoas.push({ id: proximoId(), nome, idade });
        mostrarAviso("Pessoa adicionada.", "ok");
    }

    guardar();
    sairDoModoEdicao();
    render();
});

botaoCancelar.addEventListener("click", sairDoModoEdicao);

campoBusca.addEventListener("input", () => {
    termo = campoBusca.value.trim();
    render();
});

document.getElementById("botao-limpar").addEventListener("click", () => {
    campoBusca.value = "";
    termo = "";
    render();
    campoBusca.focus();
});

// ---------------------------------------------------------------------------
// Exportar / importar
// ---------------------------------------------------------------------------

document.getElementById("botao-exportar").addEventListener("click", () => {
    const conteudo = JSON.stringify(pessoas, null, 2);
    const ficheiro = new Blob([conteudo], { type: "application/json" });
    const endereco = URL.createObjectURL(ficheiro);

    const link = document.createElement("a");
    const hoje = new Date().toISOString().slice(0, 10);
    link.href = endereco;
    link.download = "pessoas-" + hoje + ".json";
    document.body.appendChild(link);
    link.click();
    link.remove();

    setTimeout(() => URL.revokeObjectURL(endereco), 1000);
    mostrarAviso("Ficheiro exportado.", "ok");
});

const campoFicheiro = document.getElementById("campo-ficheiro");

document.getElementById("botao-importar").addEventListener("click", () => {
    campoFicheiro.click();
});

campoFicheiro.addEventListener("change", () => {
    const ficheiro = campoFicheiro.files && campoFicheiro.files[0];

    if (!ficheiro) {
        return;
    }

    const leitor = new FileReader();

    leitor.onload = () => {
        let dados;

        try {
            dados = JSON.parse(String(leitor.result));
        } catch (erro) {
            mostrarAviso("O ficheiro nao e um JSON valido.", "erro");
            return;
        }

        if (!Array.isArray(dados)) {
            mostrarAviso("O ficheiro tem de conter uma lista de pessoas.", "erro");
            return;
        }

        const novas = [];
        let proximo = pessoas.reduce((maior, p) => Math.max(maior, p.id), 0) + 1;

        for (const entrada of dados) {
            const nome = entrada && typeof entrada.nome === "string"
                ? entrada.nome.trim()
                : "";

            if (nome === "") {
                continue;
            }

            const idade = Number(entrada.idade);
            novas.push({
                id: proximo++,
                nome,
                idade: Number.isFinite(idade) && idade >= 0 ? Math.floor(idade) : 0,
            });
        }

        if (novas.length === 0) {
            mostrarAviso("Nao encontrei nenhuma pessoa valida no ficheiro.", "erro");
            return;
        }

        if (!confirm("Juntar " + novas.length + " pessoa(s) a lista atual?")) {
            return;
        }

        pessoas = pessoas.concat(novas);
        guardar();
        render();
        mostrarAviso(novas.length + " pessoa(s) importada(s).", "ok");
    };

    leitor.onerror = () => mostrarAviso("Nao foi possivel ler o ficheiro.", "erro");
    leitor.readAsText(ficheiro);
    campoFicheiro.value = "";
});

// ---------------------------------------------------------------------------
// Arranque
// ---------------------------------------------------------------------------

render();

if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("./sw.js").catch(() => {
        // Sem service worker a pagina continua a funcionar, so nao fica em cache.
    });
}

// ---------------------------------------------------------------------------
// Fundo estilo "cmatrix"
// ---------------------------------------------------------------------------

const canvasMatriz = document.getElementById("fundo-matriz");
const ctxMatriz = canvasMatriz && canvasMatriz.getContext
    ? canvasMatriz.getContext("2d")
    : null;
const botaoMatriz = document.getElementById("botao-matriz");
const CHAVE_MATRIZ = "pessoas-matriz-v1";

const CARACTERES_MATRIZ =
    "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン" +
    "0123456789ABCDEFXYZ<>[]{}=+*#$%&@";

let colunasMatriz = [];
let animacaoMatriz = null;
let ultimoPasso = 0;
let matrizAtiva = false;
let medidas = { largura: 0, altura: 0, passo: 16 };

function matrizPreferida() {
    const guardado = localStorage.getItem(CHAVE_MATRIZ);

    if (guardado === "0") {
        return false;
    }

    if (guardado === "1") {
        return true;
    }

    const reduzir = window.matchMedia
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    return !(reduzir && reduzir.matches);
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

    const passo = largura < 480 ? 14 : 17;
    const total = Math.ceil(largura / passo);

    colunasMatriz = Array.from({ length: total }, () => Math.random() * -60);
    medidas = { largura, altura, passo };

    ctxMatriz.fillStyle = "#050a06";
    ctxMatriz.fillRect(0, 0, largura, altura);
}

function desenharMatriz(agora) {
    if (!matrizAtiva) {
        return;
    }

    animacaoMatriz = window.requestAnimationFrame(desenharMatriz);

    // Limita a ~20 frames por segundo: poupa bateria.
    if (agora - ultimoPasso < 50) {
        return;
    }

    ultimoPasso = agora;

    const { largura, altura, passo } = medidas;

    // Rasto: escurece o quadro anterior em vez de apagar.
    ctxMatriz.fillStyle = "rgba(5, 10, 6, 0.10)";
    ctxMatriz.fillRect(0, 0, largura, altura);

    ctxMatriz.font = passo + "px monospace";
    ctxMatriz.textBaseline = "top";

    for (let i = 0; i < colunasMatriz.length; i++) {
        const x = i * passo;
        const y = colunasMatriz[i] * passo;

        if (y > -passo) {
            const brilho = Math.random() < 0.07;
            const caractere =
                CARACTERES_MATRIZ[Math.floor(Math.random() * CARACTERES_MATRIZ.length)];

            ctxMatriz.fillStyle = brilho ? "#eafff1" : "#00e676";
            ctxMatriz.globalAlpha = brilho ? 0.95 : 0.45;
            ctxMatriz.fillText(caractere, x, y);
            ctxMatriz.globalAlpha = 1;
        }

        colunasMatriz[i]++;

        if (y > altura && Math.random() > 0.975) {
            colunasMatriz[i] = 0;
        }
    }
}

function ligarMatriz() {
    if (!ctxMatriz) {
        return;
    }

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
            if (matrizAtiva) {
                prepararMatriz();
            }
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
