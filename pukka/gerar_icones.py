#!/usr/bin/env python3
"""Gera os icones do PUKKA: prompt de terminal ">_" em vermelho sobre preto."""

import random
from pathlib import Path

from PIL import Image, ImageDraw

PASTA = Path(__file__).resolve().parent

FUNDO = (5, 5, 6, 255)
VERMELHO = (255, 43, 43, 255)
VERMELHO_FRACO = (255, 43, 43, 55)


def desenhar(tamanho: int) -> Image.Image:
    escala = tamanho / 512
    imagem = Image.new("RGBA", (tamanho, tamanho), FUNDO)
    desenho = ImageDraw.Draw(imagem)

    # Chuva ao fundo
    random.seed(11)
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

    # ">" do prompt
    espessura = max(3, int(30 * escala))
    esquerda = int(140 * escala)
    topo = int(170 * escala)
    meio = int(256 * escala)
    base = int(342 * escala)
    desenho.line(
        [(esquerda, topo), (int(250 * escala), meio), (esquerda, base)],
        fill=VERMELHO,
        width=espessura,
        joint="curve",
    )

    # "_" do prompt
    sub_esq = int(285 * escala)
    sub_dir = int(390 * escala)
    sub_topo = int(318 * escala)
    desenho.rounded_rectangle(
        [sub_esq, sub_topo, sub_dir, sub_topo + espessura],
        radius=espessura // 2,
        fill=VERMELHO,
    )

    return imagem


if __name__ == "__main__":
    for tamanho in (192, 512):
        destino = PASTA / f"icon-{tamanho}.png"
        desenhar(tamanho).save(destino, "PNG")
        print(f"Criado {destino}")
