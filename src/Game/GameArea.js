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

(function () {
  "use strict";

  // 加载区域，把括地图，角色，物品
  Game.loadArea = function (id, callback) {

    var preloadItems = ["bag", "gold"];
    preloadItems = preloadItems.filter(function (element) {
      if (Game.items && Game.items[element]) {
        return false;
      }
      return true;
    });

    if (preloadItems.length > 0) {
      var itemLoader = new Sprite.Loader();
      preloadItems.forEach(function (element) {
        itemLoader.add(`/item/${element}.json`);
      });
      itemLoader.start();
      itemLoader.on("complete", function (event) {
        preloadItems.forEach(function (element, index) {
          var itemData = event.data[index];
          Game.items[element] = new Game.Item(itemData);
        })
      });
    }

    var loader = new Sprite.Loader();
    loader.add(`map/${id}.json`,
      `map/${id}_extra.json`);
    loader.start();

    loader.on("complete", function (event) {

      var mapData = event.data[0];
      var mapExtra = event.data[1];

      for (let key in mapExtra) {
        mapData[key] = mapExtra[key];
      }

      var mapObj = new Game.Map(mapData);
      mapObj.on("complete", function () {

        var area = {
          actors: new Set(),
          bags: {},
          doors: [],
          chests: [],
          hints: [],
          touch: [],
          map: mapObj
        };

        var completeCount = -1;
        var Complete = () => {
          completeCount++;
          if (completeCount >= 0) {
            callback(area);
          }
        };

        if (mapExtra.actors) {
          mapExtra.actors.forEach(function (element) {
            completeCount--;
            var actorLoader = new Sprite.Loader();
            actorLoader.add(`actor/${element.id}.json`).start();
            actorLoader.on("complete", function (event) {
              var actorData = Sprite.copy(event.data[0]);
              actorData.x = element.x;
              actorData.y = element.y;
              actorData.mode = element.mode;
              var actorObj = new Game.Actor(actorData);
              actorObj.on("complete", function () {
                area.actors.add(actorObj);
                actorObj.draw(Game.layers.actorLayer);
                if (element.hasOwnProperty("visible")) {
                  actorObj.visible = element.visible;
                }
                Complete();
              });
            });
          });
        }

        if (mapExtra.door) {
          mapExtra.door.forEach(function (element) {
            var door = Sprite.copy(element);
            door.type = "door";
            area.doors.push(door);
          });
        }

        if (mapExtra.chest) {
          mapExtra.chest.forEach(function (element) {
            var chest = Sprite.copy(element);
            chest.type = "chest";
            area.chests.push(chest);
          });
        }

        if (mapExtra.hint) {
          mapExtra.hint.forEach(function (element) {
            var hint = Sprite.copy(element);
            hint.type = "hint";
            area.hints.push(hint);
          });
        }

        if (mapExtra.touch) {
          mapExtra.touch.forEach(function (element) {
            var touch = Sprite.copy(element);
            touch.type = "touch";
            area.touch.push(touch);
          });
        }

        Complete();
      });
    });
  };

})();
