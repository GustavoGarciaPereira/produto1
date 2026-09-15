# Análise — Remodelação da Home (padrão Bradesco Seguros)

> 🚧 **STATUS: FASE 1 CONCLUÍDA E COMMITADA (commit `c2e2a68`, 2026-09-14/15)** — a home remodelada já está no `index.html` (seção Ofertas, simulador, Como funciona, CTA final, nova ordem), com pendências de conteúdo do cliente em aberto. **Fase 2 em andamento:** nova tela de Cartas Contempladas (estoque LD Cred) em validação no Framesmith.
>
> Referência de UX/UI: <https://www.bradescoseguros.com.br/clientes> — copiar a **estrutura mental** (hierarquia, respiro, cards consistentes, CTAs claros), **não o visual**. Identidade Marpe preservada (Azul `#0970cd`, Verde `#81bc04`, Laranja `#fd9116`, Navy `#0b1e36`).

---

## Entregas até agora

| Artefato | Onde | Status |
|---|---|---|
| Folha de estilos do Design System | `css/marpe-design-system.css` (linkada no `index.html`, aditiva, prefixo `mp-`) | ✅ criada |
| Wireframe P&B da nova Home (10 seções) | Framesmith — canvas "Wireframe — Nova Home (hierarquia)" | ✅ validado |
| **Layout final colorido (identidade Marpe aplicada)** | Framesmith — mesmo canvas (paleta, Poppins + Work Sans, tratamentos) | ✅ pronto para aprovação |
| **Cards de serviço com foto** (imagens reais `images/*.webp`) | Framesmith — **12 cards, foto no topo** (estilo A escolhido) | ✅ decidido |
| Protótipo da grade de ofertas (padrão Bradesco) | Framesmith — canvas "Marpe — Ofertas como cards" | ✅ direção aprovada |
| Transcrição das 15 artes de campanha (textos) | Nesta análise / sessão de trabalho | ✅ transcritas |

## Estrutura proposta da nova Home

Header → Hero (benefício + 19 anos + simulador) → Diferenciais (prova social) → Seguros (grade 4×2 + 4 secundários) → Como funciona (4 passos) → Depoimentos → Sobre (antes do rodapé) → Parceiros → CTA final → Rodapé

## Pendências

### Conteúdo com o cliente

- [ ] **Depoimentos reais** — 3, com nome, cidade e serviço (hoje: placeholders no wireframe)
- [ ] **Lista de seguradoras parceiras** + autorização de uso das marcas (hoje: caixas "LOGO")
- [ ] **Fotos** — Marcel/equipe (seção Sobre) e família/cliente (hero) (hoje: placeholders)
- [ ] **Revisão dos textos propostos** pelo cliente (hero, Como funciona, Sobre e CTA final)

### Decisões

- [x] **Estilo dos cards de serviço** — **foto no topo** (estilo A), com **12 serviços** em cards com foto (todos os serviços, incluindo Plano de Saúde, Diversos, Consórcios e Crédito). O estilo B (foto como fundo do card, com painel translúcido) foi testado no canvas "Marpe — Serviços · estilo B" e descartado.
- [ ] **Destino das 15 ofertas das artes de campanha** (Consórcio a partir de R$ 25 mil, Home Equity 1,09% a.m., Financiamentos, etc.):
  - **Opção A** — bullets dentro dos cards de serviço (enriquece os 8 cards principais);
  - **Opção B** — seção própria "Ofertas e campanhas" (grade de cards com bullets + CTA).

### Implementação (após validação do wireframe)

- [x] **Seção "Ofertas e campanhas" no `index.html`** (2026-09-14) — substitui a vitrine de 15 artes; 12 cards com bullets transcritos das artes e CTAs ligados aos modais existentes (Auto, Agrícola, Vida, Saúde, Consórcios) e ao WhatsApp (Financiamentos, Home Equity, Empréstimo). Estilos via `mp-*` em `css/marpe-design-system.css`; vitrine/Swiper removidos do HTML (JS fica dormente).
- [x] **Simulador na capa** — `#simulador-servico` + `#simulador-btn` abrem o modal do serviço escolhido (lógica no `js/custom.js`; testado em navegador).
- [x] **Seção "Como funciona"** (4 passos) — `.mp-passos`.
- [x] **Sobre**: texto institucional novo + assinatura "Contigo em todos os momentos" (`.mp-assinatura`); **rodapé** com a mesma assinatura.
- [x] **Reordenação da home**: Capa → Diferenciais → Serviços → **Ofertas** → **Cartas Contempladas** → **Como funciona** → **FAQ** → **Sobre** → **CTA final** → Rodapé. Banner "Melhores Ofertas" fundido no CTA final (`.mp-cta-final`); menu reordenado (Cartas antes de Sobre).
- [x] **`CLAUDE.md` atualizado** (2026-09-14).
- [ ] **Conteúdo pendente** (cliente): depoimentos reais · lista de seguradoras · foto do Marcel/equipe — seções **não publicadas** até termos conteúdo.
- [ ] Limpeza opcional: remover o bloco dormente da vitrine em `js/custom.js` + `swiper-legacy.min.js` + CSS `.destaques-*` + `images/destaques/`/`banner9.webp` (arquivos órfãos no repo).
- [ ] Conferir textos/valores das campanhas com o cliente (datam) e revisar a copy do hero (mantida a atual por SEO — o mockup sugeria novo H1).

