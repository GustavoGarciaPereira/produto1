# Análise Marpe — Site × Canais oficiais (pesquisa 2026)

> ✅ **STATUS: 100% implementado/decidido em 2026-08-21** — ver `CLAUDE.md` para o estado atual do site.

> Documento de trabalho: pesquisa dos canais oficiais + estado atual do site,
> para decidir melhorias **sem perder o foco** da corretora.
> Nenhum arquivo do site foi alterado — somente leitura.

---

## 1. Pesquisa de canais oficiais

### Instagram — @marpeseguros (acessado publicamente)

| Dado | Valor |
|---|---|
| Nome de exibição | **Marpe Consórcios, Seguros e Créditos** |
| Seguidores | 3.675 |
| Bio | "Solicite sua cotação no link abaixo" → `linktr.ee/marpeseguros` |
| Destaques | **Patrimonial** · **Bens e Serviços** · **Proteção à Vida** |
| Posts recentes | Reel Consórcio Pontual Rodobens (11/08/26) · Aniversário 19 anos (10/07/26) · Seguro de Vida (17/03/26) |

**Conteúdo que publicam:**
- **Consórcio Rodobens** (reel 11/08/2026): "O Consórcio Pontual Rodobens é uma modalidade que une planejamento e previsibilidade para quem quer conquistar um carro."
- **Aniversário 19 anos** (10/07/2026): comemoração dos 19 anos do "Mundo dos Seguros" (Marcel) — 85 likes, 19 comentários, felicitações de colegas e clientes.
- **Seguro de Vida** (17/03/2026): *"Seguro de vida é uma escolha consciente de quem cuida hoje para viver com mais segurança amanhã. Planejar também é amar…"* — hashtags `#SeguroDeVida #ProteçãoFamiliar #PlanejamentoFinanceiro #Tranquilidade #CuidadoComQuemImporta #AtendimentoNacional`.

### Linktree — linktr.ee/marpeseguros

Descrição: **"Segurança e previsibilidade para sua vida. Seguros, consórcios e crédito com clareza, cuidado e confiança. Fale com quem…"**

| Link | Destino |
|---|---|
| Cotar Consórcio | WhatsApp 55991504477 |
| **Cotar Plano de Saúde** | WhatsApp 55991504477 ⚠️ *não existe card no site* |
| Simulação de Crédito | `link.bpotech.com.br/xafgg` (sistema BPO Tech) |
| Cotar Seguro | `marpe.corretordigital.site/#/home?simplificado=true` |
| Fale com a Marpe | WhatsApp 55991504477 |
| Conheça a Marpe | `marpeseguros.com.br` |

### Facebook — /marpeseguros

- Título público: **"Marpe Consórcios e Seguros | São Sepé RS"** (login requerido para o conteúdo; só o título foi coletado).

### Sistema de cotação externo (corretordigital.site)

- Modo simplificado (`?simplificado=true`): página "FAÇA UMA COTAÇÃO" com os **8 seguros** (Auto, Moto, Caminhão, Residencial, Condomínio, Empresarial, Vida, Diversos). Sem consórcio/crédito/plano de saúde.

### ⚠️ Inconsistência de nome da marca (3 variações)

| Canal | Nome |
|---|---|
| Site | Marpe **Corretora de Seguros** |
| Instagram | Marpe **Consórcios, Seguros e Créditos** |
| Facebook | Marpe **Consórcios e Seguros** |

---

## 2. Estado atual do site (testado no servidor local 127.0.0.1:5502)

✅ Funcionando: hero 3 slides · 10 cards com modais de cotação (iframe lazy-load) ·
Cartas Contempladas · Melhores Ofertas · footer · botão WhatsApp fixo · WOW.js · SEO
básico (title, description, OG, JSON-LD InsuranceAgency, sitemap, robots, canonical).

### Achados pontuais (com referência)

