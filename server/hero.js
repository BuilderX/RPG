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
"use strict";

var HERO_ANIMATIONS = {
  spellcastup: [0, 6, "", 0.8],
  spellcastleft: [13, 19, "", 0.8],
  spellcastdown: [26, 32, "", 0.8],
  spellcastright: [39, 45, "", 0.8],

  thrustup: [52, 59, "", 0.8],
  thrustleft: [65, 72, "", 0.8],
  thrustdown: [78, 85, "", 0.8],
  thrustright: [91, 98, "", 0.8],

  walkup: [104, 112, "walkup", 0.4],
  walkleft: [117, 125, "walkleft", 0.4],
  walkdown: [130, 138, "walkdown", 0.4],
  walkright: [143, 151, "walkright", 0.4],

  runup: [104, 112, "runup", 0.7],
  runleft: [117, 125, "runleft", 0.7],
  rundown: [130, 138, "rundown", 0.7],
  runright: [143, 151, "runright", 0.7],

  slashup: [156, 161, "", 0.8],
  slashleft: [169, 174, "", 0.8],
  slashdown: [182, 187, "", 0.8],
  slashright: [195, 200, "", 0.8],

  shootup: [208, 220, "", 0.8],
  shootleft: [221, 233, "", 0.8],
  shootdown: [234, 246, "", 0.8],
  shootright: [247, 259, "", 0.8],

  hurt: [260, 265, "", 0.3],

  dead: 265,

  faceup: 104,
  faceleft: 117,
  facedown: 130,
  faceright: 143
};

var fs = require("fs");

var HeroDB = require("./db").hero;

var SpellModule = require("./spell");

var ItemModule = require("./item");

var HEROS = {};

(function LoadHero () {
  HeroDB.find({}, function (err, heros) {
    heros.forEach(function (element) {
      var id = element.id;
      AddHero(element);
    });

    console.log("Heros loaded ", Object.keys(HEROS).length);
  });
})();

function CalculateBuffNerf (h) {
  h.buff.forEach(function (element) {
    if (h.hasOwnProperty(element.target)) {
      h[element.target] += element.value;
    } else if (h.skills.hasOwnProperty(element.target)) {
      h.skills[element.target] += element.value;
    }
  }); // buff
  h.nerf.forEach(function (element) {
    if (h.hasOwnProperty(element.target)) {
      h[element.target] += element.value;
    } else if (h.skills.hasOwnProperty(element.target)) {
      h.skills[element.target] += element.value;
    }
  }); // nerf
}

function CalculateEquipment (h, equipment) {
  if (equipment.buff) {
    for (var key in equipment.buff) {
      h.buff.push({
        target: key,
        value: equipment.buff[key],
        source: equipment.id,
        time: "forever"
      });
    }
  }
  if (equipment.nerf) {
    for (var key in equipment.nerf) {
      h.buff.push({
        target: key,
        value: equipment.nerf[key],
        source: equipment.id,
        time: "forever"
      });
    }
  }
}

function CalculateHero (h) {
  h.str = h._str;
  h.dex = h._dex;
  h.int = h._int;
  h.con = h._con;
  h.cha = h._cha;

  h._hp = h.con * 10; // 生命
  h._sp = h.int * 10; // 精神力
  h.hp = h._hp; // 当前生命
  h.sp = h._sp; // 当前精神力

  h.atk = h.str * 0.5; // 攻击力
  h.def = h.dex * 0.5; // 防御力
  h.matk = h.int * 0.5; // 魔法攻击力
  h.mdef = h.int * 0.5; // 魔法防御力

  h.skills.trade = h.skills._trade;
  h.skills.negotiate = h.skills._negotiate;
  h.skills.lock = h.skills._lock;
  h.skills.knowledge = h.skills._knowledge;
  h.skills.treatment = h.skills._treatment;
  h.skills.animal = h.skills._animal;

  if (h.equipment.head)
    CalculateEquipment(h, h.equipment.head);
  if (h.equipment.neck)
    CalculateEquipment(h, h.equipment.neck);
  if (h.equipment.body)
    CalculateEquipment(h, h.equipment.body);
  if (h.equipment.feet)
    CalculateEquipment(h, h.equipment.feet);
  if (h.equipment.righthand)
    CalculateEquipment(h, h.equipment.righthand);
  if (h.equipment.lefthand)
    CalculateEquipment(h, h.equipment.lefthand);
  if (h.equipment.leftring)
    CalculateEquipment(h, h.equipment.leftring);
  if (h.equipment.rightring)
    CalculateEquipment(h, h.equipment.rightring);
}

// 对数据库中保存的hero进行一次初始化
function AddHero (element) {
  var id = element.id;
  HEROS[id] = element;
  HEROS[id].animations = HERO_ANIMATIONS;
  HEROS[id].width = HEROS[id].custom.width;
  HEROS[id].height = HEROS[id].custom.height;
  HEROS[id].tilewidth = HEROS[id].custom.tilewidth;
  HEROS[id].tileheight = HEROS[id].custom.tileheight;
  // 读取角色技能
  HEROS[id].spells = SpellModule.get(HEROS[id].spells);
  // 读取角色物品
  HEROS[id].items.forEach(function (element, index, array) {
    if (element) {
      element.item = ItemModule.get(element.id);
    }
  });
  // 读取角色装备（物品）
  if (HEROS[id].equipment.head)
    HEROS[id].equipment.head = ItemModule.get(HEROS[id].equipment.head);
  if (HEROS[id].equipment.neck)
    HEROS[id].equipment.neck = ItemModule.get(HEROS[id].equipment.neck);
  if (HEROS[id].equipment.body)
    HEROS[id].equipment.body = ItemModule.get(HEROS[id].equipment.body);
  if (HEROS[id].equipment.feet)
    HEROS[id].equipment.feet = ItemModule.get(HEROS[id].equipment.feet);
  if (HEROS[id].equipment.righthand)
    HEROS[id].equipment.righthand = ItemModule.get(HEROS[id].equipment.righthand);
  if (HEROS[id].equipment.lefthand)
    HEROS[id].equipment.lefthand = ItemModule.get(HEROS[id].equipment.lefthand);
  if (HEROS[id].equipment.leftring)
    HEROS[id].equipment.leftring = ItemModule.get(HEROS[id].equipment.leftring);
  if (HEROS[id].equipment.rightring)
    HEROS[id].equipment.rightring = ItemModule.get(HEROS[id].equipment.rightring);

  // 对属性进行计算
  CalculateHero(HEROS[id]);
  CalculateBuffNerf(HEROS[id]);
}

function GetHero (id) {
  if (typeof id == "string") {
    return HEROS[id];
  } else if (id instanceof Array) {
    var ret = {};
    for (var i = 0; i < id.length; i++) {
      ret[id[i]] = HEROS[id[i]];
    }
    return ret;
  } else {
    console.log(typeof id, id);
    throw new TypeError("GetHero Invalid Argument");
  }
}

function UpdateHero (id, object, callback) {
  var obj = {
    "$set": object
  };
  HeroDB.update({id: id}, obj, {}, function (err) {
    if (err) {
      console.log("hero.UpdateHero ", err);
    }
    HeroDB.findOne({id: id}, function (err, doc) {
      AddHero(doc);
      callback(HEROS[id]);
    });
  });
}

function ListHero () {
  return Object.keys(HEROS);
}

exports.add = AddHero;
exports.get = GetHero;
exports.update = UpdateHero;
exports.list = ListHero;
exports.db = HeroDB;