## Observações do wireframe

- Conteúdo marcado como pendente também aparece no próprio wireframe (bloco "Pendências" no final + notas nas seções).
- O inspetor do Framesmith está limpo (espaçamento, contraste AA, tipografia e clichês). Os 2 avisos restantes são falso-positivo do detector de "tabela de dados" — ele lê grades de cards de marketing como tabela e pede estados vazio/carregando, o que não se aplica a site estático.
- Textos legais e contatos existentes **não mudam**: WhatsApp (55) 99150-4477, endereço e CNPJ 44.697.683/0001-53.

---

## Fase 2 — Tela "Cartas Contempladas" (estoque LD Cred)

> Demanda do cliente: exibir no site o estoque de cartas contempladas do parceiro **LD Cred**.

### A API

- **URL:** `https://app.ldcred.com/api/parceiro-estoque/<token>` (token no path) — **a URL completa NÃO fica no código**: está guardada no Secret `LDCRED_ESTOQUE_URL` do repositório (GitHub → Settings → Secrets and variables → Actions) e é usada só pelo workflow do Pages
- **Resposta:** JSON, ~60 KB, **CORS aberto** (`access-control-allow-origin: *`)
- **Cache:** `private, max-age=60` (dados com "atualizado_em")
- **Publicação:** o workflow `.github/workflows/static.yml` busca a API com o Secret e escreve **`data/cartas.json`** antes de publicar (a cada push e a cada 30 min via `schedule`); a página lê esse arquivo — se a busca falhar, mantém o último JSON publicado
- **Campos por carta:** `id`, `categoria` (Imóvel/Veículo), `administradora`, `valor_credito`, `entrada`, `parcelas`, `valor_parcela`, `saldo_devedor`, `taxa_transferencia`, `seguro` (número ou "A Consultar"), `status`, `vencimento_dia`
- **Manutenção:** se o parceiro rotacionar o token, basta atualizar o Secret (nenhuma mudança de código)

### Retrato do estoque (2026-09-15)

| Dado | Valor |
|---|---|
| Total | 239 cartas (100% disponíveis) |
| Categorias | Imóvel 117 · Veículo 122 |
| Administradoras | 21 (HS 97 · Porto 25 · Itaú 18 · Serello 16 · Bradesco 15 · Magalu 13 · Zema 9 · CNP 8 · Santander 7 · Embracon 6 · BB 4 · Yamaha 4 · +) |
| Crédito | R$ 19,5 mil a R$ 1,17 mi (média R$ 155 mil) |
| Entrada | R$ 7,1 mil a R$ 603 mil |
| Parcelas | 21 a 235x (R$ 369 a R$ 16,4 mil/mês) |
| Taxa de transferência | R$ 370 a R$ 10,2 mil |

### Proposta de UI/UX (canvas Framesmith "Cartas Contempladas — nova tela")

- **Página própria** (`cartas-contempladas.html`, no padrão das páginas internas — leve, sem JS de template) — nav "Cartas Contempladas" e a seção da home passam a apontar para ela
- **Hero navy** com contagem (239 · 117 imóveis · 122 veículos) e data de atualização
- **Filtros:** busca por administradora · categoria · faixa de crédito · ordenação (menor entrada/p menor parcela/maior crédito) · limpar
- **Cards** (3/2/1 colunas): categoria + administradora, valor do crédito em destaque, entrada/parcela/saldo/taxa, vencimento, CTA "Tenho interesse" → WhatsApp com mensagem pré-preenchida (id + categoria + valor)
- **Carregar mais** (24 por vez) — o estoque tem 239 itens
- **Estados previstos:** carregando (skeleton), sem resultados (limpar filtros), erro na API (tentar novamente)
- **Nota legal** sobre sujeição de valores e aprovação da administradora

### Status desta fase (2026-09-15)

- [x] Layout aprovado (canvas Framesmith "Cartas Contempladas — nova tela")
- [x] **Página implementada** — `cartas-contempladas.html` + `js/cartas.js` (fetch, filtros de administradora/categoria/faixa de crédito/ordenação, "carregar mais" 24/página, estados de carregando/vazio/erro, WhatsApp por carta). Testado no navegador (desktop e mobile, console limpo).
- [x] Menu "Cartas Contempladas" aponta para a página; a seção da home ganhou o botão "Ver cartas disponíveis" (WhatsApp virou ação secundária)
- [x] `sitemap.xml` atualizado (changefreq daily)
- [x] **Filtro "valor desejado"** (pedido do cliente, 2026-09-15): campo com máscara de moeda + janela de **± R$ 10 mil** em torno do valor, com texto transparente ("Mostrando créditos entre R$ X e R$ Y"); convive com a faixa fixa (filtros se somam). Constante `FOLGA` no `js/cartas.js`.
- [ ] Cliente/contratante validar a página publicada
- [ ] Decidir se haverá formulário próprio p/ financiamentos (hoje os CTAs dessas ofertas vão direto ao WhatsApp)
- [x] **Token da API ocultado do código** (2026-09-15) — está no Secret `LDCRED_ESTOQUE_URL` do repositório; o workflow do Pages gera `data/cartas.json` (a cada push e a cada 30 min). O histórico local foi reescrito antes do push, então o token nunca foi publicado.
- [ ] Revisar periodicamente com o parceiro se o token segue válido (se rotacionar, atualizar o Secret — sem mudança de código)
