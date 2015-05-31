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


  document.getElementById("registerBox").innerHTML = `
    <div id="previewBox">
      <h4>预览：</h4>
      <canvas id="preview" width="256" height="64"></canvas>
    </div>

    <div style="padding-top: 140px;"></div>

    <div>
      <label>
      性别
      </label>
      <select onchange="SelectHero(event)" data-type="sex" class="">
        <option value="male">男性</option>
        <option value="female">女性</option>
      </select>
    </div>

    <div>
      <label>
      皮肤
      </label>
      <select onchange="SelectHero(event)" data-type="body" class="">
        <option value="light">粉白</option>
        <option value="dark">深色</option>
        <option value="dark2">更深</option>
        <option value="tanned">黄白</option>
        <option value="tanned2">黄灰</option>
      </select>
    </div>

    <div>
      <label>
      眼睛
      </label>
      <select onchange="SelectHero(event)" data-type="eyes" class="">
        <option value="blue">蓝色</option>
        <option value="brown">棕色</option>
        <option value="gray">灰色</option>
        <option value="green">绿色</option>
        <option value="orange">橙色</option>
        <option value="purple">紫色</option>
        <option value="red">红色</option>
        <option value="yellow">黄色</option>
      </select>
    </div>

    <div id="customMaleHair">
      <label>
      头发
      </label>
      <select onchange="SelectHero(event)" data-type="hair" class="">
        <option value="">无</option>
        <option value="bedhead">Bedhead</option>
        <option value="long">Long</option>
        <option value="longhawk">Longhawk</option>
        <option value="messy1">Messy1</option>
        <option value="messy2">Messy2</option>
        <option value="mohawk">Mohawk</option>
        <option value="page">Page</option>
        <option value="parted">Parted</option>
        <option value="plain">Plain</option>
        <option value="shorthawk">Shorthawk</option>
      </select>
    </div>

    <div id="customFemaleHair" style="display: none;">
      <label>
      头发
      </label>
      <select onchange="SelectHero(event)" data-type="hair" class="">
        <option value="">无</option>
        <option value="bangs">bangs</option>
        <option value="bangslong">bangslong</option>
        <option value="bangslong2">bangslong2</option>
        <option value="bunches">bunches</option>
        <option value="loose">loose</option>
        <option value="pixie">pixie</option>
        <option value="ponytail">ponytail</option>
        <option value="ponytail2">ponytail2</option>
        <option value="princess">princess</option>
        <option value="shoulderl">shoulderl</option>
        <option value="shoulderr">shoulderr</option>
        <option value="swoop">swoop</option>
        <option value="unkempt">unkempt</option>
      </select>
    </div>

    <div>
      <label>
      发色
      </label>
      <select onchange="SelectHero(event)" data-type="haircolor" class="">
        <option value="black">Black</option>
        <option value="blonde">Blonde</option>
        <option value="blonde2">blonde2</option>
        <option value="blue">blue</option>
        <option value="blue2">blue2</option>
        <option value="brown">brown</option>
        <option value="brown2">brown2</option>
        <option value="brunette">brunette</option>
        <option value="brunette2">brunette2</option>
        <option value="dark-blonde">dark-blonde</option>
        <option value="gold">gold</option>
        <option value="gray">gray</option>
        <option value="gray2">gray2</option>
        <option value="green">green</option>
        <option value="green2">green2</option>
        <option value="light-blonde">light-blonde</option>
        <option value="light-blonde2">light-blonde2</option>
        <option value="pink">pink</option>
        <option value="pink2">pink2</option>
        <option value="purple">purple</option>
        <option value="raven">raven</option>
        <option value="raven2">raven2</option>
        <option value="redhead">redhead</option>
        <option value="redhead2">redhead2</option>
        <option value="ruby-red">ruby-red</option>
        <option value="white">white</option>
        <option value="white-blonde">white-blonde</option>
        <option value="white-blonde2">white-blonde2</option>
        <option value="white-cyan">white-cyan</option>
      </select>
    </div>

    <div>
      <label>
      帽子
      </label>
      <select onchange="SelectHero(event)" data-type="head" class="">
        <option value="">无</option>
        <option value="chainhat">chainhat</option>
        <option value="chain_hood">chain_hood</option>
        <option value="cloth_hood">cloth_hood</option>
        <option value="leather_cap">leather_cap</option>
        <option value="red">red</option>
      </select>
    </div>

    <div>
      <label>
      上衣
      </label>
      <select onchange="SelectHero(event)" data-type="shirts" class="">
        <option value="">无</option>
        <option value="brown">brown</option>
        <option value="maroon">maroon</option>
        <option value="teal">teal</option>
        <option value="white">white</option>
      </select>
    </div>

    <div>
      <label>
      裤子
      </label>
      <select onchange="SelectHero(event)" data-type="pants" class="">
        <option value="">无</option>
        <option value="magenta">magenta</option>
        <option value="red">red</option>
        <option value="teal">teal</option>
        <option value="white">white</option>
      </select>
    </div>

    <div>
      <label>
      鞋子
      </label>
      <select onchange="SelectHero(event)"  data-type="shoes" class="">
        <option value="">无</option>
        <option value="black">black</option>
        <option value="brown">brown</option>
        <option value="maroon">maroon</option>
      </select>
    </div>


    <div>
      <label>
      头盔
      </label>
      <select onchange="SelectHero(event)" data-type="armorhelms" class="">
        <option value="">无</option>
        <option value="golden">黄金</option>
        <option value="metal">白银</option>
      </select>
    </div>

    <div>
      <label>
      胸甲
      </label>
      <select onchange="SelectHero(event)" data-type="armorchest" class="">
        <option value="">无</option>
        <option value="golden">黄金</option>
        <option value="metal">白银</option>
      </select>
    </div>

    <div>
      <label>
      臂甲
      </label>
      <select onchange="SelectHero(event)" data-type="armorarm" class="">
        <option value="">无</option>
        <option value="golden">黄金</option>
        <option value="metal">白银</option>
      </select>
    </div>

    <div>
      <label>
      腿甲
      </label>
      <select onchange="SelectHero(event)" data-type="armorlegs" class="">
        <option value="">无</option>
        <option value="golden">黄金</option>
        <option value="metal">白银</option>
      </select>
    </div>

    <div>
      <label>
      足甲
      </label>
      <select onchange="SelectHero(event)" data-type="armorfeet" class="">
        <option value="">无</option>
        <option value="golden">黄金</option>
        <option value="metal">白银</option>
      </select>
    </div>

    <div>
      <input id="regName" placeholder="名字" type="text">
    </div>
    <div>
    <input id="regPassword" placeholder="您的秘密符文" type="password">
    </div>
    <div>
    <input id="regRepeat" placeholder="确认您的秘密符文" type="password">
    </div>
    <button onclick="RegSubmit()" class="btn" type="button">完成创建</button>
    <button onclick="ReturnLogin()" class="btn" type="button">返回登录</button>
  `;

  var loginBox = document.getElementById("loginBox");
  var registerBox = document.getElementById("registerBox");

  // 注册模块
  window.Register = function () {
    loginBox.style.display = "none";
    registerBox.style.display = "block";
    Init();
  };

  window.ReturnLogin = function () {
    loginBox.style.display = "block";
    registerBox.style.display = "none";
  };

  window.RegSubmit = function () {
    var name = document.getElementById("regName").value;
    var password = document.getElementById("regPassword").value;
    var repeat = document.getElementById("regRepeat").value;

    if (name.trim().length <= 0) {
      alert("Invalid Name");
      return;
    }

    if (password.trim().length <= 0) {
      alert("Invalid Password");
      return;
    }

    if (password != repeat) {
      alert("Passwor Different from Repeat");
      return;
    }

    Game.io.get("/hero/create", {
      name: name,
      password: password,
      custom: heroCustom
    }, function (data) {
      if (data.success) {
        ReturnLogin();
      } else {
        alert(data.error || "Unknown Error");
      }
    });
  };

  // 英雄组件数据
  var heroCustom = {
    sex: "male",
    body: "light",
    eyes: "blue",
    hair: "",
    haircolor: "black",

    head: "",
    shirts: "",
    pants: "",
    shoes: "",

    armorchest: "",
    armorarm: "",
    armorlegs: "",
    armorhelms: "",
    armorfeet: ""
  };

  // 13x21
  heroCustom.width = 64 * 13; // 832;
  heroCustom.height = 64 * 21; // 1344;
  heroCustom.width *= 0.8125;
  heroCustom.height *= 0.9375;
  heroCustom.tilewidth = heroCustom.width / 13;
  heroCustom.tileheight = heroCustom.height / 21;

  function Init () {

    window.SelectHero = function (event) {
      if (heroCustom.sex == "male") {
        document.getElementById("customMaleHair").style.display = "block";
        document.getElementById("customFemaleHair").style.display = "none";
      } else {
        document.getElementById("customMaleHair").style.display = "none";
        document.getElementById("customFemaleHair").style.display = "block";
      }
      var value = event.target.value;
      var type = event.target.getAttribute("data-type");
      if (heroCustom[type] != value) {
        heroCustom[type] = value;
        DisplayHero();
      }
    };

    var heroDisplay = new createjs.Stage("preview");
    DisplayHero();

    function DisplayHero () {
      Game.drawHero(heroCustom, function (img) {
        heroDisplay.removeAllChildren();

        var sheet = new createjs.SpriteSheet({
          images: [img],
          frames: {
            width: heroCustom.tilewidth,
            height: heroCustom.tileheight
          },
          animations: {
            faceup: 104,
            faceleft: 117,
            facedown: 130,
            faceright: 143
          }
        });

        function SheetComplete () {
          var spriteDown = new createjs.Sprite(sheet, "facedown");
          spriteDown.x = 0;
          spriteDown.y = 0;
          var spriteLeft = new createjs.Sprite(sheet, "faceleft");
          spriteLeft.x = 64;
          spriteLeft.y = 0;
          var spriteRight = new createjs.Sprite(sheet, "faceright");
          spriteRight.x = 128;
          spriteRight.y = 0;
          var spriteUp = new createjs.Sprite(sheet, "faceup");
          spriteUp.x = 192;
          spriteUp.y = 0;
          heroDisplay.addChild(spriteDown);
          heroDisplay.addChild(spriteLeft);
          heroDisplay.addChild(spriteRight);
          heroDisplay.addChild(spriteUp);
          heroDisplay.update();
        }

        if (sheet.complete) {
          SheetComplete();
        } else {
          sheet.on("complete", SheetComplete);
        }
      });
    }

  };




})();
