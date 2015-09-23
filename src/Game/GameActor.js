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

  let internal = Sprite.Namespace();

  /*
    角色类，包括涉及到hero和npc
    属性：
      this.sprite 精灵
  */
  Game.assign("Actor", class Actor extends Sprite.Event {
    constructor (actorData) {
      super();
      let privates = internal(this);

      privates.data = actorData;

      this.makeInfoBox();

      if (this.data.image instanceof Array) {
        this.init(this.data.image);
      } else if (typeof this.data.image == "string") {
        Sprite.Loader
          .create()
          .add("actor/" + this.data.image)
          .start()
          .on("complete", (event) => {
            this.init(event.data);
          });
      } else {
        console.error(this.id, this.data, this.data.image, this);
        throw new Error("Invalid Actor Image");
      }
    }

    init (images) {
      let privates = internal(this);

      for (let image of images) {
        if (!(image instanceof Image) && !(image.getContext && image.getContext("2d"))) {
          console.error(image, images, this);
          throw new Error("Game.Actor got invalid image, not Image or Canvas");
        }

        if (image.width <= 0 || !Number.isFinite(image.width) || image.height <= 0 || !Number.isFinite(image.height)) {
          console.error(image, images);
          throw new Error("Game.Actor got invalid image, invalid width or height");
        }
      };

      let sprite = new Sprite.Sheet({
        images: images, // images is Array
        width: this.data.tilewidth,
        height: this.data.tileheight,
        animations: this.data.animations
      });

      if (Number.isInteger(this.data.centerX) && Number.isInteger(this.data.centerY)) {
        sprite.centerX = this.data.centerX;
        sprite.centerY = this.data.centerY;
      } else {
        console.log(this.data);
        throw new Error("Game.Actor invalid centerX/centerY");
      }

      sprite.play("facedown");
      privates.sprite = sprite;

      sprite.on("change", () => {
        privates.infoBox.x = sprite.x;
        privates.infoBox.y = sprite.y - sprite.centerY - 20
      });

      let completeCount = -1;
      let Complete = () => {
        completeCount++;
        if (completeCount >= 0) {
          this.calculate();
          this.refreshBar();
          this.emit("complete", true);
        }
      };

      if (this.data.quests) {
        privates.quests = [];
        privates.quests.length = this.data.quests.length;
        this.data.quests.forEach((questId, index) => {
          completeCount--;
          Sprite.Loader.create()
            .add(`quest/${questId}.json`)
            .start()
            .on("complete", function (event) {
              privates.quests[index] = event.data[0];
              privates.quests[index].id = questId;
              Complete();
            });
        });
      }

      if (this.data.skills) {
        this.data.skills.forEach((skillId) => {
          completeCount--;
          Game.Skill.load(skillId, () => {
            Complete();
          });
        });
      }

      if (this.data.equipment) {
        for (let key in this.data.equipment) {
          let itemId = this.data.equipment[key];
          if (itemId) {
            completeCount--;
            Game.Item.load(itemId, () => {
              Complete();
            });
          }
        }
      }

      if (this.data.items) {
        for (let itemId in this.data.items) {
          completeCount--;
          Game.Item.load(itemId, () => {
            Complete();
          });
        }
      }

      if (this.data.contact && this.data.trade) {
        for (let itemId in this.data.trade) {
          completeCount--;
          Game.Item.load(itemId, () => {
            Complete();
          });
        }
      }

      Complete();
    }

    get data () {
      let privates = internal(this);
      return privates.data;
    }

    set data (value) {
      throw new Error("Game.Actor.data readonly");
    }

    get id () {
      let privates = internal(this);
      return privates.data.id;
    }

    set id (value) {
      throw new Error("Game.Actor.id readonly")
    }

    get sprite () {
      let privates = internal(this);
      return privates.sprite;
    }

    set sprite (value) {
      throw new Error("Game.Actor.sprite readonly");
    }

    get quests () {
      let privates = internal(this);
      if (privates.quests) {
        return privates.quests;
      } else {
        return null;
      }
    }

    set quests (value) {
      throw new Error("Game.Actor.quests readonly");
    }

    makeInfoBox () {
      let privates = internal(this);
      // 名字
      let text = new Sprite.Text({
        text: this.data.name,
        maxWidth: 200,
        color: "white",
        fontSize: 12
      });
      text.centerY = Math.floor(text.height / 2);
      text.centerX = Math.floor(text.width / 2);
      text.x = 0;
      text.y = 0;

      // 一个上面四个精神条、血条的聚合，统一管理放入这个Container
      privates.infoBox = new Sprite.Container();

      if (this.data.type != "hero") {
        // 血条外面的黑框
        let hpbarBox = new Sprite.Shape();
        hpbarBox.centerX = 15;
        hpbarBox.centerY = 2;
        hpbarBox.x = 0;
        hpbarBox.y = 9;

        // 魔法条外面的黑框
        let mpbarBox = new Sprite.Shape();
        mpbarBox.centerX = 15;
        mpbarBox.centerY = 2;
        mpbarBox.x = 0;
        mpbarBox.y = 12;

        hpbarBox.rect({
          x: 0,
          y: 0,
          width: 30,
          height: 3,
          "fill-opacity": 0
        });

        mpbarBox.rect({
          x: 0,
          y: 0,
          width: 30,
          height: 3,
          "fill-opacity": 0
        });

        // 生命条
        privates.hpbar = new Sprite.Shape();
        privates.hpbar.centerX = 15;
        privates.hpbar.centerY = 2;
        privates.hpbar.x = 0;
        privates.hpbar.y = 9;

        // 精力条
        privates.mpbar = new Sprite.Shape();
        privates.mpbar.centerX = 15;
        privates.mpbar.centerY = 2;
        privates.mpbar.x = 0;
        privates.mpbar.y = 12;

        privates.infoBox.appendChild(
          text,
          hpbarBox,
          mpbarBox,
          privates.hpbar,
          privates.mpbar
        );
      }
    }

    calculate () {
      if (this.data.$str && this.data.$dex && this.data.$con && this.data.$int && this.data.$cha) {

        this.data.str = this.data.$str;
        this.data.dex = this.data.$dex;
        this.data.con = this.data.$con;
        this.data.int = this.data.$int;
        this.data.cha = this.data.$cha;

        // 然后可以针对基本属性计算buff

        this.data.$hp = this.data.con * 10;
        this.data.$sp = this.data.int * 5;
        this.data.$atk = this.data.str * 1;
        this.data.$matk = this.data.int * 0.5;
        this.data.$def = 0;
        this.data.$mdef = 0;

        this.data.critical = this.data.dex * 0.005;
        this.data.dodge = this.data.dex * 0.005;

        // 计算完了战斗相关数值
        this.data.hp = this.data.$hp;
        this.data.sp = this.data.$sp;
        this.data.atk = this.data.$atk;
        this.data.def = this.data.$def;
        this.data.matk = this.data.$matk;
        this.data.mdef = this.data.$mdef;

        // 最后可以对战斗相关数值计算buff

        if (this.data.buff && this.data.nerf) {
          this.data.buff.forEach((element) => {

          });
          this.data.nerf.forEach((element) => {

          });
        }
      }
    }

    get x () {
      return this.data.x;
    }

    set x (value) {
      if (Number.isFinite(value) && Number.isInteger(value)) {
        this.data.x = value;
        this.sprite.x = value * 32 + 16;
      } else {
        console.error(value, internal(this), this);
        throw new Error("Game.Actor got invalid x, x has to be a number and integer");
      }
    }

    get y () {
      return this.data.y;
    }

    set y (value) {
      if (Number.isFinite(value) && Number.isInteger(value)) {
        this.data.y = value;
        this.sprite.y = value * 32 + 16;
      } else {
        console.error(value, internal(this), this);
        throw new Error("Game.Actor got invalid y, y has to be a number and integer");
      }
    }

    get visible () {
      return this.sprite.visible;
    }

    set visible (value) {
      this.sprite.visible = value;
      internal(this).infoBox.visible = value;
    }

    get alpha () {
      return this.sprite.alpha;
    }

    set alpha (value) {
      if (Number.isFinite(value) && value >= 0 && value <= 1) {
        this.sprite.alpha = value;
        this.infoBox.alpha = value;
      } else {
        console.error(value, this);
        throw new Error("Game.Actor.alpha got invalid value");
      }
    }

    get position () {
      return {
        x: this.x,
        y: this.y
      };
    }

    set position (value) {
      throw new Error("Game.Actor.position readonly");
    }

    get direction () {
      return this.sprite.currentAnimation.match(/up|left|down|right/)[0];
    }

    set direction (value) {
      throw new Error("Game.Actor.direction readonly");
    }

    get facePosition () {
      let p = this.position;
      switch (this.direction) {
        case "up":
          p.y -= 1;
          break;
        case "down":
          p.y += 1;
          break;
        case "left":
          p.x -= 1;
          break;
        case "right":
          p.x += 1;
          break;
      }
      return p;
    }

    set facePosition (value) {
      throw new Error("Game.Actor.facePosition readonly");
    }

    clone  (callback) {
      let actor = new Game.Actor(this.data);
      actor.x = this.x;
      actor.y = this.y;
      actor.visible = this.visible;
      actor.alpha = this.alpha;
      actorObj.on("complete", function () {
        if (callback) {
          callback(actor);
        }
      });
    }

    refreshBar () {
      let privates = internal(this);

      if (privates.hpbar && privates.mpbar) {
        let hpcolor = "green";
        if ((this.data.hp / this.data.$hp) < 0.25)
          hpcolor = "red";
        else if ((this.data.hp / this.data.$hp) < 0.5)
          hpcolor = "yellow";

        privates.hpbar.clear().rect({
          x: 1,
          y: 1,
          width: Math.floor((this.data.hp / this.data.$hp) * 28),
          height: 2,
          fill: hpcolor,
          "stroke-width": 0
        });

        privates.mpbar.clear().rect({
          x: 1,
          y: 1,
          width: Math.floor((this.data.sp / this.data.$sp) * 28),
          height: 2,
          fill: "blue",
          "stroke-width": 0
        });
      }
    }

    distance () {
      let x = null, y = null;
      if (arguments.length == 2 && Number.isFinite(arguments[0]) && Number.isFinite(arguments[1])) {
        x = arguments[0];
        y = arguments[1];
      } else if (arguments.length == 1 && Number.isFinite(arguments[0].x) && Number.isFinite(arguments[0].y)) {
        x = arguments[0].x;
        y = arguments[0].y;
      } else {
        console.error(arguments);
        throw new Error("Game.Actor.distance Invalid arguments");
      }
      let d = 0;
      d += Math.pow(this.x - x, 2);
      d += Math.pow(this.y - y, 2);
      d = Math.sqrt(d);
      return d;
    }

    decreaseHP (power) {
      this.data.hp -= power;
      this.refreshBar();
    }

    decreaseSP (sp) {
      this.data.sp -= sp;
      this.refreshBar();
    }

    dead (attacker) {
      if (this.data.hp <= 0) {
        if (this.data.type == "hero") {

        } else {

          this.erase();
          Game.area.actors.delete(this);

          if (!this.data.items || Object.keys(this.data.items).length <= 0) {
            this.data.items = {
              gold: 1
            };
          }

          let bag = null;
          for (let b of Game.area.bags) {
            if (b.hitTest(this.x, this.y)) {
              bag = b;
            }
          }
          if (!bag) {
            bag = Game.items.bag.clone();
            bag.on("complete", () => {
              bag.x = this.x;
              bag.y = this.y;
              bag.inner = {};
              bag.draw();
              Game.area.bags.add(bag);
            });
          }

          for (let key in this.data.items) {
            if (bag.inner.hasOwnProperty(key)) {
              bag.inner[key] += this.data.items[key];
            } else {
              bag.inner[key] = this.data.items[key];
            }
          }

          attacker.emit("kill", false, this);

        }
      }
    }

    /** 闪一闪人物，例如被击中时的效果 */
    flash () {
      this.sprite.alpha = 0.5;
      setTimeout(() => {
        this.sprite.alpha = 1;
      }, 200);
    }

    /** 受到attacker的skill技能的伤害 */
    damage (attacker, skill) {

      this.emit("damaged");

      let power = skill.power;
      let type = skill.type;

      let color = "white";
      if (this.data.type == "hero") {
        color = "red";
      }

      if (type == "normal") {
        power += attacker.data.atk;
        power -= this.data.def
        power = Math.max(0, power);
      } else { // type == magic
        power += attacker.data.matk;
        power - this.data.mdef
        power = Math.max(0, power);
      }

      let text = null;
      let state = null;

      if (Math.random() < this.data.dodge) { // 闪避了
        state = "dodge";
        text = new Sprite.Text({
          text: "miss",
          color: color,
          fontSize: 16
        });
      } else if (Math.random() < attacker.data.critical) { // 重击了
        state = "critical";
        power *= 2;
        text = new Sprite.Text({
          text: "-" + power,
          color: color,
          fontSize: 32
        });
        this.flash();
        this.decreaseHP(power);
      } else { // 普通击中
        state = "hit";
        text = new Sprite.Text({
          text: "-" + power,
          color: color,
          fontSize: 16
        });
        this.flash();
        this.decreaseHP(power);
      }

      if (state != "dodge" && this != Game.hero) {
        if (Game.sounds.hurt) {
          Game.sounds.hurt.load();
          Game.sounds.hurt.play();
        }
      }

      text.centerX = Math.floor(text.width / 2);
      text.centerY = Math.floor(text.height);
      text.x = this.sprite.x;
      text.y = this.sprite.y;

      text.x += Sprite.rand(-10, 10);

      Game.layers.actorLayer.appendChild(text);

      let speed = Sprite.rand(1, 3);

      Sprite.Ticker.whiles(100, (last) => {
        text.y -= speed;
        if (last) {
          Game.layers.actorLayer.removeChild(text);
        }
      });

      // 测试是否死亡
      this.dead(attacker);

    }

    /** 播放一个动画 */
    play (animation, priority) {
      // 新动画默认优先级为0
      if (!Number.isFinite(priority)) {
        priority = 0;
      }

      // 无动画或者停止状态，现有优先级为-1（最低级）
      if (typeof this.animationPriority == "undefined" || this.sprite.paused == true) {
        this.animationPriority = -1;
      }

      if (
        this.data.animations.hasOwnProperty(animation) &&
        priority >= this.animationPriority &&
        animation != this.sprite.currentAnimation
      ) {
        this.animationPriority = priority;
        this.sprite.play(animation);
      }
    }

    /** 停止 */
    stop () {
      if (!this.sprite.currentAnimation) return;

      if ((this.sprite.paused && !this.sprite.currentAnimation.match(/face/))
        || this.sprite.currentAnimation.match(/walk|run/)) {
        switch (this.direction) {
          case "up":
            this.sprite.play("faceup");
            break;
          case "down":
            this.sprite.play("facedown");
            break;
          case "left":
            this.sprite.play("faceleft");
            break;
          case "right":
            this.sprite.play("faceright");
            break;
        }
      }
    }

    /** 向指定direction方向释放一个技能 */
    fire (id, direction) {
      // 同一时间只能施展一个skill
      if (this.attacking)
        return 0;

      let skill = Game.skills[id];
      if (!skill)
        return 0;

      // 只有当这个skill的cooldown结
      let now = new Date().getTime();
      if (
        Number.isFinite(this.lastAttack) &&
        Number.isFinite(this.lastAttackCooldown) &&
        (now - this.lastAttack) < this.lastAttackCooldown
      ) {
        return 0;
      }

      if (skill.data.cost > this.data.sp) {
        return 0;
      }

      if (!direction) {
        direction = this.direction;
      }

      if (skill.can(this)) {

        this.lastAttack = now;
        this.lastAttackCooldown = skill.data.cooldown;
        this.attacking = true;

        this.data.sp -= skill.data.cost;
        this.refreshBar();

        skill.fire(this, direction, (hitted) => {
          this.attacking = false;
          if (hitted.length > 0) {
            hitted[0].damage(this, skill);
          }
          this.emit("change");
        });

        return skill.data.cooldown;
      } else {
        return 0;
      }
    }

    /** 行走到指定地点 */
    goto (x, y, state, callback) {

      if (this.going) {
        this.goingNext = () => {
          this.goto(x, y, state, callback);
        };
        return;
      }

      let destBlocked = this.checkCollision(x, y);

      if (destBlocked) {
        if (this.x == x) {
          if (this.y - y == -1) {
            this.stop();
            this.face("down");
            if (callback) callback();
            return;
          } else if (this.y - y == 1) {
            this.stop();
            this.face("up");
            if (callback) callback();
            return;
          }
        } else if (this.y == y) {
          if (this.x - x == -1) {
            this.stop();
            this.face("right");
            if (callback) callback();
            return;
          } else if (this.x - x == 1) {
            this.stop();
            this.face("left");
            if (callback) callback();
            return;
          }
        }
      }

      let positionChoice = [];
      // 上下左右
      if (this.checkCollision(x, y-1) == false) {
        positionChoice.push({x: x, y: y-1, after: "down"});
      }
      if (this.checkCollision(x, y+1) == false) {
        positionChoice.push({x: x, y: y+1, after: "up"});
      }
      if (this.checkCollision(x-1, y) == false) {
        positionChoice.push({x: x-1, y: y, after: "right"});
      }
      if (this.checkCollision(x+1, y) == false) {
        positionChoice.push({x: x+1, y: y, after: "left"});
      }

      for (let element of positionChoice) { // 计算地址距离
        element.distance = this.distance(element.x, element.y);
      }

      // 按照地址的距离从近到远排序（从小到大）
      positionChoice.sort((a, b) => {
        return a.distance - b.distance;
      });

      // 如果真正的目的地有可能走，插入到第一位，写在这里是因为目的地并不一定是distance最小的
      if (this.checkCollision(x, y) == false) {
        positionChoice.splice(0, 0, {x: x, y: y});
      }

      let index = 0;
      let otherChoice = false;

      let TestPosition = () => {
        if (index < positionChoice.length) {
          let dest = positionChoice[index]; // 保存第一个选项
          index++;
          Game.Astar.getPath({x: this.x, y: this.y}, dest, (result) => {
            this.gettingPath = false;
            if (this.goingNext) {
              let c = this.goingNext;
              this.goingNext = null;
              this.going = false;
              if (this == Game.hero) {
                Game.Input.clearDest();
              }
              c();
              return;
            }
            if (this.going) {
              return;
            }
            if (result) {
              if (this == Game.hero) {
                Game.Input.setDest(dest.x, dest.y);
              }
              this.gotoPath(result, state, dest.after, callback);
            } else {
              TestPosition();
            }
          });
        } else {
          if (otherChoice == false) {
            otherChoice = true;
            let otherPositionChoice = [];
            // 四个角
            if (this.checkCollision(x-1, y-1) == false) {
              otherPositionChoice.push({x: x-1, y: y-1, after: "right"});
            }
            if (this.checkCollision(x+1, y-1) == false) {
              otherPositionChoice.push({x: x+1, y: y-1, after: "left"});
            }
            if (this.checkCollision(x-1, y+1) == false) {
              otherPositionChoice.push({x: x-1, y: y+1, after: "right"});
            }
            if (this.checkCollision(x+1, y+1) == false) {
              otherPositionChoice.push({x: x+1, y: y+1, after: "left"});
            }
            // 四个远方向
            if (this.checkCollision(x, y-2) == false) {
              otherPositionChoice.push({x: x, y: y-2, after: "down"});
            }
            if (this.checkCollision(x, y+2) == false) {
              otherPositionChoice.push({x: x, y: y+2, after: "up"});
            }
            if (this.checkCollision(x-2, y) == false) {
              otherPositionChoice.push({x: x-2, y: y, after: "right"});
            }
            if (this.checkCollision(x+2, y) == false) {
              otherPositionChoice.push({x: x+2, y: y, after: "left"});
            }

            for (let element of otherPositionChoice) { // 计算地址距离
              element.distance = this.distance(element.x, element.y);
            }

            // 按照地址的距离从近到远排序（从小到大）
            otherPositionChoice.sort((a, b) => {
              return a.distance - b.distance;
            });

            if (otherPositionChoice.length) {
              index = 0;
              positionChoice = otherPositionChoice;
              TestPosition();
            }
          }
        } // 再次尝试离地点最近的地点
      }

      TestPosition();

    }

    gotoPath (path, state, after, callback) {
      this.going = true;
      let index = 1;
      let Walk = () => {
        if (Game.paused) {
          this.stop();
          this.going = false;
          if (this == Game.hero) {
            Game.Input.clearDest();
          }
          return;
        }
        if (this.goingNext) {
          let c = this.goingNext;
          this.goingNext = null;
          this.going = false;
          if (this == Game.hero) {
            Game.Input.clearDest();
          }
          c();
          return;
        }

        if (index < path.length) {
          let current = {x: this.x, y: this.y};
          let dest = path[index];
          let direction = null;
          if (dest.x == current.x) {
            if (dest.y > current.y) {
              direction = "down";
            } else if (dest.y < current.y) {
              direction = "up";
            }
          } else if (dest.y == current.y) {
            if (dest.x > current.x) {
              direction = "right"
            } else if (dest.x < current.x) {
              direction = "left";
            }
          }

          if (direction) {
            let currentDirection = this.direction;
            if (direction != currentDirection) {
              this.stop();
              this.face(direction);
            }
            let goResult = this.go(state, direction, () => Walk());
            if (goResult != true) {
              this.going = false;
            }
            index++;
          }
        } else { // 正常结束
          if (after) {
            this.stop();
            this.face(after);
          }
          if (this == Game.hero) {
            Game.Input.clearDest();
          }
          this.going = false;
          if (callback) callback();
        }
      }
      Walk();
    }

    face (direction) {
      let animation = "face" + direction;
      if (this.animation != animation) {
        this.sprite.play(animation);
        this.emit("change");
      }
    }

    // 参数t中记录了某个方格的方位xy，测试这个方格是否和玩家有冲突
    // 返回true为有碰撞，返回false为无碰撞
    checkCollision (x, y) {
      // 地图边缘碰撞
      if (x < 0 || y < 0 || x >= Game.area.map.data.width || y >= Game.area.map.data.height) {
        return true;
      }
      // 地图碰撞
      if (Game.area.map.hitTest(x, y)) {
        return true;
      }

      // 角色碰撞
      if (Game.area.actors) {
        for (let actor of Game.area.actors) {
          if (actor != this && actor.hitTest(x, y)) {
            return true;
          }
        }
      }
      return false;
    };

    hitTest (x, y) {
      if (this.data.hitArea && this.data.hitArea instanceof Array) {
        for (let p of this.data.hitArea) {
          if (x == this.x + p[0] && y == this.y + p[1]) {
            return true;
          }
        }
        return false;
      } else {
        console.error(this.data);
        throw new Error("Game.Actor.hitTest invalid data");
      }
    }

    go (state, direction, callback = null) {

      // 如果正在战斗动画，则不走
      if (
        this.sprite.paused == false &&
        this.sprite.currentAnimation.match(/skillcast|thrust|slash|shoot/)
      ) {
        return false;
      }

      if (this.walking) {
        return false;
      }

      if (this.attacking) {
        return false;
      }

      if (this.direction != direction) {
        this.walking = true;
        this.stop();
        this.face(direction);
        // wait 4 ticks
        Sprite.Ticker.after(4, () => {
          this.walking = false;
        });
        return false;
      }

      let newPosition = this.facePosition;

      if (this.checkCollision(newPosition.x, newPosition.y) == false) {
        // 没碰撞，开始行走
        this.walking = true;

        // 把角色位置设置为新位置，为了占领这个位置，这样其他角色就会碰撞
        // 但是不能用this.x = newX这样设置，因为this.x的设置会同时设置this.sprite.x
        this.data.x = newPosition.x;
        this.data.y = newPosition.y;

        // walk
        // 这些数组和必须是32，为了保证一次go行走32个像素
        let speed = [3,3,2,3,3,2,3,3,2,3,3,2]; // 和是32
        if (state == "run") {
          // speed = [6,7,6,7,6]; // 和是32
          speed = [4,4,4,4,4,4,4,4]; // 和是32
        }
        // 比预计多一个，这样是为了流畅
        // 因为下一次go可能紧挨着这次
        let times = speed.length + 1;
        let id = null;

        Sprite.Ticker.whiles(times, (last) => {
          if (last) {
            this.x = newPosition.x;
            this.y = newPosition.y;
            this.walking = false;
            this.emit("change");

            if (callback) {
              //Sprite.Ticker.after(2, function () {
                callback();
              //});
            }
          } else {
            switch (direction) {
              case "up":
                this.sprite.y -= speed.pop();
                break;
              case "down":
                this.sprite.y += speed.pop();
                break;
              case "left":
                this.sprite.x -= speed.pop();
                break;
              case "right":
                this.sprite.x += speed.pop();
                break;
            }
          }
        });

        // 播放行走动画
        this.play(state + direction, 1);
        return true;
      }

      return false;
    }

    /** 在Game.actorLayer上删除人物 */
    erase () {
      let privates = internal(this);
      Game.layers.actorLayer.removeChild(this.sprite);
      Game.layers.infoLayer.removeChild(privates.infoBox);
    }

    /** 在Game.actorLayer上显示人物 */
    draw () {
      let privates = internal(this);
      if (Number.isInteger(this.x) && Number.isInteger(this.y)) {
        this.x = this.data.x;
        this.y = this.data.y;

        internal(this).infoBox.x = this.sprite.x;
        internal(this).infoBox.y = this.sprite.y - this.sprite.centerY - 20;

        Game.layers.actorLayer.appendChild(this.sprite);
        Game.layers.infoLayer.appendChild(privates.infoBox);
      } else {
        console.error(this.data.x, this.data.y, this.data);
        throw new Error("Game.Actor.draw invalid data.x/data.y");
      }
    }

    /** 镜头集中 */
    focus () {
      let privates = internal(this);
      privates.infoBox.x = this.sprite.x;
      privates.infoBox.y = this.sprite.y - this.sprite.centerY - 20;

      Game.stage.centerX = Math.round(this.sprite.x - Game.config.width / 2);
      Game.stage.centerY = Math.round(this.sprite.y - Game.config.height / 2);
    }

  }); // Game.Actor

})();
