// Homepage full-screen wallpaper: copy banner background to #web_bg for seamless fixed wallpaper
(function () {
  var cards = document.querySelectorAll('.index-card');
  if (cards.length) {
    // We're on the homepage - set up the full-screen wallpaper
    var banner = document.getElementById('banner');
    var webBg = document.getElementById('web_bg');
    if (banner && webBg) {
      var bannerBg = banner.style.backgroundImage;
      if (!bannerBg) {
        // Try to get background from computed style
        var computedBg = window.getComputedStyle(banner).backgroundImage;
        if (computedBg && computedBg !== 'none') {
          bannerBg = computedBg;
        }
      }
      if (bannerBg && bannerBg !== 'none') {
        webBg.style.backgroundImage = bannerBg;
        // Make banner transparent so web_bg shows through without seams
        banner.style.background = 'transparent';
      }
    }

    // Scroll animation for cards
    document.querySelector('.row').setAttribute('style', 'overflow: hidden;');
    var coefficient = document.documentElement.clientWidth > 768 ? 0.5 : 0.3;
    var origin = document.documentElement.clientHeight - cards[0].getBoundingClientRect().height * coefficient;

    function throttle(fn, wait) {
      var timer = null;
      return function () {
        var context = this;
        var args = arguments;
        if (!timer) {
          timer = setTimeout(function () {
            fn.apply(context, args);
            timer = null;
          }, wait);
        }
      };
    }

    function handle() {
      cards.forEach(function (card) {
        card.setAttribute('style', '--state: ' + ((card.getBoundingClientRect().top - origin) < 0 ? 1 : 0) + ';');
      });
    }

    document.addEventListener('scroll', throttle(handle, 100));
  }
})();
