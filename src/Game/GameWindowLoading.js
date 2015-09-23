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

  let win = Game.windows.loading = Game.Window.create("loadingWindow");

  win.html = `
    <table><tbody><tr><td>
      <label>请稍等...<small id="loadingWindowProgress"></small></label>
    </td></tr></tbody></table>
  `;

  win.css = `
    .loadingWindow {
      text-align: center;
    }

    .loadingWindow table, .loadingWindow tbody, .loadingWindow tr, .loadingWindow td {
      width: 100%;
      height: 100%;
      margin: 0;
      padding: 0;
    }

    .loadingWindow label {
      padding: 50px;
      border-radius:25px;
      background-color: grey;
      font-size: 60px;
    }
  `;

  let loadingWindowProgress = win.querySelector("#loadingWindowProgress");

  win.assign("begin", function () {
    loadingWindowProgress.innerHTML = "";
    Game.windows.loading.show();
  });

  win.assign("update", function (value) {
    loadingWindowProgress.innerHTML = value;
  });

  win.assign("end", function () {
    Game.windows.loading.hide();
  });


})();
