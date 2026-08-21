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

Apenas `index.html` está ativo. As páginas `about-us.html`, `contacts.html` e `typography.html` foram **removidas do repositório** (conteúdo morto do template, sem links; recuperáveis via git history). Todo o contato já está no footer da home.

### Estrutura de `index.html`

| Seção | Descrição |
|---|---|
| `<head>` | Carrega Bootstrap 3, fontes Google (Work Sans, Poppins), `style.min.css`. Inclui SSL Seal da AlphaSSL (bloco marcado como "DO NOT EDIT" — não editar). |
| Preloader | Exibe o logo (`images/logo.webp`) durante carregamento. |
| `rd-navbar` | Navbar responsiva com logo e badge de contato (número de WhatsApp). Ícone (WhatsApp) é SVG inline. |
| Slider hero | Swiper.js com 3 slides, todos usando `images/bannernovo.webp` como fundo, com efeito fade e autoplay a cada 5000ms. Há um `<img>` placeholder com `fetchpriority="high"` antes do `swiper-wrapper` para antecipar o LCP. **1 único `<h1>`** (slide 1); slides 2–3 usam `<h2 class="heading-1">` com o mesmo visual. |
| **Seção de serviços** ("Conheça e cote os nossos serviços") | 11 cards (8 seguros + Plano de Saúde + Consórcios + Crédito) — cada um com imagem, título e descrição curta. Os 10 de cotação abrem modal Bootstrap com iframe (lazy load); Plano de Saúde abre modal com CTA para WhatsApp. |
| **Seção "Sobre a Marpe"** | `#sobre` (o nav "Sobre Nós" aponta para ela): história (19 anos desde 2007), 3 cards de valores (Clareza, Cuidado, Confiança — `.sobre-value`, CSS inline) e CTA "Fale com a Marpe" (WhatsApp). |
| Banner "Melhores Ofertas" | Seção com fundo `images/banner9.webp`, botão "Volte ao topo". |
| Footer | 2 colunas: "Sobre nós" (col-lg-7) + "Contato" com WhatsApp, endereço e redes sociais (col-lg-5). Rodapé inferior com `flex-wrap` e `gap:12px`. |
| Botão WhatsApp fixo | `position: fixed`, canto **inferior direito** (20px da borda), cor `#25D366`. Some enquanto um modal de cotação estiver aberto (`.modal-open .whatsapp-button`). |
| `#modals-container` | Todos os modais são gerados dinamicamente por JS inline no fim do body, dentro de `DOMContentLoaded`. |

### Sistema de Cotação (modal + iframe)

Os 10 cards de cotação disparam modais Bootstrap (800px de largura, 90vh de altura, classe `.modal-square` — corpo e iframe preenchem via CSS, sem heights inline) que carregam iframes apontando para o sistema externo de cotação:

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
| Consórcios | `#consorcioModal` | `consorcio` |
| Crédito | `#creditoModal` | `credito` |
| Plano de Saúde | `#saudeModal` | — (modal com CTA para WhatsApp, sem iframe) |

Os modais são gerados por um array `modals` em JS inline no fim do `<body>`, dentro de `document.addEventListener('DOMContentLoaded', ...)` (necessário porque o script usa jQuery com `defer`). Para adicionar um novo serviço, basta adicionar um objeto ao array. Um modal **sem iframe** usa `whatsapp: true` + `waLink` (ex.: Plano de Saúde) — o loop renderiza um CTA estilizado (`.modal-whatsapp-cta` + `.btn-wa-cta`, CSS inline no `index.html`) em vez do iframe e não registra eventos de lazy load.

**Lazy load dos iframes:** o `src` do iframe **não** é definido na criação do DOM. Ele é injetado via `$(el).on('shown.bs.modal')` e limpo via `$(el).on('hidden.bs.modal')`. Isso evita que 8 instâncias de reCAPTCHA + Angular inicializem simultaneamente no carregamento da página. **Não adicionar `iframe.src` fora desses eventos** (aplica-se apenas aos modais com iframe; o modal de Plano de Saúde não usa lazy load).

### JavaScript

- **`js/device.min.js`** — adiciona classe `desktop` ao `<html>` (necessário para WOW.js).
- **`js/page-transition.min.js`** — transição de página + preloader.
- **`js/rd-navbar.min.js`** — plugin proprietário da navbar.
- **`js/swiper-legacy.min.js`** — Swiper 5 legado (API incompatível com versões novas).
- **`js/stubs.min.js`** — stubs para plugins não carregados (evita TypeError).
- **`js/ui-to-top.min.js`** — UItoTop.
- **`js/script.js`** (~40KB, fonte) → **`js/script.min.js`** (21KB, minificado com terser; **é o carregado pelo site**). Lógica customizada do template: inicializa plugins via seletor jQuery, padrão `plugins = { ... }`, detecta mobile/IE/desktop via `userAgent`, `lazyInit()`. **Não editar para features novas** — use JS inline ou arquivo separado; edite o fonte e regenere o min com `npx terser js/script.js -c -m -o js/script.min.js`.

