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

### Páginas ativas

`index.html` (home) e `politica-de-privacidade.html` (LGPD, página interna enxuta — header/footer simplificados, sem JS de template). As páginas `about-us.html`, `contacts.html` e `typography.html` foram **removidas do repositório** (conteúdo morto do template, sem links; recuperáveis via git history). Todo o contato já está no footer da home.

### Estrutura de `index.html`

| Seção | Descrição |
|---|---|
| `<head>` | Carrega `css/fonts.css`, `bootstrap.min.css`, `style.min.css`, `custom.css`. Preload da imagem LCP (`images/hero-familia.webp` com `fetchpriority="high"`) e `preconnect` para o cdnjs. **Selo SSL da AlphaSSL fica no footer** (bloco marcado "DO NOT EDIT" — não editar o código; dentro do `<head>` era inválido e o parser jogava o `<img>` para o início do `<body>`). |
| Preloader | Exibe o logo (`images/logo.webp`) durante carregamento; some via `.loaded` (com fallback de 2,5s em `js/custom.js`). |
| `rd-navbar` | Navbar responsiva com logo e badge de contato (WhatsApp). "Portal do Parceiro" é ação secundária (outline) — o CTA principal é o WhatsApp. Ícone (WhatsApp) é SVG inline. |
| **Capa (`#destaques`)** | Primeira seção desde 2026-09: grid em 2 colunas com **1 único `<h1>`** ("Seguros, Consórcios e Créditos"), eyebrow verde, subtítulo, CTAs "Cotar pelo WhatsApp" (primário) e "Ver serviços", e a foto `images/hero-familia.webp` (recorte limpo do banner antigo, sem texto sobreposto). Abaixo, a **vitrine de campanhas**: carrossel Swiper 3 (bundle legacy local, **API de params planos** — não usar API de objetos do Swiper 5+) com 15 artes do cliente em moldura uniforme 4:5 (`images/destaques/*.webp`, originais em `imagens_cliente_contexto/`, gitignored), CTA WhatsApp por slide. **3 slides no desktop / 2 no tablet / 1.05 no mobile** — a build legada não aplica `breakpoints`, então os params são recalculados em `js/custom.js` (`vitrineParams` + listener de resize). Setas só no desktop (bullets ocultos ≥992px); swipe nativo no mobile com hint `.destaques-hint`. Clones do loop recebem `aria-hidden` + `tabindex=-1`. |
| Faixa de confiança | `.faixa-confianca` — 4 diferenciais factuais (+19 anos, atendimento nacional, grandes seguradoras, cotação gratuita). |
| **Seção de serviços** ("Conheça e cote os nossos serviços") | 12 cards (9 seguros + Plano de Saúde + Consórcios + Crédito) — cada um com imagem, título e descrição curta. Os 10 de cotação abrem modal Bootstrap com iframe (lazy load); Plano de Saúde e Agrícola abrem modal com CTA para WhatsApp. Cards em `.thumbnail-light` reestilizados (card branco, faixa de acento verde/azul, hover elevado). |
| **Seção "Sobre a Marpe"** | `#sobre` (o nav "Sobre Nós" aponta para ela): história (19 anos desde 2007), 3 cards de valores (Clareza, Cuidado, Confiança — `.sobre-value`, `h4`) e CTA "Fale com a Marpe" (WhatsApp). |
| **Seção "Cartas Contempladas"** | `#cartas-contempladas` — texto institucional + CTA WhatsApp. |
| **Seção FAQ** | `#faq` — 7 perguntas em accordion Bootstrap collapse com CSS inline (`.faq-*`, `+` vira `×` no aberto) + JSON-LD `FAQPage` espelhado no head. Antes do banner "Melhores Ofertas". |
| Banner "Melhores Ofertas" | Seção com fundo `images/banner9.webp`, botões "Cote agora pelo WhatsApp" e "Ver todos os serviços" (outline branco — contraste AA sobre a foto). |
| Footer | 2 colunas: "Sobre nós" (col-lg-7) + "Contato" com WhatsApp, **atendimento (seg–sex 8h30–18h)**, endereço com link de rota no Google Maps, **Política de Privacidade**, redes sociais e selo SSL. Rodapé inferior com `flex-wrap` e `gap:12px`; logo sobre cartão branco. |
| Botão WhatsApp fixo | `position: fixed`, canto **inferior direito** (20px da borda), cor `#25D366`. Some enquanto um modal de cotação estiver aberto (`.modal-open .whatsapp-button`) e é **oculto no mobile** (substituído pela barra fixa de conversão). |
| Barra fixa de conversão (mobile) | `.cta-mobile` (<768px): "Cote pelo WhatsApp" + "Ver serviços". Some com modal aberto; `#footer` ganha `padding-bottom` para não cobrir conteúdo. |
| `#modals-container` | Todos os modais são gerados dinamicamente por `js/custom.js` no fim do body, dentro de `DOMContentLoaded`. |

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
| Agrícola | `#agricolaModal` | — (modal com CTA para WhatsApp, sem iframe) |
| Plano de Saúde | `#saudeModal` | — (modal com CTA para WhatsApp, sem iframe) |

