(function() {
  'use strict';

  var startAt = new Date('2023-10-07T20:53:53+08:00').getTime();
  var tocActiveLockUntil = 0;

  function pad(value) {
    return String(value).padStart(2, '0');
  }

  function updateRuntime() {
    var runtime = document.getElementById('site-runtime');
    var year = document.getElementById('site-footer-year');
    if (!runtime) {
      return;
    }

    var elapsedSeconds = Math.max(0, Math.floor((Date.now() - startAt) / 1000));
    var days = Math.floor(elapsedSeconds / 86400);
    var hours = Math.floor(elapsedSeconds % 86400 / 3600);
    var minutes = Math.floor(elapsedSeconds % 3600 / 60);
    var seconds = elapsedSeconds % 60;

    runtime.textContent = days + ' 天 ' + pad(hours) + ' 时 ' + pad(minutes) + ' 分 ' + pad(seconds) + ' 秒';
    if (year) {
      year.textContent = '2023-' + new Date().getFullYear();
    }
  }

  function placeStatistics() {
    var statistics = document.querySelector('.footer-inner > .statistics');
    var target = document.getElementById('site-footer-statistics');
    if (statistics && target) {
      target.appendChild(statistics);
    }
  }

  function decodeHash(hash) {
    try {
      return decodeURIComponent(hash.replace(/^#/, ''));
    } catch (error) {
      return hash.replace(/^#/, '');
    }
  }

  function setCustomTocActive(link) {
    var toc = document.getElementById('toc-body');
    if (!toc || !link) {
      return;
    }

    toc.classList.add('toc-custom-sync');
    toc.querySelectorAll('a.tocbot-link').forEach(function(item) {
      var isActive = item === link;
      item.classList.toggle('toc-custom-active', isActive);
      var listItem = item.closest('.toc-list-item');
      if (listItem) {
        listItem.classList.toggle('toc-custom-active-item', isActive);
      }
    });
  }

  function syncTocActiveState() {
    if (Date.now() < tocActiveLockUntil) {
      return;
    }

    var links = Array.from(document.querySelectorAll('#toc-body a.tocbot-link'));
    if (links.length === 0) {
      return;
    }

    var navbar = document.getElementById('navbar');
    var threshold = (navbar ? navbar.getBoundingClientRect().height : 0) + 24;
    var activeLink = links[0];

    links.forEach(function(link) {
      var heading = document.getElementById(decodeHash(link.hash));
      if (heading && heading.getBoundingClientRect().top <= threshold) {
        activeLink = link;
      }
    });

    setCustomTocActive(activeLink);
  }

  function bindTocActiveState() {
    var ticking = false;
    window.addEventListener('scroll', function() {
      if (ticking) {
        return;
      }
      ticking = true;
      window.requestAnimationFrame(function() {
        syncTocActiveState();
        ticking = false;
      });
    }, { passive: true });
    window.setTimeout(syncTocActiveState, 500);
  }

  function disableTocbotAutoSync() {
    var attempts = 0;
    var timer = window.setInterval(function() {
      attempts += 1;
      var toc = document.getElementById('toc-body');
      if (!toc || !window.tocbot || toc.querySelectorAll('.tocbot-link').length === 0) {
        if (attempts >= 50) {
          window.clearInterval(timer);
        }
        return;
      }

      window.clearInterval(timer);
      var renderedToc = toc.innerHTML;
      window.tocbot.destroy();
      toc.innerHTML = renderedToc;
      window.tocbot.refresh = function() {};
      syncTocActiveState();
    }, 100);
  }

  function bindTocAnchorNavigation() {
    document.addEventListener('click', function(event) {
      var link = event.target.closest('#toc-body a.tocbot-link');
      if (!link || !link.hash) {
        return;
      }

      var target = document.getElementById(decodeHash(link.hash));
      if (!target) {
        return;
      }

      event.preventDefault();
      event.stopImmediatePropagation();

      var navbar = document.getElementById('navbar');
      var navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      var top = window.scrollY + target.getBoundingClientRect().top - navbarHeight - 12;
      tocActiveLockUntil = Date.now() + 900;
      setCustomTocActive(link);
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
      window.history.replaceState(null, '', '#' + encodeURIComponent(target.id));
    }, true);
  }

  function bindTocVisibility() {
    var sidebar = document.querySelector('.side-col:last-child .sidebar');
    var board = document.getElementById('board-ctn');
    if (!sidebar || !board) {
      return;
    }

    function updateTocVisibility() {
      var navbar = document.getElementById('navbar');
      var navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      var hasReachedArticle = board.getBoundingClientRect().top <= navbarHeight;
      sidebar.classList.toggle('toc-is-visible', hasReachedArticle);
    }

    window.addEventListener('scroll', updateTocVisibility, { passive: true });
    window.addEventListener('resize', updateTocVisibility);
    updateTocVisibility();
  }

  function init() {
    placeStatistics();
    updateRuntime();
    bindTocAnchorNavigation();
    bindTocActiveState();
    disableTocbotAutoSync();
    bindTocVisibility();
    window.setInterval(updateRuntime, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
