/**
 * 节点类
 */
define(function (require, exports) {
    'use strict';
    var $ = require('core/selector'),
        Class = require('lib/class'),
        serialNumberGenerator = require('base/serialNumberGenerator'),
        Node;
    function getter(propName) {
        return function () {
            return this[propName];
        };
    }
    Node = Class.extend({
        type: 'component',
        updating: false,  //更新中
        initializing: false,  //初始化进行中
        initialized: false,  //已初始化
        /*-------- START OF GETTER -----*/
        getType: getter('type'),
        getId: getter('id'),
        /*---------- END OF GETTER -----*/
        /**
         * 组件构造函数, 组件的初始化操作
         * @param  {Object} option 组件配置
         *
         */
        init: function (option) {
            var self = this;
            //保存用户原始配置，已备用
            self.originOption = $.extend(true, {}, option);
            //为每一个组件组件实例赋予一个独立的sn
            self.sn = serialNumberGenerator.gen();
            //创建默认的ID，ID格式:{type}-{sn}
            self.id = [self.getType(), self.sn].join('-');
            self.initVar(['id', 'parentNode', 'nextNode', 'prevNode']);
        },
        /**
         * 添加节点
         * @param  {Node} node
         * @return {this}
         */
        appendChild: function (node) {
            if (!this.firstChild) {
                this.firstChild = this.lastChild = node;
            } else {
                node.linkNode({
                    prev: this.lastChild
                });
                this.lastChild = node;
            }
            return this;
        },
        /**
         * 删除节点
         * @param  {Node} nodeWillRemove  待删除节点
         * @return {this}
         */
        removeChild: function (nodeWillRemove) {
            var node = this.getChildById(nodeWillRemove.id);
            if (node) {
                node.destroy();
            }
            node = null;
            return this;
        },
        /**
         * 析构
         */
        destroy: function () {
            if (this.prevNode) {
                this.prevNode.nextNode = this.nextNode;
            } else {
                this.firstChild = this.nextNode;
            }
            if (this.nextNode) {
                this.nextNode.prevNode = this.prevNode;
            } else {
                this.lastChild = this.prevNode;
            }
        },
        /**
         * 初始化组件的变量列表
         * @param  {Array} variableArray 需要初始化的变量名数组 
         *
         *         变量名格式: {配置项属性名称}[:{组件属性名称}]
         *
         *         如果组件的初始化配置option是:
         *         {
         *             name: 'hello',
         *             parent: this,
         *             identity: 'this/is/a/identity'
         *         }
         *         如果组件类定义了3个属性, name对应option.name,  p 对于option.parent, id对应option.identity
         *         那么应该传入的参数就是：['name', 'parent:p', 'identity:id']
         *
         * @return
         */
        initVar: function (variableArray) {
            var component = this,
                option = component.originOption;
            variableArray.forEach(function (element) {
                var variableConfigArray = element.split(':'),
                    optionKey = variableConfigArray[0],
                    variableName = variableConfigArray[1] || optionKey;
                if (option[optionKey] !== undefined) {
                    component[variableName] = option[optionKey];
                }
            });
        },
        /**
         * 根据Id查找组件
         * @param  {String} id 组件编号
         * @return {Node/Null} 返回组件,找不到则返回Null
         */
        getChildById: function (id) {
            var node = this.firstChild;
            while (node) {
                if (node.id === id) {
                    return node;
                }
                node = node.nextNode;
            }
            return null;
        },
        /**
         * 将组件连接起来
         *
         *     prevNode -> curNode -> nextNode
         *
         */
        linkNode: function (nodeConfig) {
            var _prevNode = nodeConfig.prev || null,
                _nextNode = nodeConfig.next || null,
                _parentNode = nodeConfig.parent || null;
            if (_prevNode) {
                this.prevNode = _prevNode;
                _prevNode.nextNode = this;
            }
            if (_nextNode) {
                this.nextNode = _nextNode;
                _nextNode.preNode = this;
            }
            if (_parentNode) {
                this.parentNode = _parentNode;
            }
        }
    });
    return Node;
});