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
 * @fileoverview Class Sprite.Frame
 * @author mail@qhduan.com (QH Duan)
 */

(function () {
  "use strict";

  var internal = Sprite.Util.namespace();

  /**
   * Class Sprite.Frame, a frame of Sprite.Sheet
   * @class
  */

  var SpriteFrame = (function (_Sprite$Display) {
    _inherits(SpriteFrame, _Sprite$Display);

    function SpriteFrame(image, sx, sy, width, height) {
      _classCallCheck(this, SpriteFrame);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SpriteFrame).call(this));

      var privates = internal(_this);
      privates.image = image;
      privates.sx = sx;
      privates.sy = sy;
      _this.width = width;
      _this.height = height;
      return _this;
    }
    /**
     * @return {Image} Return the image this Sprite.Frame hold
     */

    _createClass(SpriteFrame, [{
      key: "print",
      value: function print() {
        console.log(internal(this));
      }

      /**
       * @return {Object} Clone this Sprite.Frame
       */

    }, {
      key: "clone",
      value: function clone() {
        var frame = new Sprite.Frame(this.image, this.sx, this.sy, this.width, this.height);
        frame.x = this.x;
        frame.y = this.y;
        frame.parent = this.parent;
        return frame;
      }

      /**
       * @param {Object} renderer
       */

    }, {
      key: "draw",
      value: function draw(renderer) {
        this.drawImage(renderer, this.image, this.sx, this.sy, this.width, this.height);
      }
    }, {
      key: "image",
      get: function get() {
        var privates = internal(this);
        return privates.image;
      },
      set: function set(value) {
        throw new Error("Sprite.Frame.image readonly");
      }

      /**
       * @return {number} Return sx
       */

    }, {
      key: "sx",
      get: function get() {
        var privates = internal(this);
        return privates.sx;
      },
      set: function set(value) {
        throw new Error("Sprite.Frame.sx readonly");
      }

      /**
       * @return {number} Return sy
       */

    }, {
      key: "sy",
      get: function get() {
        var privates = internal(this);
        return privates.sy;
      },
      set: function set(value) {
        throw new Error("Sprite.Frame.sy readonly");
      }
    }]);

    return SpriteFrame;
  })(Sprite.Display);

  Sprite.assign("Frame", SpriteFrame);
})();
