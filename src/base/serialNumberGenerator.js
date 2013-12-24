/**
 * 显示类
 */
define(function (require, exports) {
    'use strict';
    var START_ID = 1e9,
        id = START_ID,
        idGenerator = {
            /**
             * 生成序列号
             * @return {String} 16进制字符串
             */
            gen: function () {
                return (id++).toString(16);
            }
        };
    return idGenerator;
});