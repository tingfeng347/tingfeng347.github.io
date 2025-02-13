const { root: siteRoot = "/" } = hexo.config;
hexo.extend.injector.register("body_begin", `<div id="web_bg"></div>`);
hexo.extend.injector.register("body_end",`<script src="${siteRoot}js/backgroundize.js"></script>`);