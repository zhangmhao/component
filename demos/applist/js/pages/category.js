/**
 * [页面] 首页
 */
define(function (require, exports) {
    'use strict';
    var Component = require('lib/com'),
        TopBar = require('components/topbar'),
        AutoFillList = require('components/list.autofill'),
        AppItem = require('components/app'),
        util = require('util'),
        installedApps = [],
        Category;

    Category = Component.extend({
        name: 'category',
        components: [{
            _constructor_: TopBar,
            getState: function () {
                return {
                    name: this.state.queries.name
                };
            }
        }, {
            _constructor_: AutoFillList,
            id: 'cateList',
            listSize: 10,
            loadSize: 5,
            tpl: '#tpl-list-app',
            api: 'apps',
            li: AppItem,
            getState: function () {
                var state = this.state;
                return {
                    cat: state.params.cat,
                    name: state.queries.name
                };
            }
        }],
        listeners: {
            //分类详情页渲染结束
            'AFTER_RENDER': function () {
                //渲染结束，则通知列表加载数据
                var list = this.getChildById('cateList');
                list.load();
            },
            //剔除已安装App,并保存到临时数组installedApps中
            'autofillList:cateList:before:append': function (event, apps) {
                util.updateAppStatus(apps);
                installedApps = installedApps.concat(util.sliceInstalledApps(apps));
            },
            'autofillList:cateList:end': function (event, list) {
                list.appendRecord(installedApps);
                installedApps = [];
            },
        }
    });
    return Category;
});
