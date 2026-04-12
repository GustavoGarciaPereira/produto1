# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Visão Geral do Projeto

**Marpe Corretora de Seguros** — site estático para uma corretora de seguros em São Sepé, RS, Brasil. Publicado em `marpeseguros.com.br` via GitHub Pages.

- **Razão social:** Marcel Foletto Pereira Ltda — CNPJ 446976830001-53
- **Responsável técnico:** Gustavo Garcia Pereira (`gustavogarciapereira.com.br`)
- **Redes sociais:** Facebook e Instagram em `@marpeseguros`

---

## Desenvolvimento

**Sem sistema de build nem gerenciador de pacotes.** Projeto HTML/CSS/JS puro.

- **Dev local:** VSCode com Live Server na porta **5502** (configurado em `.vscode/settings.json`)
- **Deploy:** qualquer push para `main` dispara o GitHub Actions (`.github/workflows/static.yml`), que publica o repositório inteiro no GitHub Pages automaticamente — sem build step
- **Roteamento HTTPS:** `.htaccess` redireciona todo tráfego HTTP (porta 80) para `https://www.marpeseguros.com.br`

---

## Arquitetura

### Página ativa

Apenas `index.html` está ativo. As páginas `about-us.html`, `contacts.html` e `typography.html` existem mas seus links de navegação estão comentados no HTML (tanto no `<nav>` quanto no `<footer>`). Para reativar, basta descomentar as tags `<li>` correspondentes.

### Estrutura de `index.html`

| Seção | Descrição |
|---|---|
| `<head>` | Carrega Bootstrap 3, fontes Google (Work Sans, Poppins), `style.min.css`. Inclui SSL Seal da AlphaSSL (bloco marcado como "DO NOT EDIT" — não editar). |
| Preloader | Exibe o logo (`images/logo.webp`) durante carregamento. |
| `rd-navbar` | Navbar responsiva com logo, número de WhatsApp e endereço clicável que abre mapa Leaflet inline. Ícones (WhatsApp, pin) são SVG inline. |
| Slider hero | Swiper.js com 3 slides, todos usando `images/bannernovo.webp` como fundo, com efeito fade e autoplay a cada 5000ms. Há um `<img>` placeholder com `fetchpriority="high"` antes do `swiper-wrapper` para antecipar o LCP. |
| Seção de diferenciais | 3 cards: "Funcionários Qualificados", "Consultas Gratuitas", "100% Garantido". Ícones são SVG inline. |
| **Seção de serviços** | 8 cards de seguros — cada um abre um modal Bootstrap com iframe de cotação (lazy load). |
| Banner "Melhores Ofertas" | Seção com fundo `images/banner9.png`, botão "Volte ao topo". |
| Footer | Texto institucional, links sociais (SVG inline), logo e copyright. |
| Botão WhatsApp fixo | `position: fixed`, canto inferior esquerdo (100px da borda), cor `#25D366`. |
| `#modals-container` | Todos os modais são gerados dinamicamente por JS inline no fim do body, dentro de `DOMContentLoaded`. |
| Mapa Leaflet | Carregado sob demanda ao clicar no endereço; coordenadas fixas `[-30.1641, -53.5654]`. |

### Sistema de Cotação (modal + iframe)

Os 8 serviços disparam modais Bootstrap (800×800px, classe `.modal-square`) que carregam iframes apontando para o sistema externo de cotação:

```
https://marpe.corretordigital.site/#/formularios/{tipo}
```

| Card | `data-target` | `{tipo}` na URL |
|---|---|---|
| Auto | `#myModalAuto` | `auto` |
| Moto | `#motoModal` | `moto` |
| Caminhão | `#caminhaoModal` | `caminhao` |
| Residencial | `#residencialModal` | `residencial` |
| Condomínio | `#condominioModal` | `condominio` |
| Empresarial | `#empresarialModal` | `empresarial` |
| Vida | `#vidaModal` | `vida` |
| Diversos | `#diversosModal` | `diversos` |

Os modais são gerados por um array `modals` em JS inline no fim do `<body>`, dentro de `document.addEventListener('DOMContentLoaded', ...)` (necessário porque o script usa jQuery com `defer`). Para adicionar um novo serviço, basta adicionar um objeto ao array.

**Lazy load dos iframes:** o `src` do iframe **não** é definido na criação do DOM. Ele é injetado via `$(el).on('shown.bs.modal')` e limpo via `$(el).on('hidden.bs.modal')`. Isso evita que 8 instâncias de reCAPTCHA + Angular inicializem simultaneamente no carregamento da página. **Não adicionar `iframe.src` fora desses eventos.**

### JavaScript

- **`js/core.min.js`** (471KB, minificado) — bundle com: jQuery, WOW.js (animações de scroll), Swiper.js (slider), Owl Carousel, RD Navbar, RD Mailform e outros plugins do template original.
- **`js/script.js`** (~700 linhas) — lógica customizada. Inicializa todos os plugins via seletor jQuery. Usa o padrão `plugins = { ... }` para cachear seletores. Detecta mobile/IE/desktop via `userAgent`. Lazy-inits componentes com `lazyInit()`. **Não deve ser editado para adicionar features novas** — use JS inline ou um novo arquivo separado.

### CSS

