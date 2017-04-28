'use strict';

module.exports = {
  client: {
    lib: {
      css: [
        // bower:css
        'public/lib/bootstrap/dist/css/bootstrap.min.css',
        'public/lib/bootstrap/dist/css/bootstrap-theme.min.css',
        'public/lib/angular-material/angular-material.min.css',
        'public/lib/font-awesome/css/font-awesome.min.css',
        'public/lib/OwlCarousel/owl-carousel/owl.carousel.css',
        'public/lib/OwlCarousel/owl-carousel/owl.theme.css',
        'public/lib/mdPickers/dist/mdPickers.min.css',
        'public/lib/angular-print/angularPrint.css'
        // endbower
      ],
      js: [
        // bower:js
        'public/lib/jquery/dist/jquery.min.js',
        'public/lib/angular/angular.min.js',
        //'public/lib/angular-aria/angular-aria.min.js',
        'public/lib/angular-resource/angular-resource.min.js',
        'public/lib/angular-animate/angular-animate.min.js',
        'public/lib/angular-material/angular-material.min.js',
        'public/lib/angular-messages/angular-messages.min.js',
        'public/lib/angular-ui-router/release/angular-ui-router.min.js',
        'public/lib/angular-bootstrap/ui-bootstrap-tpls.min.js',
        'public/lib/angular-file-upload/dist/angular-file-upload.min.js',
        'public/lib/owasp-password-strength-test/owasp-password-strength-test.js',
        'public/lib/angular-io-barcode/build/angular-io-barcode.min.js',
        'public/lib/OwlCarousel/owl-carousel/owl.carousel.min.js',
        'public/lib/mdPickers/dist/mdPickers.min.js',
        'public/lib/moment/min/moment.min.js',
        'public/lib/angular-print/angularPrint.js'
        // endbower
      ]
    },
    css: 'public/dist/application.min.css',
    js: 'public/dist/application.min.js'
  }
};
