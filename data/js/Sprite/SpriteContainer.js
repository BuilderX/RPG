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
 * @fileoverview Class Sprite.Container, it's a general container
 * Contain Sprite.Sheet, Sprite.Bitmap, Sprite.Shape, Sprite.Text, Sprite.Frame or Sprite.Container
 * @author mail@qhduan.com (QH Duan)
 */

"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  "use strict";

  var internal = Sprite.Namespace();

  /**
   * Contain everything which inherit from Sprite.Display
   * @class
   */
  Sprite.assign("Container", (function (_Sprite$Display) {
    _inherits(SpriteContainer, _Sprite$Display);

    /**
     * Construct Sprite.Container
     * @constructor
     */

    function SpriteContainer() {
      _classCallCheck(this, SpriteContainer);

      _get(Object.getPrototypeOf(SpriteContainer.prototype), "constructor", this).call(this);
      var privates = internal(this);
      /**
       * Contain all children element
       * @private
       */
      privates.children = [];
      /**
       * Cached canvas
       */
      privates.cacheCanvas = null;
    }

    /**
     * @return {Array} Children array
     */

    _createClass(SpriteContainer, [{
      key: "clearCache",

      /**
       * Remove canvas cache
       */
      value: function clearCache() {
        var privates = internal(this);
        privates.cacheCanvas = null;
      }

      /**
       * Prerender all children as cache
       */
    }, {
      key: "cache",
      value: function cache(x, y, width, height) {
        var privates = internal(this);
        if (privates.cacheCanvas) {
          privates.cacheCanvas = null;
        }
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;

            child.parent = null;
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        var context = canvas.getContext("2d");
        this.draw(context);
        privates.cacheCanvas = canvas;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this.children[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var child = _step2.value;

            child.parent = this;
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
              _iterator2["return"]();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }
      }

      /**
       * Hit test
       */
    }, {
      key: "hitTest",
      value: function hitTest(x, y) {
        var privates = internal(this);
        if (this.cacheCanvas) {
          return _get(Object.getPrototypeOf(SpriteContainer.prototype), "hitTest", this).call(this, x, y);
        } else {
          var hitted = [];
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = this.children[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var child = _step3.value;

              var ret = child.hitTest(x, y);
              if (ret instanceof Array) {
                hitted = hitted.concat(ret);
              } else if (ret === true) {
                hitted.push(child);
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                _iterator3["return"]();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          return hitted;
        }
      }

      /**
       * Draw all children in this container on context
       * @param {Object} renderer Sprite.Webgl/Sprite.Canvas/Context
       */
    }, {
      key: "draw",
      value: function draw(renderer) {
        var privates = internal(this);
        if (this.alpha < 0.01 || this.visible != true) {
          return;
        }

        if (this.cacheCanvas) {
          this.drawImage(renderer, this.cacheCanvas, 0, 0, this.cacheCanvas.width, this.cacheCanvas.height, 0, 0, this.cacheCanvas.width, this.cacheCanvas.height);
        } else {
          if (this.children.length > 0) {
            var _iteratorNormalCompletion4 = true;
            var _didIteratorError4 = false;
            var _iteratorError4 = undefined;

            try {
              for (var _iterator4 = this.children[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
                var child = _step4.value;

                if (child.visible == true && child.alpha >= 0.01) {
                  child.draw(renderer);
                }
              }
            } catch (err) {
              _didIteratorError4 = true;
              _iteratorError4 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                  _iterator4["return"]();
                }
              } finally {
                if (_didIteratorError4) {
                  throw _iteratorError4;
                }
              }
            }
          }
        }
      }

      /**
       * Append one or more children into container
       * eg. c.appendChild(childA) c.appendChild(childA, childB)
       * @param one or more children
       */
    }, {
      key: "appendChild",
      value: function appendChild() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length <= 0) {
          throw new Error("Sprite.Container.appendChild got an invalid arguments");
        }

        var _iteratorNormalCompletion5 = true;
        var _didIteratorError5 = false;
        var _iteratorError5 = undefined;

        try {
          for (var _iterator5 = args[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
            var element = _step5.value;

            if (element instanceof Sprite.Display == false) {
              console.error(element);
              throw new Error("Sprite.Container.appendChild only accept Sprite.Display or it's sub-class");
            }
            element.parent = this;
            this.children.push(element);
          }
        } catch (err) {
          _didIteratorError5 = true;
          _iteratorError5 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
              _iterator5["return"]();
            }
          } finally {
            if (_didIteratorError5) {
              throw _iteratorError5;
            }
          }
        }

        this.emit("addedChildren");
      }

      /**
       * Append one or more children into container at certain position
       * eg. c.appendChildAt(0, childA) c.appendChildAt(0, childA, childB)
       * @param one or more children
       */
    }, {
      key: "appendChildAt",
      value: function appendChildAt() {
        var args = Array.prototype.slice.call(arguments);

        if (args.length <= 1) {
          console.log(arguments, this);
          throw new TypeError("Sprite.Container.appendChildAt has an invalid arguments");
        }

        var index = args[0];
        for (var i = 1; i < args.length; i++) {
          if (args[i] instanceof Sprite.Display == false) {
            console.error(args[i]);
            throw new Error("Sprite.Container.appendChildAt only can accept Sprite.Display or it's sub-class");
          }
          args[i].parent = this;
          this.children.splice(index, 0, args[i]);
        }

        this.emit("addedChildren");
      }

      /**
       * Remove one child from a container
       * eg. c.removeChild(childA)
       * @param {Object} element The child you want to remove
       * @return {boolean} If found and removed element, return true, otherwise, false
       */
    }, {
      key: "removeChild",
      value: function removeChild(element) {
        var index = this.children.indexOf(element);
        if (index != -1) {
          // 删除成功
          this.children[index].parent = null;
          this.children.splice(index, 1);
          this.emit("removedChildren");
          return true;
        } else {
          // 没有找到需要删除的对象
          return false;
        }
      }

      /**
       * remove all children of container
       */
    }, {
      key: "clear",
      value: function clear() {
        var privates = internal(this);
        var _iteratorNormalCompletion6 = true;
        var _didIteratorError6 = false;
        var _iteratorError6 = undefined;

        try {
          for (var _iterator6 = this.children[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
            var child = _step6.value;

            child.parent = null;
          }
        } catch (err) {
          _didIteratorError6 = true;
          _iteratorError6 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
              _iterator6["return"]();
            }
          } finally {
            if (_didIteratorError6) {
              throw _iteratorError6;
            }
          }
        }

        internal(this).children = [];
        if (privates.cacheCanvas) {
          privates.cacheCanvas = null;
        }
        this.emit("removedChildren");
      }
    }, {
      key: "children",
      get: function get() {
        var privates = internal(this);
        return privates.children;
      },
      set: function set(value) {
        throw new Error("Sprite.Container.children readonly");
      }

      /**
       * @return {Object} Cached canvas
       */
    }, {
      key: "cacheCanvas",
      get: function get() {
        var privates = internal(this);
        return privates.cacheCanvas;
      },
      set: function set(value) {
        throw new Error("Sprite.Container.cacheCanvas readonly");
      }
    }]);

    return SpriteContainer;
  })(Sprite.Display));
})();
//# sourceMappingURL=SpriteContainer.js.map
