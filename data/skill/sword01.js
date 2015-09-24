/*


技能信息


*/
"use strict";
return {
  id: "sword01",
  name: "剑攻击Level1",
  description: "剑攻击Level1",
  image: "resource\/sword.png",
  icon: "resource\/sword_icon.png",
  sound: "resource\/sword.ogg",
  cost: 1,
  distance: 0,
  cooldown: 450,
  type: "normal",
  needweapontype: "sword",
  power: "1d10",
  tileheight: 64,
  tilewidth: 64,
  alpha: 0.5,
  animations: {
    attackdown: {
      frames: [0],
      speed: 40,
      next: "",
      centerX: 25,
      centerY: 70,
      actor: "slashdown"
    },
    attackleft: {
      frames: [1],
      speed: 40,
      next: "",
      centerX: 20,
      centerY: 60,
      actor: "slashleft"
    },
    attackright: {
      frames: [2],
      speed: 40,
      next: "",
      centerX: 50,
      centerY: 60,
      actor: "slashright"
    },
    attackup: {
      frames: [3],
      speed: 40,
      next: "",
      centerX: 25,
      centerY: 40,
      actor: "slashup"
    }
  }
};
