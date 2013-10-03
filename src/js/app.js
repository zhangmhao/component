define(function(require, exports) {
    'use strict';
    var $ = require('core/selector'),
        router = require('core/router'),
        model = require('model'),
        pageClass = {},
        pages = {},
        $body = $('body'),
        changePage;
    changePage = function (ctx, next) {
        var pathname = ctx.pathname,
            pageName = pathname.slice(1),
            pg;
        if (!pageClass[pageName]) {
            require.async('page/' + pageName, function (Page) {
                pageClass[pageName] = Page;
                pg = pages[pageName] || (pages[pageName] = new Page({
                    parent: $body
                }));
                pg.on('beforerender', function (evt, page) {
                    //如果要加载的页面没有页面模板，则不清空Body
                    if (!page.noTplContent) {
                        $body.empty();
                    }
                    console.debug('准备渲染页面' + page.name);
                }).on('afterrender', function (evt, page) {
                    $body.empty();
                    console.debug('成功渲染页面' + page.name);
                }).on('componentrendered', function (evt, page) {
                    console.debug('成功渲染所有组件' + page.name);
                });
                model.getData(pageName, function (data) {
                    pg.render(data);
                });
            });
        }
    };
    router('/index', changePage);
    router();
});