- **`css/bootstrap.css`** — Bootstrap 3 (grid 12 colunas, componentes). Não editar.
- **`css/style.min.css`** (169KB) — CSS do template Novi gerado via PurgeCSS a partir de `style.css` (original 332KB, redução de 49%). **É o arquivo carregado pelo site.** Para regenerar, usar o script Node.js com safelist (ver commits `ed73a87` e `15991b7`).
- **`css/style.css`** (332KB) — original intacto, mantido como backup para regenerar o `.min.css`.
- **`css/fonts.css`** — webfonts de FontAwesome, Material Design Icons e Linearicons. **Não é carregado pelo site** — referência removida do `<head>` porque todos os ícones foram substituídos por SVG inline. Mantido em disco como backup. Contém `font-display: swap` em todos os `@font-face`.

### Ícones

Todos os ícones são **SVG inline** diretamente no HTML. Não há dependência de webfonts de ícones em produção. Ícones em uso:

| SVG | Localização |
|---|---|
| WhatsApp | Navbar mobile (linha ~138) |
| Map pin | Navbar mobile (linha ~148) |
| Pessoa (user) | Card "Funcionários Qualificados" |
| Chat (bubble) | Card "Consultas Gratuitas" |
| Estrela (star) | Card "100% Garantido" |
| Facebook | Footer |
| Instagram | Footer |

### Imagens

Imagens ativas usadas pelo site (todas em WebP):

| Arquivo | Uso |
|---|---|
| `images/logo.webp` | Logo (preloader, navbar e footer) |
| `images/bannernovo.webp` | Background dos 3 slides do hero + placeholder LCP |
| `images/banner9.png` | Background da seção "Melhores Ofertas" |
| `images/favicon.png` | Ícone da aba |
| `images/carro.jpg` | Card Auto |
| `images/moto.webp` | Card Moto |
| `images/caminhao.jpg` | Card Caminhão |
| `images/residencial.webp` | Card Residencial |
| `images/condominio.webp` | Card Condomínio |
| `images/empresarial.webp` | Card Empresarial |
| `images/vida.webp` | Card Vida |
| `images/diversos.webp` | Card Diversos |
| `images/icon_whatsapp.webp` | Botão WhatsApp fixo |

Os originais `.jpg`/`.png` foram mantidos em disco como backup. As demais imagens em `images/` são resíduos do template original e não estão em uso.

### Backend PHP (formulário de contato)

Localizado em `bat/`:
- `rd-mailform.php` — handler de email com PHPMailer
- `rd-mailform.config.json` — configuração SMTP atual com credenciais de demo (`demo@gmail.com`) — **não está funcional**; para ativar, configurar `useSmtp: true` e credenciais reais
- `bat/ReCaptcha/` — integração Google reCAPTCHA

### Extensões Chrome (excluídas do git via `.gitignore`)

**`WhatsappCaps/`** — Manifest V3. Converte texto digitado no WhatsApp Web para maiúsculas via `content.js`.

**`WhatsappImageDescriber/`** — Manifest V3. Descreve imagens do WhatsApp em português usando a API Gemini 1.5 Flash:
- `background.js`: recebe URL da imagem, converte para Base64, chama `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`
- `content.js`: injeta botão "Descrever imagem" no WhatsApp Web
- `options.html/js`: página para o usuário salvar a chave da API Gemini em `chrome.storage.sync`
- Timeout de 30s na chamada à API

---

## Otimizações de Performance Aplicadas

Resumo das otimizações já feitas — não refazer sem necessidade:

| Otimização | Detalhe |
|---|---|
| PurgeCSS | `style.css` (332KB) → `style.min.css` (169KB, −49%). Safelist preserva `.modal.show`, `.swiper*`, `.rd-navbar*`, `.wow*`, `.animated*` e outros seletores dinâmicos. |
| Imagens WebP | Cards e logo convertidos para WebP com ImageMagick (redução média −81%). Originais mantidos como backup. |
| Lazy load iframes | 8 iframes de cotação carregados apenas no `shown.bs.modal`, destruídos no `hidden.bs.modal`. Elimina 8 instâncias simultâneas de reCAPTCHA + Angular no carregamento. |
| SVG inline | Ícones de FontAwesome, MDI e Linearicons substituídos por SVG inline. `fonts.css` removido do `<head>` (~150KB de webfonts eliminados). |
| LCP placeholder | `<img fetchpriority="high">` do banner hero inserido antes do `swiper-wrapper` para antecipar renderização sem aguardar o JS do Swiper. |
| `font-display: swap` | Adicionado nos 4 blocos `@font-face` de `fonts.css` e já presente na URL do Google Fonts (`&display=swap`). |
| Dimensões SSL Seal | `width="115" height="55"` adicionados na `<img>` do AlphaSSL para eliminar CLS. |

---

## Informações de Contato (usar ao editar conteúdo)

- **WhatsApp/Telefone:** 55991504477
- **Endereço:** Rua Visconde do Rio Branco, 1379 - Sala 01, Centro - São Sepé/RS
- **Coordenadas do mapa:** `-30.1641, -53.5654`
- **URL WhatsApp:** `https://wa.me/55991504477?text=Gostaria%20de%20mais%20informações%20a%20MARPE%20esta%20aqui%20para%20te%20atender,%20entre%20em%20contato%20e%20faça%20a%20sua%20cotação`
