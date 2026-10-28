/* 全站主题切换（所有页面共用）
 * 放在 <head> 中加载：先应用已保存的主题，避免页面闪烁；
 * DOM 解析完成后再绑定 #theme-switch 开关。 */
(function () {
  var STORAGE_KEY = 'theme';
  var root = document.documentElement;

  function getSystemTheme() {
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  }

  function getTheme() {
    var saved = localStorage.getItem(STORAGE_KEY);
    return saved === 'dark' || saved === 'light' ? saved : getSystemTheme();
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    if (document.body) {
      document.body.setAttribute('data-theme', theme);
    }
    var toggle = document.getElementById('theme-switch');
    if (toggle) {
      toggle.checked = theme === 'dark';
    }
  }

  function bindToggle() {
    var toggle = document.getElementById('theme-switch');
    if (!toggle || toggle.dataset.themeBound === 'true') {
      return;
    }
    toggle.dataset.themeBound = 'true';
    toggle.addEventListener('change', function () {
      var theme = this.checked ? 'dark' : 'light';
      localStorage.setItem(STORAGE_KEY, theme);
      applyTheme(theme);
    });
  }

  // 尽早应用主题（此时 body 可能还不存在，只设置 html）
  applyTheme(getTheme());

  document.addEventListener('DOMContentLoaded', function () {
    applyTheme(getTheme());
    bindToggle();

    // 跟随系统主题（用户未手动选择过时）
    if (window.matchMedia) {
      var media = window.matchMedia('(prefers-color-scheme: dark)');
      var onChange = function (event) {
        if (!localStorage.getItem(STORAGE_KEY)) {
          applyTheme(event.matches ? 'dark' : 'light');
        }
      };
      if (media.addEventListener) {
        media.addEventListener('change', onChange);
      } else if (media.addListener) {
        media.addListener(onChange);
      }
    }

    // 多标签页同步
    window.addEventListener('storage', function (event) {
      if (event.key === STORAGE_KEY) {
        applyTheme(getTheme());
      }
    });
  });
})();
