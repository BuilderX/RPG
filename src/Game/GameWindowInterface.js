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

  var win = Game.windows.interface = new Game.Window("interfaceWindow");

  win.html(`
    <div style="text-align: center; position: absolute; bottom: 10px; width: 100%; height: 60px;">
      <button id="interfaceWindowButton-0" class="interfaceWindowButton"></button>
      <button id="interfaceWindowButton-1" class="interfaceWindowButton"></button>
      <button id="interfaceWindowButton-2" class="interfaceWindowButton"></button>
      <button id="interfaceWindowButton-3" class="interfaceWindowButton"></button>
      <button id="interfaceWindowButton-4" class="interfaceWindowButton"></button>
      <button id="interfaceWindowButton-5" class="interfaceWindowButton"></button>
      <button id="interfaceWindowButton-6" class="interfaceWindowButton"></button>
      <button id="interfaceWindowButton-7" class="interfaceWindowButton"></button>
    </div>

    <div style="position: absolute; bottom: 10px; left: 20px; width: 100px; height: 60px;">
      <div style="width: 100px; height: 20px; margin: 5px 0; border: 1px solid black; background-color: white;">
        <div id="interfaceWindowHP" style="width: 100%; height: 100%; background-color: green;"></div>
      </div>
      <div style="width: 100px; height: 20px; margin: 5px 0; border: 1px solid black; background-color: white;">
        <div id="interfaceWindowSP" style="width: 100%; height: 100%; background-color: blue;"></div>
      </div>
    </div>

    <span id="interfaceWindowMap"></span>
    <span id="interfaceWindowDatetime"></span>

    <button id="interfaceWindowUse" class="interfaceWindowButton"></button>
    <button id="interfaceWindowMenu" class="interfaceWindowButton"></button>
  `);

  win.css(`
    #interfaceWindow {
      pointer-events: none;
    }

    button.interfaceWindowButton {
      width: 60px;
      height: 60px;
      border: 4px solid gray;
      border-radius: 10px;
      background-color: rgba(100, 100, 100, 0.5);
      display: inline-block;
      pointer-events: auto;
      background-repeat: no-repeat;
      background-size: cover;
    }

    button.interfaceWindowButton:hover {
      opacity: 0.5;
    }

    button.interfaceWindowButton > img {
      width: 100%;
      height: 100%;
    }

    span#interfaceWindowMap {
      position: absolute:
      top: 0px;
      background-color: rgba(100, 100, 100, 0.7);
      display: inline-block;
    }

    span#interfaceWindowDatetime {
      position: absolute:
      top: 200px;
      left: 0;
      background-color: rgba(100, 100, 100, 0.7);
      display: inline-block;
    }

    button#interfaceWindowUse {
      position: absolute;
      top: 5px;
      right: 85px;
      visibility: hidden;
      background-image: url("image/hint.png");
    }

    button#interfaceWindowMenu {
      position: absolute;
      top: 5px;
      right: 5px;
      background-image: url("image/setting.png");
    }

    button.interfaceWindowButton:disabled {
      cursor: default;
      pointer-events: none;
      background-color: gray;
      opacity: 0.5;
    }
  `);

  win.use = document.querySelector("button#interfaceWindowUse");

  var interfaceWindowMap = document.querySelector("span#interfaceWindowMap");
  var interfaceWindowMenu = document.querySelector("button#interfaceWindowMenu");

  Sprite.Input.whenUp(["esc"], function (key) {
    if (Game.windows.interface.only()) {
      setTimeout(function () {
        interfaceWindowMenu.click();
      }, 20);
    }
  });

  (function SettingBar () {
    // 设置技能栏
    for (var i = 0; i < 8; i++) {
      (function (button, index) {
        button.addEventListener("click", function (event) {
          var element = Game.hero.data.bar[index];
          if (element) {
            if (element.type == "skill")
              Game.hero.fire(element.id);
            else if (element.type == "item") {

            }
          }
        });
      })(document.querySelector(`button#interfaceWindowButton-${i}`), i);
    }

    function SkillFire (num) {
      var element = Game.hero.data.bar[num];
      if (element) {
        if (element.type == "skill") {
          var cooldown = Game.hero.fire(element.id);
          var button = document.querySelector(`button#interfaceWindowButton-${num}`);
          button.disabled = true;
          setTimeout(function () {
            button.disabled = false;
          }, cooldown);
          //button.style.disabled = "true";
        } else if (element.type == "item") {

        }
      }
    }

    Sprite.Input.whenUp(["1", "2", "3", "4", "5", "6", "7", "8"], function (key) {
      var num = parseInt(key);
      // 只有在interface窗口是only存在的时候才使用快捷键
      if (Number.isInteger(num) && Game.windows.interface.only()) {
        SkillFire(num - 1);
      }
    });

    Sprite.Input.whenUp(["e", "E"], function (key) {
      if (Game.windows.interface.showing()) {
        if (Game.hintObject) {
          win.use.click();
        }
      }
    });

    win.use.addEventListener("click", function (event) {
      if (Game.hintObject) {
        if (Game.hintObject.type && Game.hintObject.type == "door") {
          var destx = Game.hintObject.destx;
          var desty = Game.hintObject.desty;
          Game.clearStage();
          var newArea = Game.hintObject.dest;
          Game.loadArea(newArea, function (area) {
            Game.area = area;
            area.map.draw(Game.layers.mapLayer);
            Game.hero.data.area = newArea;
            Game.hero.draw(Game.layers.actorLayer);
            area.actors["hero"] = Game.hero;
            Game.hero.x = destx;
            Game.hero.y = desty;
            Game.windows.interface.show();
            Game.stage.update();
          });

        } else if (Game.hintObject.type && Game.hintObject.type == "chest") {
        } else if (Game.hintObject.type && Game.hintObject.type == "hint") {
          Game.popup(Game.hintObject, Game.hintObject.message)
        } else if (Game.hintObject instanceof Game.Actor) {
          Game.hintObject.contact();
        }
        else if (Game.hintObject instanceof Game.Item) {
          Game.hintObject.pickup();
        }
      }
    });

  })();

  win.register("status", function (hp, sp) {
    var interfaceWindowHP = document.querySelector("#interfaceWindowHP");
    var interfaceWindowSP = document.querySelector("#interfaceWindowSP");
    interfaceWindowHP.style.width = `${hp*100}%`;
    interfaceWindowSP.style.width = `${sp*100}%`;
    if (hp >= 0.5) {
      interfaceWindowHP.style.backgroundColor = "green";
    } else if (hp >= 0.25) {
      interfaceWindowHP.style.backgroundColor = "yellow";
    } else {
      interfaceWindowHP.style.backgroundColor = "red";
    }
  });

  win.register("datetime", function () {
    if (Game.hero && Game.hero.data && Number.isInteger(Game.hero.data.time)) {
      var YEARMIN = 60*24*30*12;
      var MONTHMIN = 60*24*30;
      var DAYMIN = 60*24;
      var HOURMIN = 60;
      var datetime = document.querySelector("span#interfaceWindowDatetime");
      var time = Game.hero.data.time;
      var year = Math.floor(time/YEARMIN);
      time = time % YEARMIN;
      var month = Math.floor(time/MONTHMIN);
      time = time % MONTHMIN;
      var day = Math.floor(time/DAYMIN);
      time = time % DAYMIN;
      var hour = Math.floor(time/HOURMIN);
      time = time % HOURMIN;
      var minute = time;
      year++;
      month++;
      day++;
      hour = hour.toString();
      while (hour.length < 2) hour = "0"+hour;
      minute = minute.toString();
      while (minute.length < 2) minute = "0"+minute;
      datetime.textContent = `帝国历${year}年${month}月${day}日 ${hour}:${minute}`;

      if (hour >= 20 || hour < 4) { // 20:00 to 4:00
        Game.stage.filter("brightness", -0.20);
      } else if (hour >= 4 && hour < 6) {
        Game.stage.filter("brightness", -0.1);
      } else if (hour >= 6 && hour < 8) {
        Game.stage.filter("brightness", 0.0);
      } else if (hour >= 8 && hour < 10) {
        Game.stage.filter("brightness", 0.05);
      } else if (hour >= 10 && hour < 12) {
        Game.stage.filter("brightness", 0.1);
      } else if (hour >= 12 && hour < 14) {
        Game.stage.filter("brightness", 0.05);
      } else if (hour >= 14 && hour < 16) {
        Game.stage.filter("brightness", 0.0);
      } else if (hour >= 16 && hour < 18) {
        Game.stage.filter("brightness", -0.1);
      } else if (hour >= 18 && hour < 20) {
        Game.stage.filter("brightness", -0.15);
      }
    }
  });

  setInterval(function () {
    if (Game.hero) {
      Game.hero.data.time++;
      Game.windows.interface.execute("datetime");
    }
  }, 1000);

  win.register("refresh", function () {
    for (var i = 0; i < 8; i++) {
      var element = Game.hero.data.bar[i];
      var container = document.querySelector(`button#interfaceWindowButton-${i}`);
      while (container.hasChildNodes())
        container.removeChild(container.lastChild);
      if (element) {
        var id = element.id;
        var type = element.type;
        if (type == "skill") {
          var skill = Game.skills[id];
          //container.appendChild(skill.icon.cloneNode());
          container.style.backgroundImage = `url("${skill.icon.src}")`;
        } else if (type == "item") {
          var item = Game.items[id];
          container.style.backgroundImage = `url("${item.icon.src}")`;
          //container.appendChild(item.icon.cloneNode());
        }
      } else {
        // empty bar element
        container.style.backgroundImage = "";
        //container.appendChild(document.createElement("img"));
      }
    }

    interfaceWindowMap.textContent = Game.area.map.data.name;
  });

  win.on("beforeShow", function () {
    Game.windows.interface.execute("refresh");
  });

  interfaceWindowMenu.addEventListener("click", function (event) {
    Game.windows.sysmenu.show();
  });

}());
