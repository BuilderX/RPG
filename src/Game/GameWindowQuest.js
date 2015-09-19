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


  let win = Game.windows.quest = Game.Window.create("questWindow");

  win.html = `
    <div class="window-box">
      <div id="questWindowItemBar">
        <button id="questWindowClose" class="brownButton">关闭</button>
        <button id="questWindowCurrent" class="brownButton">当前任务</button>
        <button id="questWindowPast" class="brownButton">已完成</button>
      </div>
      <div id="questWindowTable"></div>
    </div>
  `;

  win.css = `
    #questWindowTable {
      width: 100%;
      overflow-y: auto;
      height: 320px;
    }

    .questWindowItem {
      border: 1px solid gray;
      border-radius: 10px;
      margin: 10px 10px;
    }

    .questWindowItem > button {
      width: 100px;
      height: 40px;
      border-radius: 5px;
    }

    #questWindowItemBar button {
      width: 100px;
      height: 30px;
      font-size: 16px;
      margin-bottom: 5px;
    }

    #questWindowClose {
      float: right;
    }
  `;

  let questWindowClose = win.querySelector("#questWindowClose");
  let questWindowCurrent = win.querySelector("#questWindowCurrent");
  let questWindowPast = win.querySelector("#questWindowPast");
  let questWindowTable = win.querySelector("#questWindowTable");


  questWindowClose.addEventListener("click", function () {
    win.hide();
  });

  win.whenUp(["esc"], function (key) {
    setTimeout(function () {
      questWindowClose.click();
    }, 20);
  });

  questWindowCurrent.addEventListener("click", function () {
    win.hide();
    win.current();
  });

  questWindowPast.addEventListener("click", function () {
    win.hide();
    win.past();
  });

  win.assign("current", function () {

    questWindowCurrent.disabled = true;
    questWindowPast.disabled = false;

    let table = "";
    let list = Game.hero.data.quest.current;
    list.forEach(function (quest) {

      let complete = true;
      if (quest.target.type == "kill") {
        for (let key in quest.target.kill) {
          let t = quest.target.kill[key];
          if (t.current < t.need) {
            complete = false;
          }
        }
      }

      let line = `<div class="questWindowItem">\n`;
      line += `  <label style="font-size: 20px; margin: 10px;">${quest.name}${complete?"[已完成]":"[未完成]"}</label>\n`;
      line += `  <div style="margin: 10px;">简介：${quest.description}</div>\n`;

      if (quest.reward) {
        line += `  <div style="margin: 10px;">任务奖励：`;
        if (quest.reward.gold) {
          line += `<label style="margin-right: 20px;">金币：${quest.reward.gold}</label>`;
        }
        if (quest.reward.exp) {
          line += `<label style="margin-right: 20px;">经验：${quest.reward.exp}</label>`;
        }
        line += `  </div>`;
      }

      if (quest.target.type == "kill") {
        for (let key in quest.target.kill) {
          let t = quest.target.kill[key];
          line += `<div style="margin: 10px;">${t.name}：${t.current} / ${t.need}</div>`;
        }
      }

      line += `  <label style="margin: 10px;">给予人：${quest.fromMap} 的 ${quest.fromName}</label>\n`;
      line += `  <label style="margin: 10px;">交付人：${quest.toMap} 的 ${quest.toName}</label>\n`;
      line += "</div>\n"
      table += line;
    });

    if (table.length <= 0) {
      table = "<div><label>没有正在进行的任务</label></div>";
    }

    questWindowTable.innerHTML = table;
    win.show();
  });

  win.assign("past", function () {

    questWindowCurrent.disabled = false;
    questWindowPast.disabled = true;

    let table = "";
    let list = Game.hero.data.quest.past;
    list.forEach(function (quest) {

      let line = `<div class="questWindowItem">\n`;
      line += `  <label style="font-size: 20px; margin: 10px;">${quest.name}[已完成]</label>\n`;
      line += `  <div style="margin: 10px;">简介：${quest.description}</div>\n`;

      if (quest.reward) {
        line += `  <div style="margin: 10px;">任务奖励：`;
        if (quest.reward.gold) {
          line += `<label style="margin-right: 20px;">金币：${quest.reward.gold}</label>`;
        }
        if (quest.reward.exp) {
          line += `<label style="margin-right: 20px;">经验：${quest.reward.exp}</label>`;
        }
        line += `  </div>`;
      }

      if (quest.target.type == "kill") {
        for (let key in quest.target.kill) {
          let t = quest.target.kill[key];
          line += `<div style="margin: 10px;">${t.name}：${t.current} / ${t.need}</div>`;
        }
      }

      line += `  <label style="margin: 10px;">给予人：${quest.fromMap} 的 ${quest.fromName}</label>\n`;
      line += `  <label style="margin: 10px;">交付人：${quest.toMap} 的 ${quest.toName}</label>\n`;
      line += "</div>\n"
      table += line;
    });

    if (table.length <= 0) {
      table = "<div><label>没有已完成任务</label></div>";
    }

    questWindowTable.innerHTML = table;
    win.show();
  });

  questWindowTable.addEventListener("click", function (event) {
    let id = event.target.getAttribute("data-id");
    if (id) {
      if (type == "remove") {
        Game.Archive.remove(id);
        win.open();
      } else if (type == "load") {
        Game.Archive.load(id);
        win.hide();
      }
    }
  });


})();
