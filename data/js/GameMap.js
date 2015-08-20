/*

A-RPG Game, Built using Node.js + JavaScript + ES6
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
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  "use strict";

  Game.MapClass = (function (_Sprite$Event) {
    _inherits(MapClass, _Sprite$Event);

    function MapClass(mapData) {
      var _this = this;

      _classCallCheck(this, MapClass);

      _get(Object.getPrototypeOf(MapClass.prototype), "constructor", this).call(this);

      this.data = mapData;
      this.id = this.data.id;

      if (this.data.entry) {
        this.data.entry.x = this.data.entry.x * 32 + 16;
        this.data.entry.y = this.data.entry.y * 32 + 16;
      }

      var imageUrls = [];
      this.data.tilesets.forEach(function (element) {
        imageUrls.push("/map/" + element.image);
      });

      var loader = new Sprite.Loader();
      loader.add(imageUrls);
      loader.start();
      loader.on("complete", function (event) {
        //console.log("mapData", this.data);
        _this.sheet = new Sprite.Sheet({
          images: event.data,
          width: _this.data.tilewidth,
          height: _this.data.tileheight
        });

        // 计算阻挡地图，如果为object则有阻挡，undefined则无阻挡
        _this.blockedMap = [];
        _this.blockedMap.length = _this.data.height;

        for (var i = 0; i < _this.blockedMap.length; i++) {
          _this.blockedMap[i] = [];
          _this.blockedMap[i].length = _this.data.width;
        }

        // 保存这个地图的所有地图块
        _this.container = new Sprite.Container();
        _this.container.name = _this.id;

        _this.data.layers.forEach(function (element, index, array) {
          var layer = element;

          if (layer.data) {
            // 渲染普通层
            for (var y = 0; y < layer.height; y++) {
              for (var x = 0; x < layer.width; x++) {
                var position = x + y * layer.width;
                var picture = layer.data[position] - 1;
                if (picture >= 0) {
                  var spriteClone = _this.sheet.clone();
                  spriteClone.x = x * _this.data.tilewidth;
                  spriteClone.y = y * _this.data.tileheight;
                  spriteClone.play(picture);

                  if (layer.properties && layer.properties.blocked) {
                    _this.blockedMap[y][x] = spriteClone;
                  }

                  _this.container.appendChild(spriteClone);
                }
              }
            }
          } else {// 渲染对象层

          }
        });

        _this.width = _this.data.width * _this.data.tilewidth;
        _this.height = _this.data.height * _this.data.tileheight;

        // 创建一个cache，地图很大可能会很大，所以以后可能还要想别的办法
        // 这个cache会创建一个看不到的canvas
        _this.container.cache(0, 0, _this.width, _this.height);

        // 开始计算迷你地图
        var ratio = _this.width / _this.height;
        var maxMinimapWidth = 780;
        var maxMinimapHeight = 360;
        var minimapWidth = 780;
        var minimapHeight = 780 / ratio;
        if (minimapHeight > maxMinimapHeight) {
          minimapHeight = 360;
          minimapWidth = 360 * ratio;
        }
        minimapHeight = Math.floor(minimapHeight);
        minimapWidth = Math.floor(minimapWidth);
        var minimapCanvas = document.createElement("canvas");
        minimapCanvas.width = minimapWidth;
        minimapCanvas.height = minimapHeight;
        var minimapContext = minimapCanvas.getContext("2d");
        minimapContext.drawImage(_this.container.cacheCanvas, 0, 0, _this.width, _this.height, 0, 0, minimapWidth, minimapHeight);

        var minimap = new Image();
        minimap.onload = function () {
          //this.minimap = new Sprite.Bitmap(minimap);
          //this.minimap.width = minimap.width;
          //this.minimap.height = minimap.height;
          //this.minimap.center.x = parseInt(minimap.width / 2);
          //this.minimap.center.y = parseInt(minimap.height / 2);

          var div = document.getElementById("minimap");
          while (div.hasChildNodes()) {
            div.removeChild(div.lastChild);
          }
          div.appendChild(minimap);
        };
        minimap.src = minimapCanvas.toDataURL();

        // 开始计算地图平均颜色（用迷你地图的平均颜色，用来作为document.body的背景）
        var rgb = { r: 0, g: 0, b: 0 };
        var minimapData = minimapContext.getImageData(0, 0, minimapCanvas.width, minimapCanvas.height).data;

        for (var i = 0; i < minimapData.length; i += 4) {
          rgb.r += minimapData[i];
          rgb.g += minimapData[i + 1];
          rgb.b += minimapData[i + 2];
        }

        // 把颜色取平均值然后转换为16进制，最后到css格式
        rgb.r = Math.floor(rgb.r / (minimapData.length / 4)).toString(16);
        rgb.g = Math.floor(rgb.g / (minimapData.length / 4)).toString(16);
        rgb.b = Math.floor(rgb.b / (minimapData.length / 4)).toString(16);
        _this.averageColor = "#" + rgb.r + rgb.g + rgb.b;

        // 发送完成事件，第二个参数代表一次性事件
        _this.emit("complete", true);
      });
    }

    // 返回某个坐标点所在的地格

    _createClass(MapClass, [{
      key: "tile",
      value: function tile(x, y) {
        x = x / this.data.tilewidth;
        y = y / this.data.tileheight;
        return {
          x: Math.floor(x),
          y: Math.floor(y)
        };
      }

      // 绘制图片，会改变Game.currentArea
    }, {
      key: "draw",
      value: function draw(layer) {
        layer.clear();
        layer.appendChild(this.container);

        if (this.averageColor) {
          document.body.style.backgroundColor = this.averageColor;
        }

        if (this.data.bgm) {
          // set loop = -1, 无限循环
          //var bgm = createjs.Sound.play(this.data.bgm, undefined, undefined, undefined, -1);
          //bgm.setVolume(0.2);
        }
      }
    }]);

    return MapClass;
  })(Sprite.Event);
})();
//# sourceMappingURL=GameMap.js.map
