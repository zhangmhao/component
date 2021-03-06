/**
 * [Component] 顶部导航条
 */
define(function (require) {
    'use strict';
    var Component = require('lib/com'),
        Button = require('components/button'),
        TopBar;

    TopBar = Component.extend({
        type: 'topBar',
        tpl: '#tpl-bar-top',
        getState: function () {
            return {
                name: this.env.queries.name
            };
        },
        components: [{
            _constructor_: Button,
            id: 'back',
            selector: '.b-btn-back'
        }],
        listeners: {
            'button:back:click': function () {
                history.back();
            }
        }
    });
    return TopBar;
});