### CSS

- **`css/bootstrap.css`** (138KB) — **Bootstrap 4.1.3** (não é BS3 como parecia), já pré-purgado em sessão anterior (não tem `.btn-secondary` nem variantes coloridas de `.btn`). Mantido como backup.
- **`css/bootstrap.min.css`** (11,5KB, −92%) — PurgeCSS do `bootstrap.css` com safelist para classes dinâmicas (modal, collapse, sr-only, grid, botões). **É o carregado pelo site.** Para regenerar: PurgeCSS com `content` = `index.html` + `js/*.js` (o `.btn-secondary` é estilizado no CSS inline do `index.html`).
- **`css/style.min.css`** (~146KB) — CSS do template Novi gerado via PurgeCSS a partir de `style.css` (original 332KB). **É o arquivo carregado pelo site.** Para regenerar: `npx --yes purgecss --config purgecss.config.js` (config na raiz, com safelist das classes dinâmicas: rd-navbar, swiper, wow, modais). Última rodada: 2026-08 (172KB → 146KB, −15%).
- **`css/style.css`** (332KB) — original intacto, mantido como backup para regenerar o `.min.css`.
- **`css/fonts.css`** — **fontes self-hosted** (Google Fonts, subset latin): Work Sans (fonte **variável**, 1 arquivo `fonts/work-sans.woff2` cobre os pesos 300–800) + Poppins 300/400/700 em `fonts/poppins-*.woff2`. Todos os `@font-face` com `font-display: swap`. Os webfonts antigos de ícones (FA/MDI/Linearicons, ~4MB) foram movidos para `b/fonts-backup/` (gitignored).

### Ícones

Todos os ícones são **SVG inline** diretamente no HTML. Não há dependência de webfonts de ícones em produção. Ícones em uso:

| SVG | Localização |
|---|---|
| WhatsApp | Navbar (badge de contato) e modal de Plano de Saúde |
| Facebook | Footer |
| Instagram | Footer |

### Imagens

Imagens ativas usadas pelo site (todas em WebP):

| Arquivo | Uso |
|---|---|
| `images/logo.webp` | Logo (preloader, navbar e footer) |
| `images/bannernovo.webp` | Background dos 3 slides do hero + placeholder LCP |
| `images/banner9.webp` | Background da seção "Melhores Ofertas" |
| `images/logo-favicon.png` | Ícone da aba (512×512) |
| `images/apple-touch-icon.png` | Ícone iOS (180×180, otimizado p/ ~13 KB) |
| `images/bannernovo.jpeg` | Só para `og:image` (1600×609) |
| `images/carro.webp` | Card Auto (convertido de .jpg em 2026-08) |
| `images/moto.webp` | Card Moto |
| `images/caminhao.webp` | Card Caminhão (convertido de .jpg em 2026-08) |
| `images/residencial.webp` | Card Residencial |
| `images/condominio.webp` | Card Condomínio |
| `images/empresarial.webp` | Card Empresarial |
| `images/vida.webp` | Card Vida |
| `images/saude.webp` | Card Plano de Saúde (foto Unsplash — profissional de saúde, 800×533px) |
| `images/diversos.webp` | Card Diversos (foto Unsplash — pessoa assinando documento, 800×600px) |
| `images/consorcio.webp` | Card Consórcios (foto Unsplash — mão entregando chaves, 800×600px) |
| `images/credito.webp` | Card Crédito (foto Unsplash — cofrinho com moedas, 800×600px) |
| `images/icon_whatsapp.webp` | Botão WhatsApp fixo |

