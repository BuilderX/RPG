/*

Online A-RPG Game, Built using Node.js + createjs
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
(function () {
  "use strict";


  var MapClass = Game.MapClass = function (mapData) {
    var self = this;

    self.data = mapData;
    self.id = self.data.id;

    var images = [];

    self.data.tilesets.forEach(function (element) {
      images.push(element.image);
    });

    self.sheet = new createjs.SpriteSheet({
      images: images,
      frames: {
        width: self.data.tilewidth,
        height: self.data.tileheight
      }
    });

    // 计算阻挡地图，如果为object则有阻挡，undefined则无阻挡
    self.blockedMap = [];
    self.blockedMap.length = self.data.height;

    for(var i = 0; i < self.blockedMap.length; i++) {
      self.blockedMap[i] = [];
      self.blockedMap[i].length = self.data.width;
    }

    // 保存这个地图的所有地图块
    self.container = new createjs.Container();

    self.data.layers.forEach(function (element, index, array) {
      var layer = element;

      if (layer.data) { // 渲染普通层
        var sprite = new createjs.Sprite(self.sheet);
        for (var y = 0; y < layer.height; y++) {
          for (var x = 0; x < layer.width; x++) {
            var position = x + y * layer.width;
            var picture = layer.data[position] - 1;
            if (picture >= 0) {
              var spriteClone = sprite.clone();
              spriteClone.x = x * self.data.tilewidth;
              spriteClone.y = y * self.data.tileheight;
              spriteClone.gotoAndStop(picture);

              if (layer.properties && layer.properties.blocked) {
                self.blockedMap[y][x] = spriteClone;
              }

              self.container.addChild(spriteClone);
            }
          }
        }
      } else { // 渲染对象层

      }

    });


    self.width = self.data.width * self.data.tilewidth;
    self.height = self.data.height * self.data.tileheight;

    // 创建一个cache，地图很大可能会很大，所以以后可能还要想别的办法
    // 这个cache会让createjs创建一个看不到的canvas
    self.container.cache(0, 0, self.width, self.height);

    var ratio = self.width / self.height;
    var maxMinimapWidth = 740;
    var maxMinimapHeight = 330;
    var minimapWidth = 740;
    var minimapHeight = 740 / ratio;
    if (minimapHeight > maxMinimapHeight) {
      minimapHeight = 330;
      minimapWidth = 330 * ratio;
    }
    var minimapCanvas = document.createElement("canvas");
    minimapCanvas.width = minimapWidth;
    minimapCanvas.height = minimapHeight;
    var minimapContext = minimapCanvas.getContext("2d");
    minimapContext.drawImage(self.container.cacheCanvas, 0, 0,
      self.width, self.height, 0, 0, minimapWidth, minimapHeight);

    var minimap = new Image();
    minimap.onload = function () {
      self.minimap = new createjs.Bitmap(minimap);
      self.minimap.regX = parseInt(minimap.width / 2);
      self.minimap.regY = parseInt(minimap.height / 2);
    };
    minimap.src = minimapCanvas.toDataURL();

    Game.areas[self.id] = self;

    // 完成事件
    self.complete = true;
    if (self.listeners && self.listeners["complete"]) {
      for (var key in self.listeners["complete"]) {
        self.listeners["complete"][key](self);
      }
    }

  };

  MapClass.prototype.on = function (event, listener) {
    var self = this;

    if (!self.listeners)
      self.listeners = {};

    if (!self.listeners[event])
      self.listeners[event] = {};

    var id = Math.random().toString(16).substr(2);
    self.listeners[event][id] = listener;
  };

  MapClass.prototype.off = function (event, id) {
    var self = this;

    if (self.listeners[event] && self.listeners[event][id]) {
      delete self.listeners[event][id];
    }
  };

  MapClass.prototype.oncomplete = function (callback) {
    var self = this;

    if (self.complete) {
      callback(self);
    } else {
      self.on("complete", callback);
    }
  };

  // 返回某个坐标点所在的地格
  MapClass.prototype.tile = function (x, y) {
    var self = this;
    x = x / self.data.tilewidth;
    y = y / self.data.tileheight;
    return {
      x: Math.floor(x),
      y: Math.floor(y)
    };
  }

  // 绘制图片，会改变Game.currentArea
  MapClass.prototype.draw = function (layer) {
    var self = this;

    layer.addChild(self.container);

    if (self.data.bgm) {
      // set loop = -1, 无限循环
      //var bgm = createjs.Sound.play(self.data.bgm, undefined, undefined, undefined, -1);
      //bgm.setVolume(0.2);
    }
  };

})();
