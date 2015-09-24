/*


任务信息


*/
"use strict";
return {
  name: "清理老鼠",
  fromMap: "斯塔特镇",
  fromName: "坦德姆",
  toMap: "斯塔特镇",
  toName: "坦德姆",
  from: "starttown.tandem",
  to: "starttown.tandem",
  before: "在斯塔特镇东面的旅馆里有几只老鼠，去弄死他们",
  finish: "感谢你的帮助，这下……旅馆也不能住",
  rewardText: "金币 20; 经验 20;",
  reward: {
    gold: 20,
    exp: 20
  },
  description: "杀掉2只斯塔特镇东面旅馆里的老鼠",
  target: {
    kill: [
      {
        id: "rat.gray",
        name: "灰色老鼠",
        current: 0,
        need: 2
      }
    ]
  }
};