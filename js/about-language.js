(function () {
  'use strict';

  var storageKey = 'about-page-language';
  var buttons = document.querySelectorAll('[data-about-language]');
  var contents = document.querySelectorAll('[data-about-language-content]');

  if (!buttons.length || !contents.length) return;

  function setLanguage(language) {
    buttons.forEach(function (button) {
      var active = button.dataset.aboutLanguage === language;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    contents.forEach(function (content) {
      content.hidden = content.dataset.aboutLanguageContent !== language;
    });

    try {
      window.localStorage.setItem(storageKey, language);
    } catch (error) {
      // Private browsing or browser settings can disable local storage.
    }
  }

  var savedLanguage;
  try {
    savedLanguage = window.localStorage.getItem(storageKey);
  } catch (error) {
    savedLanguage = null;
  }

  setLanguage(savedLanguage === 'en' ? 'en' : 'zh-CN');

  buttons.forEach(function (button) {
    button.addEventListener('click', function () {
      setLanguage(button.dataset.aboutLanguage);
    });
  });
}());
