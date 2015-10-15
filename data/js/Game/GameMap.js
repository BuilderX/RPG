/*

A-RPG Game, Built using JavaScript ES6
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

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  "use strict";

  var internal = Sprite.Namespace();

  Game.assign("Map", (function (_Sprite$Event) {
    _inherits(GameMap, _Sprite$Event);

    _createClass(GameMap, [{
      key: "hitTest",
      value: function hitTest(x, y) {
        if (internal(this).blockedMap[x * 10000 + y]) {
          return true;
        }
        return false;
      }
    }, {
      key: "hitWater",
      value: function hitWater(x, y) {
        if (internal(this).waterMap[x * 10000 + y]) {
          return true;
        }
        return false;
      }
    }, {
      key: "blockedMap",
      get: function get() {
        return internal(this).blockedMap;
      },
      set: function set(value) {
        throw new Error("Game.Map.blockedMap readonly");
      }
    }], [{
      key: "load",
      value: function load(id) {
        return new Promise(function (resolve, reject) {
          Sprite.load("map/" + id + ".json", "map/" + id + ".js").then(function (data) {
            var _data = _slicedToArray(data, 2);

            var mapData = _data[0];
            var mapInfo = _data[1];

            mapInfo = mapInfo(); // map/id.js文件会返回一个函数
            mapData.id = id;

            for (var key in mapInfo) {
              if (mapData.hasOwnProperty(key)) {
                console.log(key, mapData[key], mapInfo[key], mapInfo, mapData);
                throw new Error("Game.loadArea invalid data");
              }
              mapData[key] = mapInfo[key];
            }

            var mapObj = new Game.Map(mapData);
            mapObj.on("complete", function () {
              resolve(mapObj);
            });
          });
        });
      }
    }]);

    function GameMap(mapData) {
      var _this = this;

      _classCallCheck(this, GameMap);

      _get(Object.getPrototypeOf(GameMap.prototype), "constructor", this).call(this);
      var privates = internal(this);
      privates.data = mapData;

      var images = [];
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = privates.data.tilesets[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var element = _step.value;

          images.push("map/" + element.image);
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

      ;

      Sprite.load(images).then(function (data) {

        // 释放空间
        privates.data.tilesets = null;

        privates.sheet = new Sprite.Sheet({
          images: data,
          width: privates.data.tilewidth,
          height: privates.data.tileheight
        });

        // 水地图，用来进行hitWater测试
        privates.waterMap = {};
        // 计算阻挡地图，如果为object则有阻挡，undefined则无阻挡
        privates.blockedMap = {};

        // 保存这个地图的所有地图块
        // 这个空间在draw后会释放
        privates.layers = [];

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = privates.data.layers[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var layerData = _step2.value;

            var layerObj = null;
            if (layerData.name != "block") {
              layerObj = new Sprite.Container();
              layerObj.name = layerData.name;
              privates.layers.push(layerObj);
            }

            var width = _this.col;
            var height = _this.row;
            for (var y = 0; y < height; y++) {
              for (var x = 0; x < width; x++) {
                var position = x + y * width;
                var key = x * 10000 + y;
                var picture = layerData.data[position] - 1;

                if (picture >= 0) {
                  if (layerData.name == "block") {
                    privates.blockedMap[key] = true;
                  } else {
                    var frame = privates.sheet.getFrame(picture);
                    frame.x = x * privates.data.tilewidth;
                    frame.y = y * privates.data.tileheight;
                    layerObj.appendChild(frame);
                    if (layerData.name == "water") {
                      privates.waterMap[key] = true;
                    }
                  }
                }
              }
            }
          }

          // 发送完成事件，第二个参数代表此事件是一次性事件，即不会再次complete
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

        _this.emit("complete", true);
      });
    }

    _createClass(GameMap, [{
      key: "tile",

      // 返回某个坐标点所在的地格
      value: function tile(x, y) {
        if (Number.isFinite(x) && Number.isFinite(y)) {
          return {
            x: Math.floor(x / this.data.tilewidth),
            y: Math.floor(y / this.data.tileheight)
          };
        } else {
          console.error(x, y, this.data);
          throw new Error("Game.Map.tile got invalid arguments");
        }
      }

      // 绘制图片，会改变Game.currentArea
    }, {
      key: "draw",
      value: function draw() {
        var _this2 = this;

        var privates = internal(this);
        Game.layers.mapLayer.clear();

        privates.layers.forEach(function (element, index) {
          var layerData = privates.data.layers[index];

          if (Number.isFinite(layerData.opacity)) {
            element.alpha = layerData.opacity;
          }

          Game.layers.mapLayer.appendChild(element);
        });

        // 释放冗余空间
        privates.layers = null;
        privates.data.layers = null;

        // 给其他地图缓冲层
        Game.layers.mapLayer.cache(this.width, this.height);
        var map = new Sprite.Bitmap(Game.layers.mapLayer.cacheCanvas);
        Game.layers.mapLayer.clear();
        Game.layers.mapLayer.appendChild(map);

        var minimap = document.createElement("canvas");
        minimap.width = this.col * 8; // 原地图的四倍
        minimap.height = this.row * 8;
        var minimapContext = minimap.getContext("2d");
        minimapContext.drawImage(map.image, 0, 0, map.width, map.height, 0, 0, minimap.width, minimap.height);

        privates.minimap = minimap;

        if (privates.data.bgm) {
          // set loop = -1, 无限循环
          //let bgm = createjs.Sound.play(this.data.bgm, undefined, undefined, undefined, -1);
          //bgm.setVolume(0.2);
        }

        var block = {};

        // 预设人物占位
        if (privates.data.actors) {
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = privates.data.actors[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var actor = _step3.value;

              block[actor.x * 10000 + actor.y] = true;
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
        }

        // 生成怪物
        if (privates.data.spawnMonster && privates.data.spawnMonster.list && privates.data.spawnMonster.count) {
          for (var i = 0, len = privates.data.spawnMonster.count; i < len; i++) {
            var monsterId = null;
            var prob = 0;
            var r = Math.random();
            for (var key in privates.data.spawnMonster.list) {
              prob += privates.data.spawnMonster.list[key];
              if (r < prob) {
                monsterId = key;
                break;
              }
            }
            if (!monsterId) {
              monsterId = Object.keys(privates.data.spawnMonster.list)[0];
            }
            Game.Actor.load(monsterId).then(function (actorObj) {
              var x = undefined,
                  y = undefined;
              while (true) {
                x = Sprite.rand(0, _this2.col);
                y = Sprite.rand(0, _this2.row);
                if (!_this2.hitTest(x, y) && !block[x * 10000 + y]) {
                  break;
                }
              }
              block[x * 10000 + y] = true;
              actorObj.x = x;
              actorObj.y = y;
              Game.area.actors.add(actorObj);
              actorObj.draw();
            });
          }
        }

        if (privates.data.spawnItem && privates.data.spawnItem.list && privates.data.spawnItem.count) {
          var _loop = function (i, len) {
            var itemId = null;
            var prob = 0;
            var r = Math.random();
            for (var key in privates.data.spawnItem.list) {
              prob += privates.data.spawnItem.list[key];
              if (r < prob) {
                itemId = key;
                break;
              }
            }
            if (!itemId) {
              itemId = Object.keys(privates.data.spawnItem.list)[0];
            }
            Game.Item.load(itemId).then(function (itemObj) {
              var x = undefined,
                  y = undefined;
              while (true) {
                x = Sprite.rand(0, _this2.col);
                y = Sprite.rand(0, _this2.row);
                if (!_this2.hitTest(x, y) && !block[x * 10000 + y]) {
                  break;
                }
              }
              block[x * 10000 + y] = true;
              itemObj.x = x;
              itemObj.y = y;
              itemObj.inner = {};
              itemObj.inner[itemId] = 1;
              Game.area.items.add(itemObj);
              itemObj.draw();
            });
          };

          for (var i = 0, len = privates.data.spawnItem.count; i < len; i++) {
            _loop(i, len);
          }
        }
      }
    }, {
      key: "data",
      get: function get() {
        return internal(this).data;
      },
      set: function set(value) {
        throw new Error("Game.Map.data readonly");
      }
    }, {
      key: "id",
      get: function get() {
        return internal(this).id;
      },
      set: function set(value) {
        throw new Error("Game.Map.id readonly");
      }
    }, {
      key: "width",
      get: function get() {
        return this.data.width * this.data.tilewidth;
      },
      set: function set(value) {
        throw new Error("Game.Map.width readonly");
      }
    }, {
      key: "height",
      get: function get() {
        return this.data.height * this.data.tileheight;
      },
      set: function set(value) {
        throw new Error("Game.Map.height readonly");
      }
    }, {
      key: "col",
      get: function get() {
        // width / tilewidth
        return this.data.width;
      },
      set: function set(value) {
        throw new Error("Game.Map.col readonly");
      }
    }, {
      key: "row",
      get: function get() {
        // height / tileheight
        return this.data.height;
      },
      set: function set(value) {
        throw new Error("Game.Map.row readonly");
      }
    }, {
      key: "minimap",
      get: function get() {
        return internal(this).minimap;
      },
      set: function set(value) {
        throw new Error("Game.Map.minimap readonly");
      }
    }]);

    return GameMap;
  })(Sprite.Event));
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9HYW1lL0dhbWVNYXAuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkEsQ0FBQyxZQUFZO0FBQ1gsY0FBWSxDQUFDOztBQUViLE1BQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7QUFFbEMsTUFBSSxDQUFDLE1BQU0sQ0FBQyxLQUFLO2NBQVEsT0FBTzs7aUJBQVAsT0FBTzs7YUF5QnRCLGlCQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDYixZQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsRUFBRTtBQUN4QyxpQkFBTyxJQUFJLENBQUM7U0FDYjtBQUNELGVBQU8sS0FBSyxDQUFDO09BQ2Q7OzthQUVRLGtCQUFDLENBQUMsRUFBRSxDQUFDLEVBQUU7QUFDZCxZQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFDLEtBQUssR0FBQyxDQUFDLENBQUMsRUFBRTtBQUN0QyxpQkFBTyxJQUFJLENBQUM7U0FDYjtBQUNELGVBQU8sS0FBSyxDQUFDO09BQ2Q7OztXQUVjLGVBQUc7QUFDaEIsZUFBTyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUMsVUFBVSxDQUFDO09BQ2xDO1dBRWMsYUFBQyxLQUFLLEVBQUU7QUFDckIsY0FBTSxJQUFJLEtBQUssQ0FBQyw4QkFBOEIsQ0FBQyxDQUFDO09BQ2pEOzs7YUEzQ1csY0FBQyxFQUFFLEVBQUU7QUFDZixlQUFPLElBQUksT0FBTyxDQUFDLFVBQVUsT0FBTyxFQUFFLE1BQU0sRUFBRTtBQUM1QyxnQkFBTSxDQUFDLElBQUksVUFBUSxFQUFFLHFCQUFnQixFQUFFLFNBQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxJQUFJLEVBQUU7dUNBQ3hDLElBQUk7O2dCQUF4QixPQUFPO2dCQUFFLE9BQU87O0FBQ3JC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O09BQzFDOzs7V0FFTyxlQUFHOztBQUNULGVBQU8sSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUE7T0FDeEI7V0FFTyxhQUFDLEtBQUssRUFBRTtBQUNkLGNBQU0sSUFBSSxLQUFLLENBQUMsdUJBQXVCLENBQUMsQ0FBQztPQUMxQzs7O1dBRVcsZUFBRztBQUNiLGVBQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLE9BQU8sQ0FBQztPQUMvQjtXQUVXLGFBQUMsS0FBSyxFQUFFO0FBQ2xCLGNBQU0sSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQztPQUM5Qzs7O1dBM0tzQixPQUFPO0tBQVMsTUFBTSxDQUFDLEtBQUssRUE0VG5ELENBQUM7Q0FHSixDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJHYW1lTWFwLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuQS1SUEcgR2FtZSwgQnVpbHQgdXNpbmcgSmF2YVNjcmlwdCBFUzZcbkNvcHlyaWdodCAoQykgMjAxNSBxaGR1YW4oaHR0cDovL3FoZHVhbi5jb20pXG5cblRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG5pdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxudGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbihhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG5cblRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2Zcbk1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbkdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG5cbllvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG5hbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cblxuKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgbGV0IGludGVybmFsID0gU3ByaXRlLk5hbWVzcGFjZSgpO1xuXG4gIEdhbWUuYXNzaWduKFwiTWFwXCIsIGNsYXNzIEdhbWVNYXAgZXh0ZW5kcyBTcHJpdGUuRXZlbnQge1xuXG4gICAgc3RhdGljIGxvYWQgKGlkKSB7XG4gICAgICByZXR1cm4gbmV3IFByb21pc2UoZnVuY3Rpb24gKHJlc29sdmUsIHJlamVjdCkge1xuICAgICAgICBTcHJpdGUubG9hZChgbWFwLyR7aWR9Lmpzb25gLCBgbWFwLyR7aWR9LmpzYCkudGhlbihmdW5jdGlvbiAoZGF0YSkge1xuICAgICAgICAgIGxldCBbbWFwRGF0YSwgbWFwSW5mb10gPSBkYXRhO1xuICAgICAgICAgIG1hcEluZm8gPSBtYXBJbmZvKCk7IC8vIG1hcC9pZC5qc+aWh+S7tuS8mui/lOWbnuS4gOS4quWHveaVsFxuICAgICAgICAgIG1hcERhdGEuaWQgPSBpZDtcblxuICAgICAgICAgIGZvciAobGV0IGtleSBpbiBtYXBJbmZvKSB7XG4gICAgICAgICAgICBpZiAobWFwRGF0YS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICAgIGNvbnNvbGUubG9nKGtleSwgbWFwRGF0YVtrZXldLCBtYXBJbmZvW2tleV0sIG1hcEluZm8sIG1hcERhdGEpO1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lLmxvYWRBcmVhIGludmFsaWQgZGF0YVwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG1hcERhdGFba2V5XSA9IG1hcEluZm9ba2V5XTtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgbWFwT2JqID0gbmV3IEdhbWUuTWFwKG1hcERhdGEpO1xuICAgICAgICAgIG1hcE9iai5vbihcImNvbXBsZXRlXCIsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJlc29sdmUobWFwT2JqKTtcbiAgICAgICAgICB9KVxuICAgICAgICB9KTtcbiAgICAgIH0pO1xuICAgIH1cblxuICAgIGhpdFRlc3QgKHgsIHkpIHtcbiAgICAgIGlmIChpbnRlcm5hbCh0aGlzKS5ibG9ja2VkTWFwW3gqMTAwMDAreV0pIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfVxuXG4gICAgaGl0V2F0ZXIgKHgsIHkpIHtcbiAgICAgIGlmIChpbnRlcm5hbCh0aGlzKS53YXRlck1hcFt4KjEwMDAwK3ldKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cblxuICAgIGdldCBibG9ja2VkTWFwICgpIHtcbiAgICAgIHJldHVybiBpbnRlcm5hbCh0aGlzKS5ibG9ja2VkTWFwO1xuICAgIH1cblxuICAgIHNldCBibG9ja2VkTWFwICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5NYXAuYmxvY2tlZE1hcCByZWFkb25seVwiKTtcbiAgICB9XG5cbiAgICBjb25zdHJ1Y3RvciAobWFwRGF0YSkge1xuICAgICAgc3VwZXIoKTtcbiAgICAgIGxldCBwcml2YXRlcyA9IGludGVybmFsKHRoaXMpO1xuICAgICAgcHJpdmF0ZXMuZGF0YSA9IG1hcERhdGE7XG5cbiAgICAgIGxldCBpbWFnZXMgPSBbXTtcbiAgICAgIGZvciAobGV0IGVsZW1lbnQgb2YgcHJpdmF0ZXMuZGF0YS50aWxlc2V0cykge1xuICAgICAgICBpbWFnZXMucHVzaChgbWFwLyR7ZWxlbWVudC5pbWFnZX1gKTtcbiAgICAgIH07XG5cbiAgICAgIFNwcml0ZS5sb2FkKGltYWdlcykudGhlbigoZGF0YSkgPT4ge1xuXG4gICAgICAgIC8vIOmHiuaUvuepuumXtFxuICAgICAgICBwcml2YXRlcy5kYXRhLnRpbGVzZXRzID0gbnVsbDtcblxuICAgICAgICBwcml2YXRlcy5zaGVldCA9IG5ldyBTcHJpdGUuU2hlZXQoe1xuICAgICAgICAgIGltYWdlczogZGF0YSxcbiAgICAgICAgICB3aWR0aDogcHJpdmF0ZXMuZGF0YS50aWxld2lkdGgsXG4gICAgICAgICAgaGVpZ2h0OiBwcml2YXRlcy5kYXRhLnRpbGVoZWlnaHQsXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIOawtOWcsOWbvu+8jOeUqOadpei/m+ihjGhpdFdhdGVy5rWL6K+VXG4gICAgICAgIHByaXZhdGVzLndhdGVyTWFwID0ge307XG4gICAgICAgIC8vIOiuoeeul+mYu+aMoeWcsOWbvu+8jOWmguaenOS4um9iamVjdOWImeaciemYu+aMoe+8jHVuZGVmaW5lZOWImeaXoOmYu+aMoVxuICAgICAgICBwcml2YXRlcy5ibG9ja2VkTWFwID0ge307XG5cbiAgICAgICAgLy8g5L+d5a2Y6L+Z5Liq5Zyw5Zu+55qE5omA5pyJ5Zyw5Zu+5Z2XXG4gICAgICAgIC8vIOi/meS4quepuumXtOWcqGRyYXflkI7kvJrph4rmlL5cbiAgICAgICAgcHJpdmF0ZXMubGF5ZXJzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgbGF5ZXJEYXRhIG9mIHByaXZhdGVzLmRhdGEubGF5ZXJzKSB7XG4gICAgICAgICAgbGV0IGxheWVyT2JqID0gbnVsbDtcbiAgICAgICAgICBpZiAobGF5ZXJEYXRhLm5hbWUgIT0gXCJibG9ja1wiKSB7XG4gICAgICAgICAgICBsYXllck9iaiA9IG5ldyBTcHJpdGUuQ29udGFpbmVyKCk7XG4gICAgICAgICAgICBsYXllck9iai5uYW1lID0gbGF5ZXJEYXRhLm5hbWU7XG4gICAgICAgICAgICBwcml2YXRlcy5sYXllcnMucHVzaChsYXllck9iaik7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgbGV0IHdpZHRoID0gdGhpcy5jb2w7XG4gICAgICAgICAgbGV0IGhlaWdodCA9IHRoaXMucm93O1xuICAgICAgICAgIGZvciAobGV0IHkgPSAwOyB5IDwgaGVpZ2h0OyB5KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgd2lkdGg7IHgrKykge1xuICAgICAgICAgICAgICBsZXQgcG9zaXRpb24gPSB4ICsgeSAqIHdpZHRoO1xuICAgICAgICAgICAgICBsZXQga2V5ID0geCAqIDEwMDAwICsgeTtcbiAgICAgICAgICAgICAgbGV0IHBpY3R1cmUgPSBsYXllckRhdGEuZGF0YVtwb3NpdGlvbl0gLSAxO1xuXG4gICAgICAgICAgICAgIGlmIChwaWN0dXJlID49IDApIHtcbiAgICAgICAgICAgICAgICBpZiAobGF5ZXJEYXRhLm5hbWUgPT0gXCJibG9ja1wiKSB7XG4gICAgICAgICAgICAgICAgICBwcml2YXRlcy5ibG9ja2VkTWFwW2tleV0gPSB0cnVlO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICBsZXQgZnJhbWUgPSBwcml2YXRlcy5zaGVldC5nZXRGcmFtZShwaWN0dXJlKTtcbiAgICAgICAgICAgICAgICAgIGZyYW1lLnggPSB4ICogcHJpdmF0ZXMuZGF0YS50aWxld2lkdGg7XG4gICAgICAgICAgICAgICAgICBmcmFtZS55ID0geSAqIHByaXZhdGVzLmRhdGEudGlsZWhlaWdodDtcbiAgICAgICAgICAgICAgICAgIGxheWVyT2JqLmFwcGVuZENoaWxkKGZyYW1lKTtcbiAgICAgICAgICAgICAgICAgIGlmIChsYXllckRhdGEubmFtZSA9PSBcIndhdGVyXCIpIHtcbiAgICAgICAgICAgICAgICAgICAgcHJpdmF0ZXMud2F0ZXJNYXBba2V5XSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAvLyDlj5HpgIHlrozmiJDkuovku7bvvIznrKzkuozkuKrlj4LmlbDku6PooajmraTkuovku7bmmK/kuIDmrKHmgKfkuovku7bvvIzljbPkuI3kvJrlho3mrKFjb21wbGV0ZVxuICAgICAgICB0aGlzLmVtaXQoXCJjb21wbGV0ZVwiLCB0cnVlKTtcbiAgICAgIH0pO1xuXG4gICAgfVxuXG4gICAgZ2V0IGRhdGEgKCkge1xuICAgICAgcmV0dXJuIGludGVybmFsKHRoaXMpLmRhdGE7XG4gICAgfVxuXG4gICAgc2V0IGRhdGEgKHZhbHVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lLk1hcC5kYXRhIHJlYWRvbmx5XCIpO1xuICAgIH1cblxuICAgIGdldCBpZCAoKSB7XG4gICAgICByZXR1cm4gaW50ZXJuYWwodGhpcykuaWQ7XG4gICAgfVxuXG4gICAgc2V0IGlkICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5NYXAuaWQgcmVhZG9ubHlcIik7XG4gICAgfVxuXG4gICAgZ2V0IHdpZHRoICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGEud2lkdGggKiB0aGlzLmRhdGEudGlsZXdpZHRoO1xuICAgIH1cblxuICAgIHNldCB3aWR0aCAodmFsdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWUuTWFwLndpZHRoIHJlYWRvbmx5XCIpO1xuICAgIH1cblxuICAgIGdldCBoZWlnaHQgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuZGF0YS5oZWlnaHQgKiB0aGlzLmRhdGEudGlsZWhlaWdodDtcbiAgICB9XG5cbiAgICBzZXQgaGVpZ2h0ICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5NYXAuaGVpZ2h0IHJlYWRvbmx5XCIpO1xuICAgIH1cblxuICAgIGdldCBjb2wgKCkgeyAvLyB3aWR0aCAvIHRpbGV3aWR0aFxuICAgICAgcmV0dXJuIHRoaXMuZGF0YS53aWR0aDtcbiAgICB9XG5cbiAgICBzZXQgY29sICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5NYXAuY29sIHJlYWRvbmx5XCIpO1xuICAgIH1cblxuICAgIGdldCByb3cgKCkgeyAvLyBoZWlnaHQgLyB0aWxlaGVpZ2h0XG4gICAgICByZXR1cm4gdGhpcy5kYXRhLmhlaWdodFxuICAgIH1cblxuICAgIHNldCByb3cgKHZhbHVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lLk1hcC5yb3cgcmVhZG9ubHlcIik7XG4gICAgfVxuXG4gICAgZ2V0IG1pbmltYXAgKCkge1xuICAgICAgcmV0dXJuIGludGVybmFsKHRoaXMpLm1pbmltYXA7XG4gICAgfVxuXG4gICAgc2V0IG1pbmltYXAgKHZhbHVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lLk1hcC5taW5pbWFwIHJlYWRvbmx5XCIpO1xuICAgIH1cblxuICAgIC8vIOi/lOWbnuafkOS4quWdkOagh+eCueaJgOWcqOeahOWcsOagvFxuICAgIHRpbGUgKHgsIHkpIHtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUoeCkgJiYgTnVtYmVyLmlzRmluaXRlKHkpKSB7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgeDogTWF0aC5mbG9vcih4IC8gdGhpcy5kYXRhLnRpbGV3aWR0aCksXG4gICAgICAgICAgeTogTWF0aC5mbG9vcih5IC8gdGhpcy5kYXRhLnRpbGVoZWlnaHQpXG4gICAgICAgIH07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKHgsIHksIHRoaXMuZGF0YSk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWUuTWFwLnRpbGUgZ290IGludmFsaWQgYXJndW1lbnRzXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIOe7mOWItuWbvueJh++8jOS8muaUueWPmEdhbWUuY3VycmVudEFyZWFcbiAgICBkcmF3ICgpIHtcbiAgICAgIGxldCBwcml2YXRlcyA9IGludGVybmFsKHRoaXMpO1xuICAgICAgR2FtZS5sYXllcnMubWFwTGF5ZXIuY2xlYXIoKTtcblxuICAgICAgcHJpdmF0ZXMubGF5ZXJzLmZvckVhY2goKGVsZW1lbnQsIGluZGV4KSA9PiB7XG4gICAgICAgIGxldCBsYXllckRhdGEgPSBwcml2YXRlcy5kYXRhLmxheWVyc1tpbmRleF07XG5cbiAgICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZShsYXllckRhdGEub3BhY2l0eSkpIHtcbiAgICAgICAgICBlbGVtZW50LmFscGhhID0gbGF5ZXJEYXRhLm9wYWNpdHk7XG4gICAgICAgIH1cblxuICAgICAgICBHYW1lLmxheWVycy5tYXBMYXllci5hcHBlbmRDaGlsZChlbGVtZW50KTtcbiAgICAgIH0pO1xuXG4gICAgICAvLyDph4rmlL7lhpfkvZnnqbrpl7RcbiAgICAgIHByaXZhdGVzLmxheWVycyA9IG51bGw7XG4gICAgICBwcml2YXRlcy5kYXRhLmxheWVycyA9IG51bGw7XG5cbiAgICAgIC8vIOe7meWFtuS7luWcsOWbvue8k+WGsuWxglxuICAgICAgR2FtZS5sYXllcnMubWFwTGF5ZXIuY2FjaGUodGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xuICAgICAgbGV0IG1hcCA9IG5ldyBTcHJpdGUuQml0bWFwKEdhbWUubGF5ZXJzLm1hcExheWVyLmNhY2hlQ2FudmFzKTtcbiAgICAgIEdhbWUubGF5ZXJzLm1hcExheWVyLmNsZWFyKCk7XG4gICAgICBHYW1lLmxheWVycy5tYXBMYXllci5hcHBlbmRDaGlsZChtYXApO1xuXG4gICAgICBsZXQgbWluaW1hcCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICBtaW5pbWFwLndpZHRoID0gdGhpcy5jb2wgKiA4OyAvLyDljp/lnLDlm77nmoTlm5vlgI1cbiAgICAgIG1pbmltYXAuaGVpZ2h0ID0gdGhpcy5yb3cgKiA4O1xuICAgICAgbGV0IG1pbmltYXBDb250ZXh0ID0gbWluaW1hcC5nZXRDb250ZXh0KFwiMmRcIik7XG4gICAgICBtaW5pbWFwQ29udGV4dC5kcmF3SW1hZ2UobWFwLmltYWdlLFxuICAgICAgICAwLCAwLCBtYXAud2lkdGgsIG1hcC5oZWlnaHQsXG4gICAgICAgIDAsIDAsIG1pbmltYXAud2lkdGgsIG1pbmltYXAuaGVpZ2h0KTtcblxuICAgICAgcHJpdmF0ZXMubWluaW1hcCA9IG1pbmltYXA7XG5cblxuICAgICAgaWYgKHByaXZhdGVzLmRhdGEuYmdtKSB7XG4gICAgICAgIC8vIHNldCBsb29wID0gLTEsIOaXoOmZkOW+queOr1xuICAgICAgICAvL2xldCBiZ20gPSBjcmVhdGVqcy5Tb3VuZC5wbGF5KHRoaXMuZGF0YS5iZ20sIHVuZGVmaW5lZCwgdW5kZWZpbmVkLCB1bmRlZmluZWQsIC0xKTtcbiAgICAgICAgLy9iZ20uc2V0Vm9sdW1lKDAuMik7XG4gICAgICB9XG5cbiAgICAgIGxldCBibG9jayA9IHt9O1xuXG4gICAgICAvLyDpooTorr7kurrnianljaDkvY1cbiAgICAgIGlmIChwcml2YXRlcy5kYXRhLmFjdG9ycykge1xuICAgICAgICBmb3IgKGxldCBhY3RvciBvZiBwcml2YXRlcy5kYXRhLmFjdG9ycykge1xuICAgICAgICAgIGJsb2NrW2FjdG9yLngqMTAwMDArYWN0b3IueV0gPSB0cnVlO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIOeUn+aIkOaAqueJqVxuICAgICAgaWYgKFxuICAgICAgICBwcml2YXRlcy5kYXRhLnNwYXduTW9uc3RlciAmJlxuICAgICAgICBwcml2YXRlcy5kYXRhLnNwYXduTW9uc3Rlci5saXN0ICYmXG4gICAgICAgIHByaXZhdGVzLmRhdGEuc3Bhd25Nb25zdGVyLmNvdW50XG4gICAgICApIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDAsIGxlbiA9IHByaXZhdGVzLmRhdGEuc3Bhd25Nb25zdGVyLmNvdW50OyBpIDwgbGVuOyBpKyspIHtcbiAgICAgICAgICBsZXQgbW9uc3RlcklkID0gbnVsbDtcbiAgICAgICAgICBsZXQgcHJvYiA9IDA7XG4gICAgICAgICAgbGV0IHIgPSBNYXRoLnJhbmRvbSgpO1xuICAgICAgICAgIGZvciAobGV0IGtleSBpbiBwcml2YXRlcy5kYXRhLnNwYXduTW9uc3Rlci5saXN0KSB7XG4gICAgICAgICAgICBwcm9iICs9IHByaXZhdGVzLmRhdGEuc3Bhd25Nb25zdGVyLmxpc3Rba2V5XTtcbiAgICAgICAgICAgIGlmIChyIDwgcHJvYikge1xuICAgICAgICAgICAgICBtb25zdGVySWQgPSBrZXk7XG4gICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIW1vbnN0ZXJJZCkge1xuICAgICAgICAgICAgbW9uc3RlcklkID0gT2JqZWN0LmtleXMocHJpdmF0ZXMuZGF0YS5zcGF3bk1vbnN0ZXIubGlzdClbMF07XG4gICAgICAgICAgfVxuICAgICAgICAgIEdhbWUuQWN0b3IubG9hZChtb25zdGVySWQpLnRoZW4oKGFjdG9yT2JqKSA9PiB7XG4gICAgICAgICAgICBsZXQgeCwgeTtcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgIHggPSBTcHJpdGUucmFuZCgwLCB0aGlzLmNvbCk7XG4gICAgICAgICAgICAgIHkgPSBTcHJpdGUucmFuZCgwLCB0aGlzLnJvdyk7XG4gICAgICAgICAgICAgIGlmICghdGhpcy5oaXRUZXN0KHgsIHkpICYmICFibG9ja1t4KjEwMDAwK3ldKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJsb2NrW3gqMTAwMDAreV0gPSB0cnVlO1xuICAgICAgICAgICAgYWN0b3JPYmoueCA9IHg7XG4gICAgICAgICAgICBhY3Rvck9iai55ID0geTtcbiAgICAgICAgICAgIEdhbWUuYXJlYS5hY3RvcnMuYWRkKGFjdG9yT2JqKTtcbiAgICAgICAgICAgIGFjdG9yT2JqLmRyYXcoKTtcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHByaXZhdGVzLmRhdGEuc3Bhd25JdGVtICYmXG4gICAgICAgIHByaXZhdGVzLmRhdGEuc3Bhd25JdGVtLmxpc3QgJiZcbiAgICAgICAgcHJpdmF0ZXMuZGF0YS5zcGF3bkl0ZW0uY291bnRcbiAgICAgICkge1xuICAgICAgICBmb3IgKGxldCBpID0gMCwgbGVuID0gcHJpdmF0ZXMuZGF0YS5zcGF3bkl0ZW0uY291bnQ7IGkgPCBsZW47IGkrKykge1xuICAgICAgICAgIGxldCBpdGVtSWQgPSBudWxsO1xuICAgICAgICAgIGxldCBwcm9iID0gMDtcbiAgICAgICAgICBsZXQgciA9IE1hdGgucmFuZG9tKCk7XG4gICAgICAgICAgZm9yIChsZXQga2V5IGluIHByaXZhdGVzLmRhdGEuc3Bhd25JdGVtLmxpc3QpIHtcbiAgICAgICAgICAgIHByb2IgKz0gcHJpdmF0ZXMuZGF0YS5zcGF3bkl0ZW0ubGlzdFtrZXldO1xuICAgICAgICAgICAgaWYgKHIgPCBwcm9iKSB7XG4gICAgICAgICAgICAgIGl0ZW1JZCA9IGtleTtcbiAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghaXRlbUlkKSB7XG4gICAgICAgICAgICBpdGVtSWQgPSBPYmplY3Qua2V5cyhwcml2YXRlcy5kYXRhLnNwYXduSXRlbS5saXN0KVswXTtcbiAgICAgICAgICB9XG4gICAgICAgICAgR2FtZS5JdGVtLmxvYWQoaXRlbUlkKS50aGVuKChpdGVtT2JqKSA9PiB7XG4gICAgICAgICAgICBsZXQgeCwgeTtcbiAgICAgICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICAgIHggPSBTcHJpdGUucmFuZCgwLCB0aGlzLmNvbCk7XG4gICAgICAgICAgICAgIHkgPSBTcHJpdGUucmFuZCgwLCB0aGlzLnJvdyk7XG4gICAgICAgICAgICAgIGlmICghdGhpcy5oaXRUZXN0KHgsIHkpICYmICFibG9ja1t4KjEwMDAwK3ldKSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGJsb2NrW3gqMTAwMDAreV0gPSB0cnVlO1xuICAgICAgICAgICAgaXRlbU9iai54ID0geDtcbiAgICAgICAgICAgIGl0ZW1PYmoueSA9IHk7XG4gICAgICAgICAgICBpdGVtT2JqLmlubmVyID0ge307XG4gICAgICAgICAgICBpdGVtT2JqLmlubmVyW2l0ZW1JZF0gPSAxO1xuICAgICAgICAgICAgR2FtZS5hcmVhLml0ZW1zLmFkZChpdGVtT2JqKTtcbiAgICAgICAgICAgIGl0ZW1PYmouZHJhdygpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cblxuICAgIH1cbiAgfSk7XG5cblxufSkoKTtcbiJdfQ==