Os modais são gerados por um array `modals` em `js/custom.js`, dentro de `document.addEventListener('DOMContentLoaded', ...)` (necessário porque o script usa jQuery com `defer`). Para adicionar um novo serviço, basta adicionar um objeto ao array. Um modal **sem iframe** usa `whatsapp: true` + `waLink` + `texto` (ex.: Plano de Saúde, Agrícola) — o loop renderiza um CTA estilizado (`.modal-whatsapp-cta` + `.btn-wa-cta`) em vez do iframe e não registra eventos de lazy load.

**Lazy load dos iframes:** o `src` do iframe **não** é definido na criação do DOM. Ele é injetado via `$(el).on('shown.bs.modal')` e limpo via `$(el).on('hidden.bs.modal')`. Isso evita que 8 instâncias de reCAPTCHA + Angular inicializem simultaneamente no carregamento da página. **Não adicionar `iframe.src` fora desses eventos** (aplica-se apenas aos modais com iframe; o modal de Plano de Saúde não usa lazy load).

### JavaScript

- **`js/device.min.js`** — adiciona classe `desktop` ao `<html>` (necessário para WOW.js).
- **`js/page-transition.min.js`** — transição de página + preloader.
- **`js/rd-navbar.min.js`** — plugin proprietário da navbar.
- **`js/swiper-legacy.min.js`** — Swiper 5 legado (API incompatível com versões novas).
- **`js/stubs.min.js`** — stubs para plugins não carregados (evita TypeError).
- **`js/ui-to-top.min.js`** — UItoTop.
- **`js/script.js`** (~40KB, fonte) → **`js/script.min.js`** (21KB, minificado com terser; **é o carregado pelo site**). Lógica customizada do template: inicializa plugins via seletor jQuery, padrão `plugins = { ... }`, detecta mobile/IE/desktop via `userAgent`, `lazyInit()`. **Não editar para features novas** — use `js/custom.js`; edite o fonte e regenere o min com `npx terser js/script.js -c -m -o js/script.min.js`.
- **`js/custom.js`** (146 linhas, editável) — modais de cotação (array `modals` + lazy load dos iframes), fallback do preloader (2,5s), vitrine de campanhas (Swiper 3: `vitrineParams()` recalcula slidesPerView/spaceBetween no resize — a build legada não aplica `breakpoints`) e acessibilidade (clones do loop com `aria-hidden`/`tabindex=-1`).

### CSS