Os originais `.jpg`/`.png` de backup (`condominio.jpg`, `empresarial.jpg`, `residencial.jpg`, `vida.jpg`, `diversos.png`, `icon_whatsapp.png`, `15326-1676668491144.png`) estão **fora do git** (`.gitignore`) mas mantidos em disco. `carro.jpg` e `caminhao.jpg` foram convertidos para WebP e removidos do git (recuperáveis via history).

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
| PurgeCSS | `style.css` (332KB) → `style.min.css` (172KB, −48%) e `bootstrap.css` (138KB, BS4.1.3) → `bootstrap.min.css` (11,5KB, −92%). Safelist preserva classes dinâmicas (modal, collapse, sr-only, grid, botões). Rodada 2026-08: 172KB → 146KB (−15%) via `purgecss.config.js`. |
| Imagens WebP | Cards e logo convertidos para WebP com ImageMagick (redução média −81%). Originais mantidos como backup no disco. |
| Lazy load iframes | 10 iframes de cotação carregados apenas no `shown.bs.modal`, destruídos no `hidden.bs.modal`. Elimina instâncias simultâneas de reCAPTCHA + Angular no carregamento. |
| SVG inline | Ícones de FontAwesome, MDI e Linearicons substituídos por SVG inline (~150KB de webfonts eliminados). |
| LCP placeholder | `<img fetchpriority="high">` do banner hero inserido antes do `swiper-wrapper` para antecipar renderização sem aguardar o JS do Swiper. |
| Fontes self-hosted | Work Sans (variável) + Poppins baixados do Google Fonts (subset latin) para `fonts/`; `css/fonts.css` com `font-display: swap`; preload dos 2 arquivos críticos (`poppins-700`, `work-sans`). Elimina request externo render-blocking. |
| Dimensões SSL Seal | `width="115" height="55"` na `<img>` do AlphaSSL para eliminar CLS (atributo duplicado removido). |
| SRI | `integrity="sha384-…"` + `crossorigin` nos 4 scripts de CDN (jquery, popper, bootstrap, wow) — hashes gerados com `openssl dgst -sha384`. |
| Preloader timeout | Fallback inline: preloader some em até 2,5s mesmo se `window.load` demorar. |
| Acessibilidade | Skip-link "Pular para o conteúdo" → `#main`; hrefs reais (`#modalId`) nos cards de serviço; `prefers-reduced-motion` desativa animações; aria-labels nos toggles da navbar; botões `Fechar` estilizados (`.btn-secondary` no CSS inline). |
| SEO | 1 `<h1>` por página com keyword ("Seguros, Consórcios e Créditos"; slides 2–3 viraram `h2.heading-1`); JSON-LD `InsuranceAgency` rico (`geo`, `areaServed` nacional — São Sepé + Brasil, `foundingDate` 2007, `openingHoursSpecification`, `priceRange`, `slogan`, `hasOfferCatalog` com os 11 serviços); OG completa (`site_name`, `locale`, dimensões + tipo + alt da imagem); Twitter Cards completos (title/description/image); `theme-color`; `apple-touch-icon`; sitemap com `lastmod`. |
| Conversão | CTA da seção "Melhores Ofertas" agora é "Cote agora pelo WhatsApp" (wa.me com mensagem pré-preenchida); URLs wa.me com percent-encoding completo. |
| Contraste footer | `.footer-advanced-text` → `rgba(255,255,255,0.6)` (~6,5:1, AA) sobre o fundo `#232426`. |
| preconnect CDN | `preconnect` + `dns-prefetch` para `cdnjs.cloudflare.com` (4 scripts CDN com SRI). |
| Plano de Saúde | Card + modal com CTA para WhatsApp (padrão Instagram/Linktree), sem iframe externo. |
| Seção "Sobre a Marpe" | Nova seção na home: 19 anos (desde 2007), valores (clareza, cuidado, confiança) e atendimento nacional; nav "Sobre Nós" aponta para `#sobre`. |
| Selo Instagram | "Siga @marpeseguros no Instagram" no footer (coluna Contato). |
| Copy emocional | Cards Vida ("Planejar também é amar…") e Consórcios ("Planejamento e previsibilidade…") com o tom do Instagram. |
| CSS morto removido | 2 `@font-face` do ícone-font `lg.*` eliminados de `style.min.css`/`style.css` + arquivos `fonts/lg.*` (git rm). |
| Imagens otimizadas | `carro.jpg`/`caminhao.jpg` → WebP (−17%/−54%); `banner9.webp` 108→62 KB; `moto.webp` 39,7→26 KB; `apple-touch-icon.png` 40→12,9 KB. |

---

## Informações de Contato (usar ao editar conteúdo)

- **WhatsApp/Telefone:** 55991504477
- **Endereço:** Rua Visconde do Rio Branco, 1379 - Sala 01, Centro - São Sepé/RS
- **Coordenadas do mapa:** `-30.1641, -53.5654`
- **URL WhatsApp:** `https://wa.me/55991504477?text=Gostaria%20de%20mais%20informações%20a%20MARPE%20esta%20aqui%20para%20te%20atender,%20entre%20em%20contato%20e%20faça%20a%20sua%20cotação`
