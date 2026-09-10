# AGENTS.md — Marpe Corretora de Seguros

Guia para agentes de IA (opencode) neste repositório. O **`CLAUDE.md` é a fonte da verdade** sobre arquitetura, arquivos e histórico de otimizações — leia-o antes de mudanças estruturais. Este arquivo cobre o fluxo de trabalho e as armadilhas específicas deste ambiente.

## Visão rápida

- Site **estático** (HTML/CSS/JS puro), **sem build step**. Publicado no GitHub Pages em `marpeseguros.com.br`.
- Páginas ativas: `index.html` (home) e `politica-de-privacidade.html` (LGPD).
- **Deploy:** qualquer push para `main` dispara `.github/workflows/static.yml` e publica o repositório inteiro.
- **Dev local:** VSCode Live Server na porta **5502** (`.vscode/settings.json`).
- Trabalho em andamento fica em `analises/` (convenção `ANALISE-<assunto>.md` com STATUS no topo).

## Regras de ouro

1. **Nunca commitar sem pedido explícito** do usuário. Ao terminar, mostre `git status`/`git diff` e peça aprovação.
2. **CSS:** edite `css/custom.css` (fonte). Nunca edite `style.min.css`/`bootstrap.min.css` à mão — eles são gerados por PurgeCSS (`purgecss.config.js`).
3. **JS:** para features novas use `js/custom.js` (editável). Não edite `js/script.js`/`script.min.js` (template) exceto se for corrigir o próprio template — nesse caso regenere o min com terser.
4. **Selo AlphaSSL:** blocos marcados "DO NOT EDIT" — não altere o código; se precisar movê-lo, mova o bloco inteiro (ele pertence ao `<body>`, nunca ao `<head>`).
5. **Iframes de cotação:** o `src` só pode ser definido em `shown.bs.modal` e limpo em `hidden.bs.modal` (`js/custom.js`). Nunca defina `iframe.src` fora desses eventos.
6. **Copy e conteúdo em pt-BR** (incluindo `alt`, `aria-label`, títulos). Preserve contatos, links wa.me com percent-encoding e dados legais (CNPJ).
7. Segredos: `bat/rd-mailform.config.json` contém credenciais de demo — não coloque credenciais reais no repositório.

## Comandos úteis

| Tarefa | Comando |
|---|---|
| Regenerar CSS do template | `npx --yes purgecss --config purgecss.config.js` |
| Minificar `js/script.js` | `npx terser js/script.js -c -m -o js/script.min.js` |
| Checar sintaxe do JS custom | `node --check js/custom.js` |
| Converter imagem p/ WebP | `convert entrada.jpg -quality 82 -define webp:method=6 saida.webp` |
| Ver alterações | `git status --short && git diff --stat` |

## Testes no navegador (Playwright MCP)

O `opencode.json` configura o MCP `playwright` (`npx @playwright/mcp@latest --browser chromium`). Neste Ubuntu 20.04 o Chromium rev. 1243 não instala; o workaround aplicado é um symlink para a rev. 1234:

```bash
ln -sfn ~/.cache/ms-playwright/chromium-1234 ~/.cache/ms-playwright/chromium-1243
ln -sfn ~/.cache/ms-playwright/chromium_headless_shell-1234 ~/.cache/ms-playwright/chromium_headless_shell-1243
```

Se o MCP voltar a falhar após atualização, recrie os symlinks. Outras armadilhas:

- **Screenshots caem na raiz do repo** por padrão — ao terminar, mova para `/tmp/opencode/` para não sujar o `git status`.
- Use `window.scrollTo({top: X, behavior: 'instant'})`; o `scroll-behavior: smooth` do site faz o Playwright esperar/animações travarem capturas.
- Animação infinita (preloader/Swiper) pode travar screenshots; elementos `.preloader` podem ser removidos via `evaluate` durante a inspeção.
- Navegue com `?v=algumacoisa` para furar cache do Live Server.
- Feche modais com `Escape` antes de continuar a inspeção.

## Mapa dos arquivos

| Caminho | Papel |
|---|---|
| `index.html` | Home (capa + serviços + sobre + FAQ + ofertas + footer) |
| `politica-de-privacidade.html` | Página LGPD (standalone, sem JS de template) |
| `css/custom.css` | CSS da marca (fonte; paleta, capa, cards, mobile) |
| `js/custom.js` | Modais, lazy-load, preloader, vitrine Swiper 3 |
| `images/destaques/*.webp` | Artes da campanha normalizadas 4:5 (900×1125) |
| `imagens_cliente_contexto/` | Originais do cliente (gitignored) |
| `analises/` | Análises/planos com status |

Para detalhes completos de cada seção, arquivos, otimizações e histórico, consulte **`CLAUDE.md`**.
