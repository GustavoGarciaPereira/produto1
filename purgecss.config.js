// PurgeCSS — regenera css/style.min.css a partir do próprio min + conteúdo do site.
// Uso: npx --yes purgecss --config purgecss.config.js
// Safelist cobre classes adicionadas em runtime por JS (rd-navbar, swiper, wow, modais, device.js...).
module.exports = {
  content: ['index.html', 'js/*.js'],
  css: ['css/style.min.css'],
  output: 'css/style.min.css',
  safelist: {
    standard: [
      'active', 'focus', 'opened', 'loaded', 'not-animated', 'animated', 'lazy-loaded',
      'desktop', 'mac-os', 'ie-10', 'ie-11', 'ie-edge', 'lt-ie-10',
      'show', 'in', 'fade', 'collapse', 'collapsing', 'collapsed',
      'modal', 'modal-open', 'modal-backdrop', 'modal-dialog', 'modal-content',
      'modal-header', 'modal-body', 'modal-footer', 'modal-title', 'close',
      'sr-only', 'sr-only-focusable', 'copyright-year', 'g-recaptcha-response',
      'toggle-cloned', 'toggle-cloned-elements', 'toggle-original', 'toggle-original-elements'
    ],
    greedy: [
      /^rd-nav/, /^swiper/, /^owl-/, /^wow$/, /^animated$/, /^slideIn/, /^fadeIn/, /^fadeOut/, /^zoomIn/,
      /^preloader/, /^loadingProgress/, /^page-transition/, /^novi-/, /^btn-/, /^col-/, /^row-/, /^container/,
      /^text-/, /^font-/, /^bg-/, /^offset-/, /^section-/, /^list-/, /^unit-/, /^icon-/, /^button-/,
      /^thumbnail-/, /^title-/, /^heading-/, /^link-/, /^footer-/, /^foter-/, /^brand$/, /^rights$/,
      /^justify-content-/, /^align-items-/, /^d-flex$/, /^flex-/, /^jumbotron-/, /^box-/, /^big$/, /^small$/,
      /^snackbars/, /^ui-to-top/, /^toggle-/, /^gm-style/
    ]
  }
};
