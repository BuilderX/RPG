/*


地图信息


*/
"use strict";

var map = {
  actors: [],
  touch: [],
  onto: []
};

map.name = "斯塔特南部森林";

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
  dest: "starttown",
  description: "通往斯塔特镇",
  destx: 60,
  desty: 118
});

map.onto.push({
  x: 60,
  y: 119,
  dest: "slimeforest.north",
  description: "通往史莱姆北部森林",
  destx: 60,
  desty: 1
});

return map;
