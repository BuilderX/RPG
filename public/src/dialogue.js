/*

Online A-RPG Game, Built using Node.js + createjs
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

  Game.dialogue = {};

  Game.oninit(function () {
    var talkBox = Game.dialogue.talkBox = new createjs.DOMElement("talkBox");
    Game.dialogueLayer.addChild(talkBox);
    talkBox.regX = 150;
    talkBox.regY = 20;
    talkBox.visible = 0;

    createjs.Ticker.on("tick", function () {
      if (Game.hero) {
        talkBox.x = Game.hero.x;
        talkBox.y = Game.hero.y;
      }
    });

  });

  Game.dialogue.talk = function () {
  };

  document.addEventListener("keydown", function (event) {
    event = event || window.event;
    var keyCode = event.keyCode;

    if (keyCode == 13) { // Enter
      if (Game.dialogue.talkBox)  {
        if (Game.dialogue.talkBox.visible) {
          Game.dialogue.talkBox.visible = 0;
          var text = document.getElementById("talkInput").value;
          document.getElementById("talkInput").value = "";
          if (text.trim().length) {
            Game.io.talk(text.trim());
          }
        } else {
          Game.dialogue.talkBox.visible = 1;
          document.getElementById("talkInput").focus();
          setTimeout(function () {
            document.getElementById("talkInput").focus()
          }, 100);
        }
        Game.update();
      }
    }
  });

  // Textplit函数用来把文字分行，因为easeljs的lineWidth的wrap机制不支持中文
  Game.dialogue.textSplit = function (text, maxWidth) {
    var textBox = new createjs.Text();

    var ret = [];
    var line = "";
    for (var i = 0; i < text.length; i++) {
      var newline = line + text[i];
      textBox.text = newline;
      if (textBox.getMeasuredWidth() > maxWidth) {
        ret.push(newline);
        line = text[i];
      } else {
        line = newline;
      }
    }

    if (line.length)
      ret.push(line);

    return ret.join("\n");
  }


})();
