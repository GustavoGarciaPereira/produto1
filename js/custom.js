/* ============================================================
   Marpe Seguros — JS customizado (extraído do index.html)
   Carregado com defer APÓS jQuery, Bootstrap e Swiper legacy.
   Blocos: 1) geração dos modais de cotação  2) fallback do preloader
           3) carrossel de destaques (Swiper 3) + acessibilidade
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {
      const modals = [
        { id: 'myModalAuto',      labelId: 'modalLabelAuto',       title: 'Cotação — Seguro Auto',        iframeTitle: 'Formulário de cotação — Seguro Auto',        src: 'https://marpe.corretordigital.site/#/formularios/auto' },
        { id: 'motoModal',        labelId: 'modalLabelMoto',       title: 'Cotação — Seguro de Moto',     iframeTitle: 'Formulário de cotação — Seguro de Moto',     src: 'https://marpe.corretordigital.site/#/formularios/moto' },
        { id: 'caminhaoModal',    labelId: 'modalLabelCaminhao',   title: 'Cotação — Seguro de Caminhão', iframeTitle: 'Formulário de cotação — Seguro de Caminhão', src: 'https://marpe.corretordigital.site/#/formularios/caminhao' },
        { id: 'agricolaModal',    labelId: 'modalLabelAgricola',   title: 'Seguro Agrícola e Propriedade Rural', whatsapp: true, waLink: 'https://wa.me/55991504477?text=Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20Seguro%20Agr%C3%ADcola', texto: 'Proteja sua lavoura contra seca, geada, granizo e outros imprevistos do campo. Atendimento para o produtor de São Sepé e região.' },
        { id: 'residencialModal', labelId: 'modalLabelResidencial',title: 'Cotação — Seguro Residencial', iframeTitle: 'Formulário de cotação — Seguro Residencial', src: 'https://marpe.corretordigital.site/#/formularios/residencial' },
        { id: 'condominioModal',  labelId: 'modalLabelCondominio', title: 'Cotação — Seguro de Condomínio',iframeTitle: 'Formulário de cotação — Seguro de Condomínio',src: 'https://marpe.corretordigital.site/#/formularios/condominio' },
        { id: 'empresarialModal', labelId: 'modalLabelEmpresarial',title: 'Cotação — Seguro Empresarial', iframeTitle: 'Formulário de cotação — Seguro Empresarial', src: 'https://marpe.corretordigital.site/#/formularios/empresarial' },
        { id: 'vidaModal',        labelId: 'modalLabelVida',       title: 'Cotação — Seguro de Vida',     iframeTitle: 'Formulário de cotação — Seguro de Vida',     src: 'https://marpe.corretordigital.site/#/formularios/vida' },
        { id: 'diversosModal',    labelId: 'modalLabelDiversos',   title: 'Cotação — Seguros Diversos',   iframeTitle: 'Formulário de cotação — Seguros Diversos',   src: 'https://marpe.corretordigital.site/#/formularios/diversos' },
        { id: 'consorcioModal',   labelId: 'modalLabelConsorcio',  title: 'Cotação — Consórcios',         iframeTitle: 'Formulário de cotação — Consórcios',         src: 'https://marpe.corretordigital.site/#/formularios/consorcio' },
        { id: 'creditoModal',     labelId: 'modalLabelCredito',    title: 'Cotação — Crédito',            iframeTitle: 'Formulário de cotação — Crédito',            src: 'https://marpe.corretordigital.site/#/formularios/credito' },
        { id: 'saudeModal',       labelId: 'modalLabelSaude',      title: 'Plano de Saúde e Odontológico', whatsapp: true, waLink: 'https://wa.me/55991504477?text=Gostaria%20de%20mais%20informa%C3%A7%C3%B5es%20sobre%20Plano%20de%20Sa%C3%BAde', texto: 'Encontre o plano de saúde ideal para você e sua família, com as melhores operadoras do mercado.' }
      ];

      const container = document.getElementById('modals-container');

      modals.forEach(function(modal) {
        const el = document.createElement('div');
        el.className = 'modal fade';
        el.id = modal.id;
        el.setAttribute('tabindex', '-1');
        el.setAttribute('aria-labelledby', modal.labelId);
        el.setAttribute('aria-hidden', 'true');

        const dialog = document.createElement('div');
        dialog.className = 'modal-dialog modal-square';

        const content = document.createElement('div');
        content.className = 'modal-content';

        const header = document.createElement('div');
        header.className = 'modal-header';
        header.innerHTML =
          '<h5 class="modal-title" id="' + modal.labelId + '">' + modal.title + '</h5>' +
          '<button type="button" class="close" data-dismiss="modal" aria-label="Fechar"><span aria-hidden="true">&times;</span></button>';

        const body = document.createElement('div');
        body.className = 'modal-body';
        let iframe = null;

        if (modal.whatsapp) {
          // Modal com CTA para WhatsApp (padrão Instagram/Linktree) — sem iframe externo
          const cta = document.createElement('div');
          cta.className = 'modal-whatsapp-cta';
          cta.innerHTML =
            '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>' +
            '<h6>Fale com um especialista</h6>' +
            '<p>' + (modal.texto || 'Fale com um especialista da Marpe e receba uma proposta sob medida para você.') + '</p>' +
            '<a class="btn-wa-cta" href="' + modal.waLink + '" target="_blank" rel="noopener noreferrer">Cotar pelo WhatsApp</a>' +
            '<small>Atendimento pelo WhatsApp — resposta rápida</small>';
          body.appendChild(cta);
        } else {
          iframe = document.createElement('iframe');
          iframe.title = modal.iframeTitle;
          // sandbox removido — corretordigital.site é serviço próprio via HTTPS e o Angular requer permissões amplas
          // src não é definido aqui — lazy load via evento shown.bs.modal
          body.appendChild(iframe);
        }

        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        footer.innerHTML = '<button type="button" class="btn btn-secondary" data-dismiss="modal">Fechar</button>';

        content.appendChild(header);
        content.appendChild(body);
        content.appendChild(footer);
        dialog.appendChild(content);
        el.appendChild(dialog);
        container.appendChild(el);

        if (iframe) {
          // Lazy load: injeta src APÓS animação completar, limpa ao fechar (destrói reCAPTCHA/Angular)
          // Usa jQuery porque Bootstrap 4 emite eventos de modal via $.fn.trigger, não via dispatchEvent
          $(el).on('shown.bs.modal', function() {
            if (!iframe.src || iframe.src === window.location.href) {
              iframe.src = modal.src;
            }
          });
          $(el).on('hidden.bs.modal', function() {
            iframe.src = '';
          });
        }
      }); // fim modals.forEach
      }); // fim DOMContentLoaded
    
    
      // Fallback: esconde o preloader em até 2,5s mesmo se window.load demorar (rede lenta/CDN)
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() {
          var preloader = document.querySelector('.preloader');
          if (preloader && !preloader.classList.contains('loaded')) {
            preloader.classList.add('loaded');
          }
        }, 2500);
      });
    
    
      // Carrossel de destaques — bundle local é Swiper 3 (params planos, não API de objetos do Swiper 5+)
      document.addEventListener('DOMContentLoaded', function() {
        if (typeof Swiper === 'function' && document.querySelector('.destaques-swiper .swiper-slide')) {
          new Swiper('.destaques-swiper', {
            loop: true,
            speed: 600,
            simulateTouch: true,
            preventClicks: true,
            autoplay: 6500,
            autoplayDisableOnInteraction: false,
            pagination: '.destaques-pagination',
            paginationClickable: true,
            nextButton: '.destaques-next',
            prevButton: '.destaques-prev',
            keyboardControl: true
          });

          // Dica de swipe some no primeiro toque
          var hint = document.querySelector('.destaques-hint');
          var carousel = document.querySelector('.destaques-swiper');
          if (hint && carousel) {
            carousel.addEventListener('touchstart', function esconde() {
              if (hint) hint.style.opacity = '0';
              carousel.removeEventListener('touchstart', esconde);
            }, { passive: true });
          }
        }

        // Acessibilidade: Swiper clona slides no modo loop (h1 duplicado + foco repetido)
        // — esconde os clones de leitores de tela e do tab
        setTimeout(function() {
          document.querySelectorAll('.swiper-slide-duplicate').forEach(function(slide) {
            slide.setAttribute('aria-hidden', 'true');
            slide.querySelectorAll('a, button').forEach(function(el) {
              el.setAttribute('tabindex', '-1');
            });
          });
        }, 100);
      });