- `<h1>` do hero é apenas **"Sempre"** (`index.html:484`) — fraco para SEO; sem a palavra-chave do negócio.
- Meta description (`index.html:3`) cita **só seguros** — não menciona consórcios/créditos.
- JSON-LD (`index.html:18-67`): `name: "Marpe Corretora de Seguros"`, `areaServed` só **"São Sepé, RS"** (IG diz **#AtendimentoNacional**), sem `foundingDate` (são **19 anos**, desde 2007), sem Plano de Saúde no `hasOfferCatalog` (10 itens).
- Footer "Sobre nós" (`index.html:657`): *"habilitados **a mais de 10 anos**"* — gramática + dado desatualizado (IG diz 19 anos); cita "planos de saúde, odontológicos" **sem existir card**.
- Card de **Plano de Saúde não existe** no site (existe no Linktree, via WhatsApp).
- **Crédito**: site usa `corretordigital/#/formularios/credito`; IG/Linktree usa **BPO Tech** (`link.bpotech.com.br/xafgg`) — fluxos diferentes, decidir o oficial.
- Arquivos OK: `robots.txt` (com sitemap), `sitemap.xml` (1 URL, lastmod 2026-07-31), `.htaccess` (HTTPS + headers de segurança + cache).

---

## 3. Oportunidades priorizadas (sem perder o foco)

### P1 — Alinhar serviços com o Instagram (maior impacto)
1. **Adicionar card "Plano de Saúde"** (modal com CTA para WhatsApp, como o IG faz) — talvez também "Odontológico". Padrão idêntico ao array `modals` (`index.html:742-752`).
2. **Unificar o fluxo de Crédito**: decidir entre corretordigital e BPO Tech e usar o oficial no site (e no Linktree).
3. **Unificar o nome da marca** em site/IG/FB (sugestão: "Marpe — Seguros, Consórcios e Créditos") e refletir em title, meta description e JSON-LD.

### P2 — Fortalecer a marca e a história
4. **Seção "Sobre nós"** na home com: **19 anos** (desde 2007), tagline do IG ("Segurança e previsibilidade para sua vida"), valores (clareza, cuidado, confiança) e **atendimento nacional**.
5. **JSON-LD enriquecido**: `foundingDate`, `slogan`, `priceRange`, `areaServed` nacional, adicionar Plano de Saúde ao catálogo quando o card existir.
6. **`<h1>` e meta description** com palavra-chave real (ex.: "Marpe — Seguros, Consórcios e Créditos em São Sepé, RS").

### P3 — Polimento
7. Corrigir "a mais de 10 anos" → "**há mais de 19 anos**" (`index.html:657`).
8. CTA "Cote agora pelo WhatsApp" já existente; considerar espelhar as frases emocionais do IG nos cards de Vida/Consórcios ("planejar também é amar", "planejamento e previsibilidade").
9. Exibir selo do Instagram ("Siga @marpeseguros — 3,6 mil seguidores") perto das redes no footer.
10. Avaliar se "Cartas Contempladas" merece card próprio (hoje é só seção com CTA WhatsApp) — o nav já aponta para ela.

---

## 4. Rascunho de copy novo (inspirado nos canais oficiais)

- **Tagline hero**: "Segurança e previsibilidade para sua vida."
- **Sobre nós**: "Há mais de 19 anos, a Marpe une seguros, consórcios e crédito com clareza, cuidado e confiança. Atendemos você em todo o Brasil."
- **Card Plano de Saúde**: "Plano de saúde e odontológico com as melhores operadoras. Fale com a gente e encontre a cobertura ideal."
- **Card Consórcios**: reforçar "planejamento e previsibilidade" (tom do reel da Rodobens).

---

## 5. Auditoria técnica profunda (relatório file:line)

> Auditoria de arquivos completa (somente leitura) — `index.html` lido integralmente + CSS/JS/imagens/SEO.

### Acessibilidade
- **P1 ⚠️ Contraste falho no footer:** `.footer-advanced-text` usa `rgba(255,255,255,0.3)` (`css/style.min.css:2161-2163`) sobre fundo `#232426` (`style.min.css:3792-3795`) → **≈2,7:1**, abaixo do AA (4,5:1). Afeta o "Sobre nós" (`index.html:657`) e blocos de Contato (661-673).
- OK: alt em todas as 16 imagens, aria-labels, skip-link, `prefers-reduced-motion`, 1 único h1, ordem de headings sem saltos.

### SEO / Metadados
- **Twitter Cards incompletos:** só `twitter:card` (`index.html:17`) — faltam title/description/image.
- **OG:** falta `og:image:type` e `og:image:alt` (`index.html:12-14`).
- **JSON-LD** (`index.html:18-67`): faltam `openingHours`, `priceRange`, `foundingDate`, `founder`, `email`, `description`, `slogan`; `telephone "+55-55-99150-4477"` em formato incomum.
- **P2 ⚠️ Apex vs www:** CNAME = apex (`marpeseguros.com.br`) mas canonical/OG/JSON-LD/sitemap/robots apontam para **www** → risco de conteúdo duplicado se ambos resolverem. O `.htaccess` é **inerte no GitHub Pages** (Pages não processa Apache).
- **sitemap.xml** OK (1 URL, `lastmod 2026-07-31` — ~3 semanas defasado do deploy).

### Performance
- **P2 ⚠️ Favicon de 202 KB:** `logo-favicon.png` 512×512 (`index.html:72`) — existe `favicon.png` de **17 KB** trackeado e não usado. Gerar 32-64 px ou trocar.
- **P2 ⚠️ Sem `preconnect`/`dns-prefetch`** para `cdnjs.cloudflare.com` (4 scripts CDN com SRI, `index.html:717-722`).
- `style.min.css` = **172 KB** render-blocking; `swiper-legacy.min.js` = 86 KB. Nova rodada de PurgeCSS/critical CSS.
- Lazy-loading de iframes confirmado (src injetado em `shown.bs.modal`, limpo em `hidden.bs.modal` — `index.html:798-805`) ✓.
- **Poppins 600** usado na navbar mas não definido em `fonts.css` (só 300/400/700) → peso sintetizado.
- `carro.jpg` e `caminhao.jpg` são os únicos cards em JPEG (demais em WebP).
- **P3** `@font-face` residual do ícone-font `lg.*` em `style.min.css:8488-8489, 8580-8581` — inerte, remover.
- Preloader com fallback 2,5 s (`index.html:809-819`) ✓; placeholder LCP declara 1920×800 mas arquivo é 1600×609 (`:476`) — sem CLS hoje, alinhar no futuro.

### Imagens — uso e pesos (auditoria)

| Imagem | Uso | Dim | Peso | Ref |
|---|---|---|---|---|
| `bannernovo.webp` | LCP + bg 3 slides + preload | 1600×609 | 65 KB | L75, 476, 478/490/502 |
| `bannernovo.jpeg` | og:image | 1600×609 | 147 KB | L12 |
| `banner9.webp` | bg Melhores Ofertas | 1920×680 | 108 KB | L635 |
| `logo.webp` | preloader/navbar/footer | 930×300 | 67 KB | L417, 437, 700 |
| `logo-favicon.png` | favicon | 512×512 | **202 KB** | L72 |
| `apple-touch-icon.png` | iOS | 180×180 | 40 KB | L73 |
| `carro.jpg` / `moto.webp` / `caminhao.jpg` | cards Auto/Moto/Caminhão | 660×413 / 740×491 / 600×462 | 19,5 / 39,7 / 25 KB | L530, 540, 552 |
| `residencial.webp`…`credito.webp` | 7 cards | 800×~374-600 | 16-34 KB | L562-612 |
| `icon_whatsapp.webp` | botão fixo | 72×72 | 2 KB | L711 |

**Otimizáveis (P3):** `apple-touch-icon.png` 40 KB → ~10-15 KB; `banner9.webp` 108 KB → ~70 KB; variante menor de `logo.webp` (exibido a ~300×97); `moto.webp` 39,7 KB é o card mais pesado; `favicon.png` e `logo-removebg-preview.png` (25 KB) trackeados e não usados → remover/documentar.

### Copy / limpeza
- `index.html:702` "All Rights Reserved" → "Todos os direitos reservados".
- Comentários de template: `index.html:618` ("view all properties") e `:640` ("of September").
- `index.html:464` nav "Créditos" vs card "Crédito" (`:613`).
- `index.html:485` hífen simples em vez de travessão.

### ⚠️ CLAUDE.md desatualizado
O `CLAUDE.md` descreve recursos que **não existem mais** no HTML: seção de diferenciais (3 cards "Funcionários Qualificados"/"Consultas Gratuitas"/"100% Garantido"), mapa Leaflet no navbar e `favicon.png` como ícone da aba (o HTML usa `logo-favicon.png`). Documentação a atualizar quando implementarmos.

### TOP 10 melhorias de maior impacto (auditoria)

| # | Prio | Melhoria | Ref |
|---|---|---|---|
| 1 | P1 | Contraste do footer → ≥4,5:1 | style.min.css:2161, 3792 |
| 2 | P2 | Favicon 202 KB → 32-64 px (ou `favicon.png` 17 KB) | index.html:72 |
| 3 | P2 | `preconnect` p/ cdnjs.cloudflare.com | index.html:717-722 |
| 4 | P2 | Apex vs www (redirect real ou domínio único) | CNAME + canonical |
| 5 | P2 | Plano de Saúde/Odontológico: copy promete (L657), catálogo não entrega | index.html:657, 521-621, 54-63 |
| 6 | P2 | h1 "Sempre" → headline com keyword | index.html:484 |
| 7 | P2 | Twitter Cards + og:image:type/alt | index.html:12-17 |
| 8 | P2 | Peso do CSS (172 KB) — nova PurgeCSS/critical | style.min.css |
| 9 | P2 | JSON-LD: openingHours, priceRange, foundingDate, telephone | index.html:18-67 |
| 10 | P3 | Polimento: L702, L618/L640, L464, L657, `<main>`, lastmod, WebP em carro/caminhão, Poppins 600, atualizar CLAUDE.md | — |

---

*Última atualização da pesquisa: 2026-08-20. Auditoria técnica integrada. Próximo passo: decidir itens P1/P2/P3 a implementar.*
