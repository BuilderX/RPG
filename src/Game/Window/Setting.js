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

import Game from "../Base.js";
import Window from "../Window.js";
import Confirm from "../Component/Confirm.js";
import Choice from  "../Component/Choice.js";

let win = Window.create("settingWindow");

let WindowSetting = win;
export default WindowSetting;

import css from "../CSS/Setting.scss";
import html from "../HTML/Setting.html";

win.css = css;
win.html = html;

let settingWindowShortcut = win.querySelector("#settingWindowShortcut");
let settingWindowShortcutAll = win.querySelector("#settingWindowShortcutAll");

let settingWindowClose = win.querySelector("#settingWindowClose");
let settingWindowScale = win.querySelector("#settingWindowScale");

let settingWindowFullscreen = win.querySelector("#settingWindowFullscreen");
let settingWindowRendererType = win.querySelector("#settingWindowRendererType");

settingWindowShortcut.addEventListener("click", (event) => {
  Choice({1:0, 2:1, 3:2, 4:3, 5:4, 6:5, 7:6, 8:7}).then((choice) => {
    if (Number.isFinite(choice)) {
      Game.hero.data.bar[choice] = null;
      Game.windows.interface.refresh();
    }
  });
});


settingWindowShortcutAll.addEventListener("click", (event) => {
  Confirm("确定要删除所有快捷栏图表吗？").then(() => {
    for (let i = 0; i < 8; i++) {
      Game.hero.data.bar[i] = null;
    }
    Game.windows.interface.refresh();
  }).catch(() => {
    // no
  });
});

win.on("beforeShow", () => {
  settingWindowRendererType.textContent = Game.stage.rendererType;
});

settingWindowClose.addEventListener("click", (event) => {
  win.hide();
});

settingWindowScale.addEventListener("click", (event) => {
  Game.config.scale = !Game.config.scale;
  win.show();
});


win.whenUp(["esc"], (key) => {
  settingWindowClose.click();
});

win.assign("toggle", () => {
  if (!document.fullscreenElement &&    // alternative standard method
      !document.mozFullScreenElement &&
      !document.webkitFullscreenElement &&
      !document.msFullscreenElement
  ) {  // current working methods
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen();
    } else if (document.documentElement.msRequestFullscreen) {
      document.documentElement.msRequestFullscreen();
    } else if (document.documentElement.mozRequestFullScreen) {
      document.documentElement.mozRequestFullScreen();
    } else if (document.documentElement.webkitRequestFullscreen) {
      document.documentElement.webkitRequestFullscreen(Element.ALLOW_KEYBOARD_INPUT);
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    } else if (document.mozCancelFullScreen) {
      document.mozCancelFullScreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
});

settingWindowFullscreen.addEventListener("click", (event) => {
  win.toggle();
});
