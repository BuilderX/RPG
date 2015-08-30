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

(function () {
  "use strict";

  function fixPosition(obj) {
    // 这里的数值用来修正方块位置，到真实位置的数值
    obj.x = obj.x * 32 + 16;
    obj.y = obj.y * 32 + 16; // 这里用来修正视角和人物模型行走的问题
  }

  // 加载区域，把括地图，角色，物品
  Game.loadArea = function (id, callback) {

    var preloadItems = ["bag", "gold"];
    var itemLoader = new Sprite.Loader();
    preloadItems.forEach(function (element) {
      itemLoader.add("/item/" + element + ".json");
    });
    itemLoader.start();
    itemLoader.on("complete", function (event) {
      preloadItems.forEach(function (element, index) {
        var itemData = event.data[index];
        Game.items[element] = new Game.Item(itemData);
      });
    });

    var loader = new Sprite.Loader();
    loader.add("map/" + id + ".json", "map/" + id + "_extra.json");
    loader.start();
    loader.on("complete", function (event) {
      var mapData = event.data[0];
      var mapExtra = event.data[1];

      for (var key in mapExtra) {
        mapData[key] = mapExtra[key];
      }

      var mapObj = new Game.Map(mapData);
      mapObj.on("complete", function () {
        var area = {
          actors: {},
          bags: {},
          doors: [],
          chests: [],
          hints: [],
          map: mapObj
        };

        var completeCount = -1;
        var Complete = function Complete() {
          completeCount++;
          if (completeCount >= 0) {
            callback(area);
          }
        };

        if (mapExtra.actors) {
          mapExtra.actors.forEach(function (element) {
            var actorLoader = new Sprite.Loader();
            actorLoader.add("actor/" + element.id + ".json");
            actorLoader.start();
            actorLoader.on("complete", function (event) {
              var actorData = Sprite.copy(event.data[0]);
              if (actorData.type == "monster") actorData.id = actorData.id + "_" + Sprite.uuid();
              actorData.x = element.x;
              actorData.y = element.y;
              fixPosition(actorData);
              actorData.mode = element.mode;
              var actorObj = new Game.Actor(actorData);
              actorObj.on("complete", function () {
                area.actors[actorObj.id] = actorObj;
                actorObj.draw(Game.layers.actorLayer);
                Complete();
              });
            });
          });
        }

        if (mapExtra.door) {
          mapExtra.door.forEach(function (element) {
            var door = Sprite.copy(element);
            fixPosition(door);
            door.destx = door.destx * 32 + 16;
            door.desty = door.desty * 32 + 16;
            door.type = "door";
            area.doors.push(door);
          });
        }

        if (mapExtra.chest) {
          mapExtra.chest.forEach(function (element) {
            var chest = Sprite.copy(element);
            fixPosition(chest);
            chest.destx = chest.destx * 32 + 16;
            chest.desty = chest.desty * 32 + 16;
            chest.type = "chest";
            area.chests.push(chest);
          });
        }

        if (mapExtra.hint) {
          mapExtra.hint.forEach(function (element) {
            var hint = Sprite.copy(element);
            fixPosition(hint);
            hint.type = "hint";
            area.hints.push(hint);
          });
        }

        Complete();
      });
    });
  };
})();
//# sourceMappingURL=GameArea.js.map
