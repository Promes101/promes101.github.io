// Service worker do "Pessoas" (GitHub Pages).
// Como os dados vivem no localStorage, basta guardar o esqueleto da app
// para ela abrir mesmo sem internet.

const CACHE = "pessoas-pages-v4";

const ESSENCIAIS = [
    "./",
    "./index.html",
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

    // Abrir a app: tenta a rede (para apanhar actualizacoes) e cai no cache.
    if (pedido.mode === "navigate") {
        const caminhoNav = new URL(pedido.url).pathname;

        // Esta app vive na raiz; /pukka/ tem o seu proprio service worker.
        if (caminhoNav !== "/" && caminhoNav !== "/index.html") {
            return;
        }

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

    const caminho = new URL(pedido.url).pathname;

    if (caminho.startsWith("/icon-") || caminho === "/manifest.webmanifest") {
        evento.respondWith(
            caches.match(pedido).then((resposta) => resposta || fetch(pedido))
        );
    }
});
