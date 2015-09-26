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

  var win = Game.windows.loading = Game.Window.create("loadingWindow");

  win.html = "\n    <table><tbody><tr><td>\n      <label>请稍等...<small id=\"loadingWindowProgress\"></small></label>\n    </td></tr></tbody></table>\n  ";

  win.css = "\n    .loadingWindow {\n      text-align: center;\n    }\n\n    .loadingWindow table, .loadingWindow tbody, .loadingWindow tr, .loadingWindow td {\n      width: 100%;\n      height: 100%;\n      margin: 0;\n      padding: 0;\n    }\n\n    .loadingWindow label {\n      padding: 50px;\n      border-radius:25px;\n      background-color: grey;\n      font-size: 60px;\n    }\n  ";

  var loadingWindowProgress = win.querySelector("#loadingWindowProgress");

  win.assign("begin", function () {
    loadingWindowProgress.innerHTML = "";
    win.show();
  });

  win.assign("update", function (value) {
    loadingWindowProgress.innerHTML = value;
  });

  win.assign("end", function () {
    win.hide();
  });
})();
//# sourceMappingURL=GameWindowLoading.js.map
