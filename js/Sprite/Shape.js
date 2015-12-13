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
 * @fileoverview Create a shape
 * @author mail@qhduan.com (QH Duan)
 */

(function () {
  "use strict";

  var internal = Sprite.Namespace();

  /**
   * Class Sprite.Shape
   * @class
   * @extends Sprite.Display
   */
  Sprite.assign("Shape", (function (_Sprite$Display) {
    _inherits(SpriteShape, _Sprite$Display);

    /**
     * construct Sprite.Shape
     * @constructor
     */

    function SpriteShape() {
      _classCallCheck(this, SpriteShape);

      var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(SpriteShape).call(this));

      var privates = internal(_this);
      privates.children = [];
      _this.width = 0;
      _this.height = 0;
      privates.image = null;
      return _this;
    }

    _createClass(SpriteShape, [{
      key: "clone",
      value: function clone() {
        var privates = internal(this);
        var shape = new Sprite.Shape();
        internal(shape).children = privates.children.slice();
        internal(shape).image = privates.image;
        shape.width = this.width;
        shape.height = this.height;
        shape.x = this.x;
        shape.y = this.y;
        shape.centerX = this.centerX;
        shape.centerY = this.centerY;
        return shape;
      }
    }, {
      key: "clear",
      value: function clear() {
        var privates = internal(this);
        privates.children = [];
        this.width = 0;
        this.height = 0;
        this.generate();
        return this;
      }
    }, {
      key: "makeConfig",
      value: function makeConfig(defaultConfig, userConfig) {
        if (userConfig) {
          for (var key in userConfig) {
            defaultConfig[key] = userConfig[key];
          }
        }
        var ret = [];
        for (var key in defaultConfig) {
          ret.push(key + "=\"" + defaultConfig[key] + "\"");
        }
        return ret.join(" ");
      }
    }, {
      key: "rect",
      value: function rect(userConfig) {
        var privates = internal(this);
        var config = {
          "x": 0,
          "y": 0,
          "width": 10,
          "height": 10,
          "stroke": "black",
          "stroke-width": 1,
          "fill": "white",
          "fill-opacity": 1,
          "stroke-opacity": 1,
          "opacity": 1
        };

        privates.children.push("<rect " + this.makeConfig(config, userConfig) + " />");

        if (config.x + config.width > this.width) {
          this.width = config.x + config.width;
        }
        if (config.y + config.height > this.height) {
          this.height = config.y + config.height;
        }
        this.generate();
      }
    }, {
      key: "circle",
      value: function circle(userConfig) {
        var privates = internal(this);
        var config = {
          "cx": 10,
          "cy": 10,
          "r": 10,
          "stroke": "black",
          "stroke-width": 1,
          "fill": "white",
          "fill-opacity": 1,
          "stroke-opacity": 1,
          "opacity": 1
        };

        privates.children.push("<circle " + this.makeConfig(config, userConfig) + " />");

        if (config.cx + config.r > this.width) {
          this.width = config.cx + config.r;
        }
        if (config.cy + config.r > this.height) {
          this.height = config.cy + config.r;
        }
        this.generate();
      }
    }, {
      key: "ellipse",
      value: function ellipse(userConfig) {
        var privates = internal(this);
        var config = {
          "cx": 10,
          "cy": 10,
          "rx": 5,
          "ry": 10,
          "stroke": "black",
          "stroke-width": 1,
          "fill": "white",
          "fill-opacity": 1,
          "stroke-opacity": 1,
          "opacity": 1
        };

        privates.children.push("<ellipse " + this.makeConfig(config, userConfig) + " />");

        if (config.cx + config.rx > this.width) {
          this.width = config.cx + config.rx;
        }
        if (config.cy + config.ry > this.height) {
          this.height = config.cy + config.ry;
        }
        this.generate();
      }
    }, {
      key: "line",
      value: function line(userConfig) {
        var privates = internal(this);
        var config = {
          "x1": 10,
          "y1": 10,
          "x2": 20,
          "y2": 20,
          "stroke": "black",
          "stroke-width": 1,
          "stroke-opacity": 1,
          "opacity": 1
        };

        privates.children.push("<line " + this.makeConfig(config, userConfig) + " />");

        if (Math.max(config.x1, config.x2) > this.width) {
          this.width = Math.max(config.x1, config.x2);
        }
        if (Math.max(config.y1, config.y2) > this.height) {
          this.height = Math.max(config.y1, config.y2);
        }
        this.generate();
      }
    }, {
      key: "polyline",
      value: function polyline(userConfig) {
        var privates = internal(this);
        var config = {
          "points": "20, 20, 30, 20, 30, 30, 20, 30",
          "stroke": "black",
          "stroke-width": 1,
          "fill": "white",
          "fill-opacity": 1,
          "stroke-opacity": 1,
          "opacity": 1
        };

        privates.children.push("<polyline " + this.makeConfig(config, userConfig) + " />");

        var max = -1;
        config.points.split(/, /).forEach(function (element) {
          var number = parseInt(element);
          if (!isNaN(number) && number > max) {
            max = number;
          }
        });

        if (max != -1 && max > this.width) {
          this.width = max;
        }
        if (max != -1 && max > this.height) {
          this.height = max;
        }
        this.generate();
      }
    }, {
      key: "polygon",
      value: function polygon(userConfig) {
        var privates = internal(this);
        var config = {
          "points": "20,20 30,20 30,30 20,30",
          "stroke": "black",
          "stroke-width": 1,
          "fill": "white",
          "fill-opacity": 1,
          "stroke-opacity": 1,
          "opacity": 1
        };

        privates.children.push("<polyline " + this.makeConfig(config, userConfig) + " />");

        var width = -1;
        var height = -1;
        // split points by comma or space
        config.points.split(/,| /).forEach(function (element, index) {
          var number = parseInt(element);
          if (index % 2 == 0) {
            // even
            if (number > width) width = number;
          } else {
            // odds
            if (number > height) height = number;
          }
        });

        if (width > 0 && width > this.width) this.width = width;
        if (height > 0 && height > this.height) this.height = height;
        this.generate();
      }
    }, {
      key: "generate",
      value: function generate() {
        var _this2 = this;

        var privates = internal(this);
        var svg = "<?xml version=\"1.0\"?>\n<svg width=\"" + this.width + "\" height=\"" + this.height + "\" " + ("style=\"width: " + this.width + "px; height: " + this.height + "px;\" ") + "xmlns=\"http://www.w3.org/2000/svg\" version=\"1.1\">\n";

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = privates.children[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var child = _step.value;

            svg += "  " + child + "\n";
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

        svg += "</svg>";

        var blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        var url = window.URL.createObjectURL(blob);
        var image = new Image();
        image.src = url;

        var Done = function Done() {
          privates.image = image;
          window.URL.revokeObjectURL(url);
          _this2.emit("change");
        };

        if (image.complete) {
          Done();
        } else {
          image.onload = Done;
        }
      }
    }, {
      key: "draw",
      value: function draw(renderer) {
        var privates = internal(this);
        var image = privates.image;
        if (image instanceof Image && image.width > 0 && image.height > 0) {
          this.drawImage(renderer, image, 0, 0, image.width, image.height, 0, 0, image.width, image.height);
        }
      }
    }]);

    return SpriteShape;
  })(Sprite.Display));
})();
