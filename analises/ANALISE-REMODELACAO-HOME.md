# Análise — Remodelação da Home (padrão Bradesco Seguros)

> 🚧 **STATUS: EM ANDAMENTO (2026-09-14)** — wireframe em validação com o cliente; pendências de conteúdo listadas abaixo. **A implementação no `index.html` ainda NÃO começou.**
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
