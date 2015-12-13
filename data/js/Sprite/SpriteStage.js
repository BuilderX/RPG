"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

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
 * @fileoverview Class Sprite.Stage
 * @author mail@qhduan.com (QH Duan)
 */

(function () {
  "use strict";

  var internal = Sprite.Namespace();

  /**
   * Main Stage, display object
   * @class
   * @extends Sprite.Container
   */
  Sprite.assign("Stage", (function (_Sprite$Container) {
    _inherits(SpriteStage, _Sprite$Container);

    /** @function Sprite.Stage.constructor
     * consturct a Sprite.Stage with width and height
     * @constructor
     * @param width, the width of stage you need
     * @param height, the height of stage you need
     */

    function SpriteStage(width, height) {
      _classCallCheck(this, SpriteStage);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SpriteStage).call(this));

      var privates = internal(_this);

      if (!privates.renderer && Sprite.Webgl.support()) {
        privates.renderer = new Sprite.Webgl(width, height);
        privates.rendererType = "webgl";
      }

      // canvas 2d first
      if (!privates.renderer && Sprite.Canvas.support()) {
        privates.renderer = new Sprite.Canvas(width, height);
        privates.rendererType = "canvas";
      }

      if (!privates.renderer) {
        throw new Error("Sprite.Stage all renderer not support");
      }

      /**
      * color when stage is empty
      */
      privates.color = "#000000";
      return _this;
    }

    _createClass(SpriteStage, [{
      key: "releaseRenderer",
      value: function releaseRenderer() {
        internal(this).renderer.release();
      }
    }, {
      key: "filter",
      value: function filter(name, value) {
        return internal(this).renderer.filter(name, value);
      }
    }, {
      key: "findHit",
      value: function findHit(event) {
        var hitted = this.hitTest(this.mouseX, this.mouseY);
        hitted.reverse();
        if (hitted.length) return hitted;
        return null;
      }
    }, {
      key: "clear",

      /// @function Sprite.Stage.clear
      /// clear the stage
      value: function clear() {
        internal(this).renderer.clear();
      }
    }, {
      key: "update",
      value: function update() {
        this.emit("beforeDraw");
        this.draw(this.renderer);
        this.emit("afterDraw");
      }
    }, {
      key: "draw",
      value: function draw(renderer) {
        /** this.children, never privates.children, because children are super's */
        if (this.children.length <= 0) {
          return false;
        }

        this.clear();

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;

            child.draw(renderer);
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }
    }, {
      key: "renderer",
      get: function get() {
        return internal(this).renderer;
      },
      set: function set(value) {
        throw new Error("Sprite.Stage renderer readonly");
      }
    }, {
      key: "rendererType",
      get: function get() {
        return internal(this).rendererType;
      },
      set: function set(value) {
        throw new Error("Sprite.Stage.rendererType readonly");
      }
    }, {
      key: "width",
      get: function get() {
        return internal(this).renderer.width;
      },
      set: function set(value) {
        internal(this).renderer.width = value;
      }
    }, {
      key: "height",
      get: function get() {
        return internal(this).renderer.height;
      },
      set: function set(value) {
        internal(this).renderer.height = value;
      }
    }, {
      key: "color",
      get: function get() {
        return internal(this).renderer.color;
      },
      set: function set(value) {
        internal(this).renderer.color = value;
      }
    }, {
      key: "canvas",
      get: function get() {
        return this.renderer.canvas;
      },
      set: function set(value) {
        throw new Error("Sprite.Stage.canvas readonly");
      }
    }]);

    return SpriteStage;
  })(Sprite.Container));
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TcHJpdGUvU3ByaXRlU3RhZ2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUF5QkEsQ0FBQyxZQUFZO0FBQ1osY0FBWSxDQUFDOztBQUVaLE1BQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUU7Ozs7Ozs7QUFBQyxBQU9sQyxRQUFNLENBQUMsTUFBTSxDQUFDLE9BQU87Y0FBUSxXQUFXOzs7Ozs7Ozs7QUFRdEMsYUFSMkIsV0FBVyxDQVF6QixLQUFLLEVBQUUsTUFBTSxFQUFFOzRCQVJELFdBQVc7O3lFQUFYLFdBQVc7O0FBVXBDLFVBQUksUUFBUSxHQUFHLFFBQVEsT0FBTSxDQUFDOztBQUU5QixVQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsSUFBSSxNQUFNLENBQUMsS0FBSyxDQUFDLE9BQU8sRUFBRSxFQUFFO0FBQ2hELGdCQUFRLENBQUMsUUFBUSxHQUFHLElBQUksTUFBTSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUM7QUFDcEQsZ0JBQVEsQ0FBQyxZQUFZLEdBQUcsT0FBTyxDQUFDO09BQ2pDOzs7QUFBQSxBQUdELFVBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxFQUFFLEVBQUU7QUFDakQsZ0JBQVEsQ0FBQyxRQUFRLEdBQUcsSUFBSSxNQUFNLENBQUMsTUFBTSxDQUFDLEtBQUssRUFBRSxNQUFNLENBQUMsQ0FBQztBQUNyRCxnQkFBUSxDQUFDLFlBQVksR0FBRyxRQUFRLENBQUM7T0FDbEM7O0FBRUQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEVBQUU7QUFDdEIsY0FBTSxJQUFJLEtBQUssQ0FBQyx1Q0FBdUMsQ0FBQyxDQUFDO09BQzFEOzs7OztBQUFBLEFBS0QsY0FBUSxDQUFDLEtBQUssR0FBRyxTQUFTLENBQUM7O0tBQzVCOztpQkEvQjBCLFdBQVc7O3dDQWlD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RCBHYW1lIFNwcml0ZSBMaWJyYXJ5LCBCdWlsdCB1c2luZyBKYXZhU2NyaXB0IEVTNlxuQ29weXJpZ2h0IChDKSAyMDE1IHFoZHVhbihodHRwOi8vcWhkdWFuLmNvbSlcblxuVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbml0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG50aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cblxuVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG5idXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cblxuWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbmFsb25nIHdpdGggdGhpcyBwcm9ncmFtLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuXG4qL1xuXG4vKipcbiAqIEBmaWxlb3ZlcnZpZXcgQ2xhc3MgU3ByaXRlLlN0YWdlXG4gKiBAYXV0aG9yIG1haWxAcWhkdWFuLmNvbSAoUUggRHVhbilcbiAqL1xuXG4oZnVuY3Rpb24gKCkge1xuIFwidXNlIHN0cmljdFwiO1xuXG4gIGxldCBpbnRlcm5hbCA9IFNwcml0ZS5OYW1lc3BhY2UoKTtcblxuICAvKipcbiAgICogTWFpbiBTdGFnZSwgZGlzcGxheSBvYmplY3RcbiAgICogQGNsYXNzXG4gICAqIEBleHRlbmRzIFNwcml0ZS5Db250YWluZXJcbiAgICovXG4gIFNwcml0ZS5hc3NpZ24oXCJTdGFnZVwiLCBjbGFzcyBTcHJpdGVTdGFnZSBleHRlbmRzIFNwcml0ZS5Db250YWluZXIge1xuXG4gICAgLyoqIEBmdW5jdGlvbiBTcHJpdGUuU3RhZ2UuY29uc3RydWN0b3JcbiAgICAgKiBjb25zdHVyY3QgYSBTcHJpdGUuU3RhZ2Ugd2l0aCB3aWR0aCBhbmQgaGVpZ2h0XG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQHBhcmFtIHdpZHRoLCB0aGUgd2lkdGggb2Ygc3RhZ2UgeW91IG5lZWRcbiAgICAgKiBAcGFyYW0gaGVpZ2h0LCB0aGUgaGVpZ2h0IG9mIHN0YWdlIHlvdSBuZWVkXG4gICAgICovXG4gICAgY29uc3RydWN0b3IgKHdpZHRoLCBoZWlnaHQpIHtcbiAgICAgIHN1cGVyKCk7XG4gICAgICBsZXQgcHJpdmF0ZXMgPSBpbnRlcm5hbCh0aGlzKTtcblxuICAgICAgaWYgKCFwcml2YXRlcy5yZW5kZXJlciAmJiBTcHJpdGUuV2ViZ2wuc3VwcG9ydCgpKSB7XG4gICAgICAgIHByaXZhdGVzLnJlbmRlcmVyID0gbmV3IFNwcml0ZS5XZWJnbCh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgcHJpdmF0ZXMucmVuZGVyZXJUeXBlID0gXCJ3ZWJnbFwiO1xuICAgICAgfVxuXG4gICAgICAvLyBjYW52YXMgMmQgZmlyc3RcbiAgICAgIGlmICghcHJpdmF0ZXMucmVuZGVyZXIgJiYgU3ByaXRlLkNhbnZhcy5zdXBwb3J0KCkpIHtcbiAgICAgICAgcHJpdmF0ZXMucmVuZGVyZXIgPSBuZXcgU3ByaXRlLkNhbnZhcyh3aWR0aCwgaGVpZ2h0KTtcbiAgICAgICAgcHJpdmF0ZXMucmVuZGVyZXJUeXBlID0gXCJjYW52YXNcIjtcbiAgICAgIH1cblxuICAgICAgaWYgKCFwcml2YXRlcy5yZW5kZXJlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJTcHJpdGUuU3RhZ2UgYWxsIHJlbmRlcmVyIG5vdCBzdXBwb3J0XCIpO1xuICAgICAgfVxuXG4gICAgICAvKipcbiAgICAgICogY29sb3Igd2hlbiBzdGFnZSBpcyBlbXB0eVxuICAgICAgKi9cbiAgICAgIHByaXZhdGVzLmNvbG9yID0gXCIjMDAwMDAwXCI7XG4gICAgfVxuXG4gICAgcmVsZWFzZVJlbmRlcmVyICgpe1xuICAgICAgaW50ZXJuYWwodGhpcykucmVuZGVyZXIucmVsZWFzZSgpO1xuICAgIH1cblxuICAgIGdldCByZW5kZXJlciAoKSB7XG4gICAgICByZXR1cm4gaW50ZXJuYWwodGhpcykucmVuZGVyZXI7XG4gICAgfVxuXG4gICAgc2V0IHJlbmRlcmVyICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3ByaXRlLlN0YWdlIHJlbmRlcmVyIHJlYWRvbmx5XCIpO1xuICAgIH1cblxuICAgIGdldCByZW5kZXJlclR5cGUgKCkge1xuICAgICAgcmV0dXJuIGludGVybmFsKHRoaXMpLnJlbmRlcmVyVHlwZTtcbiAgICB9XG5cbiAgICBzZXQgcmVuZGVyZXJUeXBlICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3ByaXRlLlN0YWdlLnJlbmRlcmVyVHlwZSByZWFkb25seVwiKVxuICAgIH1cblxuICAgIGZpbHRlciAobmFtZSwgdmFsdWUpIHtcbiAgICAgIHJldHVybiBpbnRlcm5hbCh0aGlzKS5yZW5kZXJlci5maWx0ZXIobmFtZSwgdmFsdWUpO1xuICAgIH1cblxuICAgIGZpbmRIaXQgKGV2ZW50KSB7XG4gICAgICBsZXQgaGl0dGVkID0gdGhpcy5oaXRUZXN0KHRoaXMubW91c2VYLCB0aGlzLm1vdXNlWSk7XG4gICAgICBoaXR0ZWQucmV2ZXJzZSgpO1xuICAgICAgaWYgKGhpdHRlZC5sZW5ndGgpXG4gICAgICAgIHJldHVybiBoaXR0ZWQ7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICBnZXQgd2lkdGggKCkge1xuICAgICAgcmV0dXJuIGludGVybmFsKHRoaXMpLnJlbmRlcmVyLndpZHRoO1xuICAgIH1cblxuICAgIHNldCB3aWR0aCAodmFsdWUpIHtcbiAgICAgIGludGVybmFsKHRoaXMpLnJlbmRlcmVyLndpZHRoID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCAoKSB7XG4gICAgICByZXR1cm4gaW50ZXJuYWwodGhpcykucmVuZGVyZXIuaGVpZ2h0O1xuICAgIH1cblxuICAgIHNldCBoZWlnaHQgKHZhbHVlKSB7XG4gICAgICBpbnRlcm5hbCh0aGlzKS5yZW5kZXJlci5oZWlnaHQgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgY29sb3IgKCkge1xuICAgICAgcmV0dXJuIGludGVybmFsKHRoaXMpLnJlbmRlcmVyLmNvbG9yO1xuICAgIH1cblxuICAgIHNldCBjb2xvciAodmFsdWUpIHtcbiAgICAgIGludGVybmFsKHRoaXMpLnJlbmRlcmVyLmNvbG9yID0gdmFsdWU7XG4gICAgfVxuXG4gICAgZ2V0IGNhbnZhcyAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5yZW5kZXJlci5jYW52YXM7XG4gICAgfVxuXG4gICAgc2V0IGNhbnZhcyAodmFsdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlNwcml0ZS5TdGFnZS5jYW52YXMgcmVhZG9ubHlcIilcbiAgICB9XG5cbiAgICAvLy8gQGZ1bmN0aW9uIFNwcml0ZS5TdGFnZS5jbGVhclxuICAgIC8vLyBjbGVhciB0aGUgc3RhZ2VcbiAgICBjbGVhciAoKSB7XG4gICAgICBpbnRlcm5hbCh0aGlzKS5yZW5kZXJlci5jbGVhcigpO1xuICAgIH1cblxuICAgIHVwZGF0ZSAoKSB7XG4gICAgICB0aGlzLmVtaXQoXCJiZWZvcmVEcmF3XCIpO1xuICAgICAgdGhpcy5kcmF3KHRoaXMucmVuZGVyZXIpO1xuICAgICAgdGhpcy5lbWl0KFwiYWZ0ZXJEcmF3XCIpO1xuICAgIH1cblxuICAgIGRyYXcgKHJlbmRlcmVyKSB7XG4gICAgICAvKiogdGhpcy5jaGlsZHJlbiwgbmV2ZXIgcHJpdmF0ZXMuY2hpbGRyZW4sIGJlY2F1c2UgY2hpbGRyZW4gYXJlIHN1cGVyJ3MgKi9cbiAgICAgIGlmICh0aGlzLmNoaWxkcmVuLmxlbmd0aCA8PSAwKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5jbGVhcigpO1xuXG4gICAgICBmb3IgKGxldCBjaGlsZCBvZiB0aGlzLmNoaWxkcmVuKSB7XG4gICAgICAgIGNoaWxkLmRyYXcocmVuZGVyZXIpO1xuICAgICAgfVxuICAgIH1cblxuICB9KTtcblxuXG59KSgpO1xuIl19
