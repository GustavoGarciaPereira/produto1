/* ============================================================
   Marpe Seguros — Tela "Cartas Contempladas"
   Lê o estoque de data/cartas.json, aplica filtros, renderiza a
   lista (tabela no desktop, cartões no mobile), a seleção de
   cotas e o "Resultado da Junção".

   O JSON é publicado pelo workflow do GitHub Pages
   (.github/workflows/static.yml), que busca a API do parceiro
   (LD Cred) usando o token guardado no Secret do repositório
   LDCRED_ESTOQUE_URL — o token NUNCA aparece no código.
   Atualização: a cada push e a cada 30 minutos (schedule).

   Página interna independente — não usa jQuery.
   ============================================================ */

(function () {
  'use strict';

  var ARQUIVO = 'data/cartas.json';
  var POR_PAGINA = 24;
  var WA_BASE = 'https://wa.me/55991504477?text=';
  /* Tolerância do filtro "valor desejado" (para cima e para baixo). */
  var FOLGA = 10000;
  var MOBILE = '(max-width: 767.98px)';

  var SVG_COPIA = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>';
  var SVG_WA = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>';
  var SVG_SETA = '<svg class="mp-th-seta" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>';

  var CORES_ADM = ['#0970cd', '#0f766e', '#7c3aed', '#b45309', '#be123c', '#0b7a3b', '#4338ca', '#a16207', '#0369a1', '#9333ea'];

  /* Logos em images/logos-adm (WebP, 165×48). Administradora sem logo cai no avatar de iniciais. */
  var LOGOS_ADM = {
    'BB Consórcios': 'bbconsorcios',
    'Bradesco': 'bradesco',
    'Caixa XS5': 'caixa-xs5',
    'Canopus': 'canopus',
    'CNP Consórcio': 'cnp',
    'Embracon': 'embracon',
    'Gazin': 'gazin',
    'HS Consórcios': 'hsconsorcios',
    'Itaú': 'itauconsorcio',
    'Magalu': 'magalu',
    'Porto Seguro': 'portoseguro',
    'Primo Rossi': 'primorossi',
    'Racon Consórcios': 'racon',
    'Rodobens': 'rodobens',
    'Santander': 'santander',
    'Serello': 'serello',
    'Sicoob Consórcios': 'sicoob',
    'Sicredi': 'sicredi',
    'União Catarinense': 'uniaocatarinense',
    'Volkswagen': 'volkswagen',
    'Yamaha': 'yamaha',
    'Zema': 'zema'
  };

  var el = {
    tabelaWrap: document.getElementById('tabela-wrap'),
    tbody: document.getElementById('cartas-tbody'),
    thead: document.querySelector('.mp-tabela thead'),
    checkPagina: document.getElementById('check-pagina'),
    grid: document.getElementById('cartas-grid'),
    vazio: document.getElementById('estado-vazio'),
    erro: document.getElementById('estado-erro'),
    busca: document.getElementById('f-busca'),
    categoria: document.getElementById('f-categoria'),
    administradora: document.getElementById('f-administradora'),
    valor: document.getElementById('f-valor'),
    valorDesejado: document.getElementById('f-valor-desejado'),
    janela: document.getElementById('f-janela'),
    limpar: document.getElementById('f-limpar'),
    resultado: document.getElementById('f-resultado'),
    atualizado: document.getElementById('f-atualizado'),
    topo: document.querySelector('.mp-estoque-topo'),
    paginacao: document.getElementById('paginacao'),
    pagInfo: document.getElementById('pag-info'),
    pagAnterior: document.getElementById('pag-anterior'),
    pagProxima: document.getElementById('pag-proxima'),
    btnLimparSelecao: document.getElementById('btn-limpar-selecao'),
    btnJuncao: document.getElementById('btn-juncao'),
    juncaoQtd: document.getElementById('juncao-qtd'),
    btnVisaoTabela: document.getElementById('btn-visao-tabela'),
    btnVisaoCards: document.getElementById('btn-visao-cards'),
    juncaoModal: document.getElementById('juncao-modal'),
    juncaoTitulo: document.getElementById('juncao-titulo'),
    juncaoFechar: document.getElementById('juncao-fechar'),
    juncaoResumo: document.getElementById('juncao-resumo'),
    juncaoFaixas: document.getElementById('juncao-faixas'),
    juncaoRodape: document.getElementById('juncao-rodape'),
    juncaoCotas: document.getElementById('juncao-cotas'),
    juncaoCopiar: document.getElementById('juncao-copiar'),
    juncaoWa: document.getElementById('juncao-wa'),
    aviso: document.getElementById('aviso-juncao'),
    avisoTexto: document.getElementById('aviso-juncao-texto'),
    avisoFechar: document.getElementById('aviso-juncao-fechar'),
    toast: document.getElementById('mp-toast'),
    statTotal: document.getElementById('stat-total'),
    statImovel: document.getElementById('stat-imovel'),
    statVeiculo: document.getElementById('stat-veiculo'),
    statAtualizado: document.getElementById('stat-atualizado')
  };

  var estado = {
    todas: [],
    filtradas: [],
    pagina: 1,
    selecionadas: {},
    ordemCampo: 'entrada',
    ordemDir: 'asc',
    visao: 'tabela'
  };

  /* ---------- utilidades ---------- */

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function moeda(v) {
    if (typeof v !== 'number' || !isFinite(v)) return '—';
    var dec = Number.isInteger(v) ? 0 : 2;
    return v.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: dec,
      maximumFractionDigits: dec
    });
  }

  function numero(v) {
    return typeof v === 'number' && isFinite(v) ? v.toLocaleString('pt-BR') : '—';
  }

  function valorOuConsultar(v) {
    return typeof v === 'number' && isFinite(v) ? moeda(v) : 'A Consultar';
  }

  /* Vencimento: usa a data da próxima parcela (dd/mm, sem Date para não cair em fuso);
     sem ela, o dia fixo; senão, "A Consultar". */
  function rotuloVencimento(item) {
    var partes = String(item.proximo_vencimento || '').split('-');
    if (partes.length === 3 && partes[1] && partes[2]) {
      return partes[2].slice(0, 2) + '/' + partes[1];
    }
    if (typeof item.vencimento_dia === 'number') return 'dia ' + item.vencimento_dia;
    return 'A Consultar';
  }

  function tituloCarta(item) {
    return String(item.administradora || '').toUpperCase() +
      ' - ' + String(item.categoria || '').toUpperCase();
  }

  function linkWhats(item) {
    var titulo = tituloCarta(item);

    var linhas = [
      'Olá! Tenho interesse na carta contemplada abaixo. Pode me ajudar?',
      '',
      titulo,
      '',
      'Crédito: ' + valorOuConsultar(item.valor_credito),
      'Entrada: ' + valorOuConsultar(item.entrada)
    ];

    if (typeof item.parcelas === 'number' && item.parcelas > 0) {
      linhas.push('', 'Parcelamento:', '1 à ' + numero(item.parcelas) + ': ' + valorOuConsultar(item.valor_parcela));
    }

    linhas.push(
      '',
      'Transferência: ' + valorOuConsultar(item.taxa_transferencia),
      'Saldo devedor: ' + valorOuConsultar(item.saldo_devedor),
      'Seguro de vida: ' + valorOuConsultar(item.seguro),
      'Vencimento: ' + rotuloVencimento(item),
      '',
      'Código da carta: #' + item.id
    );

    return WA_BASE + encodeURIComponent(linhas.join('\n'));
  }

  function textoDetalhe(item) {
    var linhas = [
      tituloCarta(item) + ' (#' + item.id + ')',
      '',
      'Crédito: ' + valorOuConsultar(item.valor_credito),
      'Entrada: ' + valorOuConsultar(item.entrada),
      'Parcela mensal: ' + valorOuConsultar(item.valor_parcela),
      'Parcelas restantes: ' + numero(item.parcelas),
      'Saldo devedor: ' + valorOuConsultar(item.saldo_devedor),
      'Taxa de transferência: ' + valorOuConsultar(item.taxa_transferencia),
      'Seguro de vida: ' + valorOuConsultar(item.seguro),
      'Vencimento: ' + rotuloVencimento(item)
    ];
    return linhas.join('\n');
  }

  function obsDe(item) {
    var partes = [];
    if (typeof item.parcelas === 'number') partes.push(numero(item.parcelas) + ' parcelas restantes');
    if (typeof item.vencimento_dia === 'number') partes.push('vence todo dia ' + item.vencimento_dia);
    if (item.seguro === 'A Consultar') partes.push('seguro a consultar');
    else if (typeof item.seguro === 'number') partes.push('seguro ' + moeda(item.seguro));
    return partes.join(' · ');
  }

  function seloClasse(categoria) {
    return categoria === 'Veículo' ? 'mp-selo--veiculo' : 'mp-selo--imovel';
  }

  function seloIcone(categoria) {
    if (categoria === 'Veículo') {
      return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><path d="M9 17h6"/><circle cx="17" cy="17" r="2"/></svg>';
    }
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/></svg>';
  }

  function selo(item) {
    return '<span class="mp-selo ' + seloClasse(item.categoria) + '">' +
      seloIcone(item.categoria) + esc(item.categoria) + '</span>';
  }

  function rotuloStatus(status) {
    var mapa = { disponivel: 'Disponível', reservado: 'Reservado', vendido: 'Vendido' };
    var chave = String(status || '').toLowerCase();
    if (mapa[chave]) return mapa[chave];
    return chave ? chave.charAt(0).toUpperCase() + chave.slice(1) : 'Disponível';
  }

  function iniciais(nome) {
    var partes = String(nome || '').trim().split(/\s+/).filter(Boolean);
    if (!partes.length) return '—';
    if (partes.length === 1 || /^[A-ZÀ-Ü]{2,3}$/.test(partes[0])) return partes[0].slice(0, 3);
    return (partes[0].charAt(0) + partes[1].charAt(0)).toUpperCase();
  }

  function corAdm(nome) {
    var s = String(nome || '');
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    return CORES_ADM[h % CORES_ADM.length];
  }

  /* Marca da administradora: logo quando existe; senão, avatar de iniciais + nome. */
  function marcaAdm(item, classe, altura) {
    var slug = LOGOS_ADM[item.administradora];
    if (slug) {
      var largura = Math.round(altura * 165 / 48);
      return '<img class="' + classe + ' mp-marca-adm" src="images/logos-adm/' + slug + '.webp" alt="' + esc(item.administradora) +
        '" width="' + largura + '" height="' + altura + '" loading="lazy" decoding="async">';
    }
    return '<span class="mp-adm"><span class="mp-adm-logo" style="--adm-cor:' + corAdm(item.administradora) +
      '" aria-hidden="true">' + esc(iniciais(item.administradora)) + '</span><span class="mp-adm-nome">' +
      esc(item.administradora) + '</span></span>';
  }

  function acharItem(id) {
    for (var i = 0; i < estado.todas.length; i++) {
      if (String(estado.todas[i].id) === String(id)) return estado.todas[i];
    }
    return null;
  }

  function unicos(itens, campo) {
    var vistos = {};
    var lista = [];
    itens.forEach(function (i) {
      var v = i[campo];
      if (v && !vistos[v]) { vistos[v] = true; lista.push(v); }
    });
    return lista;
  }

  function soma(itens, campo) {
    var s = 0;
    itens.forEach(function (i) {
      if (typeof i[campo] === 'number' && isFinite(i[campo])) s += i[campo];
    });
    return s;
  }

  function somaOuConsultar(itens, campo) {
    var completo = true;
    itens.forEach(function (i) {
      if (typeof i[campo] !== 'number' || !isFinite(i[campo])) completo = false;
    });
    return completo ? moeda(soma(itens, campo)) : 'A Consultar';
  }

  function prazoMedio(itens) {
    var somaParcelas = 0, n = 0;
    itens.forEach(function (i) {
      if (typeof i.parcelas === 'number' && isFinite(i.parcelas)) { somaParcelas += i.parcelas; n++; }
    });
    return n ? Math.round(somaParcelas / n) : null;
  }

  /* Faixas do parcelamento somado: meses em que o valor total se repete viram uma faixa. */
  function faixasParcelamento(itens) {
    var maxParcelas = 0;
    itens.forEach(function (i) {
      if (typeof i.parcelas === 'number' && i.parcelas > maxParcelas) maxParcelas = i.parcelas;
    });
    if (!maxParcelas) return [];

    var faixas = [];
    var atual = null;

    for (var mes = 1; mes <= maxParcelas; mes++) {
      var total = 0, parcial = false;
      itens.forEach(function (i) {
        if (typeof i.parcelas === 'number' && i.parcelas >= mes) {
          if (typeof i.valor_parcela === 'number' && isFinite(i.valor_parcela)) total += i.valor_parcela;
          else parcial = true;
        }
      });

      if (atual && Math.abs(atual.valor - total) < 0.005) {
        atual.fim = mes;
      } else {
        atual = { inicio: mes, fim: mes, valor: total, parcial: parcial };
        faixas.push(atual);
      }
    }

    return faixas;
  }

  function rotuloFaixa(faixa) {
    return faixa.inicio === faixa.fim
      ? 'Mês ' + faixa.inicio
      : faixa.inicio + ' à ' + faixa.fim;
  }

  function itensSelecionados() {
    var porId = {};
    estado.todas.forEach(function (i) { porId[String(i.id)] = i; });
    var itens = Object.keys(estado.selecionadas).map(function (id) { return porId[id]; })
      .filter(function (i) { return !!i; });
    itens.sort(function (a, b) { return a.id - b.id; });
    return itens;
  }

  function textoVendas(itens) {
    var total = itens.length;
    var categorias = unicos(itens, 'categoria');
    var admins = unicos(itens, 'administradora');
    var prazo = prazoMedio(itens);

    var linhas = [
      '*RESULTADO DA JUNÇÃO (' + total + (total === 1 ? ' cota)*' : ' cotas)*'),
      'Segmento: ' + (categorias.length === 1 ? categorias[0] : 'Misto'),
      'Administradora: ' + (admins.length === 1 ? admins[0] : 'Múltiplas'),
      '',
      'Crédito: ' + moeda(soma(itens, 'valor_credito')),
      'Entrada: ' + moeda(soma(itens, 'entrada'))
    ];

    if (prazo) linhas.push('Prazo médio: ' + numero(prazo) + ' meses');

    linhas.push('', '*Parcelamento*');
    faixasParcelamento(itens).forEach(function (f) {
      linhas.push(rotuloFaixa(f) + ': ' + moeda(f.valor) + (f.parcial ? ' +' : ''));
    });

    linhas.push(
      '',
      'Saldo devedor: ' + moeda(soma(itens, 'saldo_devedor')),
      'Transferência: ' + somaOuConsultar(itens, 'taxa_transferencia'),
      'Seguro de vida: ' + somaOuConsultar(itens, 'seguro'),
      '',
      '*Cotas selecionadas*'
    );

    itens.forEach(function (i) {
      linhas.push(
        'Cód: ' + i.id +
        ' — Crédito: ' + valorOuConsultar(i.valor_credito) +
        ' — Vencimento: ' + rotuloVencimento(i)
      );
    });

    linhas.push('', 'Sujeito à confirmação da administradora.', 'Marpe Corretora de Seguros — (55) 99150-4477');
    return linhas.join('\n');
  }

  /* ---------- render ---------- */

  function linha(item) {
    var id = String(item.id);
    var marcada = !!estado.selecionadas[id];
    return '' +
      '<tr data-id="' + esc(id) + '"' + (marcada ? ' class="is-selecionada"' : '') + '>' +
        '<td class="mp-td-check"><label class="mp-check-alvo"><input type="checkbox" class="mp-check-carta" data-id="' + esc(id) + '"' + (marcada ? ' checked' : '') + ' aria-label="Selecionar carta ' + esc(id) + '"></label></td>' +
        '<td>' + marcaAdm(item, 'mp-adm-img', 24) + '</td>' +
        '<td>' + selo(item) + '</td>' +
        '<td class="mp-td-num mp-forte">' + moeda(item.valor_credito) + '</td>' +
        '<td class="mp-td-num">' + moeda(item.entrada) + '</td>' +
        '<td class="mp-td-num">' + (typeof item.parcelas === 'number' ? numero(item.parcelas) + 'x' : '—') + '</td>' +
        '<td class="mp-td-num">' + moeda(item.valor_parcela) + '</td>' +
        '<td class="mp-td-num">' + moeda(item.saldo_devedor) + '</td>' +
        '<td class="mp-td-num">' + valorOuConsultar(item.taxa_transferencia) + '</td>' +
        '<td class="mp-td-num">' + valorOuConsultar(item.seguro) + '</td>' +
        '<td><span class="mp-status">' + esc(rotuloStatus(item.status)) + '</span></td>' +
        '<td class="mp-td-acoes">' +
          '<button type="button" class="mp-acao" data-copiar="' + esc(id) + '" title="Copiar dados da carta" aria-label="Copiar dados da carta ' + esc(id) + '">' + SVG_COPIA + '</button>' +
          '<a class="mp-acao mp-acao--wa" href="' + linkWhats(item) + '" target="_blank" rel="noopener noreferrer" title="Tenho interesse pelo WhatsApp" aria-label="Tenho interesse na carta ' + esc(id) + ' pelo WhatsApp">' + SVG_WA + '</a>' +
        '</td>' +
      '</tr>';
  }

  function cartao(item) {
    var id = String(item.id);
    var marcada = !!estado.selecionadas[id];
    return '' +
      '<li class="mp-carta' + (marcada ? ' is-selecionada' : '') + '" data-id="' + esc(id) + '">' +
        '<div class="mp-carta-topo">' +
          '<label class="mp-check-alvo"><input type="checkbox" class="mp-check-carta" data-id="' + esc(id) + '"' + (marcada ? ' checked' : '') + ' aria-label="Selecionar carta ' + esc(id) + '"></label>' +
          '<span class="mp-selo ' + seloClasse(item.categoria) + '">' + seloIcone(item.categoria) + esc(item.categoria) + '</span>' +
          marcaAdm(item, 'mp-carta-adm-img', 24) +
        '</div>' +
        '<div>' +
          '<div class="mp-carta-valor">' + moeda(item.valor_credito) + '</div>' +
          '<div class="mp-carta-valor-label">valor do crédito</div>' +
        '</div>' +
        '<hr class="mp-carta-linha">' +
        '<dl class="mp-carta-info">' +
          '<div><dt>Entrada</dt><dd>' + moeda(item.entrada) + '</dd></div>' +
          '<div><dt>Parcela mensal</dt><dd>' + moeda(item.valor_parcela) + '</dd></div>' +
          '<div><dt>Saldo devedor</dt><dd>' + moeda(item.saldo_devedor) + '</dd></div>' +
          '<div><dt>Taxa de transferência</dt><dd>' + moeda(item.taxa_transferencia) + '</dd></div>' +
        '</dl>' +
        '<p class="mp-carta-obs">' + esc(obsDe(item)) + '</p>' +
        '<a class="mp-carta-cta" href="' + linkWhats(item) + '" target="_blank" rel="noopener noreferrer">Tenho interesse</a>' +
      '</li>';
  }

  function esqueletoCartao() {
    return '' +
      '<li class="mp-carta mp-carta--esqueleto" aria-hidden="true">' +
        '<div class="mp-esqueleto" style="width:40%;height:22px"></div>' +
        '<div class="mp-esqueleto" style="width:65%;height:30px"></div>' +
        '<div class="mp-esqueleto" style="width:100%;height:1px"></div>' +
        '<div class="mp-esqueleto" style="width:100%;height:64px"></div>' +
        '<div class="mp-esqueleto" style="width:100%;height:46px"></div>' +
      '</li>';
  }

  function esqueletoLinhas() {
    var html = '';
    for (var i = 0; i < 8; i++) {
      html += '' +
        '<tr class="mp-linha-esqueleto" aria-hidden="true">' +
          '<td class="mp-td-check"><div class="mp-esqueleto" style="width:18px;height:18px;margin:0 auto"></div></td>' +
          '<td><div class="mp-esqueleto" style="width:130px"></div></td>' +
          '<td><div class="mp-esqueleto" style="width:74px"></div></td>' +
          '<td colspan="9"><div class="mp-esqueleto" style="width:100%"></div></td>' +
        '</tr>';
    }
    return html;
  }

  function mostrarCarregando() {
    el.vazio.hidden = true;
    el.erro.hidden = true;
    el.paginacao.hidden = true;
    el.resultado.innerHTML = '<span>Carregando cartas disponíveis…</span>';
    el.atualizado.textContent = '';
    el.checkPagina.checked = false;
    el.checkPagina.indeterminate = false;

    if (estado.visao === 'tabela') {
      el.tabelaWrap.hidden = false;
      el.grid.hidden = true;
      el.grid.innerHTML = '';
      el.tbody.innerHTML = esqueletoLinhas();
    } else {
      el.tabelaWrap.hidden = true;
      el.tbody.innerHTML = '';
      el.grid.hidden = false;
      var html = '';
      for (var i = 0; i < 6; i++) html += esqueletoCartao();
      el.grid.innerHTML = html;
    }
  }

  function valorDigitado() {
    var d = (el.valorDesejado.value || '').replace(/\D/g, '');
    return d ? Number(d) : 0;
  }

  function totalPaginas() {
    return Math.max(1, Math.ceil(estado.filtradas.length / POR_PAGINA));
  }

  function ordenar() {
    var campo = estado.ordemCampo;
    var dir = estado.ordemDir === 'asc' ? 1 : -1;
    var texto = campo === 'administradora' || campo === 'categoria';

    estado.filtradas.sort(function (a, b) {
      if (texto) {
        return dir * String(a[campo] || '').localeCompare(String(b[campo] || ''), 'pt-BR');
      }
      var va = typeof a[campo] === 'number' && isFinite(a[campo]) ? a[campo] : Infinity;
      var vb = typeof b[campo] === 'number' && isFinite(b[campo]) ? b[campo] : Infinity;
      return dir * (va - vb);
    });
  }

  function atualizarOrdemUI() {
    if (!el.thead) return;
    var ths = el.thead.querySelectorAll('th[data-campo]');
    for (var i = 0; i < ths.length; i++) {
      var th = ths[i];
      var ativo = th.getAttribute('data-campo') === estado.ordemCampo;
      th.setAttribute('aria-sort', ativo ? (estado.ordemDir === 'asc' ? 'ascending' : 'descending') : 'none');
    }
  }

  function aplicarFiltros() {
    var busca = (el.busca.value || '').trim().toLowerCase();
    var categoria = el.categoria.value;
    var adm = el.administradora.value;
    var faixa = el.valor.value;
    var desejado = valorDigitado();

    var faixaMin = 0, faixaMax = Infinity;
    if (faixa) {
      var p = faixa.split('-');
      faixaMin = Number(p[0]) || 0;
      faixaMax = Number(p[1]) || Infinity;
    }

    var desejoMin = 0, desejoMax = Infinity;
    if (desejado > 0) {
      desejoMin = Math.max(0, desejado - FOLGA);
      desejoMax = desejado + FOLGA;
    }

    var lista = estado.todas.filter(function (item) {
      if (adm && item.administradora !== adm) return false;
      if (busca) {
        var alvo = (String(item.administradora || '') + ' ' + String(item.id)).toLowerCase();
        if (alvo.indexOf(busca) === -1) return false;
      }
      if (categoria && item.categoria !== categoria) return false;
      if (typeof item.valor_credito === 'number' && (item.valor_credito < faixaMin || item.valor_credito > faixaMax)) return false;
      if (typeof item.valor_credito === 'number' && (item.valor_credito < desejoMin || item.valor_credito > desejoMax)) return false;
      return true;
    });

    if (desejado > 0) {
      el.janela.hidden = false;
      el.janela.textContent = 'Mostrando créditos entre ' + moeda(desejoMin) + ' e ' + moeda(desejoMax) +
        ' — tolerância de ' + moeda(FOLGA) + ' em torno de ' + moeda(desejado) + '.';
    } else {
      el.janela.hidden = true;
    }

    estado.filtradas = lista;
    estado.pagina = 1;
    ordenar();
    atualizarOrdemUI();
    render();
  }

  function render() {
    var total = estado.filtradas.length;

    el.erro.hidden = true;
    el.resultado.innerHTML = '<strong>' + total +
      (total === 1 ? ' carta encontrada' : ' cartas encontradas') + '</strong>';

    if (!total) {
      el.tabelaWrap.hidden = true;
      el.grid.hidden = true;
      el.tbody.innerHTML = '';
      el.grid.innerHTML = '';
      el.vazio.hidden = false;
      el.paginacao.hidden = true;
      atualizarSelecaoUI();
      return;
    }

    el.vazio.hidden = true;

    var paginas = totalPaginas();
    if (estado.pagina > paginas) estado.pagina = paginas;

    var inicio = (estado.pagina - 1) * POR_PAGINA;
    var mostrando = estado.filtradas.slice(inicio, inicio + POR_PAGINA);

    if (estado.visao === 'tabela') {
      el.tabelaWrap.hidden = false;
      el.tbody.innerHTML = mostrando.map(linha).join('');
      el.grid.hidden = true;
      el.grid.innerHTML = '';
    } else {
      el.tabelaWrap.hidden = true;
      el.tbody.innerHTML = '';
      el.grid.hidden = false;
      el.grid.innerHTML = mostrando.map(cartao).join('');
    }

    el.paginacao.hidden = paginas <= 1;
    el.pagInfo.textContent = estado.pagina + ' / ' + paginas;
    el.pagAnterior.disabled = estado.pagina <= 1;
    el.pagProxima.disabled = estado.pagina >= paginas;

    atualizarSelecaoUI();
  }

  function mostrarErro() {
    el.tabelaWrap.hidden = true;
    el.grid.hidden = true;
    el.tbody.innerHTML = '';
    el.grid.innerHTML = '';
    el.vazio.hidden = true;
    el.erro.hidden = false;
    el.paginacao.hidden = true;
    el.resultado.innerHTML = '<span>Não foi possível carregar o estoque agora.</span>';
  }

  /* ---------- avisos e seleção ---------- */

  var avisoTimer;

  function mostrarAviso(msg) {
    el.avisoTexto.textContent = msg;
    el.aviso.hidden = false;
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function () { el.aviso.hidden = true; }, 9000);
  }

  function limparAviso() {
    clearTimeout(avisoTimer);
    el.aviso.hidden = true;
  }

  function adminsDaSelecao() {
    var vistos = {};
    var lista = [];
    itensSelecionados().forEach(function (i) {
      if (i.administradora && !vistos[i.administradora]) {
        vistos[i.administradora] = true;
        lista.push(i.administradora);
      }
    });
    return lista;
  }

  /* Regra do parceiro: a junção só existe entre cotas da MESMA administradora. */
  function avisoAdminsDiferentes(admins) {
    admins.sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });
    mostrarAviso('⚠ Não é possível juntar cartas de administradoras diferentes (' + admins.join(', ') +
      '). Selecione cartas de uma mesma administradora.');
  }

  function atualizarSelecaoUI() {
    var n = Object.keys(estado.selecionadas).length;
    el.juncaoQtd.textContent = n;
    el.btnJuncao.disabled = n === 0;
    el.btnLimparSelecao.hidden = n === 0;

    var checks = document.querySelectorAll('.mp-check-carta');
    var marcados = 0;
    for (var i = 0; i < checks.length; i++) {
      var on = !!estado.selecionadas[checks[i].getAttribute('data-id')];
      checks[i].checked = on;
      if (on) marcados++;
      var linhaEl = checks[i].closest('tr, li');
      if (linhaEl) {
        if (on) linhaEl.classList.add('is-selecionada');
        else linhaEl.classList.remove('is-selecionada');
      }
    }

    if (el.checkPagina) {
      el.checkPagina.checked = checks.length > 0 && marcados === checks.length;
      el.checkPagina.indeterminate = marcados > 0 && marcados < checks.length;
    }
  }

  function limparSelecao() {
    estado.selecionadas = {};
    limparAviso();
    atualizarSelecaoUI();
  }

  function aoMarcar(ev) {
    var alvo = ev.target;
    if (!alvo || !alvo.classList || !alvo.classList.contains('mp-check-carta')) return;
    var id = alvo.getAttribute('data-id');

    if (alvo.checked) {
      var item = acharItem(id);
      var admins = adminsDaSelecao();
      if (item && admins.length && admins.indexOf(item.administradora) === -1) {
        alvo.checked = false;
        avisoAdminsDiferentes(admins.concat([item.administradora]));
        atualizarSelecaoUI();
        return;
      }
      estado.selecionadas[id] = true;
    } else {
      delete estado.selecionadas[id];
    }

    atualizarSelecaoUI();
  }

  el.tbody.addEventListener('change', aoMarcar);
  el.grid.addEventListener('change', aoMarcar);

  el.checkPagina.addEventListener('change', function () {
    var inicio = (estado.pagina - 1) * POR_PAGINA;
    var visiveis = estado.filtradas.slice(inicio, inicio + POR_PAGINA);

    if (!el.checkPagina.checked) {
      visiveis.forEach(function (item) { delete estado.selecionadas[String(item.id)]; });
      atualizarSelecaoUI();
      return;
    }

    var admins = adminsDaSelecao();
    var admRef = admins.length ? admins[0] : (visiveis[0] ? visiveis[0].administradora : null);
    var marcadas = 0;
    var outras = {};

    visiveis.forEach(function (item) {
      if (item.administradora === admRef) {
        estado.selecionadas[String(item.id)] = true;
        marcadas++;
      } else {
        outras[item.administradora] = true;
      }
    });

    var ignoradas = Object.keys(outras);
    if (ignoradas.length) {
      mostrarAviso('⚠ Esta página tem cartas de administradoras diferentes — selecionamos apenas as ' +
        marcadas + ' cartas de ' + admRef + '.');
    }

    atualizarSelecaoUI();
  });

  el.btnLimparSelecao.addEventListener('click', limparSelecao);
  el.avisoFechar.addEventListener('click', limparAviso);

  /* ---------- visão (tabela x cartões) ---------- */

  function definirVisao(visao, silencioso) {
    estado.visao = visao;
    var tabela = visao === 'tabela';
    el.btnVisaoTabela.classList.toggle('is-ativo', tabela);
    el.btnVisaoCards.classList.toggle('is-ativo', !tabela);
    el.btnVisaoTabela.setAttribute('aria-pressed', tabela ? 'true' : 'false');
    el.btnVisaoCards.setAttribute('aria-pressed', tabela ? 'false' : 'true');
    if (!silencioso) render();
  }

  el.btnVisaoTabela.addEventListener('click', function () { definirVisao('tabela'); });
  el.btnVisaoCards.addEventListener('click', function () { definirVisao('cards'); });

  var mqMobile = window.matchMedia(MOBILE);
  if (mqMobile.addEventListener) {
    mqMobile.addEventListener('change', function () {
      definirVisao(mqMobile.matches ? 'cards' : 'tabela');
    });
  }

  /* ---------- paginação ---------- */

  function irParaPagina(p) {
    if (p < 1 || p > totalPaginas() || p === estado.pagina) return;
    estado.pagina = p;
    render();
    if (el.topo) el.topo.scrollIntoView({ block: 'start' });
  }

  el.pagAnterior.addEventListener('click', function () { irParaPagina(estado.pagina - 1); });
  el.pagProxima.addEventListener('click', function () { irParaPagina(estado.pagina + 1); });

  /* ---------- junção ---------- */

  function preencherJuncao(itens) {
    var total = itens.length;
    var categorias = unicos(itens, 'categoria');
    var admins = unicos(itens, 'administradora');
    var prazo = prazoMedio(itens);

    el.juncaoTitulo.textContent = 'Resultado da Junção (' + total + (total === 1 ? ' cota)' : ' cotas)');

    function itemResumo(rotulo, valor, classe, destaque) {
      return '<div' + (destaque ? ' class="mp-juncao-destaque"' : '') + '>' +
        '<dt>' + esc(rotulo) + '</dt>' +
        '<dd' + (classe ? ' class="' + classe + '"' : '') + '>' + esc(valor) + '</dd></div>';
    }

    el.juncaoResumo.innerHTML =
      itemResumo('Segmento', categorias.length === 1 ? categorias[0] : 'Misto') +
      itemResumo('Administradora', admins.length === 1 ? admins[0] : 'Múltiplas') +
      itemResumo('Crédito', moeda(soma(itens, 'valor_credito')), '', true) +
      itemResumo('Entrada', moeda(soma(itens, 'entrada')), 'mp-juncao-verde') +
      itemResumo('Prazo médio', prazo ? numero(prazo) + ' meses' : '—');

    var faixas = faixasParcelamento(itens);
    el.juncaoFaixas.innerHTML = faixas.map(function (f) {
      return '<li><span>' + esc(rotuloFaixa(f)) + '</span><span class="mp-juncao-val">' +
        moeda(f.valor) + (f.parcial ? ' +' : '') + '</span></li>';
    }).join('');

    el.juncaoRodape.innerHTML =
      itemResumo('Saldo devedor', moeda(soma(itens, 'saldo_devedor'))) +
      itemResumo('Transferência', somaOuConsultar(itens, 'taxa_transferencia')) +
      itemResumo('Seguro de vida', somaOuConsultar(itens, 'seguro'));

    el.juncaoCotas.innerHTML = itens.map(function (i) {
      return '<li><strong>Cód: ' + esc(String(i.id)) + '</strong> — Crédito: <strong>' +
        moeda(i.valor_credito) + '</strong> — Vencimento: <strong>' +
        esc(rotuloVencimento(i)) +
        '</strong></li>';
    }).join('');

    el.juncaoWa.href = WA_BASE + encodeURIComponent(textoVendas(itens));
  }

  function abrirJuncao() {
    var itens = itensSelecionados();
    if (!itens.length) return;
    var admins = adminsDaSelecao();
    if (admins.length > 1) {
      avisoAdminsDiferentes(admins);
      return;
    }
    preencherJuncao(itens);
    if (typeof el.juncaoModal.showModal === 'function') {
      el.juncaoModal.showModal();
      document.body.classList.add('mp-modal-aberto');
    } else {
      el.juncaoModal.setAttribute('open', '');
    }
  }

  function fecharJuncao() {
    if (typeof el.juncaoModal.close === 'function') el.juncaoModal.close();
    else el.juncaoModal.removeAttribute('open');
  }

  el.btnJuncao.addEventListener('click', abrirJuncao);
  el.juncaoFechar.addEventListener('click', fecharJuncao);
  el.juncaoModal.addEventListener('close', function () {
    document.body.classList.remove('mp-modal-aberto');
  });
  el.juncaoModal.addEventListener('click', function (ev) {
    if (ev.target === el.juncaoModal) fecharJuncao();
  });
  el.juncaoCopiar.addEventListener('click', function () {
    var itens = itensSelecionados();
    if (itens.length) copiar(textoVendas(itens), 'Texto de vendas copiado');
  });

  /* ---------- cópia e aviso ---------- */

  function copiar(texto, msg) {
    function ok() { mostrarToast(msg); }
    function alternativa() {
      var ta = document.createElement('textarea');
      ta.value = texto;
      ta.setAttribute('readonly', '');
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); ok(); } catch (e) { /* silencioso */ }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(texto).then(ok, alternativa);
    } else {
      alternativa();
    }
  }

  var toastTimer;
  function mostrarToast(msg) {
    el.toast.textContent = msg;
    el.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { el.toast.hidden = true; }, 2600);
  }

  function aoCopiar(ev) {
    var btn = ev.target && ev.target.closest ? ev.target.closest('[data-copiar]') : null;
    if (!btn) return;
    var item = acharItem(btn.getAttribute('data-copiar'));
    if (item) copiar(textoDetalhe(item), 'Dados da carta copiados');
  }

  el.tbody.addEventListener('click', aoCopiar);
  el.grid.addEventListener('click', aoCopiar);

  /* ---------- dica (tooltip) do logo da administradora ---------- */

  var dica = document.getElementById('mp-dica');

  function posicionarDica(x, y) {
    var margem = 8;
    dica.style.left = '0px';
    dica.style.top = '0px';
    var largura = dica.offsetWidth;
    var altura = dica.offsetHeight;
    var left = Math.min(x + 14, window.innerWidth - largura - margem);
    var top = y + 18;
    if (top + altura > window.innerHeight - margem) top = y - altura - 14;
    dica.style.left = Math.max(margem, left) + 'px';
    dica.style.top = Math.max(margem, top) + 'px';
  }

  function esconderDica() {
    if (dica) dica.hidden = true;
  }

  function marcaSob(ev) {
    return ev.target && ev.target.classList && ev.target.classList.contains('mp-marca-adm') ? ev.target : null;
  }

  if (dica && window.matchMedia('(hover: hover)').matches) {
    [el.tabelaWrap, el.grid].forEach(function (cont) {
      cont.addEventListener('mouseover', function (ev) {
        var img = marcaSob(ev);
        if (!img) return;
        dica.textContent = img.alt;
        dica.hidden = false;
        posicionarDica(ev.clientX, ev.clientY);
      });
      cont.addEventListener('mousemove', function (ev) {
        if (!marcaSob(ev)) { esconderDica(); return; }
        if (!dica.hidden) posicionarDica(ev.clientX, ev.clientY);
      });
      cont.addEventListener('mouseout', function (ev) {
        if (marcaSob(ev)) esconderDica();
      });
    });
    window.addEventListener('scroll', esconderDica, true);
  }

  /* ---------- ordenação por coluna ---------- */

  if (el.thead) {
    el.thead.addEventListener('click', function (ev) {
      var th = ev.target && ev.target.closest ? ev.target.closest('th[data-campo]') : null;
      if (!th) return;
      var campo = th.getAttribute('data-campo');
      if (estado.ordemCampo === campo) {
        estado.ordemDir = estado.ordemDir === 'asc' ? 'desc' : 'asc';
      } else {
        estado.ordemCampo = campo;
        estado.ordemDir = 'asc';
      }
      estado.pagina = 1;
      ordenar();
      atualizarOrdemUI();
      render();
    });
  }

  /* ---------- dados ---------- */

  function preencherAdministradoras() {
    var lista = unicos(estado.todas.map(function (i) {
      return { administradora: i.administradora };
    }), 'administradora').sort(function (a, b) { return a.localeCompare(b, 'pt-BR'); });

    el.administradora.innerHTML = '<option value="">Todas as administradoras</option>' +
      lista.map(function (nome) {
        return '<option value="' + esc(nome) + '">' + esc(nome) + '</option>';
      }).join('');
  }

  function carregar() {
    mostrarCarregando();
    fetch(ARQUIVO)
      .then(function (r) {
        if (!r.ok) throw new Error('HTTP ' + r.status);
        return r.json();
      })
      .then(function (dados) {
        estado.todas = Array.isArray(dados.itens) ? dados.itens : [];

        var imoveis = 0, veiculos = 0;
        estado.todas.forEach(function (i) {
          if (i.categoria === 'Imóvel') imoveis++;
          else if (i.categoria === 'Veículo') veiculos++;
        });

        el.statTotal.textContent = estado.todas.length + ' cartas disponíveis';
        el.statImovel.textContent = imoveis + ' imóveis';
        el.statVeiculo.textContent = veiculos + ' veículos';

        if (dados.atualizado_em) {
          try {
            var d = new Date(dados.atualizado_em);
            var str = d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
            el.statAtualizado.textContent = 'Atualizado em ' + str;
            el.atualizado.textContent = 'atualizado em ' + str;
          } catch (e) { /* mantém vazio */ }
        }

        preencherAdministradoras();
        aplicarFiltros();
      })
      .catch(function () {
        mostrarErro();
      });
  }

  /* ---------- eventos de filtro ---------- */

  var debounce;
  el.busca.addEventListener('input', function () {
    clearTimeout(debounce);
    debounce = setTimeout(aplicarFiltros, 250);
  });
  el.valorDesejado.addEventListener('input', function () {
    var d = el.valorDesejado.value.replace(/\D/g, '');
    el.valorDesejado.value = d ? Number(d).toLocaleString('pt-BR') : '';
    clearTimeout(debounce);
    debounce = setTimeout(aplicarFiltros, 250);
  });
  el.categoria.addEventListener('change', aplicarFiltros);
  el.administradora.addEventListener('change', aplicarFiltros);
  el.valor.addEventListener('change', aplicarFiltros);

  function limparFiltros() {
    el.busca.value = '';
    el.categoria.value = '';
    el.administradora.value = '';
    el.valor.value = '';
    el.valorDesejado.value = '';
    el.janela.hidden = true;
    estado.ordemCampo = 'entrada';
    estado.ordemDir = 'asc';
    atualizarOrdemUI();
    aplicarFiltros();
  }

  el.limpar.addEventListener('click', limparFiltros);
  var vazioLimpar = document.getElementById('vazio-limpar');
  if (vazioLimpar) vazioLimpar.addEventListener('click', limparFiltros);

  var tentar = document.getElementById('btn-tentar');
  if (tentar) tentar.addEventListener('click', carregar);

  /* ---------- início ---------- */

  definirVisao(mqMobile.matches ? 'cards' : 'tabela', true);
  atualizarOrdemUI();
  carregar();
})();
