"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

/*

2D Game Sprite Library, Built using JavaScript ES6
Copyright (C) 2015 qhduan(http://qhduan.com)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.

*/

/**
 * @fileoverview Define Sprite.Bitmap
 * @author mail@qhduan.com (QH Duan)
*/

(function () {
  "use strict";

  var SpriteUtil = (function () {
    function SpriteUtil() {
      _classCallCheck(this, SpriteUtil);
    }

    _createClass(SpriteUtil, null, [{
      key: "timeout",
      value: function timeout(ms) {
        return new Promise(function (resolve, reject) {
          setTimeout(resolve, ms);
        });
      }

      /**
       * Function Sprite.Util.namespace, return an unique Private-Properties function
       * for javascript private properties need, for es6
       * @return {object} privates
      */

    }, {
      key: "namespace",
      value: function namespace() {
        /**
         * Using closure variable store private properties
         * and different file have different "privateProperties"
        */
        var privates = new WeakMap();
        return function (object) {
          if (privates.has(object) == false) {
            privates.set(object, {});
          }
          return privates.get(object);
        };
      }
    }, {
      key: "uuid",
      value: function uuid() {
        // generate a UUID
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/x|y/g, function (c) {
          var r = Math.floor(Math.random() * 16);
          if (c == "x") {
            return r.toString(16);
          } else {
            return (r & 0x03 | 0x08).toString(16);
          }
        });
      }
    }, {
      key: "copy",
      value: function copy(obj) {
        return JSON.parse(JSON.stringify(obj));
      }
    }, {
      key: "each",
      value: function each(obj, callback) {
        if (obj.forEach) {
          obj.forEach(callback);
        } else {
          for (var key in obj) {
            callback(obj[key], key, obj);
          }
        }
      }
    }, {
      key: "btoa",
      value: function btoa(str) {
        // convert str to base64
        return window.btoa(unescape(encodeURIComponent(str)));
      }
    }, {
      key: "atob",
      value: function atob(str) {
        // convert base64 str to original
        return decodeURIComponent(escape(window.atob(str)));
      }

      /**
       * @param {number} N The min number
       * @param {number} M The max number
       * @return {number} A random integer N <= return < M, aka. [N, M)
      */

    }, {
      key: "randInt",
      value: function randInt(N, M) {
        var r = M - N;
        r *= Math.random();
        return N + Math.floor(r);
      }
    }]);

    return SpriteUtil;
  })();

  Sprite.assign("Util", SpriteUtil);
})();
