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

  // 加载区域，把括地图，角色，物品
  Game.assign("loadArea", function (id, callback) {

    var preloadSoundEffects = {
      hurt: "sound/effect/hurt.ogg"
    };

    for (var key in preloadSoundEffects) {
      (function (key, url) {
        Sprite.Loader.create().add(url).start().on("complete", function (event) {
          Game.sounds[key] = event.data[0];
        });
      })(key, preloadSoundEffects[key]);
    }

    var preloadItems = ["bag", "gold"];
    preloadItems = preloadItems.filter(function (element) {
      if (Game.items && Game.items.hasOwnProperty(element)) {
        return false;
      }
      return true;
    });

    if (preloadItems.length > 0) {
      var itemLoader = Sprite.Loader.create();
      preloadItems.forEach(function (id) {
        Game.Item.load(id);
      });
    }

    Sprite.Loader.create().add("map/" + id + ".json", "map/" + id + ".js").start().on("complete", function (event) {

      var mapData = Sprite.copy(event.data[0]);
      var mapInfo = event.data[1]();
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

        var area = {
          actors: new Set(),
          bags: new Set(),
          touch: [], // touch或onto会触发的地点/物品
          onto: [], // onto会触发的地点/物品
          map: mapObj
        };

        var completeCount = -1;
        var Complete = function Complete() {
          completeCount++;
          if (completeCount >= 0) {
            callback(area);
          }
        };

        if (mapInfo.actors) {
          mapInfo.actors.forEach(function (element) {
            completeCount--;

            Game.Actor.load(element.id, function (actorObj) {

              for (var key in element) {
                actorObj.data[key] = element[key];
              }

              area.actors.add(actorObj);
              actorObj.draw(Game.layers.actorLayer);
              Complete();
            });
          });
        }

        if (mapInfo.onto) {
          mapInfo.onto.forEach(function (element) {
            var onto = Sprite.copy(element);
            onto.type = "onto";
            area.onto.push(onto);
          });
        }

        if (mapInfo.touch) {
          mapInfo.touch.forEach(function (element) {
            var touch = Sprite.copy(element);
            area.touch.push(touch);
          });
        }

        Complete();
      });
    });
  });
})();