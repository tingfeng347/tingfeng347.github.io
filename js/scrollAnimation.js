// Homepage wallpaper: copy banner background to #web_bg and allow users to disable fullscreen mode.
(function () {
  var cards = document.querySelectorAll('.index-card');
  if (cards.length) {
    var wallpaperStorageKey = 'homepage-wallpaper-fullscreen';
    var banner = document.getElementById('banner');
    var webBg = document.getElementById('web_bg');
    if (banner && webBg) {
      var bannerBg = banner.style.backgroundImage;
      var originalBannerStyle = banner.getAttribute('style') || '';
      if (!bannerBg) {
        var computedBg = window.getComputedStyle(banner).backgroundImage;
        if (computedBg && computedBg !== 'none') {
          bannerBg = computedBg;
        }
      }

      function setFullscreenWallpaper(enabled) {
        if (enabled && bannerBg && bannerBg !== 'none') {
          webBg.style.backgroundImage = bannerBg;
          banner.style.background = 'transparent';
        } else {
          webBg.style.backgroundImage = 'none';
          banner.setAttribute('style', originalBannerStyle);
        }

        document.documentElement.classList.toggle('homepage-wallpaper-disabled', !enabled);
        localStorage.setItem(wallpaperStorageKey, enabled ? '1' : '0');
        return enabled;
      }

      window.HomepageWallpaper = {
        isFullscreen: function () {
          return localStorage.getItem(wallpaperStorageKey) !== '0';
        },
        setFullscreen: setFullscreenWallpaper
      };

      if (bannerBg && bannerBg !== 'none') {
        setFullscreenWallpaper(localStorage.getItem(wallpaperStorageKey) !== '0');
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
