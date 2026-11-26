#!/usr/bin/env python3
"""Gera os icones do PWA no estilo matrix (verde sobre preto).

Correr:  python3 gerar_icones.py
"""

import random
from pathlib import Path

from PIL import Image, ImageDraw

PASTA = Path(__file__).resolve().parent

FUNDO = (5, 5, 6, 255)
VERMELHO = (255, 43, 43, 255)
VERMELHO_FRACO = (255, 43, 43, 55)
BRILHO = (255, 217, 217, 255)

CARACTERES = "01<>[]{}=+*#"


def desenhar(tamanho: int) -> Image.Image:
    escala = tamanho / 512
    imagem = Image.new("RGBA", (tamanho, tamanho), FUNDO)
    desenho = ImageDraw.Draw(imagem)

    # Chuva de caracteres ao fundo
    random.seed(7)
    coluna_largura = max(6, int(22 * escala))
    for x in range(0, tamanho, coluna_largura):
        for _ in range(random.randint(3, 7)):
            y = random.randint(0, tamanho - coluna_largura)
            altura = random.randint(6, 26)
            largura_traco = max(2, coluna_largura - 7)
            desenho.rectangle(
                [x + 3, y, x + 3 + largura_traco, y + altura],
                fill=VERMELHO_FRACO,
            )

    # Moldura
    margem = int(18 * escala)
    desenho.rounded_rectangle(
        [margem, margem, tamanho - margem, tamanho - margem],
        radius=int(70 * escala),
        outline=VERMELHO,
        width=max(2, int(12 * escala)),
    )

    # Pessoa: cabeca + ombros
    centro_x = tamanho // 2
    raio = int(62 * escala)
    centro_y = int(190 * escala)
    desenho.ellipse(
        [centro_x - raio, centro_y - raio, centro_x + raio, centro_y + raio],
        fill=VERMELHO,
    )

    largura = int(190 * escala)
    altura = int(120 * escala)
    topo = int(292 * escala)
    desenho.rounded_rectangle(
        [centro_x - largura // 2, topo, centro_x + largura // 2, topo + altura],
        radius=int(58 * escala),
        fill=VERMELHO,
    )

    # Ponto de brilho na cabeca
    brilho = int(16 * escala)
    desenho.ellipse(
        [
            centro_x - raio + int(18 * escala),
            centro_y - raio + int(10 * escala),
            centro_x - raio + int(18 * escala) + brilho,
            centro_y - raio + int(10 * escala) + brilho,
        ],
        fill=BRILHO,
    )

    return imagem


if __name__ == "__main__":
    for tamanho in (192, 512):
        destino = PASTA / f"icon-{tamanho}.png"
        desenhar(tamanho).save(destino, "PNG")
        print(f"Criado {destino}")
