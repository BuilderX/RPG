/*


地图信息


*/
"use strict";

var map = {
  actors: [],
  touch: [],
  onto: []
};

map.name = "巴斯托森林北部";

// 自动生成怪物
map.spawnMonster = {
  list: {
    "bat.purple": 0.8,
    "robber.green": 0.1,
    "slime.green": 0.1
  },
  count: 20
};

// 自动生成矿产
map.spawnItem = {
  list: {
    "ore.iron": 0.5,
    "herb.stramonium": 0.5
  },
  count: 10
};

map.onto.push({
  x: 60,
  y: 0,
  description: "通往法斯通镇",
  execute: function () {
    Game.hero.gotoArea("fystone", 60, 118);
  }
});

map.onto.push({
  x: 60,
  y: 119,
  description: "通往巴斯托森林中部",
  execute: function () {
    Game.hero.gotoArea("bastowforest.center", 60, 1);
  }
});

return map;
