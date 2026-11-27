// Service worker do PUKKA.
// Guarda o esqueleto da app para abrir mesmo sem internet.

const CACHE = "pukka-v1";

const ESSENCIAIS = [
    "./",
    "./index.html",
    "./style.css",
    "./app.js",
    "./manifest.webmanifest",
    "./icon-192.png",
    "./icon-512.png",
];

self.addEventListener("install", (evento) => {
    evento.waitUntil(
        caches
            .open(CACHE)
            .then((cache) => cache.addAll(ESSENCIAIS))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener("activate", (evento) => {
    evento.waitUntil(
        caches
            .keys()
            .then((chaves) =>
                Promise.all(
                    chaves
                        .filter((chave) => chave !== CACHE)
                        .map((chave) => caches.delete(chave))
                )
            )
            .then(() => self.clients.claim())
    );
});

self.addEventListener("fetch", (evento) => {
    const pedido = evento.request;

    if (pedido.method !== "GET") {
        return;
    }

    const caminho = new URL(pedido.url).pathname;

    // So trata pedidos dentro de /pukka/.
    if (!caminho.includes("/pukka/")) {
        return;
    }

    if (pedido.mode === "navigate") {
        evento.respondWith(
            fetch(pedido)
                .then((resposta) => {
                    const copia = resposta.clone();
                    caches.open(CACHE).then((cache) => cache.put(pedido, copia));
                    return resposta;
                })
                .catch(() => caches.match("./index.html"))
        );
        return;
    }

    if (
        caminho.endsWith("/app.js") ||
        caminho.endsWith("/style.css") ||
        caminho.includes("/icon-") ||
        caminho.endsWith("/manifest.webmanifest")
    ) {
        evento.respondWith(
            caches
                .match(pedido)
                .then((resposta) => resposta || fetch(pedido))
        );
    }
});
