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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    cards.forEach(function (card, index) {
      card.style.setProperty('--card-delay', Math.min(index * 70, 420) + 'ms');
      card.classList.add('index-card--pending');
    });

    var revealCard = function (entry) {
      entry.target.classList.remove('index-card--pending');
      entry.target.classList.add('index-card--visible');
    };

    if ('IntersectionObserver' in window) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) {
            return;
          }
          revealCard(entry);
          observer.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });

      cards.forEach(function (card) {
        observer.observe(card);
      });
    } else {
      cards.forEach(function (card) {
        revealCard({ target: card });
      });
    }
  }
})();
