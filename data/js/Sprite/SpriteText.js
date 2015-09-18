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
 * @fileoverview Define the Sprite.Text to show text in game
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

  var textCanvas = document.createElement("canvas");
  textCanvas.width = 1;
  textCanvas.height = 1;
  var textContext = textCanvas.getContext("2d");

  /**
   * Class Sprite.Text, contain text
   * @class
   * @extends Sprite.Display
   */
  Sprite.register("Text", (function (_Sprite$Display) {
    _inherits(SpriteText, _Sprite$Display);

    /**
     * construct Sprite.Text
     * @constructor
     */

    function SpriteText(config) {
      _classCallCheck(this, SpriteText);

      _get(Object.getPrototypeOf(SpriteText.prototype), "constructor", this).call(this);
      internal(this).text = config.text || "Invalid Text";
      internal(this).maxWidth = config.maxWidth || 1000;
      internal(this).color = config.color || "black";
      internal(this).fontSize = config.fontSize || 14;
      internal(this).fontFamily = config.fontFamily || "Ariel";
      internal(this).image = null;
      this.generate();
    }

    _createClass(SpriteText, [{
      key: "clone",
      value: function clone() {
        var text = new Text({
          text: internal(this).text,
          maxWidth: internal(this).maxWidth,
          color: internal(this).color,
          fontSize: internal(this).fontSize,
          fontFamily: internal(this).fontFamily
        });
        text.x = this.x;
        text.y = this.y;
        text.centerX = this.centerX;
        text.centerY = this.centerY;
        return text;
      }
    }, {
      key: "generate",
      value: function generate() {
        textContext.font = this.fontSize + "px " + internal(this).fontFamily;
        // "龍" is the max-width & max-height Chinese word I think
        var lineHeight = Math.ceil(textContext.measureText("龍").width * 1.2);
        internal(this).width = 0;

        // find the real-maximum-width of multiline text, base user's maxWidth
        var lines = [];
        var lineText = "";
        for (var i = 0; i < this.text.length; i++) {
          if (textContext.measureText(lineText + this.text[i]).width > this.maxWidth) {
            lines.push(lineText);
            lineText = this.text[i];
          } else {
            lineText += this.text[i];
          }
          if (textContext.measureText(lineText).width > this.width) internal(this).width = Math.ceil(textContext.measureText(lineText).width);
        }

        if (lineText.length) {
          lines.push(lineText);
        }

        this.height = lines.length * lineHeight;

        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var context = canvas.getContext("2d");
        context.font = this.fontSize + "px " + this.fontFamily;
        context.fillStyle = this.color;
        context.textAlign = "center";
        context.textBaseline = "top";
        // draw each line
        lines.forEach(function (element, index) {
          context.fillText(element, canvas.width / 2, index * lineHeight);
        });

        internal(this).image = canvas;
      }
    }, {
      key: "draw",
      value: function draw(context) {
        var image = internal(this).image;
        if (image && image.width > 0 && image.height > 0) {
          this.drawImage(context, image, 0, 0, image.width, image.height);
        }
      }
    }, {
      key: "text",
      get: function get() {
        return internal(this).text;
      },
      set: function set(value) {
        if (value != this.text) {
          internal(this).text = value;
          this.generate();
        }
      }
    }, {
      key: "width",
      get: function get() {
        return internal(this).width;
      },
      set: function set(value) {
        if (value != this.width) {
          internal(this).width = value;
          this.generate();
        }
      }
    }, {
      key: "height",
      get: function get() {
        return internal(this).height;
      },
      set: function set(value) {
        if (value != this.height) {
          internal(this).height = value;
          this.generate();
        }
      }
    }, {
      key: "color",
      get: function get() {
        return internal(this).color;
      },
      set: function set(value) {
        if (value != this.color) {
          internal(this).color = value;
          this.generate();
        }
      }
    }, {
      key: "fontSize",
      get: function get() {
        return internal(this).fontSize;
      },
      set: function set(value) {
        if (value != this.fontSize) {
          internal(this).fontSize = value;
          this.generate();
        }
      }
    }, {
      key: "fontFamily",
      get: function get() {
        return internal(this).fontFamily;
      },
      set: function set(value) {
        if (value != this.fontFamily) {
          internal(this).fontFamily = value;
          this.generate();
        }
      }
    }]);

    return SpriteText;
  })(Sprite.Display));
})();
//# sourceMappingURL=SpriteText.js.map