- **`css/bootstrap.css`** (138KB) — **Bootstrap 4.1.3** (não é BS3 como parecia), já pré-purgado em sessão anterior (não tem `.btn-secondary` nem variantes coloridas de `.btn`). Mantido como backup.
- **`css/bootstrap.min.css`** (11,5KB, −92%) — PurgeCSS do `bootstrap.css` com safelist para classes dinâmicas (modal, collapse, sr-only, grid, botões). **É o carregado pelo site.** Para regenerar: PurgeCSS com `content` = `index.html` + `js/*.js` (o `.btn-secondary` é estilizado no `custom.css`).
- **`css/style.min.css`** (~146KB) — CSS do template Novi gerado via PurgeCSS a partir de `style.css` (original 332KB). **É o arquivo carregado pelo site.** Para regenerar: `npx --yes purgecss --config purgecss.config.js` (config na raiz, com safelist das classes dinâmicas: rd-navbar, swiper, wow, modais). Última rodada: 2026-08 (172KB → 146KB, −15%).
- **`css/style.css`** (332KB) — original intacto, mantido como backup para regenerar o `.min.css`.
- **`css/fonts.css`** — **fontes self-hosted** (Google Fonts, subset latin): Work Sans (fonte **variável**, 1 arquivo `fonts/work-sans.woff2` cobre os pesos 300–800) + Poppins 300/400/700 em `fonts/poppins-*.woff2`. Todos os `@font-face` com `font-display: swap`. Os webfonts antigos de ícones (FA/MDI/Linearicons, ~4MB) foram movidos para `b/fonts-backup/` (gitignored).
- **`css/custom.css`** (~780 linhas, fonte) — CSS customizado, carregado por último (sobrescreve o template). Define as variáveis de marca (`--marpe-azul #0970cd`, `--marpe-verde #81bc04`, `--marpe-laranja #fd9116`, `--marpe-navy #0b1e36`), a capa, a vitrine, a faixa de confiança, os cards de serviços, o FAQ, o footer/selo, a barra de conversão mobile, os botões e a página de privacidade. **Editar aqui**, não no `styles.min.css`.

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
| `images/hero-familia.webp` | Foto da capa (recorte 770×609 do banner antigo) + preload LCP |
| `images/bannernovo.webp` | Só para `image` do JSON-LD (não aparece mais na página) |
| `images/banner9.webp` | Background da seção "Melhores Ofertas" |
| `images/logo-favicon.png` | Ícone da aba (64×64, ~8 KB) |
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
| `images/agricola.webp` | Card Agrícola (crop da arte da campanha do cliente) |
| `images/destaques/*.webp` | 15 artes da campanha normalizadas em 4:5 (900×1125, fundo desfocado) para a vitrine da capa |

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
| LCP placeholder | `<img fetchpriority="high">` do banner hero inserido antes do `swiper-wrapper` para antecipar renderização sem aguardar o JS do Swiper. **Substituído em 2026-09:** a capa usa `images/hero-familia.webp` com `preload` + `fetchpriority="high"` (o hero Swiper antigo foi removido). |
| Fontes self-hosted | Work Sans (variável) + Poppins baixados do Google Fonts (subset latin) para `fonts/`; `css/fonts.css` com `font-display: swap`. Elimina request externo render-blocking. Os preloads de `poppins-700`/`work-sans` foram removidos em 2026-09 (o Chrome baixava 2× e gerava warnings no console). |
| Dimensões SSL Seal | `width="115" height="55"` na `<img>` do AlphaSSL para eliminar CLS (atributo duplicado removido). |
| SRI | `integrity="sha384-…"` + `crossorigin` nos 4 scripts de CDN (jquery, popper, bootstrap, wow) — hashes gerados com `openssl dgst -sha384`. |
| Preloader timeout | Fallback inline: preloader some em até 2,5s mesmo se `window.load` demorar. |
| Acessibilidade | Skip-link "Pular para o conteúdo" → `#destaques`; hrefs reais (`#modalId`) nos cards de serviço; `prefers-reduced-motion` desativa animações; aria-labels nos toggles da navbar; botões `Fechar` estilizados (`.btn-secondary` no `custom.css`); hierarquia de headings corrigida (valores do "Sobre" usam `h4`). |
| SEO | 1 `<h1>` por página com keyword ("Seguros, Consórcios e Créditos"); JSON-LD `InsuranceAgency` rico (`geo`, `areaServed` nacional — São Sepé + Brasil, `foundingDate` 2007, `openingHoursSpecification`, `priceRange`, `slogan`, `hasOfferCatalog` com os 12 serviços); OG completa (`site_name`, `locale`, dimensões + tipo + alt da imagem); Twitter Cards completos (title/description/image); `theme-color`; `apple-touch-icon`; sitemap com `lastmod` e a página de privacidade. |
| Conversão | CTA da seção "Melhores Ofertas" agora é "Cote agora pelo WhatsApp" (wa.me com mensagem pré-preenchida); URLs wa.me com percent-encoding completo; botão "Ver todos os serviços" com contraste AA sobre a foto; barra fixa `.cta-mobile` no mobile. |
| Contraste footer | `.footer-advanced-text` → `rgba(255,255,255,0.6)` (~6,5:1, AA) sobre o fundo `#232426`. |
| Coesão de cor | Azul da marca `#0970cd` (extraído da logo) via variável `--marpe-azul` (overrides do template `#007bff`/`#4854ed`/`#0d6efd` em `.button-primary`, `.button-primary-outline`, `.ui-to-top`, navbar); verde `--marpe-verde` e laranja `--marpe-laranja` como acentos (títulos, faixa de confiança). Descrições dos cards escurecidas para `#5f666d` (AA reforçado). |
| UX mobile | Alvos de toque ≥44px (títulos dos cards com padding, ícones sociais 44×44), deep-links do menu (`#consorcio-card`, `#credito-card` com `scroll-margin-top`), hint de swipe no carrossel, FAQ em accordion. |
| preconnect CDN | `preconnect` + `dns-prefetch` para `cdnjs.cloudflare.com` (4 scripts CDN com SRI). |
| Plano de Saúde | Card + modal com CTA para WhatsApp (padrão Instagram/Linktree), sem iframe externo. |
| Seção "Sobre a Marpe" | Nova seção na home: 19 anos (desde 2007), valores (clareza, cuidado, confiança) e atendimento nacional; nav "Sobre Nós" aponta para `#sobre`. |
| Selo Instagram | "Siga @marpeseguros no Instagram" no footer (coluna Contato). |
| Copy emocional | Cards Vida ("Planejar também é amar…") e Consórcios ("Planejamento e previsibilidade…") com o tom do Instagram. |
| CSS morto removido | 2 `@font-face` do ícone-font `lg.*` eliminados de `style.min.css`/`style.css` + arquivos `fonts/lg.*` (git rm). |
| Imagens otimizadas | `carro.jpg`/`caminhao.jpg` → WebP (−17%/−54%); `banner9.webp` 108→62 KB; `moto.webp` 39,7→26 KB; `apple-touch-icon.png` 40→12,9 KB. |
| Redesign 2026-09 | Capa com foto limpa (`hero-familia.webp`) + overlay da marca e vitrine 4:5; hero Swiper antigo removido (menos JS e sem texto sobre arte); paleta da logo aplicada; cards de serviço modernizados; `politica-de-privacidade.html` (LGPD); selo AlphaSSL movido do `<head>` para o footer (HTML válido); favicon 202→8 KB; órfãs `favicon.png`/`logo-removebg-preview.png` removidas; animação infinita do preloader parada; preloads de fonte removidos (console limpo). |

---

## Informações de Contato (usar ao editar conteúdo)

- **WhatsApp/Telefone:** 55991504477
- **Endereço:** Rua Visconde do Rio Branco, 1379 - Sala 01, Centro - São Sepé/RS
- **Coordenadas do mapa:** `-30.1641, -53.5654`
- **URL WhatsApp:** `https://wa.me/55991504477?text=Gostaria%20de%20mais%20informações%20a%20MARPE%20esta%20aqui%20para%20te%20atender,%20entre%20em%20contato%20e%20faça%20a%20sua%20cotação`
