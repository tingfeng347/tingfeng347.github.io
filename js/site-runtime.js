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

  function customScrollTo(targetY, duration) {
    var startY = window.scrollY;
    var diffY = targetY - startY;
    var startTime = null;

    // ease-out 曲线：起步快、末尾减速
    function easeOutCubic(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function step(currentTime) {
      if (!startTime) {
        startTime = currentTime;
      }
      var elapsed = currentTime - startTime;
      var progress = Math.min(elapsed / duration, 1);
      window.scrollTo(0, startY + diffY * easeOutCubic(progress));
      if (progress < 1) {
        requestAnimationFrame(step);
      }
    }

    requestAnimationFrame(step);
  }

  // 全局接管所有 behavior:'smooth' 的 scrollTo 调用
  (function patchSmoothScroll() {
    var originalScrollTo = window.scrollTo.bind(window);
    window.scrollTo = function(options) {
      if (options && options.behavior === 'smooth' && typeof options.top === 'number') {
        customScrollTo(options.top, 500);
      } else {
        originalScrollTo.apply(window, arguments);
      }
    };
  })();

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
      customScrollTo(Math.max(0, top), 500);
      window.history.replaceState(null, '', '#' + encodeURIComponent(target.id));
    }, true);
  }

  function bindTocVisibility() {
    var tocSidebar = document.querySelector('.side-col:last-child .sidebar');
    var catSidebar = document.querySelector('.side-col:first-child .sidebar.category-bar');
    var board = document.getElementById('board-ctn');
    if ((!tocSidebar && !catSidebar) || !board) {
      return;
    }

    function updateTocVisibility() {
      var navbar = document.getElementById('navbar');
      var navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;
      var hasReachedArticle = board.getBoundingClientRect().top <= navbarHeight - 60;
      if (tocSidebar) {
        tocSidebar.classList.toggle('toc-is-visible', hasReachedArticle);
      }
      if (catSidebar) {
        catSidebar.classList.toggle('cat-is-visible', hasReachedArticle);
      }
    }

    window.addEventListener('scroll', updateTocVisibility, { passive: true });
    window.addEventListener('resize', updateTocVisibility);
    updateTocVisibility();
  }

  function bindSidebarToggles() {
    var catSidebar = document.querySelector('.side-col:first-child .sidebar.category-bar');
    var tocSidebar = document.querySelector('.side-col:last-child .sidebar');

    if (!catSidebar && !tocSidebar) {
      return;
    }

    // 创建按钮组容器
    var btnGroup = document.createElement('div');
    btnGroup.id = 'toggle-sidebar-btns';
    document.body.appendChild(btnGroup);

    var topBtn = document.getElementById('scroll-top-button');
    var board = document.getElementById('board'); // for visibility check

    // 将回到顶部按钮移入横排按钮组
    if (topBtn) {
      btnGroup.appendChild(topBtn);
    }

    function syncVisibility() {
      if (!board) return;
      var scrollHeight = document.body.scrollTop + document.documentElement.scrollTop;
      var headerHeight = board.offsetTop;
      btnGroup.style.opacity = scrollHeight >= headerHeight ? '1' : '0';
    }

    function createBtn(iconClass, label, sidebarEl, storageKey) {
      var btn = document.createElement('a');
      btn.className = 'toggle-btn';
      btn.setAttribute('role', 'button');
      btn.setAttribute('aria-label', label);
      btn.innerHTML = '<i class="iconfont ' + iconClass + '"></i>';

      var isCollapsed = localStorage.getItem(storageKey) === '1';
      if (isCollapsed && sidebarEl) {
        sidebarEl.classList.add(storageKey === 'toc-collapsed' ? 'toc-collapsed' : 'cat-collapsed');
        btn.classList.add('collapsed');
      }

      btn.addEventListener('click', function(e) {
        e.preventDefault();
        if (!sidebarEl) return;
        var cls = storageKey === 'toc-collapsed' ? 'toc-collapsed' : 'cat-collapsed';
        var collapsed = sidebarEl.classList.toggle(cls);
        btn.classList.toggle('collapsed', collapsed);
        localStorage.setItem(storageKey, collapsed ? '1' : '0');
      });

      return btn;
    }

    // 横排顺序（从左到右）：分类 | 目录 | 回到顶部
    if (catSidebar) {
      btnGroup.appendChild(createBtn('icon-arrowright', '折叠分类导航', catSidebar, 'cat-collapsed'));
    }
    if (tocSidebar) {
      btnGroup.appendChild(createBtn('icon-list', '折叠目录', tocSidebar, 'toc-collapsed'));
    }
    // topBtn 已移到末尾

    window.addEventListener('scroll', syncVisibility, { passive: true });
    window.setTimeout(function() {
      syncVisibility();
    }, 300);
  }

  function init() {
    placeStatistics();
    updateRuntime();
    bindTocAnchorNavigation();
    bindTocActiveState();
    disableTocbotAutoSync();
    bindTocVisibility();
    bindSidebarToggles();
    window.setInterval(updateRuntime, 1000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
