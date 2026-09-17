/* ============================================================
   Marpe Seguros — Tela "Cartas Contempladas"
   Lê o estoque de data/cartas.json, aplica filtros, renderiza os
   cards e o "carregar mais".

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

  var el = {
    grid: document.getElementById('cartas-grid'),
    vazio: document.getElementById('estado-vazio'),
    erro: document.getElementById('estado-erro'),
    busca: document.getElementById('f-busca'),
    categoria: document.getElementById('f-categoria'),
    valor: document.getElementById('f-valor'),
    valorDesejado: document.getElementById('f-valor-desejado'),
    janela: document.getElementById('f-janela'),
    ordem: document.getElementById('f-ordem'),
    limpar: document.getElementById('f-limpar'),
    resultado: document.getElementById('f-resultado'),
    atualizado: document.getElementById('f-atualizado'),
    mais: document.getElementById('btn-mais'),
    maisInfo: document.getElementById('mais-info'),
    statTotal: document.getElementById('stat-total'),
    statImovel: document.getElementById('stat-imovel'),
    statVeiculo: document.getElementById('stat-veiculo'),
    statAtualizado: document.getElementById('stat-atualizado')
  };

  var estado = { todas: [], filtradas: [], visiveis: POR_PAGINA };

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
      'Vencimento: ' + (typeof item.vencimento_dia === 'number' ? 'dia ' + item.vencimento_dia : 'A Consultar'),
      '',
      'Código da carta: #' + item.id
    );

    return WA_BASE + encodeURIComponent(linhas.join('\n'));
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
    return categoria === 'Veículo' ? 'mp-carta-selo--veiculo' : 'mp-carta-selo--imovel';
  }

  /* ---------- render ---------- */

  function cartao(item) {
    return '' +
      '<li class="mp-carta">' +
        '<div class="mp-carta-topo">' +
          '<span class="mp-carta-selo ' + seloClasse(item.categoria) + '">' + esc(item.categoria) + '</span>' +
          '<span class="mp-carta-adm">' + esc(item.administradora) + '</span>' +
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

  function esqueleto() {
    return '' +
      '<li class="mp-carta mp-carta--esqueleto" aria-hidden="true">' +
        '<div class="mp-esqueleto" style="width:40%;height:22px"></div>' +
        '<div class="mp-esqueleto" style="width:65%;height:30px"></div>' +
        '<div class="mp-esqueleto" style="width:100%;height:1px"></div>' +
        '<div class="mp-esqueleto" style="width:100%;height:64px"></div>' +
        '<div class="mp-esqueleto" style="width:100%;height:46px"></div>' +
      '</li>';
  }

  function mostrarCarregando() {
    var html = '';
    for (var i = 0; i < 6; i++) html += esqueleto();
    el.grid.innerHTML = html;
    el.grid.hidden = false;
    el.vazio.hidden = true;
    el.erro.hidden = true;
    el.mais.parentNode.hidden = true;
    el.resultado.innerHTML = '<span>Carregando cartas disponíveis…</span>';
    el.atualizado.textContent = '';
  }

  function valorDigitado() {
    var d = (el.valorDesejado.value || '').replace(/\D/g, '');
    return d ? Number(d) : 0;
  }

  function aplicarFiltros() {
    var busca = (el.busca.value || '').trim().toLowerCase();
    var categoria = el.categoria.value;
    var faixa = el.valor.value;
    var ordem = el.ordem.value;
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
      if (busca && String(item.administradora || '').toLowerCase().indexOf(busca) === -1) return false;
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

    lista.sort(function (a, b) {
      if (ordem === 'parcela') return (a.valor_parcela || 0) - (b.valor_parcela || 0);
      if (ordem === 'credito-desc') return (b.valor_credito || 0) - (a.valor_credito || 0);
      if (ordem === 'credito-asc') return (a.valor_credito || 0) - (b.valor_credito || 0);
      return (a.entrada || 0) - (b.entrada || 0);
    });

    estado.filtradas = lista;
    estado.visiveis = POR_PAGINA;
    renderizar();
  }

  function renderizar() {
    var mostrando = estado.filtradas.slice(0, estado.visiveis);

    el.erro.hidden = true;
    el.resultado.innerHTML = '<strong>' + estado.filtradas.length +
      (estado.filtradas.length === 1 ? ' carta encontrada' : ' cartas encontradas') + '</strong>';

    if (!estado.filtradas.length) {
      el.grid.innerHTML = '';
      el.grid.hidden = true;
      el.vazio.hidden = false;
      el.mais.parentNode.hidden = true;
      return;
    }

    el.vazio.hidden = true;
    el.grid.hidden = false;
    el.grid.innerHTML = mostrando.map(cartao).join('');

    var restantes = estado.filtradas.length - mostrando.length;
    el.mais.parentNode.hidden = restantes <= 0;
    el.maisInfo.textContent = restantes > 0
      ? 'mostrando ' + mostrando.length + ' de ' + estado.filtradas.length
      : 'todas as cartas exibidas';
  }

  function mostrarErro() {
    el.grid.innerHTML = '';
    el.grid.hidden = true;
    el.vazio.hidden = true;
    el.erro.hidden = false;
    el.resultado.innerHTML = '<span>Não foi possível carregar o estoque agora.</span>';
  }

  /* ---------- dados ---------- */

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

        aplicarFiltros();
      })
      .catch(function () {
        mostrarErro();
      });
  }

  /* ---------- eventos ---------- */

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
  el.valor.addEventListener('change', aplicarFiltros);
  el.ordem.addEventListener('change', aplicarFiltros);

  function limparFiltros() {
    el.busca.value = '';
    el.categoria.value = '';
    el.valor.value = '';
    el.valorDesejado.value = '';
    el.janela.hidden = true;
    el.ordem.value = 'entrada';
    aplicarFiltros();
  }

  el.limpar.addEventListener('click', limparFiltros);
  var vazioLimpar = document.getElementById('vazio-limpar');
  if (vazioLimpar) vazioLimpar.addEventListener('click', limparFiltros);

  el.mais.addEventListener('click', function () {
    estado.visiveis += POR_PAGINA;
    renderizar();
  });

  var tentar = document.getElementById('btn-tentar');
  if (tentar) tentar.addEventListener('click', carregar);

  carregar();
})();
