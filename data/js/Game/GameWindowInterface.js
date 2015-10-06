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

  var win = Game.windows["interface"] = Game.Window.create("interfaceWindow");

  win.html = "\n    <div id=\"interfaceWindowBar\"></div>\n\n    <div style=\"position: absolute; bottom: 10px; left: 20px; width: 100px; height: 60px;\">\n      <div style=\"width: 100px; height: 20px; margin: 5px 0; border: 1px solid gray; background-color: white;\">\n        <div id=\"interfaceWindowHP\" style=\"width: 100%; height: 100%; background-color: green;\"></div>\n      </div>\n      <div style=\"width: 100px; height: 20px; margin: 5px 0; border: 1px solid gray; background-color: white;\">\n        <div id=\"interfaceWindowSP\" style=\"width: 100%; height: 100%; background-color: blue;\"></div>\n      </div>\n    </div>\n\n    <span id=\"interfaceWindowDatetime\"></span>\n    <span id=\"interfaceWindowMap\"></span>\n\n    <button id=\"interfaceWindowUse\" class=\"interfaceWindowButton\"></button>\n    <button id=\"interfaceWindowMenu\" class=\"interfaceWindowButton\"></button>\n  ";

  win.css = "\n\n    #interfaceWindowBar {\n      text-align: center;\n      position: absolute;\n      bottom: 10px;\n      width: 100%;\n      height: 60px;\n    }\n\n    .interfaceWindow {\n      /** 让interface窗口的主要窗口，不接受事件 */\n      pointer-events: none;\n    }\n\n    button.interfaceWindowButton {\n      margin-left: 3px;\n      margin-right: 3px;\n      width: 60px;\n      height: 60px;\n      border: 4px solid gray;\n      border-radius: 10px;\n      background-color: rgba(100, 100, 100, 0.5);\n      display: inline-block;\n      /** 让interface窗口的按钮，接受事件 */\n      pointer-events: auto;\n      background-repeat: no-repeat;\n      background-size: cover;\n    }\n\n    button.interfaceWindowButton:hover {\n      opacity: 0.5;\n    }\n\n    button.interfaceWindowButton > img {\n      width: 100%;\n      height: 100%;\n    }\n\n    #interfaceWindowMap {\n      position: absolute;\n      top: 35px;\n      left: 5px;\n      background-color: rgba(100, 100, 100, 0.7);\n      padding: 2px;\n    }\n\n    #interfaceWindowDatetime {\n      position: absolute;\n      top: 10px;\n      left: 5px;\n      background-color: rgba(100, 100, 100, 0.7);\n      padding: 2px;\n    }\n\n    button#interfaceWindowUse {\n      position: absolute;\n      top: 5px;\n      right: 85px;\n      visibility: hidden;\n      background-image: url(\"image/hint.png\");\n    }\n\n    button#interfaceWindowMenu {\n      position: absolute;\n      top: 5px;\n      right: 5px;\n      background-image: url(\"image/setting.png\");\n    }\n\n    interfaceWindowButton:disabled {\n      cursor: default;\n      pointer-events: none;\n      background-color: gray;\n      opacity: 0.5;\n    }\n\n    .interfaceWindowButtonText {\n      position: absolute;\n      background-color: white;\n      margin-left: -26px;\n      margin-top: 12px;\n    }\n  ";

  // 使用按钮
  var interfaceWindowUse = win.querySelector("button#interfaceWindowUse");
  // 技能栏按钮组
  var interfaceWindowBar = win.querySelector("div#interfaceWindowBar");
  // 地图信息
  var interfaceWindowMap = win.querySelector("#interfaceWindowMap");
  // 选项菜单
  var interfaceWindowMenu = win.querySelector("button#interfaceWindowMenu");
  // 玩家的hp
  var interfaceWindowHP = win.querySelector("#interfaceWindowHP");
  // 玩家的sp
  var interfaceWindowSP = win.querySelector("#interfaceWindowSP");

  win.assign("hideUse", function () {
    interfaceWindowUse.style.visibility = "hidden";
  });

  win.assign("showUse", function () {
    interfaceWindowUse.style.visibility = "visible";
  });

  win.on("active", function () {
    Game.start();
  });

  win.on("deactive", function () {
    Game.pause();
  });

  win.whenUp(["esc"], function (key) {
    if (Game.windows["interface"].atop) {
      setTimeout(function () {
        interfaceWindowMenu.click();
      }, 20);
    }
  });

  function InitInterfaceBar() {
    var buttonCount = 8;
    var buttonHTML = "";
    for (var i = 0; i < buttonCount; i++) {
      var line = "";
      line += "<button data-index=\"" + i + "\" class=\"interfaceWindowButton\">";
      line += "<label data-index=\"" + i + "\" class=\"interfaceWindowButtonText\"></label>";
      line += "</button>\n";
      buttonHTML += line;
    }
    interfaceWindowBar.innerHTML = buttonHTML;
  }

  setInterval(function () {
    if (Game.hero && Game.paused == false) {
      Game.hero.data.time++;
      Game.windows["interface"].datetime();
    }
  }, 1000);

  InitInterfaceBar();
  var buttons = win.querySelectorAll(".interfaceWindowButton");
  var buttonTexts = win.querySelectorAll(".interfaceWindowButtonText");

  interfaceWindowBar.addEventListener("click", function (event) {
    var index = event.target.getAttribute("data-index");
    if (index) {
      var element = Game.hero.data.bar[index];
      if (element) {
        if (element.type == "skill") {
          var cooldown = Game.hero.fire(element.id);
          if (cooldown) {
            event.target.disabled = true;
            setTimeout(function () {
              event.target.disabled = false;
            }, cooldown);
          }
        } else if (element.type == "item") {
          var itemId = element.id;
          var item = Game.items[itemId];
          item.heroUse();
          Game.windows["interface"].refresh();
        }
      }
    }
  });

  win.whenUp(["1", "2", "3", "4", "5", "6", "7", "8"], function (key) {
    var num = parseInt(key);
    if (Number.isInteger(num) && num >= 0 && num < buttons.length) {
      buttons[num - 1].click();
    }
  });

  win.whenUp(["e", "E", "space", "enter"], function (key) {
    if (Game.windows["interface"].showing) {
      if (Game.hintObject && Game.hintObject.heroUse) {
        Game.hintObject.heroUse();
      }
    }
  });

  interfaceWindowUse.addEventListener("click", function (event) {
    if (Game.hintObject && Game.hintObject.heroUse) {
      Game.hintObject.heroUse();
    }
  });

  win.assign("status", function () {
    if (Game.hero) {
      var hp = Game.hero.data.hp / Game.hero.data.$hp;
      var sp = Game.hero.data.sp / Game.hero.data.$sp;
      interfaceWindowHP.style.width = hp * 100 + "%";
      interfaceWindowSP.style.width = sp * 100 + "%";
      if (hp >= 0.5) {
        interfaceWindowHP.style.backgroundColor = "green";
      } else if (hp >= 0.25) {
        interfaceWindowHP.style.backgroundColor = "yellow";
      } else {
        interfaceWindowHP.style.backgroundColor = "red";
      }
    }
  });

  win.assign("datetime", function () {
    if (Game.hero && Game.hero.data && Number.isInteger(Game.hero.data.time)) {
      var YEARMIN = 60 * 24 * 30 * 12;
      var MONTHMIN = 60 * 24 * 30;
      var DAYMIN = 60 * 24;
      var HOURMIN = 60;
      var datetime = win.querySelector("#interfaceWindowDatetime");
      var time = Game.hero.data.time;
      var year = Math.floor(time / YEARMIN);
      time = time % YEARMIN;
      var month = Math.floor(time / MONTHMIN);
      time = time % MONTHMIN;
      var day = Math.floor(time / DAYMIN);
      time = time % DAYMIN;
      var hour = Math.floor(time / HOURMIN);
      time = time % HOURMIN;
      var minute = time;
      year++;
      month++;
      day++;
      hour = hour.toString();
      while (hour.length < 2) hour = "0" + hour;
      minute = minute.toString();
      while (minute.length < 2) minute = "0" + minute;
      datetime.textContent = month + "月" + day + "日 " + hour + ":" + minute;

      if (hour >= 20 || hour < 4) {
        // 20:00 to 4:00
        Game.stage.filter("brightness", -0.15);
      } else if (hour >= 4 && hour < 6) {
        Game.stage.filter("brightness", -0.1);
      } else if (hour >= 6 && hour < 8) {
        Game.stage.filter("brightness", -0.05);
      } else if (hour >= 8 && hour < 10) {
        Game.stage.filter("brightness", 0.0);
      } else if (hour >= 10 && hour < 12) {
        Game.stage.filter("brightness", 0.05);
      } else if (hour >= 12 && hour < 14) {
        Game.stage.filter("brightness", 0.0);
      } else if (hour >= 14 && hour < 16) {
        Game.stage.filter("brightness", 0.0);
      } else if (hour >= 16 && hour < 18) {
        Game.stage.filter("brightness", -0.05);
      } else if (hour >= 18 && hour < 20) {
        Game.stage.filter("brightness", -0.1);
      }
    }
  });

  win.assign("refresh", function () {
    for (var i = 0; i < 8; i++) {
      var element = Game.hero.data.bar[i];
      var button = buttons[i];
      var text = buttonTexts[i];
      button.disabled = false;
      text.disabled = false;

      if (element) {
        var id = element.id;
        var type = element.type;
        if (type == "skill") {
          var skill = Game.skills[id];
          button.style.backgroundImage = "url(\"" + skill.icon.src + "\")";
          text.textContent = skill.data.cost;
        } else if (type == "item") {
          var item = Game.items[id];
          button.style.backgroundImage = "url(\"" + item.icon.src + "\")";
          if (Game.hero.data.items[id]) {
            text.textContent = Game.hero.data.items[id];
          } else {
            text.textContent = "0";
            button.disabled = true;
            text.disabled = true;
          }
        }
      } else {
        // empty bar element
        text.textContent = "";
        button.style.backgroundImage = "";
      }
    }

    interfaceWindowMap.textContent = Game.area.map.data.name;
  });

  interfaceWindowMenu.addEventListener("click", function (event) {
    Game.windows.sysmenu.show();
  });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9HYW1lL0dhbWVXaW5kb3dJbnRlcmZhY2UuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQW9CQSxDQUFDLFlBQVk7QUFDWCxjQUFZLENBQUM7O0FBRWIsTUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sYUFBVSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLGlCQUFpQixDQUFDLENBQUM7O0FBRXpFLEtBQUcsQ0FBQyxJQUFJLGc0QkFpQlAsQ0FBQzs7QUFFRixLQUFHLENBQUMsR0FBRyxxeURBbUZOLENBQUM7OztBQUdGLE1BQUksa0JBQWtCLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQywyQkFBMkIsQ0FBQyxDQUFDOztBQUV4RSxNQUFJLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsd0JBQXdCLENBQUMsQ0FBQzs7QUFFckUsTUFBSSxrQkFBa0IsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLHFCQUFxQixDQUFDLENBQUM7O0FBRWxFLE1BQUksbUJBQW1CLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyw0QkFBNEIsQ0FBQyxDQUFDOztBQUUxRSxNQUFJLGlCQUFpQixHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMsb0JBQW9CLENBQUMsQ0FBQzs7QUFFaEUsTUFBSSxpQkFBaUIsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLG9CQUFvQixDQUFDLENBQUM7O0FBRWhFLEtBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFlBQVk7QUFDaEMsc0JBQWtCLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7R0FDaEQsQ0FBQyxDQUFDOztBQUVILEtBQUcsQ0FBQyxNQUFNLENBQUMsU0FBUyxFQUFFLFlBQVk7QUFDaEMsc0JBQWtCLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxTQUFTLENBQUM7R0FDakQsQ0FBQyxDQUFDOztBQUVILEtBQUcsQ0FBQyxF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SSxDQUFDLElBQUksQ0FBQztTQUNwQyxNQUFNLElBQUksSUFBSSxJQUFJLE1BQU0sRUFBRTtBQUN6QixjQUFJLElBQUksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQzFCLGdCQUFNLENBQUMsS0FBSyxDQUFDLGVBQWUsY0FBVyxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsUUFBSSxDQUFDO0FBQ3pELGNBQUksSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFO0FBQzVCLGdCQUFJLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsQ0FBQztXQUM3QyxNQUFNO0FBQ0wsZ0JBQUksQ0FBQyxXQUFXLEdBQUcsR0FBRyxDQUFDO0FBQ3ZCLGtCQUFNLENBQUMsUUFBUSxHQUFHLElBQUksQ0FBQztBQUN2QixnQkFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUM7V0FDdEI7U0FDRjtPQUNGLE1BQU07O0FBRUwsWUFBSSxDQUFDLFdBQVcsR0FBRyxFQUFFLENBQUM7QUFDdEIsY0FBTSxDQUFDLEtBQUssQ0FBQyxlQUFlLEdBQUcsRUFBRSxDQUFDO09BQ25DO0tBQ0Y7O0FBRUQsc0JBQWtCLENBQUMsV0FBVyxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUM7R0FDMUQsQ0FBQyxDQUFDOztBQUVILHFCQUFtQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFVLEtBQUssRUFBRTtBQUM3RCxRQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUM3QixDQUFDLENBQUM7Q0FHSixDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJHYW1lV2luZG93SW50ZXJmYWNlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuQS1SUEcgR2FtZSwgQnVpbHQgdXNpbmcgSmF2YVNjcmlwdCBFUzZcbkNvcHlyaWdodCAoQykgMjAxNSBxaGR1YW4oaHR0cDovL3FoZHVhbi5jb20pXG5cblRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG5pdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxudGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbihhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG5cblRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2Zcbk1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbkdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG5cbllvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG5hbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cblxuKi9cblxuKGZ1bmN0aW9uICgpIHtcbiAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgbGV0IHdpbiA9IEdhbWUud2luZG93cy5pbnRlcmZhY2UgPSBHYW1lLldpbmRvdy5jcmVhdGUoXCJpbnRlcmZhY2VXaW5kb3dcIik7XG5cbiAgd2luLmh0bWwgPSBgXG4gICAgPGRpdiBpZD1cImludGVyZmFjZVdpbmRvd0JhclwiPjwvZGl2PlxuXG4gICAgPGRpdiBzdHlsZT1cInBvc2l0aW9uOiBhYnNvbHV0ZTsgYm90dG9tOiAxMHB4OyBsZWZ0OiAyMHB4OyB3aWR0aDogMTAwcHg7IGhlaWdodDogNjBweDtcIj5cbiAgICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogMTAwcHg7IGhlaWdodDogMjBweDsgbWFyZ2luOiA1cHggMDsgYm9yZGVyOiAxcHggc29saWQgZ3JheTsgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XCI+XG4gICAgICAgIDxkaXYgaWQ9XCJpbnRlcmZhY2VXaW5kb3dIUFwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgYmFja2dyb3VuZC1jb2xvcjogZ3JlZW47XCI+PC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICAgIDxkaXYgc3R5bGU9XCJ3aWR0aDogMTAwcHg7IGhlaWdodDogMjBweDsgbWFyZ2luOiA1cHggMDsgYm9yZGVyOiAxcHggc29saWQgZ3JheTsgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XCI+XG4gICAgICAgIDxkaXYgaWQ9XCJpbnRlcmZhY2VXaW5kb3dTUFwiIHN0eWxlPVwid2lkdGg6IDEwMCU7IGhlaWdodDogMTAwJTsgYmFja2dyb3VuZC1jb2xvcjogYmx1ZTtcIj48L2Rpdj5cbiAgICAgIDwvZGl2PlxuICAgIDwvZGl2PlxuXG4gICAgPHNwYW4gaWQ9XCJpbnRlcmZhY2VXaW5kb3dEYXRldGltZVwiPjwvc3Bhbj5cbiAgICA8c3BhbiBpZD1cImludGVyZmFjZVdpbmRvd01hcFwiPjwvc3Bhbj5cblxuICAgIDxidXR0b24gaWQ9XCJpbnRlcmZhY2VXaW5kb3dVc2VcIiBjbGFzcz1cImludGVyZmFjZVdpbmRvd0J1dHRvblwiPjwvYnV0dG9uPlxuICAgIDxidXR0b24gaWQ9XCJpbnRlcmZhY2VXaW5kb3dNZW51XCIgY2xhc3M9XCJpbnRlcmZhY2VXaW5kb3dCdXR0b25cIj48L2J1dHRvbj5cbiAgYDtcblxuICB3aW4uY3NzID0gYFxuXG4gICAgI2ludGVyZmFjZVdpbmRvd0JhciB7XG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICBwb3NpdGlvbjogYWJzb2x1dGU7XG4gICAgICBib3R0b206IDEwcHg7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGhlaWdodDogNjBweDtcbiAgICB9XG5cbiAgICAuaW50ZXJmYWNlV2luZG93IHtcbiAgICAgIC8qKiDorqlpbnRlcmZhY2Xnqpflj6PnmoTkuLvopoHnqpflj6PvvIzkuI3mjqXlj5fkuovku7YgKi9cbiAgICAgIHBvaW50ZXItZXZlbnRzOiBub25lO1xuICAgIH1cblxuICAgIGJ1dHRvbi5pbnRlcmZhY2VXaW5kb3dCdXR0b24ge1xuICAgICAgbWFyZ2luLWxlZnQ6IDNweDtcbiAgICAgIG1hcmdpbi1yaWdodDogM3B4O1xuICAgICAgd2lkdGg6IDYwcHg7XG4gICAgICBoZWlnaHQ6IDYwcHg7XG4gICAgICBib3JkZXI6IDRweCBzb2xpZCBncmF5O1xuICAgICAgYm9yZGVyLXJhZGl1czogMTBweDtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTAwLCAxMDAsIDEwMCwgMC41KTtcbiAgICAgIGRpc3BsYXk6IGlubGluZS1ibG9jaztcbiAgICAgIC8qKiDorqlpbnRlcmZhY2Xnqpflj6PnmoTmjInpkq7vvIzmjqXlj5fkuovku7YgKi9cbiAgICAgIHBvaW50ZXItZXZlbnRzOiBhdXRvO1xuICAgICAgYmFja2dyb3VuZC1yZXBlYXQ6IG5vLXJlcGVhdDtcbiAgICAgIGJhY2tncm91bmQtc2l6ZTogY292ZXI7XG4gICAgfVxuXG4gICAgYnV0dG9uLmludGVyZmFjZVdpbmRvd0J1dHRvbjpob3ZlciB7XG4gICAgICBvcGFjaXR5OiAwLjU7XG4gICAgfVxuXG4gICAgYnV0dG9uLmludGVyZmFjZVdpbmRvd0J1dHRvbiA+IGltZyB7XG4gICAgICB3aWR0aDogMTAwJTtcbiAgICAgIGhlaWdodDogMTAwJTtcbiAgICB9XG5cbiAgICAjaW50ZXJmYWNlV2luZG93TWFwIHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogMzVweDtcbiAgICAgIGxlZnQ6IDVweDtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IHJnYmEoMTAwLCAxMDAsIDEwMCwgMC43KTtcbiAgICAgIHBhZGRpbmc6IDJweDtcbiAgICB9XG5cbiAgICAjaW50ZXJmYWNlV2luZG93RGF0ZXRpbWUge1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgdG9wOiAxMHB4O1xuICAgICAgbGVmdDogNXB4O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgxMDAsIDEwMCwgMTAwLCAwLjcpO1xuICAgICAgcGFkZGluZzogMnB4O1xuICAgIH1cblxuICAgIGJ1dHRvbiNpbnRlcmZhY2VXaW5kb3dVc2Uge1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgdG9wOiA1cHg7XG4gICAgICByaWdodDogODVweDtcbiAgICAgIHZpc2liaWxpdHk6IGhpZGRlbjtcbiAgICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybChcImltYWdlL2hpbnQucG5nXCIpO1xuICAgIH1cblxuICAgIGJ1dHRvbiNpbnRlcmZhY2VXaW5kb3dNZW51IHtcbiAgICAgIHBvc2l0aW9uOiBhYnNvbHV0ZTtcbiAgICAgIHRvcDogNXB4O1xuICAgICAgcmlnaHQ6IDVweDtcbiAgICAgIGJhY2tncm91bmQtaW1hZ2U6IHVybChcImltYWdlL3NldHRpbmcucG5nXCIpO1xuICAgIH1cblxuICAgIGludGVyZmFjZVdpbmRvd0J1dHRvbjpkaXNhYmxlZCB7XG4gICAgICBjdXJzb3I6IGRlZmF1bHQ7XG4gICAgICBwb2ludGVyLWV2ZW50czogbm9uZTtcbiAgICAgIGJhY2tncm91bmQtY29sb3I6IGdyYXk7XG4gICAgICBvcGFjaXR5OiAwLjU7XG4gICAgfVxuXG4gICAgLmludGVyZmFjZVdpbmRvd0J1dHRvblRleHQge1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogd2hpdGU7XG4gICAgICBtYXJnaW4tbGVmdDogLTI2cHg7XG4gICAgICBtYXJnaW4tdG9wOiAxMnB4O1xuICAgIH1cbiAgYDtcblxuICAvLyDkvb/nlKjmjInpkq5cbiAgbGV0IGludGVyZmFjZVdpbmRvd1VzZSA9IHdpbi5xdWVyeVNlbGVjdG9yKFwiYnV0dG9uI2ludGVyZmFjZVdpbmRvd1VzZVwiKTtcbiAgLy8g5oqA6IO95qCP5oyJ6ZKu57uEXG4gIGxldCBpbnRlcmZhY2VXaW5kb3dCYXIgPSB3aW4ucXVlcnlTZWxlY3RvcihcImRpdiNpbnRlcmZhY2VXaW5kb3dCYXJcIik7XG4gIC8vIOWcsOWbvuS/oeaBr1xuICBsZXQgaW50ZXJmYWNlV2luZG93TWFwID0gd2luLnF1ZXJ5U2VsZWN0b3IoXCIjaW50ZXJmYWNlV2luZG93TWFwXCIpO1xuICAvLyDpgInpobnoj5zljZVcbiAgbGV0IGludGVyZmFjZVdpbmRvd01lbnUgPSB3aW4ucXVlcnlTZWxlY3RvcihcImJ1dHRvbiNpbnRlcmZhY2VXaW5kb3dNZW51XCIpO1xuICAvLyDnjqnlrrbnmoRocFxuICBsZXQgaW50ZXJmYWNlV2luZG93SFAgPSB3aW4ucXVlcnlTZWxlY3RvcihcIiNpbnRlcmZhY2VXaW5kb3dIUFwiKTtcbiAgLy8g546p5a6255qEc3BcbiAgbGV0IGludGVyZmFjZVdpbmRvd1NQID0gd2luLnF1ZXJ5U2VsZWN0b3IoXCIjaW50ZXJmYWNlV2luZG93U1BcIik7XG5cbiAgd2luLmFzc2lnbihcImhpZGVVc2VcIiwgZnVuY3Rpb24gKCkge1xuICAgIGludGVyZmFjZVdpbmRvd1VzZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJoaWRkZW5cIjtcbiAgfSk7XG5cbiAgd2luLmFzc2lnbihcInNob3dVc2VcIiwgZnVuY3Rpb24gKCkge1xuICAgIGludGVyZmFjZVdpbmRvd1VzZS5zdHlsZS52aXNpYmlsaXR5ID0gXCJ2aXNpYmxlXCI7XG4gIH0pO1xuXG4gIHdpbi5vbihcImFjdGl2ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgR2FtZS5zdGFydCgpO1xuICB9KTtcblxuICB3aW4ub24oXCJkZWFjdGl2ZVwiLCBmdW5jdGlvbiAoKSB7XG4gICAgR2FtZS5wYXVzZSgpO1xuICB9KVxuXG4gIHdpbi53aGVuVXAoW1wiZXNjXCJdLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgaWYgKEdhbWUud2luZG93cy5pbnRlcmZhY2UuYXRvcCkge1xuICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIGludGVyZmFjZVdpbmRvd01lbnUuY2xpY2soKTtcbiAgICAgIH0sIDIwKTtcbiAgICB9XG4gIH0pO1xuXG4gIGZ1bmN0aW9uIEluaXRJbnRlcmZhY2VCYXIgKCkge1xuICAgIGxldCBidXR0b25Db3VudCA9IDg7XG4gICAgbGV0IGJ1dHRvbkhUTUwgPSBcIlwiO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYnV0dG9uQ291bnQ7IGkrKykge1xuICAgICAgbGV0IGxpbmUgPSBcIlwiO1xuICAgICAgbGluZSArPSBgPGJ1dHRvbiBkYXRhLWluZGV4PVwiJHtpfVwiIGNsYXNzPVwiaW50ZXJmYWNlV2luZG93QnV0dG9uXCI+YDtcbiAgICAgIGxpbmUgKz0gYDxsYWJlbCBkYXRhLWluZGV4PVwiJHtpfVwiIGNsYXNzPVwiaW50ZXJmYWNlV2luZG93QnV0dG9uVGV4dFwiPjwvbGFiZWw+YFxuICAgICAgbGluZSArPSBgPC9idXR0b24+XFxuYDtcbiAgICAgIGJ1dHRvbkhUTUwgKz0gbGluZTtcbiAgICB9XG4gICAgaW50ZXJmYWNlV2luZG93QmFyLmlubmVySFRNTCA9IGJ1dHRvbkhUTUw7XG4gIH1cblxuICBzZXRJbnRlcnZhbChmdW5jdGlvbiAoKSB7XG4gICAgaWYgKEdhbWUuaGVybyAmJiBHYW1lLnBhdXNlZCA9PSBmYWxzZSkge1xuICAgICAgR2FtZS5oZXJvLmRhdGEudGltZSsrO1xuICAgICAgR2FtZS53aW5kb3dzLmludGVyZmFjZS5kYXRldGltZSgpO1xuICAgIH1cbiAgfSwgMTAwMCk7XG5cbiAgSW5pdEludGVyZmFjZUJhcigpO1xuICBsZXQgYnV0dG9ucyA9IHdpbi5xdWVyeVNlbGVjdG9yQWxsKFwiLmludGVyZmFjZVdpbmRvd0J1dHRvblwiKTtcbiAgbGV0IGJ1dHRvblRleHRzID0gd2luLnF1ZXJ5U2VsZWN0b3JBbGwoXCIuaW50ZXJmYWNlV2luZG93QnV0dG9uVGV4dFwiKTtcblxuICBpbnRlcmZhY2VXaW5kb3dCYXIuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGxldCBpbmRleCA9IGV2ZW50LnRhcmdldC5nZXRBdHRyaWJ1dGUoXCJkYXRhLWluZGV4XCIpO1xuICAgIGlmIChpbmRleCkge1xuICAgICAgbGV0IGVsZW1lbnQgPSBHYW1lLmhlcm8uZGF0YS5iYXJbaW5kZXhdO1xuICAgICAgaWYgKGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKGVsZW1lbnQudHlwZSA9PSBcInNraWxsXCIpIHtcbiAgICAgICAgICBsZXQgY29vbGRvd24gPSBHYW1lLmhlcm8uZmlyZShlbGVtZW50LmlkKTtcbiAgICAgICAgICBpZiAoY29vbGRvd24pIHtcbiAgICAgICAgICAgIGV2ZW50LnRhcmdldC5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgZXZlbnQudGFyZ2V0LmRpc2FibGVkID0gZmFsc2U7XG4gICAgICAgICAgICB9LCBjb29sZG93bik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGVsZW1lbnQudHlwZSA9PSBcIml0ZW1cIikge1xuICAgICAgICAgIGxldCBpdGVtSWQgPSBlbGVtZW50LmlkO1xuICAgICAgICAgIGxldCBpdGVtID0gR2FtZS5pdGVtc1tpdGVtSWRdO1xuICAgICAgICAgIGl0ZW0uaGVyb1VzZSgpO1xuICAgICAgICAgIEdhbWUud2luZG93cy5pbnRlcmZhY2UucmVmcmVzaCgpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICB3aW4ud2hlblVwKFtcIjFcIiwgXCIyXCIsIFwiM1wiLCBcIjRcIiwgXCI1XCIsIFwiNlwiLCBcIjdcIiwgXCI4XCJdLCBmdW5jdGlvbiAoa2V5KSB7XG4gICAgbGV0IG51bSA9IHBhcnNlSW50KGtleSk7XG4gICAgaWYgKE51bWJlci5pc0ludGVnZXIobnVtKSAmJiBudW0gPj0gMCAmJiBudW0gPCBidXR0b25zLmxlbmd0aCkge1xuICAgICAgYnV0dG9uc1tudW0gLSAxXS5jbGljaygpO1xuICAgIH1cbiAgfSk7XG5cbiAgd2luLndoZW5VcChbXCJlXCIsIFwiRVwiLCBcInNwYWNlXCIsIFwiZW50ZXJcIl0sIGZ1bmN0aW9uIChrZXkpIHtcbiAgICBpZiAoR2FtZS53aW5kb3dzLmludGVyZmFjZS5zaG93aW5nKSB7XG4gICAgICBpZiAoR2FtZS5oaW50T2JqZWN0ICYmIEdhbWUuaGludE9iamVjdC5oZXJvVXNlKSB7XG4gICAgICAgIEdhbWUuaGludE9iamVjdC5oZXJvVXNlKCk7XG4gICAgICB9XG4gICAgfVxuICB9KTtcblxuICBpbnRlcmZhY2VXaW5kb3dVc2UuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIGlmIChHYW1lLmhpbnRPYmplY3QgJiYgR2FtZS5oaW50T2JqZWN0Lmhlcm9Vc2UpIHtcbiAgICAgIEdhbWUuaGludE9iamVjdC5oZXJvVXNlKCk7XG4gICAgfVxuICB9KTtcblxuICB3aW4uYXNzaWduKFwic3RhdHVzXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoR2FtZS5oZXJvKSB7XG4gICAgICBsZXQgaHAgPSBHYW1lLmhlcm8uZGF0YS5ocCAvIEdhbWUuaGVyby5kYXRhLiRocDtcbiAgICAgIGxldCBzcCA9IEdhbWUuaGVyby5kYXRhLnNwIC8gR2FtZS5oZXJvLmRhdGEuJHNwO1xuICAgICAgaW50ZXJmYWNlV2luZG93SFAuc3R5bGUud2lkdGggPSBgJHtocCoxMDB9JWA7XG4gICAgICBpbnRlcmZhY2VXaW5kb3dTUC5zdHlsZS53aWR0aCA9IGAke3NwKjEwMH0lYDtcbiAgICAgIGlmIChocCA+PSAwLjUpIHtcbiAgICAgICAgaW50ZXJmYWNlV2luZG93SFAuc3R5bGUuYmFja2dyb3VuZENvbG9yID0gXCJncmVlblwiO1xuICAgICAgfSBlbHNlIGlmIChocCA+PSAwLjI1KSB7XG4gICAgICAgIGludGVyZmFjZVdpbmRvd0hQLnN0eWxlLmJhY2tncm91bmRDb2xvciA9IFwieWVsbG93XCI7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbnRlcmZhY2VXaW5kb3dIUC5zdHlsZS5iYWNrZ3JvdW5kQ29sb3IgPSBcInJlZFwiO1xuICAgICAgfVxuICAgIH1cbiAgfSk7XG5cbiAgd2luLmFzc2lnbihcImRhdGV0aW1lXCIsIGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoR2FtZS5oZXJvICYmIEdhbWUuaGVyby5kYXRhICYmIE51bWJlci5pc0ludGVnZXIoR2FtZS5oZXJvLmRhdGEudGltZSkpIHtcbiAgICAgIGxldCBZRUFSTUlOID0gNjAqMjQqMzAqMTI7XG4gICAgICBsZXQgTU9OVEhNSU4gPSA2MCoyNCozMDtcbiAgICAgIGxldCBEQVlNSU4gPSA2MCoyNDtcbiAgICAgIGxldCBIT1VSTUlOID0gNjA7XG4gICAgICBsZXQgZGF0ZXRpbWUgPSB3aW4ucXVlcnlTZWxlY3RvcihcIiNpbnRlcmZhY2VXaW5kb3dEYXRldGltZVwiKTtcbiAgICAgIGxldCB0aW1lID0gR2FtZS5oZXJvLmRhdGEudGltZTtcbiAgICAgIGxldCB5ZWFyID0gTWF0aC5mbG9vcih0aW1lL1lFQVJNSU4pO1xuICAgICAgdGltZSA9IHRpbWUgJSBZRUFSTUlOO1xuICAgICAgbGV0IG1vbnRoID0gTWF0aC5mbG9vcih0aW1lL01PTlRITUlOKTtcbiAgICAgIHRpbWUgPSB0aW1lICUgTU9OVEhNSU47XG4gICAgICBsZXQgZGF5ID0gTWF0aC5mbG9vcih0aW1lL0RBWU1JTik7XG4gICAgICB0aW1lID0gdGltZSAlIERBWU1JTjtcbiAgICAgIGxldCBob3VyID0gTWF0aC5mbG9vcih0aW1lL0hPVVJNSU4pO1xuICAgICAgdGltZSA9IHRpbWUgJSBIT1VSTUlOO1xuICAgICAgbGV0IG1pbnV0ZSA9IHRpbWU7XG4gICAgICB5ZWFyKys7XG4gICAgICBtb250aCsrO1xuICAgICAgZGF5Kys7XG4gICAgICBob3VyID0gaG91ci50b1N0cmluZygpO1xuICAgICAgd2hpbGUgKGhvdXIubGVuZ3RoIDwgMikgaG91ciA9IFwiMFwiK2hvdXI7XG4gICAgICBtaW51dGUgPSBtaW51dGUudG9TdHJpbmcoKTtcbiAgICAgIHdoaWxlIChtaW51dGUubGVuZ3RoIDwgMikgbWludXRlID0gXCIwXCIrbWludXRlO1xuICAgICAgZGF0ZXRpbWUudGV4dENvbnRlbnQgPSBgJHttb250aH3mnIgke2RheX3ml6UgJHtob3VyfToke21pbnV0ZX1gO1xuXG4gICAgICBpZiAoaG91ciA+PSAyMCB8fCBob3VyIDwgNCkgeyAvLyAyMDowMCB0byA0OjAwXG4gICAgICAgIEdhbWUuc3RhZ2UuZmlsdGVyKFwiYnJpZ2h0bmVzc1wiLCAtMC4xNSk7XG4gICAgICB9IGVsc2UgaWYgKGhvdXIgPj0gNCAmJiBob3VyIDwgNikge1xuICAgICAgICBHYW1lLnN0YWdlLmZpbHRlcihcImJyaWdodG5lc3NcIiwgLTAuMSk7XG4gICAgICB9IGVsc2UgaWYgKGhvdXIgPj0gNiAmJiBob3VyIDwgOCkge1xuICAgICAgICBHYW1lLnN0YWdlLmZpbHRlcihcImJyaWdodG5lc3NcIiwgLTAuMDUpO1xuICAgICAgfSBlbHNlIGlmIChob3VyID49IDggJiYgaG91ciA8IDEwKSB7XG4gICAgICAgIEdhbWUuc3RhZ2UuZmlsdGVyKFwiYnJpZ2h0bmVzc1wiLCAwLjApO1xuICAgICAgfSBlbHNlIGlmIChob3VyID49IDEwICYmIGhvdXIgPCAxMikge1xuICAgICAgICBHYW1lLnN0YWdlLmZpbHRlcihcImJyaWdodG5lc3NcIiwgMC4wNSk7XG4gICAgICB9IGVsc2UgaWYgKGhvdXIgPj0gMTIgJiYgaG91ciA8IDE0KSB7XG4gICAgICAgIEdhbWUuc3RhZ2UuZmlsdGVyKFwiYnJpZ2h0bmVzc1wiLCAwLjApO1xuICAgICAgfSBlbHNlIGlmIChob3VyID49IDE0ICYmIGhvdXIgPCAxNikge1xuICAgICAgICBHYW1lLnN0YWdlLmZpbHRlcihcImJyaWdodG5lc3NcIiwgMC4wKTtcbiAgICAgIH0gZWxzZSBpZiAoaG91ciA+PSAxNiAmJiBob3VyIDwgMTgpIHtcbiAgICAgICAgR2FtZS5zdGFnZS5maWx0ZXIoXCJicmlnaHRuZXNzXCIsIC0wLjA1KTtcbiAgICAgIH0gZWxzZSBpZiAoaG91ciA+PSAxOCAmJiBob3VyIDwgMjApIHtcbiAgICAgICAgR2FtZS5zdGFnZS5maWx0ZXIoXCJicmlnaHRuZXNzXCIsIC0wLjEpO1xuICAgICAgfVxuXG4gICAgfVxuICB9KTtcblxuICB3aW4uYXNzaWduKFwicmVmcmVzaFwiLCBmdW5jdGlvbiAoKSB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCA4OyBpKyspIHtcbiAgICAgIGxldCBlbGVtZW50ID0gR2FtZS5oZXJvLmRhdGEuYmFyW2ldO1xuICAgICAgbGV0IGJ1dHRvbiA9IGJ1dHRvbnNbaV07XG4gICAgICBsZXQgdGV4dCA9IGJ1dHRvblRleHRzW2ldO1xuICAgICAgYnV0dG9uLmRpc2FibGVkID0gZmFsc2U7XG4gICAgICB0ZXh0LmRpc2FibGVkID0gZmFsc2U7XG5cbiAgICAgIGlmIChlbGVtZW50KSB7XG4gICAgICAgIGxldCBpZCA9IGVsZW1lbnQuaWQ7XG4gICAgICAgIGxldCB0eXBlID0gZWxlbWVudC50eXBlO1xuICAgICAgICBpZiAodHlwZSA9PSBcInNraWxsXCIpIHtcbiAgICAgICAgICBsZXQgc2tpbGwgPSBHYW1lLnNraWxsc1tpZF07XG4gICAgICAgICAgYnV0dG9uLnN0eWxlLmJhY2tncm91bmRJbWFnZSA9IGB1cmwoXCIke3NraWxsLmljb24uc3JjfVwiKWA7XG4gICAgICAgICAgdGV4dC50ZXh0Q29udGVudCA9IHNraWxsLmRhdGEuY29zdDtcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlID09IFwiaXRlbVwiKSB7XG4gICAgICAgICAgbGV0IGl0ZW0gPSBHYW1lLml0ZW1zW2lkXTtcbiAgICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gYHVybChcIiR7aXRlbS5pY29uLnNyY31cIilgO1xuICAgICAgICAgIGlmIChHYW1lLmhlcm8uZGF0YS5pdGVtc1tpZF0pIHtcbiAgICAgICAgICAgIHRleHQudGV4dENvbnRlbnQgPSBHYW1lLmhlcm8uZGF0YS5pdGVtc1tpZF07XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRleHQudGV4dENvbnRlbnQgPSBcIjBcIjtcbiAgICAgICAgICAgIGJ1dHRvbi5kaXNhYmxlZCA9IHRydWU7XG4gICAgICAgICAgICB0ZXh0LmRpc2FibGVkID0gdHJ1ZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGVtcHR5IGJhciBlbGVtZW50XG4gICAgICAgIHRleHQudGV4dENvbnRlbnQgPSBcIlwiO1xuICAgICAgICBidXR0b24uc3R5bGUuYmFja2dyb3VuZEltYWdlID0gXCJcIjtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpbnRlcmZhY2VXaW5kb3dNYXAudGV4dENvbnRlbnQgPSBHYW1lLmFyZWEubWFwLmRhdGEubmFtZTtcbiAgfSk7XG5cbiAgaW50ZXJmYWNlV2luZG93TWVudS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgR2FtZS53aW5kb3dzLnN5c21lbnUuc2hvdygpO1xuICB9KTtcblxuXG59KSgpO1xuIl19
