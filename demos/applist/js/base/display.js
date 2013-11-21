/**
 * 显示类
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        _ = require('core/lang'),
        Class = require('lib/class'),
        tpl = require('core/template'),
        Event = require('base/event'),
        slice = Array.prototype.slice,
        methods = ['show', 'hide', 'toggle', 'empty'],
        initVar = ['tpl', 'tplContent', 'parentEl', 'className', 'id', 'display', 'el', 'selector', 'renderAfterInit'],
        Display,
        _handleEvent;
    _handleEvent = function () {
        var type = arguments[0],
            args = slice.call(arguments, 1),
            eventName = this.getEvent(args[0]),
            el;
        el = eventName ? this.$parentEl : this.$el;
        args[0] = eventName || args[0];
        //console.log(type + ': ' + args[0], el[0]);
        el[type].apply(el, args);
        return this;
    };
    Display = Class.extend({
        type: 'display',
        tpl: null,
        tplContent: null,
        parentEl: null,
        _num: null,  //编号
        el: null,
        $el: null,  //该展示区域的容器
        updating: false,  //更新中
        tplDowloading: false, //下载模板中
        rendered: false,  //已渲染
        initializing: false,  //初始化进行中
        initialized: false,  //已初始化
        display: true, //是否显示
        /**
         * 开始初始化，标志各标志位
         */
        startInit: function () {
            var self = this;
            if (!self._startInit) {
                self.initialized = false;
                self.initializing = true;
                self._startInit = true;
            }
        },
        /**
         * 结束初始化
         * @return {[type]} [description]
         */
        finishInit: function () {
            var self = this;
            if (!self._finishInit) {
                self.initializing = false;
                self.initialized = true;
                self._finishInit = true;
            }
        },
        /**
         * 是否有模板内容
         * @return {Boolean}
         */
        hasTplContent: function () {
            return !!this.tplContent;
        },
        /**
         * 获取类型 (Component/Page/...)
         */
        getType: function () {
            return this.type;
        },
        _initTpl: function (callback) {
            var self = this,
                tpl = self.tpl;
            callback = callback || function () {};
            if (!tpl) {
                console.warn(['Has no template(tpl) or element(el) config for',
                    '[', self.getType() || '[unknow type]', ']',
                    '[', self.id || '[unknow name]', ']',
                    'please check your option'].join(' '));
                if (self.tplContent) {
                    self.$el = $(self.tmpl());
                    self.el = self.$el[0];
                    callback(true);
                } else {
                    callback(false);
                }
                return;
            }
            //使用HTML文件中的<script type="template" id="{id}"></script>
            if (tpl.indexOf('#') === 0) {
                self.tplContent = $(tpl).html();
                callback(true);
                return;
            }
            require.async('tpl/' + tpl, function (res) {
                if (res) {
                    self.tplContent = res;
                    self.$el = $(self.tmpl());
                    self.el = self.$el[0];
                    callback(true);
                } else {
                    callback(false);
                }
            });
        },
        /**
         * 初始化组件元素
         * 先下载模板文件，然后构建element
         */
        _initElement: function (callback) {
            var self = this;
            callback = callback || function () {};
            //已经有元素了，不需要初始化
            if (self.$el !== null) {
                callback();
                return;
            }
            self._initTpl(function (success) {
                if (success) {
                    self.$el = $(self.tmpl());
                    self.el = self.$el[0];
                } else { //没有初始化成功, 需要初始化一个页面的Element
                    self.el = document.createElement('section');
                    self.$el = $(self.el);
                }
                callback();
            });
        },
        /**
         * {Private} 添加到父亲节点
         */
        appendToParent: function () {
            if (this.parentEl) {
                this.$el.appendTo(this.parentEl);
            }
            return this;
        },
        /**
         * 获取事件的实际名称
         * @param  {String} eventName 事件代号 BEFORE_RENDER
         * @return {String}           list:myList:beforerender
         */
        getEvent: function (eventName) {
            return Event.get(this.type, eventName, this.getType(), this.id);
        },
        /**
         * 初始化变量
         * @return {[type]} [description]
         */
        initVariable: function (option, variables) {
            if (!option) { return; }
            var self = this,
                tmp, optionKey, realKey;
            for (var i = 0, len = variables.length; i < len; i++) {
                tmp = variables[i].split('->');
                optionKey = tmp[0];
                realKey = tmp[1] || optionKey;
                //option的v属性会覆盖对象的v属性
                if (option[optionKey] !== undefined) {
                    self[realKey] = option[optionKey];
                }
            }
        },
        /**
         * {Private} 监听事件
         * @param  {Object} listeners 事件配置
         */
        _listen: function (listeners) {
            if (!listeners) {
                return;
            }
            for (var event in listeners) {
                if (listeners.hasOwnProperty(event)) {
                    this.on(event, (function (event, self) {
                        return function () {
                            listeners[event].apply(self, arguments);
                        };
                    })(event, this));
                }
            }
        },
        /**
         * 初始化Display
         * @param  {Object} option      Display所需配置
         * @param  {Boolean} flagSilent 是否改变状态量 true:改变,false:不改变
         */
        init: function (option, callback) {
            var self = this;
            option = option || {};
            self.startInit();
            //使用timestamp来作为组件的唯一标志
            self._num = Date.now().toString();
            //创建默认的Id,如果用户配置Option中有自定义Id，则默认Id会被自定义Id覆盖
            self.id = [self.getType(), self._num].join('-');
            //初始化变量
            self.initVariable(option, initVar);
            //创建parentEl的$(object)对象
            var parentEl = self.parentEl;
            if (parentEl) {
                self.$parentEl = $(parentEl);
            }
            //创建el的$(object)对象
            var el = self.el;
            if (el) {
                self.$el = $(el);
            }
            var selector = self.selector;
            if (typeof selector === 'string') {
                self.$el = self.$parentEl.find(selector);
                self.el = self.$el[0];
            }
            //保存用户原始配置，已备用
            self.originOption = $.extend(true, {}, option);
            //用户指定了元素，则不进行模板渲染, 内置了模板文件，不需要请求模板文件
            self._initElement(function () {
                self.$el.attr('id', self.id)
                        .attr('class', self.className);
                //监听组件原生listener
                self._listen(self.listeners);
                //用户创建的Listener
                self._listen(option.listeners);
                if (typeof callback === 'function') {
                    callback();
                } else { //如果没有callback，则直接结束初始化
                    self.finishInit();
                }
                //之前被通知过render，模板准备好之后进行渲染
                if (self.needToRender) {
                    self.render();
                }
            });
        },
        /**
         * 渲染组件
         */
        render: function (callback) {
            var self = this,
                originOption = self.originOption;
            //如果有selector则表明该元素已经在页面上了，不需要再渲染
            if (!self.selector || self.rendered) {
                if (self.initialized) {
                    //给予id以及Class
                    self.trigger('BEFORE_RENDER', [self]);
                    if (self.isContinueRender !== false) {
                        self.isContinueRender = true;
                        self.$el.css({
                            width: originOption.width,
                            height: originOption.height
                        });
                        if (self.display === false) {
                            self.$el.css('display', 'none');
                        }
                        //self.appendToParent();
                        if (typeof callback === 'function') {
                            callback(self);
                        } else {
                            self.finishRender();
                        }
                    }
                } else {
                    //异步情况下，用户通知渲染时尚未初始化结束
                    self.needToRender = true;
                }
            } else {
                if (typeof callback === 'function') {
                    callback(self);
                }
            }
            return self;
        },
        update: function () {
            this.updating = true;
            return this;
        },
        /**
         * 渲染模板
         */
        tmpl: function (data, tplCont) {
            var html;
            data = data || this.data;
            tplCont = tplCont || this.tplContent;
            if (tplCont) {
                html = tpl.tmpl(tplCont, data, this.helper);
            } else {
                console.warn(tpl + '模板的内容为空，请检查模板文件是否存在,或者模板加载失败');
            }
            return html || '';
        },
        /**
         * 监听事件,糅合了 jQuery或者Zepto的事件机制，所以使用与上述类库同理
         */
        on: function () {
            return _handleEvent.apply(this, ['on'].concat(slice.call(arguments, 0)));
        },
        /**
         * 触发事件，同上
         */
        trigger: function () {
            return _handleEvent.apply(this, ['trigger'].concat(slice.call(arguments, 0)));
        },
        /**
         * 析构
         */
        destroy: function () {
            this.$el.remove();
            this.$el = null;
        },
        /**
         * 结束渲染
         */
        finishRender: function () {
            this.rendered = true; //标志已经渲染完毕
            this.trigger('AFTER_RENDER', [this]);
        }
    });
    //扩展方法 'show', 'hide', 'toggle', 'appendTo', 'append', 'empty'
    _.each(methods, function (method) {
        Display.prototype[method] = function () {
            var args = slice.call(arguments);
            this.$el[method].apply(this.$el, args);
            return this;
        };
    });
    return Display;
});