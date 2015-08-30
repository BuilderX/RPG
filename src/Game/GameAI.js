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

(function (Game) {
  "use strict";

  Game.AI = class AI {

    static actor () {
      if (Game.area && Game.area.actors) {
        Sprite.each(Game.area.actors, function (actor) {

          if (actor.data.type == "hero") {
            var barChanged = false;

            if (actor.data.hp < actor.data.$hp) {
              actor.data.hp++;
              barChanged = true;
            }

            if (actor.data.sp < actor.data.$sp) {
              actor.data.sp++;
              barChanged = true;
            }

            if (barChanged) {
              actor.refreshBar();
            }
          } else if (actor.data.type == "monster") {

            var barChanged = false;

            if (actor.data.hp < actor.data.$hp) {
              actor.data.hp++;
              barChanged = true;
            }

            if (actor.data.sp < actor.data.$sp) {
              actor.data.sp++;
              barChanged = true;
            }

            if (barChanged) {
              actor.refreshBar();
            }

            if (Game.hero && Game.hero.distance(actor) <= 32) {
              if (actor.y == Game.hero.y) { // left or right
                if (actor.x < Game.hero.x) { // left
                  actor.fire("sword01", "right");
                } else { // right
                  actor.fire("sword01", "left");
                }
              } else { // up or down
                if (actor.y < Game.hero.y) { // up
                  actor.fire("sword01", "down");
                } else { // down
                  actor.fire("sword01", "up");
                }
              }
            } else if (Game.hero && Game.hero.distance(actor) < 200) {
              actor.goto(Game.hero.x, Game.hero.y, "walk", true);
            } else if (actor.data.mode == "patrol") {
              if (Math.random() < 0.8) {
                return;
              }
              var x = actor.x;
              var y = actor.y;
              actor.goto(x + Sprite.rand(-50, 50), y + Sprite.rand(-50, 50), 4);
            }
          }
        });
      }
    }

    static start () {
      setInterval(function () {
        Game.AI.actor();
      }, 500);
    }

  };
})(Game);
