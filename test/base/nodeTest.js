define(function (require) {

    var Node = require("./node");

    // Define the QUnit module and lifecycle.
    QUnit.module("base/node");

    QUnit.test("Node api and property test", function () {
        var node1 = new Node({
            id: 'node_id_1'
        });
        var node2 = new Node();
        var node3 = new Node({
            id: 'node_id_3'
        });
        var node4 = new Node();

        node1.appendChild(node2);

        node2.appendChild(node3);
        node2.appendChild(node4);

        var node5 = new Node();
        node1.appendChild(node5);
        //test api getChildById
        var result = node2.getChildById('node_id_3');
        QUnit.equal(node3 === result, true, 'getChildById API 正常');

        var resultList = node2.getChildByType('node');
        QUnit.equal(resultList[0] === node3 && resultList[1] === node4, true, 'getChildByType API 正常');

        //test property nextNode and prevNode
        QUnit.equal(node2.firstChild === node3, true, 'firstChild API 正常');
        QUnit.equal(node2.lastChild === node4, true, 'lastChild API 正常');
        QUnit.equal(node3.nextNode === node4, true, 'nextNode API 正常');
        QUnit.equal(node4.prevNode === node3, true, 'prevNode API 正常');


        //test api appendChild
        QUnit.equal(node1.childCount, 2);
        QUnit.equal(node2.childCount, 2);

        //test api removeChild
        node1.removeChild(node5);
        QUnit.equal(node1.firstChild === node2 && node1.lastChild === node2 && node1.childCount === 1, true, 'removeChild API 正常');

        //test api removeAllChild
        node2.removeAllChild();
        QUnit.equal(!node2.firstChild && !node2.lastChild && node2.childCount === 0, true, 'removeAllChild API 正常');

    });

    QUnit.test('Node Event', function () {
        var adder = new Node({
            id: 'adder'
        });
        adder.on('add', function (evt, a, b, c) {
            console.log('node1 event fire', a, b, c);
            QUnit.equal(a + b + c, 6, '.on("event", callbakc)形式：事件回调调用正常');
        }).on({
            sub: function (evt, a, b) {
                QUnit.equal(a - b, 2, '.on({event1: foo, event2: bar})形式：事件回调调用正常');
            },
            increase: function (evt, a) {
                QUnit.equal(a + 1, 3,  '.on({event1: foo, event2: bar})形式：事件回调调用正常');
            }
        });
        adder.trigger('add', 1, 2, 3);
        adder.trigger('sub', 6, 4);
        adder.trigger('increase', 2);

        var View = new Node(),
            Model = new Node(),
            Router = new Node();

        var functionCallCounter = {
            onModelChange: 0,
            onModelChange2: 0,
            Router: 0
        };
        var onModelChange = function (evt, data) {
            functionCallCounter.onModelChange++;
            QUnit.equal(data, 'model data', 'listenTo API 正常');
        };

        View.listenTo(Router, 'change', function (evt, params) {
            functionCallCounter.Router++;
            QUnit.equal(params, 'router params', 'listenTo API 正常');
        }).listenTo(Model, {
            'change': onModelChange,
            'delete': function (evt, data) {
                QUnit.equal(data, 'model delete', 'listenTo API 正常');
            }
        }).listenTo(Model, 'change', function (evt, data) {
            functionCallCounter.onModelChange2++;
            QUnit.equal(data, 'model data', 'listenTo：监听同一个事件正常');
        });

        Model.trigger('change', 'model data');
        Model.trigger('delete', 'model delete');
        Router.trigger('change', 'router params');

        View.stopListening(Router);
        Router.trigger('change', 'router params');
        View.stopListening(Model, 'change', onModelChange);
        Model.trigger('delete', 'model delete');
        QUnit.equal(functionCallCounter.onModelChange, 1, 'stopListening(obj, name, func) 正常');
        QUnit.equal(functionCallCounter.onModelChange2, 1, 'stopListening(obj, name) 正常');
        QUnit.equal(functionCallCounter.Router, 1, 'stopListening(obj) 正常');


        var Root = Node.extend({
            type: 'Root'
        }), A = Node.extend({
            type: 'A'
        });
        /**
         *             root
         *               |
         *               c
         *            ___|___
         *           |       |
         *           A1     A2
         */
        var root = new Root({id: 'root'}),
            computer = new Node({id: 'computer'}),
            a1 = new A({id: 'a1'}),
            a2 = new A({id: 'a2'});

        computer.sub = function () {
            this.trigger('sub', this.a - this.b);
        };

        computer.add = function () {
            this.trigger('add', this.a + this.b);
        };

        root.appendChild(computer);
        computer.appendChild([a1, a2]);
        computer.listenTo(a1, {
            'event1': function (evt, a) {
                console.log(a);
                this.a = a;
            },
            'event2': function (evt, b) {
                console.log(b);
                this.b = b;
            }
        });
        root.listenTo(computer, {
            'add': function(evt, result) {
                QUnit.equal(result === 4, true, 'listenTo API ok');
            },
            'sub': function(evt, result) {
                QUnit.equal(result === -2, true, 'listenTo API ok');
            }
        });


        a1.trigger('event1', 1);
        a1.trigger('event2', 3);

        computer.add();
        computer.sub();
    });

});
