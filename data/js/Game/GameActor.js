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

"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

(function () {
  "use strict";

  var internal = Sprite.Namespace();

  /*
    角色类，包括涉及到hero和npc
    属性：
      this.sprite 精灵
  */
  Game.assign("Actor", (function (_Sprite$Event) {
    _inherits(Actor, _Sprite$Event);

    _createClass(Actor, null, [{
      key: "load",
      value: function load(id) {
        return new Promise(function (resolve, reject) {
          Sprite.load("actor/" + id + ".js").then(function (data) {
            var actorData = data[0]();
            actorData.id = id;

            var actorObj = null;
            if (actorData.type == "npc") {
              actorObj = new Game.ActorNPC(actorData);
            } else if (actorData.type == "monster") {
              actorObj = new Game.ActorMonster(actorData);
            } else if (actorData.type == "ally") {
              actorObj = new Game.ActorAlly(actorData);
            } else if (actorData.type == "pet") {
              actorObj = new Game.ActorPet(actorData);
            } else {
              console.error(actorData.type, actorData);
              throw new Error("Game.Actor.load invalid actor type");
            }
            actorObj.on("complete", function () {
              resolve(actorObj);
            });
          });
        });
      }
    }]);

    function Actor(actorData) {
      var _this = this;

      _classCallCheck(this, Actor);

      _get(Object.getPrototypeOf(Actor.prototype), "constructor", this).call(this);
      var privates = internal(this);

      privates.data = actorData;

      this.makeInfoBox();

      if (this.data.image instanceof Array) {
        this.init(this.data.image);
      } else if (typeof this.data.image == "string") {
        Sprite.load("actor/" + this.data.image).then(function (data) {
          // data is Array
          _this.init(data);
        });
      } else {
        console.error(this.id, this.data, this.data.image, this);
        throw new Error("Invalid Actor Image");
      }
    }

    _createClass(Actor, [{
      key: "init",
      value: function init(images) {
        var _this2 = this;

        var privates = internal(this);
        var data = privates.data;

        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = images[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var image = _step.value;

            if (!(image instanceof Image) && !(image.getContext && image.getContext("2d"))) {
              console.error(image, images, this);
              throw new Error("Game.Actor got invalid image, not Image or Canvas");
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"]) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        ;

        var sprite = new Sprite.Sheet({
          images: images, // images is Array
          width: data.tilewidth,
          height: data.tileheight,
          animations: data.animations
        });

        if (Number.isInteger(data.centerX) && Number.isInteger(data.centerY)) {
          sprite.centerX = data.centerX;
          sprite.centerY = data.centerY;
        } else {
          console.log(data);
          throw new Error("Game.Actor invalid centerX/centerY");
        }

        sprite.play("facedown");
        privates.sprite = sprite;

        sprite.on("change", function () {
          privates.infoBox.x = sprite.x;
          privates.infoBox.y = sprite.y - sprite.centerY - 20;
        });

        var completeCount = -1;
        var Complete = function Complete() {
          completeCount++;
          if (completeCount >= 0) {
            _this2.calculate();
            _this2.refreshBar();
            _this2.emit("complete", true);
          }
        };

        // 加载NPC可能有的任务
        if (data.quest) {
          privates.quest = [];
          privates.quest.length = data.quest.length;
          data.quest.forEach(function (questId, index) {
            completeCount--;

            Game.Quest.load(questId).then(function (questData) {
              privates.quest.push(questData);
              Complete();
            });
          });
        }

        // 加载人物技能
        if (data.skills) {
          data.skills.forEach(function (skillId) {
            completeCount--;
            Game.Skill.load(skillId).then(function () {
              Complete();
            });
          });
        }

        // 加载人物装备（暂时只有玩家）
        if (data.equipment) {
          for (var key in data.equipment) {
            var itemId = data.equipment[key];
            if (itemId) {
              completeCount--;
              Game.Item.load(itemId).then(function () {
                Complete();
              });
            }
          }
        }

        // 加载人物物品
        if (data.items) {
          for (var itemId in data.items) {
            completeCount--;
            Game.Item.load(itemId).then(function () {
              Complete();
            });
          }
        }

        Complete();
      }
    }, {
      key: "popup",
      value: function popup(text) {
        Game.popup(this.sprite, text, 0, -50);
      }
    }, {
      key: "makeInfoBox",
      value: function makeInfoBox() {
        var privates = internal(this);
        // 名字
        var text = new Sprite.Text({
          text: privates.data.name,
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

        if (privates.data.type != "hero") {
          // 血条外面的黑框
          var hpbarBox = new Sprite.Shape();
          hpbarBox.centerX = 15;
          hpbarBox.centerY = 2;
          hpbarBox.x = 0;
          hpbarBox.y = 9;

          // 魔法条外面的黑框
          var mpbarBox = new Sprite.Shape();
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

          privates.infoBox.appendChild(text, hpbarBox, mpbarBox, privates.hpbar, privates.mpbar);
        }
      }
    }, {
      key: "calculate",
      value: function calculate() {
        var data = internal(this).data;
        if (data.$str && data.$dex && data.$con && data.$int && data.$cha) {

          data.str = data.$str;
          data.dex = data.$dex;
          data.con = data.$con;
          data.int = data.$int;
          data.cha = data.$cha;

          // 然后可以针对一级属性计算buff

          // 计算完一级属性的buff之后，开始计算二级属性

          data.$hp = data.con * 5;
          data.$sp = data.int * 5;

          data.atk = Math.floor(data.str * 0.25);
          data.matk = Math.floor(data.int * 0.25);
          data.def = 0;
          data.mdef = 0;
          data.critical = data.dex * 0.005;
          data.dodge = data.dex * 0.005;

          // 然后可以对二级属性计算buff

          // 对二级属性计算完buff之后，可以计算会变动的值
          // 例如.$hp是buff之后的生命值上限，.hp是当前生命值
          data.hp = data.$hp;
          data.sp = data.$sp;

          if (data.buff && data.nerf) {
            data.buff.forEach(function (element) {});
            data.nerf.forEach(function (element) {});
          }
        }
      }
    }, {
      key: "refreshBar",
      value: function refreshBar() {
        var privates = internal(this);

        if (privates.hpbar && privates.mpbar) {
          var hpcolor = "green";
          if (this.data.hp / this.data.$hp < 0.25) hpcolor = "red";else if (this.data.hp / this.data.$hp < 0.5) hpcolor = "yellow";

          privates.hpbar.clear().rect({
            x: 1,
            y: 1,
            width: Math.floor(this.data.hp / this.data.$hp * 28),
            height: 2,
            fill: hpcolor,
            "stroke-width": 0
          });

          privates.mpbar.clear().rect({
            x: 1,
            y: 1,
            width: Math.floor(this.data.sp / this.data.$sp * 28),
            height: 2,
            fill: "blue",
            "stroke-width": 0
          });
        }
      }
    }, {
      key: "distance",
      value: function distance() {
        var x = null,
            y = null;
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
        var d = 0;
        d += Math.pow(this.x - x, 2);
        d += Math.pow(this.y - y, 2);
        d = Math.sqrt(d);
        return d;
      }
    }, {
      key: "decreaseHP",
      value: function decreaseHP(power) {
        this.data.hp -= power;
        this.refreshBar();
      }
    }, {
      key: "decreaseSP",
      value: function decreaseSP(sp) {
        this.data.sp -= sp;
        this.refreshBar();
      }
    }, {
      key: "dead",
      value: function dead(attacker) {
        var _this3 = this;

        if (this.data.hp <= 0) {
          if (this.data.type == "hero") {
            Game.windows.over.open("你被" + attacker.data.name + "打死了");
          } else {
            (function () {

              _this3.erase();
              Game.area.actors["delete"](_this3);

              var items = _this3.data.items || { gold: 1 };

              Game.addBag(_this3.x, _this3.y).then(function (bag) {
                for (var itemId in items) {
                  if (bag.inner.hasOwnProperty(itemId)) {
                    bag.inner[itemId] += items[itemId];
                  } else {
                    bag.inner[itemId] = items[itemId];
                  }
                }
              });

              attacker.emit("kill", false, _this3);
            })();
          }
        }
      }

      /** 闪一闪人物，例如被击中时的效果 */
    }, {
      key: "flash",
      value: function flash() {
        var _this4 = this;

        this.sprite.alpha = 0.5;
        Sprite.Ticker.after(10, function () {
          _this4.sprite.alpha = 1;
        });
      }

      /** 受到attacker的skill技能的伤害 */
    }, {
      key: "damage",
      value: function damage(attacker, skill) {

        this.emit("damaged");

        var power = skill.power;
        var type = skill.type;

        var color = "white";
        if (this.data.type == "hero") {
          color = "red";
        }

        if (type == "normal") {
          power += attacker.data.atk;
          power -= this.data.def;
          power = Math.max(0, power);
        } else {
          // type == magic
          power += attacker.data.matk;
          power - this.data.mdef;
          power = Math.max(0, power);
        }

        var text = null;
        var state = null;

        if (Math.random() < this.data.dodge) {
          // 闪避了
          state = "dodge";
          text = new Sprite.Text({
            text: "miss",
            color: color,
            fontSize: 16
          });
        } else if (Math.random() < attacker.data.critical) {
          // 重击了
          state = "critical";
          power *= 2;
          text = new Sprite.Text({
            text: "-" + power,
            color: color,
            fontSize: 32
          });
          this.flash();
          this.decreaseHP(power);
        } else {
          // 普通击中
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
            Game.sounds.hurt.volume = 0.2;
            Game.sounds.hurt.play();
          }
        }

        text.centerX = Math.floor(text.width / 2);
        text.centerY = Math.floor(text.height);
        text.x = this.sprite.x;
        text.y = this.sprite.y;

        text.x += Sprite.rand(-10, 10);

        Game.layers.actorLayer.appendChild(text);

        var speed = Sprite.rand(1, 3);

        Sprite.Ticker.whiles(100, function (last) {
          text.y -= speed;
          if (last) {
            Game.layers.actorLayer.removeChild(text);
          }
        });

        // 测试是否死亡
        this.dead(attacker);
      }

      /** 播放一个动画 */
    }, {
      key: "play",
      value: function play(animation, priority) {
        // 新动画默认优先级为0
        if (!Number.isFinite(priority)) {
          priority = 0;
        }

        // 无动画或者停止状态，现有优先级为-1（最低级）
        if (typeof this.animationPriority == "undefined" || this.sprite.paused == true) {
          this.animationPriority = -1;
        }

        if (this.data.animations.hasOwnProperty(animation) && priority >= this.animationPriority && animation != this.sprite.currentAnimation) {
          this.animationPriority = priority;
          this.sprite.play(animation);
        }
      }

      /** 停止 */
    }, {
      key: "stop",
      value: function stop() {
        if (!this.sprite.currentAnimation) return;

        if (this.sprite.paused && !this.sprite.currentAnimation.match(/face/) || this.sprite.currentAnimation.match(/walk|run/)) {
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
    }, {
      key: "fire",
      value: function fire(id, direction) {
        var _this5 = this;

        // 同一时间只能施展一个skill
        if (this.attacking) return 0;

        var skill = Game.skills[id];
        if (!skill) return 0;

        // 只有当这个skill的cooldown结
        var now = new Date().getTime();
        if (Number.isFinite(this.lastAttack) && Number.isFinite(this.lastAttackCooldown) && now - this.lastAttack < this.lastAttackCooldown) {
          return 0;
        }

        if (skill.data.cost > this.data.sp) {
          return 0;
        }

        if (!direction) {
          direction = this.direction;
        }

        if ( // 玩家使用技能是可能有条件的，例如剑技能需要装备剑
        this.type == "hero" && skill.data.condition && skill.data.condition() == false) {
          return 0;
        }

        this.lastAttack = now;
        this.lastAttackCooldown = skill.data.cooldown;
        this.attacking = true;

        if (this.going) {
          this.going = false;
        }

        Game.Input.clearDest();

        this.data.sp -= skill.data.cost;
        this.refreshBar();

        skill.fire(this, direction, function (hitted) {
          _this5.attacking = false;
          if (hitted.length > 0) {
            hitted[0].damage(_this5, skill);
          }
          _this5.emit("change");
        });

        return skill.data.cooldown;
      }

      /** 行走到指定地点 */
    }, {
      key: "goto",
      value: function goto(x, y, state) {
        var _this6 = this;

        return new Promise(function (resolve, reject) {

          if (_this6.going) {
            _this6.goingNext = function () {
              _this6.goto(x, y, state).then(resolve);
            };
            return false;
          }

          var destBlocked = _this6.checkCollision(x, y);

          if (destBlocked) {
            if (_this6.x == x) {
              if (_this6.y - y == -1) {
                _this6.stop();
                _this6.face("down");
                resolve();
                return false;
              } else if (_this6.y - y == 1) {
                _this6.stop();
                _this6.face("up");
                resolve();
                return false;
              }
            } else if (_this6.y == y) {
              if (_this6.x - x == -1) {
                _this6.stop();
                _this6.face("right");
                resolve();
                return false;
              } else if (_this6.x - x == 1) {
                _this6.stop();
                _this6.face("left");
                resolve();
                return false;
              }
            }
          }

          var positionChoice = [];
          // 上下左右
          if (_this6.checkCollision(x, y - 1) == false) {
            positionChoice.push({ x: x, y: y - 1, after: "down" });
          }
          if (_this6.checkCollision(x, y + 1) == false) {
            positionChoice.push({ x: x, y: y + 1, after: "up" });
          }
          if (_this6.checkCollision(x - 1, y) == false) {
            positionChoice.push({ x: x - 1, y: y, after: "right" });
          }
          if (_this6.checkCollision(x + 1, y) == false) {
            positionChoice.push({ x: x + 1, y: y, after: "left" });
          }

          var _iteratorNormalCompletion2 = true;
          var _didIteratorError2 = false;
          var _iteratorError2 = undefined;

          try {
            for (var _iterator2 = positionChoice[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
              var element = _step2.value;
              // 计算地址距离
              element.distance = _this6.distance(element.x, element.y);
            }

            // 按照地址的距离从近到远排序（从小到大）
          } catch (err) {
            _didIteratorError2 = true;
            _iteratorError2 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion2 && _iterator2["return"]) {
                _iterator2["return"]();
              }
            } finally {
              if (_didIteratorError2) {
                throw _iteratorError2;
              }
            }
          }

          positionChoice.sort(function (a, b) {
            return a.distance - b.distance;
          });

          // 如果真正的目的地有可能走，插入到第一位，写在这里是因为目的地并不一定是distance最小的
          if (_this6.checkCollision(x, y) == false) {
            positionChoice.splice(0, 0, { x: x, y: y });
          }

          var index = 0;
          var otherChoice = false;

          var TestPosition = function TestPosition() {
            if (index < positionChoice.length) {
              (function () {
                var dest = positionChoice[index]; // 保存第一个选项
                index++;
                Game.Astar.getPath({ x: _this6.x, y: _this6.y }, dest).then(function (result) {
                  _this6.gettingPath = false;
                  if (_this6.goingNext) {
                    var c = _this6.goingNext;
                    _this6.goingNext = null;
                    _this6.going = false;
                    if (_this6 == Game.hero) {
                      Game.Input.clearDest();
                    }
                    c();
                    return;
                  }
                  if (_this6.going) {
                    return;
                  }
                  if (result) {
                    if (_this6 == Game.hero) {
                      Game.Input.setDest(dest.x, dest.y);
                    } else {
                      // not hero
                      if (result.length > 30) {
                        // too far
                        return;
                      }
                    }
                    _this6.gotoPath(result, state, dest.after).then(resolve);
                    return;
                  } else {
                    return TestPosition();
                  }
                });
              })();
            } else {
              if (otherChoice == false) {
                otherChoice = true;
                var otherPositionChoice = [];
                // 四个角
                if (_this6.checkCollision(x - 1, y - 1) == false) {
                  otherPositionChoice.push({ x: x - 1, y: y - 1, after: "right" });
                }
                if (_this6.checkCollision(x + 1, y - 1) == false) {
                  otherPositionChoice.push({ x: x + 1, y: y - 1, after: "left" });
                }
                if (_this6.checkCollision(x - 1, y + 1) == false) {
                  otherPositionChoice.push({ x: x - 1, y: y + 1, after: "right" });
                }
                if (_this6.checkCollision(x + 1, y + 1) == false) {
                  otherPositionChoice.push({ x: x + 1, y: y + 1, after: "left" });
                }
                // 四个远方向
                if (_this6.checkCollision(x, y - 2) == false) {
                  otherPositionChoice.push({ x: x, y: y - 2, after: "down" });
                }
                if (_this6.checkCollision(x, y + 2) == false) {
                  otherPositionChoice.push({ x: x, y: y + 2, after: "up" });
                }
                if (_this6.checkCollision(x - 2, y) == false) {
                  otherPositionChoice.push({ x: x - 2, y: y, after: "right" });
                }
                if (_this6.checkCollision(x + 2, y) == false) {
                  otherPositionChoice.push({ x: x + 2, y: y, after: "left" });
                }

                var _iteratorNormalCompletion3 = true;
                var _didIteratorError3 = false;
                var _iteratorError3 = undefined;

                try {
                  for (var _iterator3 = otherPositionChoice[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
                    var element = _step3.value;
                    // 计算地址距离
                    element.distance = _this6.distance(element.x, element.y);
                  }

                  // 按照地址的距离从近到远排序（从小到大）
                } catch (err) {
                  _didIteratorError3 = true;
                  _iteratorError3 = err;
                } finally {
                  try {
                    if (!_iteratorNormalCompletion3 && _iterator3["return"]) {
                      _iterator3["return"]();
                    }
                  } finally {
                    if (_didIteratorError3) {
                      throw _iteratorError3;
                    }
                  }
                }

                otherPositionChoice.sort(function (a, b) {
                  return a.distance - b.distance;
                });

                if (otherPositionChoice.length) {
                  index = 0;
                  positionChoice = otherPositionChoice;
                  TestPosition();
                }
              }
            } // 再次尝试离地点最近的地点
          };

          return TestPosition();
        });
      }

      /**
       * 按照指定的path和state行走
       * 行走结束后如果after有定义，则面向after的方向
       */
    }, {
      key: "gotoPath",
      value: function gotoPath(path, state, after) {
        var _this7 = this;

        return new Promise(function (resolve, reject) {
          _this7.going = true;
          var index = 1;
          var Walk = function Walk() {
            if (Game.paused) {
              _this7.stop();
              _this7.going = false;
              if (_this7 == Game.hero) {
                Game.Input.clearDest();
              }
              return;
            }
            if (_this7.goingNext) {
              var c = _this7.goingNext;
              _this7.goingNext = null;
              _this7.going = false;
              if (_this7 == Game.hero) {
                Game.Input.clearDest();
              }
              c();
              return;
            }

            if (index < path.length) {
              var current = { x: _this7.x, y: _this7.y };
              var dest = path[index];
              var direction = null;
              if (dest.x == current.x) {
                if (dest.y > current.y) {
                  direction = "down";
                } else if (dest.y < current.y) {
                  direction = "up";
                }
              } else if (dest.y == current.y) {
                if (dest.x > current.x) {
                  direction = "right";
                } else if (dest.x < current.x) {
                  direction = "left";
                }
              }

              if (direction) {
                var currentDirection = _this7.direction;
                if (direction != currentDirection) {
                  _this7.stop();
                  _this7.face(direction);
                }
                _this7.go(state, direction).then(function () {
                  Walk();
                });
                index++;
              }
            } else {
              // 正常结束
              if (after) {
                _this7.stop();
                _this7.face(after);
              }
              if (_this7 == Game.hero) {
                Game.Input.clearDest();
              }
              _this7.going = false;
              resolve();
            }
          };
          Walk();
        });
      }

      /**
       * 让人物面向某个direction
       */
    }, {
      key: "face",
      value: function face(direction) {
        var animation = "face" + direction;
        if (this.animation != animation) {
          this.sprite.play(animation);
          this.emit("change");
        }
      }

      /**
       * 参数t中记录了某个方格的方位xy，测试这个方格是否和玩家有冲突
       * 返回true为有碰撞，返回false为无碰撞
       */
    }, {
      key: "checkCollision",
      value: function checkCollision(x, y) {
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
          var _iteratorNormalCompletion4 = true;
          var _didIteratorError4 = false;
          var _iteratorError4 = undefined;

          try {
            for (var _iterator4 = Game.area.actors[Symbol.iterator](), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
              var actor = _step4.value;

              if (actor != this && actor.hitTest(x, y)) {
                return true;
              }
            }
          } catch (err) {
            _didIteratorError4 = true;
            _iteratorError4 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion4 && _iterator4["return"]) {
                _iterator4["return"]();
              }
            } finally {
              if (_didIteratorError4) {
                throw _iteratorError4;
              }
            }
          }
        }

        // 地图上的物品碰撞
        if (Game.area.items) {
          var _iteratorNormalCompletion5 = true;
          var _didIteratorError5 = false;
          var _iteratorError5 = undefined;

          try {
            for (var _iterator5 = Game.area.items[Symbol.iterator](), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
              var item = _step5.value;

              if (item.hitTest(x, y)) {
                return true;
              }
            }
          } catch (err) {
            _didIteratorError5 = true;
            _iteratorError5 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion5 && _iterator5["return"]) {
                _iterator5["return"]();
              }
            } finally {
              if (_didIteratorError5) {
                throw _iteratorError5;
              }
            }
          }
        }

        return false;
      }
    }, {
      key: "hitTest",

      /**
       * 测试人物碰撞
       */
      value: function hitTest(x, y) {
        if (this.data.hitArea && this.data.hitArea instanceof Array) {
          var _iteratorNormalCompletion6 = true;
          var _didIteratorError6 = false;
          var _iteratorError6 = undefined;

          try {
            for (var _iterator6 = this.data.hitArea[Symbol.iterator](), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
              var p = _step6.value;

              if (x == this.x + p[0] && y == this.y + p[1]) {
                return true;
              }
            }
          } catch (err) {
            _didIteratorError6 = true;
            _iteratorError6 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion6 && _iterator6["return"]) {
                _iterator6["return"]();
              }
            } finally {
              if (_didIteratorError6) {
                throw _iteratorError6;
              }
            }
          }

          return false;
        } else {
          console.error(this.data);
          throw new Error("Game.Actor.hitTest invalid data");
        }
      }

      /**
       * 用state的姿态（walk，run）向direction方向走
       * 如果人物现在不是direction方向的，优先转头
       */
    }, {
      key: "go",
      value: function go(state, direction) {
        var _this8 = this;

        return new Promise(function (resolve, reject) {
          if (Game.paused) {
            return;
          }

          // 如果正在战斗动画，则不走
          if (_this8.sprite.paused == false && _this8.sprite.currentAnimation.match(/skillcast|thrust|slash|shoot/)) {
            return;
          }

          if (_this8.walking) {
            return;
          }

          if (_this8.attacking) {
            return;
          }

          if (_this8.direction != direction) {
            _this8.walking = true;
            _this8.stop();
            _this8.face(direction);
            // wait 4 ticks
            Sprite.Ticker.after(4, function () {
              _this8.walking = false;
            });
            return;
          }

          var newPosition = _this8.facePosition;

          if (_this8.checkCollision(newPosition.x, newPosition.y) == false) {
            (function () {
              // 没碰撞，开始行走
              _this8.walking = true;

              // 把角色位置设置为新位置，为了占领这个位置，这样其他角色就会碰撞
              // 但是不能用this.x = newX这样设置，因为this.x的设置会同时设置this.sprite.x
              var oldX = _this8.data.x;
              var oldY = _this8.data.y;
              _this8.data.x = newPosition.x;
              _this8.data.y = newPosition.y;

              // walk
              // 这些数组和必须是32，为了保证一次go行走32个像素
              var speed = [3, 3, 2, 3, 3, 2, 3, 3, 2, 3, 3, 2]; // 和是32
              if (state == "run") {
                // speed = [6,7,6,7,6]; // 和是32
                speed = [4, 4, 4, 4, 4, 4, 4, 4]; // 和是32
              }

              var whilesId = Sprite.Ticker.whiles(speed.length, function (last) {
                if (Game.paused) {
                  _this8.data.x = oldX;
                  _this8.data.y = oldY;
                  _this8.walking = false;
                  _this8.emit("change");
                  Sprite.Ticker.clearWhiles(whilesId);
                  resolve();
                  return;
                }
                if (last) {
                  _this8.x = newPosition.x;
                  _this8.y = newPosition.y;
                  _this8.walking = false;
                  _this8.emit("change");
                  resolve();
                } else {
                  switch (direction) {
                    case "up":
                      _this8.sprite.y -= speed.pop();
                      break;
                    case "down":
                      _this8.sprite.y += speed.pop();
                      break;
                    case "left":
                      _this8.sprite.x -= speed.pop();
                      break;
                    case "right":
                      _this8.sprite.x += speed.pop();
                      break;
                  }
                }
              });

              // 播放行走动画
              _this8.play(state + direction, 1);
            })();
          }
        });
      }

      /** 在Game.actorLayer上删除人物 */
    }, {
      key: "erase",
      value: function erase() {
        var privates = internal(this);
        Game.layers.actorLayer.removeChild(this.sprite);
        Game.layers.infoLayer.removeChild(privates.infoBox);
      }

      /** 在Game.actorLayer上显示人物 */
    }, {
      key: "draw",
      value: function draw() {
        var privates = internal(this);
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

      /** 镜头移动到中心为这个人物 */
    }, {
      key: "focus",
      value: function focus() {
        var privates = internal(this);
        privates.infoBox.x = this.sprite.x;
        privates.infoBox.y = this.sprite.y - this.sprite.centerY - 20;

        Game.stage.centerX = Math.round(this.sprite.x - Game.config.width / 2);
        Game.stage.centerY = Math.round(this.sprite.y - Game.config.height / 2);
      }
    }, {
      key: "data",
      get: function get() {
        var privates = internal(this);
        return privates.data;
      },
      set: function set(value) {
        throw new Error("Game.Actor.data readonly");
      }
    }, {
      key: "id",
      get: function get() {
        return internal(this).data.id;
      },
      set: function set(value) {
        throw new Error("Game.Actor.id readonly");
      }
    }, {
      key: "type",
      get: function get() {
        return internal(this).data.type;
      },
      set: function set(value) {
        throw new Error("Game.Actor.type readonly");
      }
    }, {
      key: "sprite",
      get: function get() {
        var privates = internal(this);
        return privates.sprite;
      },
      set: function set(value) {
        throw new Error("Game.Actor.sprite readonly");
      }
    }, {
      key: "quest",
      get: function get() {
        var privates = internal(this);
        if (privates.quest) {
          return privates.quest;
        } else {
          return null;
        }
      },
      set: function set(value) {
        throw new Error("Game.Actor.quests readonly");
      }
    }, {
      key: "x",
      get: function get() {
        return this.data.x;
      },
      set: function set(value) {
        if (Number.isFinite(value) && Number.isInteger(value)) {
          this.data.x = value;
          this.sprite.x = value * 32 + 16;
        } else {
          console.error(value, internal(this), this);
          throw new Error("Game.Actor got invalid x, x has to be a number and integer");
        }
      }
    }, {
      key: "y",
      get: function get() {
        return this.data.y;
      },
      set: function set(value) {
        if (Number.isFinite(value) && Number.isInteger(value)) {
          this.data.y = value;
          this.sprite.y = value * 32 + 16;
        } else {
          console.error(value, internal(this), this);
          throw new Error("Game.Actor got invalid y, y has to be a number and integer");
        }
      }
    }, {
      key: "visible",
      get: function get() {
        return this.sprite.visible;
      },
      set: function set(value) {
        this.sprite.visible = value;
        internal(this).infoBox.visible = value;
      }
    }, {
      key: "alpha",
      get: function get() {
        return this.sprite.alpha;
      },
      set: function set(value) {
        if (Number.isFinite(value) && value >= 0 && value <= 1) {
          this.sprite.alpha = value;
          internal(this).infoBox.alpha = value;
        } else {
          console.error(value, this);
          throw new Error("Game.Actor.alpha got invalid value");
        }
      }
    }, {
      key: "position",
      get: function get() {
        return {
          x: this.x,
          y: this.y
        };
      },
      set: function set(value) {
        throw new Error("Game.Actor.position readonly");
      }
    }, {
      key: "direction",
      get: function get() {
        return this.sprite.currentAnimation.match(/up|left|down|right/)[0];
      },
      set: function set(value) {
        throw new Error("Game.Actor.direction readonly");
      }
    }, {
      key: "facePosition",
      get: function get() {
        var p = this.position;
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
      },
      set: function set(value) {
        throw new Error("Game.Actor.facePosition readonly");
      }
    }]);

    return Actor;
  })(Sprite.Event)); // Game.Actor
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNyYy9HYW1lL0dhbWVBY3Rvci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkEsQ0FBQyxZQUFZO0FBQ1gsY0FBWSxDQUFDOztBQUViLE1BQUksUUFBUSxHQUFHLE1BQU0sQ0FBQyxTQUFTLEVBQUUsQ0FBQzs7Ozs7OztBQU9sQyxNQUFJLENBQUMsTUFBTSxDQUFDLE9BQU87Y0FBUSxLQUFLOztpQkFBTCxLQUFLOzthQUVsQixjQUFDLEVBQUUsRUFBRTtBQUNmLGVBQU8sSUFBSSxPQUFPLENBQUMsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQzVDLGdCQUFNLENBQUMsSUFBSSxZQUFVLEVBQUUsU0FBTSxDQUFDLElBQUksQ0FBQyxVQUFVLElBQUksRUFBRTtBQUNqRCxnQkFBSSxTQUFTLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDMUIscUJBQVMsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFDOztBQUVsQixnQkFBSSxRQUFRLEdBQUcsSUFBSSxDQUFDO0FBQ3BCLGdCQUFJLFNBQVMsQ0FBQyxJQUFJLElBQUksS0FBSyxFQUFFO0FBQzNCLHNCQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3pDLE1BQU0sSUFBSSxTQUFTLENBQUMsSUFBSSxJQUFJLFNBQVMsRUFBRTtBQUN0QyxzQkFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFlBQVksQ0FBQyxTQUFTLENBQUMsQ0FBQzthQUM3QyxNQUFNLElBQUksU0FBUyxDQUFDLElBQUksSUFBSSxNQUFNLEVBQUU7QUFDbkMsc0JBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDMUMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxJQUFJLElBQUksS0FBSyxFQUFFO0FBQ2xDLHNCQUFRLEdBQUcsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FB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RUFBRSxJQUFJLENBQUMsQ0FBQztTQUNWLENBQUM7T0FDSDtXQUVZLGFBQUMsS0FBSyxFQUFFO0FBQ25CLGNBQU0sSUFBSSxLQUFLLENBQUMsOEJBQThCLENBQUMsQ0FBQztPQUNqRDs7O1dBRWEsZUFBRztBQUNmLGVBQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNwRTtXQUVhLGFBQUMsS0FBSyxFQUFFO0FBQ3BCLGNBQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztPQUNsRDs7O1dBRWdCLGVBQUc7QUFDbEIsWUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQztBQUN0QixnQkFBUSxJQUFJLENBQUMsU0FBUztBQUNwQixlQUFLLElBQUk7QUFDUCxhQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNULGtCQUFNO0FBQUEsQUFDUixlQUFLLE1BQU07QUFDVCxhQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNULGtCQUFNO0FBQUEsQUFDUixlQUFLLE1BQU07QUFDVCxhQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNULGtCQUFNO0FBQUEsQUFDUixlQUFLLE9BQU87QUFDVixhQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNULGtCQUFNO0FBQUEsU0FDVDtBQUNELGVBQU8sQ0FBQyxDQUFDO09BQ1Y7V0FFZ0IsYUFBQyxLQUFLLEVBQUU7QUFDdkIsY0FBTSxJQUFJLEtBQUssQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFDO09BQ3JEOzs7V0E3WndCLEtBQUs7S0FBUyxNQUFNLENBQUMsS0FBSyxFQTJtQ25ELENBQUM7Q0FFSixDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJzcmMvR2FtZS9HYW1lQWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKlxuXG5BLVJQRyBHYW1lLCBCdWlsdCB1c2luZyBKYXZhU2NyaXB0IEVTNlxuQ29weXJpZ2h0IChDKSAyMDE1IHFoZHVhbihodHRwOi8vcWhkdWFuLmNvbSlcblxuVGhpcyBwcm9ncmFtIGlzIGZyZWUgc29mdHdhcmU6IHlvdSBjYW4gcmVkaXN0cmlidXRlIGl0IGFuZC9vciBtb2RpZnlcbml0IHVuZGVyIHRoZSB0ZXJtcyBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgYXMgcHVibGlzaGVkIGJ5XG50aGUgRnJlZSBTb2Z0d2FyZSBGb3VuZGF0aW9uLCBlaXRoZXIgdmVyc2lvbiAzIG9mIHRoZSBMaWNlbnNlLCBvclxuKGF0IHlvdXIgb3B0aW9uKSBhbnkgbGF0ZXIgdmVyc2lvbi5cblxuVGhpcyBwcm9ncmFtIGlzIGRpc3RyaWJ1dGVkIGluIHRoZSBob3BlIHRoYXQgaXQgd2lsbCBiZSB1c2VmdWwsXG5idXQgV0lUSE9VVCBBTlkgV0FSUkFOVFk7IHdpdGhvdXQgZXZlbiB0aGUgaW1wbGllZCB3YXJyYW50eSBvZlxuTUVSQ0hBTlRBQklMSVRZIG9yIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFLiAgU2VlIHRoZVxuR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2UgZm9yIG1vcmUgZGV0YWlscy5cblxuWW91IHNob3VsZCBoYXZlIHJlY2VpdmVkIGEgY29weSBvZiB0aGUgR05VIEdlbmVyYWwgUHVibGljIExpY2Vuc2VcbmFsb25nIHdpdGggdGhpcyBwcm9ncmFtLiAgSWYgbm90LCBzZWUgPGh0dHA6Ly93d3cuZ251Lm9yZy9saWNlbnNlcy8+LlxuXG4qL1xuXG4oZnVuY3Rpb24gKCkge1xuICBcInVzZSBzdHJpY3RcIjtcblxuICBsZXQgaW50ZXJuYWwgPSBTcHJpdGUuTmFtZXNwYWNlKCk7XG5cbiAgLypcbiAgICDop5LoibLnsbvvvIzljIXmi6zmtonlj4rliLBoZXJv5ZKMbnBjXG4gICAg5bGe5oCn77yaXG4gICAgICB0aGlzLnNwcml0ZSDnsr7ngbVcbiAgKi9cbiAgR2FtZS5hc3NpZ24oXCJBY3RvclwiLCBjbGFzcyBBY3RvciBleHRlbmRzIFNwcml0ZS5FdmVudCB7XG5cbiAgICBzdGF0aWMgbG9hZCAoaWQpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAocmVzb2x2ZSwgcmVqZWN0KSB7XG4gICAgICAgIFNwcml0ZS5sb2FkKGBhY3Rvci8ke2lkfS5qc2ApLnRoZW4oZnVuY3Rpb24gKGRhdGEpIHtcbiAgICAgICAgICBsZXQgYWN0b3JEYXRhID0gZGF0YVswXSgpO1xuICAgICAgICAgIGFjdG9yRGF0YS5pZCA9IGlkO1xuXG4gICAgICAgICAgbGV0IGFjdG9yT2JqID0gbnVsbDtcbiAgICAgICAgICBpZiAoYWN0b3JEYXRhLnR5cGUgPT0gXCJucGNcIikge1xuICAgICAgICAgICAgYWN0b3JPYmogPSBuZXcgR2FtZS5BY3Rvck5QQyhhY3RvckRhdGEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAoYWN0b3JEYXRhLnR5cGUgPT0gXCJtb25zdGVyXCIpIHtcbiAgICAgICAgICAgIGFjdG9yT2JqID0gbmV3IEdhbWUuQWN0b3JNb25zdGVyKGFjdG9yRGF0YSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChhY3RvckRhdGEudHlwZSA9PSBcImFsbHlcIikge1xuICAgICAgICAgICAgYWN0b3JPYmogPSBuZXcgR2FtZS5BY3RvckFsbHkoYWN0b3JEYXRhKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFjdG9yRGF0YS50eXBlID09IFwicGV0XCIpIHtcbiAgICAgICAgICAgIGFjdG9yT2JqID0gbmV3IEdhbWUuQWN0b3JQZXQoYWN0b3JEYXRhKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcihhY3RvckRhdGEudHlwZSwgYWN0b3JEYXRhKTtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWUuQWN0b3IubG9hZCBpbnZhbGlkIGFjdG9yIHR5cGVcIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGFjdG9yT2JqLm9uKFwiY29tcGxldGVcIiwgKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShhY3Rvck9iaik7XG4gICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBjb25zdHJ1Y3RvciAoYWN0b3JEYXRhKSB7XG4gICAgICBzdXBlcigpO1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG5cbiAgICAgIHByaXZhdGVzLmRhdGEgPSBhY3RvckRhdGE7XG5cbiAgICAgIHRoaXMubWFrZUluZm9Cb3goKTtcblxuICAgICAgaWYgKHRoaXMuZGF0YS5pbWFnZSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIHRoaXMuaW5pdCh0aGlzLmRhdGEuaW1hZ2UpO1xuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdGhpcy5kYXRhLmltYWdlID09IFwic3RyaW5nXCIpIHtcbiAgICAgICAgU3ByaXRlLmxvYWQoXCJhY3Rvci9cIiArIHRoaXMuZGF0YS5pbWFnZSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgIC8vIGRhdGEgaXMgQXJyYXlcbiAgICAgICAgICB0aGlzLmluaXQoZGF0YSk7XG4gICAgICAgIH0pO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih0aGlzLmlkLCB0aGlzLmRhdGEsIHRoaXMuZGF0YS5pbWFnZSwgdGhpcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgQWN0b3IgSW1hZ2VcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaW5pdCAoaW1hZ2VzKSB7XG4gICAgICBsZXQgcHJpdmF0ZXMgPSBpbnRlcm5hbCh0aGlzKTtcbiAgICAgIGxldCBkYXRhID0gcHJpdmF0ZXMuZGF0YTtcblxuICAgICAgZm9yIChsZXQgaW1hZ2Ugb2YgaW1hZ2VzKSB7XG4gICAgICAgIGlmICghKGltYWdlIGluc3RhbmNlb2YgSW1hZ2UpICYmICEoaW1hZ2UuZ2V0Q29udGV4dCAmJiBpbWFnZS5nZXRDb250ZXh0KFwiMmRcIikpKSB7XG4gICAgICAgICAgY29uc29sZS5lcnJvcihpbWFnZSwgaW1hZ2VzLCB0aGlzKTtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lLkFjdG9yIGdvdCBpbnZhbGlkIGltYWdlLCBub3QgSW1hZ2Ugb3IgQ2FudmFzXCIpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICBsZXQgc3ByaXRlID0gbmV3IFNwcml0ZS5TaGVldCh7XG4gICAgICAgIGltYWdlczogaW1hZ2VzLCAvLyBpbWFnZXMgaXMgQXJyYXlcbiAgICAgICAgd2lkdGg6IGRhdGEudGlsZXdpZHRoLFxuICAgICAgICBoZWlnaHQ6IGRhdGEudGlsZWhlaWdodCxcbiAgICAgICAgYW5pbWF0aW9uczogZGF0YS5hbmltYXRpb25zXG4gICAgICB9KTtcblxuICAgICAgaWYgKFxuICAgICAgICBOdW1iZXIuaXNJbnRlZ2VyKGRhdGEuY2VudGVyWCkgJiZcbiAgICAgICAgTnVtYmVyLmlzSW50ZWdlcihkYXRhLmNlbnRlclkpXG4gICAgICApIHtcbiAgICAgICAgc3ByaXRlLmNlbnRlclggPSBkYXRhLmNlbnRlclg7XG4gICAgICAgIHNwcml0ZS5jZW50ZXJZID0gZGF0YS5jZW50ZXJZO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5sb2coZGF0YSk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWUuQWN0b3IgaW52YWxpZCBjZW50ZXJYL2NlbnRlcllcIik7XG4gICAgICB9XG5cbiAgICAgIHNwcml0ZS5wbGF5KFwiZmFjZWRvd25cIik7XG4gICAgICBwcml2YXRlcy5zcHJpdGUgPSBzcHJpdGU7XG5cbiAgICAgIHNwcml0ZS5vbihcImNoYW5nZVwiLCAoKSA9PiB7XG4gICAgICAgIHByaXZhdGVzLmluZm9Cb3gueCA9IHNwcml0ZS54O1xuICAgICAgICBwcml2YXRlcy5pbmZvQm94LnkgPSBzcHJpdGUueSAtIHNwcml0ZS5jZW50ZXJZIC0gMjBcbiAgICAgIH0pO1xuXG4gICAgICBsZXQgY29tcGxldGVDb3VudCA9IC0xO1xuICAgICAgbGV0IENvbXBsZXRlID0gKCkgPT4ge1xuICAgICAgICBjb21wbGV0ZUNvdW50Kys7XG4gICAgICAgIGlmIChjb21wbGV0ZUNvdW50ID49IDApIHtcbiAgICAgICAgICB0aGlzLmNhbGN1bGF0ZSgpO1xuICAgICAgICAgIHRoaXMucmVmcmVzaEJhcigpO1xuICAgICAgICAgIHRoaXMuZW1pdChcImNvbXBsZXRlXCIsIHRydWUpO1xuICAgICAgICB9XG4gICAgICB9O1xuXG4gICAgICAvLyDliqDovb1OUEPlj6/og73mnInnmoTku7vliqFcbiAgICAgIGlmIChkYXRhLnF1ZXN0KSB7XG4gICAgICAgIHByaXZhdGVzLnF1ZXN0ID0gW107XG4gICAgICAgIHByaXZhdGVzLnF1ZXN0Lmxlbmd0aCA9IGRhdGEucXVlc3QubGVuZ3RoO1xuICAgICAgICBkYXRhLnF1ZXN0LmZvckVhY2goKHF1ZXN0SWQsIGluZGV4KSA9PiB7XG4gICAgICAgICAgY29tcGxldGVDb3VudC0tO1xuXG4gICAgICAgICAgR2FtZS5RdWVzdC5sb2FkKHF1ZXN0SWQpLnRoZW4oKHF1ZXN0RGF0YSkgPT4ge1xuICAgICAgICAgICAgcHJpdmF0ZXMucXVlc3QucHVzaChxdWVzdERhdGEpO1xuICAgICAgICAgICAgQ29tcGxldGUoKTtcbiAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8g5Yqg6L295Lq654mp5oqA6IO9XG4gICAgICBpZiAoZGF0YS5za2lsbHMpIHtcbiAgICAgICAgZGF0YS5za2lsbHMuZm9yRWFjaCgoc2tpbGxJZCkgPT4ge1xuICAgICAgICAgIGNvbXBsZXRlQ291bnQtLTtcbiAgICAgICAgICBHYW1lLlNraWxsLmxvYWQoc2tpbGxJZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBDb21wbGV0ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgIH1cblxuICAgICAgLy8g5Yqg6L295Lq654mp6KOF5aSH77yI5pqC5pe25Y+q5pyJ546p5a6277yJXG4gICAgICBpZiAoZGF0YS5lcXVpcG1lbnQpIHtcbiAgICAgICAgZm9yIChsZXQga2V5IGluIGRhdGEuZXF1aXBtZW50KSB7XG4gICAgICAgICAgbGV0IGl0ZW1JZCA9IGRhdGEuZXF1aXBtZW50W2tleV07XG4gICAgICAgICAgaWYgKGl0ZW1JZCkge1xuICAgICAgICAgICAgY29tcGxldGVDb3VudC0tO1xuICAgICAgICAgICAgR2FtZS5JdGVtLmxvYWQoaXRlbUlkKS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgQ29tcGxldGUoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyDliqDovb3kurrniannianlk4FcbiAgICAgIGlmIChkYXRhLml0ZW1zKSB7XG4gICAgICAgIGZvciAobGV0IGl0ZW1JZCBpbiBkYXRhLml0ZW1zKSB7XG4gICAgICAgICAgY29tcGxldGVDb3VudC0tO1xuICAgICAgICAgIEdhbWUuSXRlbS5sb2FkKGl0ZW1JZCkudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBDb21wbGV0ZSgpO1xuICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIENvbXBsZXRlKCk7XG4gICAgfVxuXG4gICAgZ2V0IGRhdGEgKCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICByZXR1cm4gcHJpdmF0ZXMuZGF0YTtcbiAgICB9XG5cbiAgICBzZXQgZGF0YSAodmFsdWUpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWUuQWN0b3IuZGF0YSByZWFkb25seVwiKTtcbiAgICB9XG5cbiAgICBnZXQgaWQgKCkge1xuICAgICAgcmV0dXJuIGludGVybmFsKHRoaXMpLmRhdGEuaWQ7XG4gICAgfVxuXG4gICAgc2V0IGlkICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5BY3Rvci5pZCByZWFkb25seVwiKTtcbiAgICB9XG5cbiAgICBnZXQgdHlwZSAoKSB7XG4gICAgICByZXR1cm4gaW50ZXJuYWwodGhpcykuZGF0YS50eXBlO1xuICAgIH1cblxuICAgIHNldCB0eXBlICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5BY3Rvci50eXBlIHJlYWRvbmx5XCIpO1xuICAgIH1cblxuICAgIGdldCBzcHJpdGUgKCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICByZXR1cm4gcHJpdmF0ZXMuc3ByaXRlO1xuICAgIH1cblxuICAgIHNldCBzcHJpdGUgKHZhbHVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lLkFjdG9yLnNwcml0ZSByZWFkb25seVwiKTtcbiAgICB9XG5cbiAgICBnZXQgcXVlc3QgKCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICBpZiAocHJpdmF0ZXMucXVlc3QpIHtcbiAgICAgICAgcmV0dXJuIHByaXZhdGVzLnF1ZXN0O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICB9XG4gICAgfVxuXG4gICAgc2V0IHF1ZXN0ICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5BY3Rvci5xdWVzdHMgcmVhZG9ubHlcIik7XG4gICAgfVxuXG4gICAgcG9wdXAgKHRleHQpIHtcbiAgICAgIEdhbWUucG9wdXAodGhpcy5zcHJpdGUsIHRleHQsIDAsIC01MCk7XG4gICAgfVxuXG4gICAgbWFrZUluZm9Cb3ggKCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICAvLyDlkI3lrZdcbiAgICAgIGxldCB0ZXh0ID0gbmV3IFNwcml0ZS5UZXh0KHtcbiAgICAgICAgdGV4dDogcHJpdmF0ZXMuZGF0YS5uYW1lLFxuICAgICAgICBtYXhXaWR0aDogMjAwLFxuICAgICAgICBjb2xvcjogXCJ3aGl0ZVwiLFxuICAgICAgICBmb250U2l6ZTogMTJcbiAgICAgIH0pO1xuICAgICAgdGV4dC5jZW50ZXJZID0gTWF0aC5mbG9vcih0ZXh0LmhlaWdodCAvIDIpO1xuICAgICAgdGV4dC5jZW50ZXJYID0gTWF0aC5mbG9vcih0ZXh0LndpZHRoIC8gMik7XG4gICAgICB0ZXh0LnggPSAwO1xuICAgICAgdGV4dC55ID0gMDtcblxuICAgICAgLy8g5LiA5Liq5LiK6Z2i5Zub5Liq57K+56We5p2h44CB6KGA5p2h55qE6IGa5ZCI77yM57uf5LiA566h55CG5pS+5YWl6L+Z5LiqQ29udGFpbmVyXG4gICAgICBwcml2YXRlcy5pbmZvQm94ID0gbmV3IFNwcml0ZS5Db250YWluZXIoKTtcblxuICAgICAgaWYgKHByaXZhdGVzLmRhdGEudHlwZSAhPSBcImhlcm9cIikge1xuICAgICAgICAvLyDooYDmnaHlpJbpnaLnmoTpu5HmoYZcbiAgICAgICAgbGV0IGhwYmFyQm94ID0gbmV3IFNwcml0ZS5TaGFwZSgpO1xuICAgICAgICBocGJhckJveC5jZW50ZXJYID0gMTU7XG4gICAgICAgIGhwYmFyQm94LmNlbnRlclkgPSAyO1xuICAgICAgICBocGJhckJveC54ID0gMDtcbiAgICAgICAgaHBiYXJCb3gueSA9IDk7XG5cbiAgICAgICAgLy8g6a2U5rOV5p2h5aSW6Z2i55qE6buR5qGGXG4gICAgICAgIGxldCBtcGJhckJveCA9IG5ldyBTcHJpdGUuU2hhcGUoKTtcbiAgICAgICAgbXBiYXJCb3guY2VudGVyWCA9IDE1O1xuICAgICAgICBtcGJhckJveC5jZW50ZXJZID0gMjtcbiAgICAgICAgbXBiYXJCb3gueCA9IDA7XG4gICAgICAgIG1wYmFyQm94LnkgPSAxMjtcblxuICAgICAgICBocGJhckJveC5yZWN0KHtcbiAgICAgICAgICB4OiAwLFxuICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgd2lkdGg6IDMwLFxuICAgICAgICAgIGhlaWdodDogMyxcbiAgICAgICAgICBcImZpbGwtb3BhY2l0eVwiOiAwXG4gICAgICAgIH0pO1xuXG4gICAgICAgIG1wYmFyQm94LnJlY3Qoe1xuICAgICAgICAgIHg6IDAsXG4gICAgICAgICAgeTogMCxcbiAgICAgICAgICB3aWR0aDogMzAsXG4gICAgICAgICAgaGVpZ2h0OiAzLFxuICAgICAgICAgIFwiZmlsbC1vcGFjaXR5XCI6IDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g55Sf5ZG95p2hXG4gICAgICAgIHByaXZhdGVzLmhwYmFyID0gbmV3IFNwcml0ZS5TaGFwZSgpO1xuICAgICAgICBwcml2YXRlcy5ocGJhci5jZW50ZXJYID0gMTU7XG4gICAgICAgIHByaXZhdGVzLmhwYmFyLmNlbnRlclkgPSAyO1xuICAgICAgICBwcml2YXRlcy5ocGJhci54ID0gMDtcbiAgICAgICAgcHJpdmF0ZXMuaHBiYXIueSA9IDk7XG5cbiAgICAgICAgLy8g57K+5Yqb5p2hXG4gICAgICAgIHByaXZhdGVzLm1wYmFyID0gbmV3IFNwcml0ZS5TaGFwZSgpO1xuICAgICAgICBwcml2YXRlcy5tcGJhci5jZW50ZXJYID0gMTU7XG4gICAgICAgIHByaXZhdGVzLm1wYmFyLmNlbnRlclkgPSAyO1xuICAgICAgICBwcml2YXRlcy5tcGJhci54ID0gMDtcbiAgICAgICAgcHJpdmF0ZXMubXBiYXIueSA9IDEyO1xuXG4gICAgICAgIHByaXZhdGVzLmluZm9Cb3guYXBwZW5kQ2hpbGQoXG4gICAgICAgICAgdGV4dCxcbiAgICAgICAgICBocGJhckJveCxcbiAgICAgICAgICBtcGJhckJveCxcbiAgICAgICAgICBwcml2YXRlcy5ocGJhcixcbiAgICAgICAgICBwcml2YXRlcy5tcGJhclxuICAgICAgICApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNhbGN1bGF0ZSAoKSB7XG4gICAgICBsZXQgZGF0YSA9IGludGVybmFsKHRoaXMpLmRhdGE7XG4gICAgICBpZiAoXG4gICAgICAgIGRhdGEuJHN0ciAmJlxuICAgICAgICBkYXRhLiRkZXggJiZcbiAgICAgICAgZGF0YS4kY29uICYmXG4gICAgICAgIGRhdGEuJGludCAmJlxuICAgICAgICBkYXRhLiRjaGFcbiAgICAgICkge1xuXG4gICAgICAgIGRhdGEuc3RyID0gZGF0YS4kc3RyO1xuICAgICAgICBkYXRhLmRleCA9IGRhdGEuJGRleDtcbiAgICAgICAgZGF0YS5jb24gPSBkYXRhLiRjb247XG4gICAgICAgIGRhdGEuaW50ID0gZGF0YS4kaW50O1xuICAgICAgICBkYXRhLmNoYSA9IGRhdGEuJGNoYTtcblxuICAgICAgICAvLyDnhLblkI7lj6/ku6Xpkojlr7nkuIDnuqflsZ7mgKforqHnrpdidWZmXG5cblxuICAgICAgICAvLyDorqHnrpflrozkuIDnuqflsZ7mgKfnmoRidWZm5LmL5ZCO77yM5byA5aeL6K6h566X5LqM57qn5bGe5oCnXG5cbiAgICAgICAgZGF0YS4kaHAgPSBkYXRhLmNvbiAqIDU7XG4gICAgICAgIGRhdGEuJHNwID0gZGF0YS5pbnQgKiA1O1xuXG4gICAgICAgIGRhdGEuYXRrID0gTWF0aC5mbG9vcihkYXRhLnN0ciAqIDAuMjUpO1xuICAgICAgICBkYXRhLm1hdGsgPSBNYXRoLmZsb29yKGRhdGEuaW50ICogMC4yNSk7XG4gICAgICAgIGRhdGEuZGVmID0gMDtcbiAgICAgICAgZGF0YS5tZGVmID0gMDtcbiAgICAgICAgZGF0YS5jcml0aWNhbCA9IGRhdGEuZGV4ICogMC4wMDU7XG4gICAgICAgIGRhdGEuZG9kZ2UgPSBkYXRhLmRleCAqIDAuMDA1O1xuXG4gICAgICAgIC8vIOeEtuWQjuWPr+S7peWvueS6jOe6p+WxnuaAp+iuoeeul2J1ZmZcblxuXG5cbiAgICAgICAgLy8g5a+55LqM57qn5bGe5oCn6K6h566X5a6MYnVmZuS5i+WQju+8jOWPr+S7peiuoeeul+S8muWPmOWKqOeahOWAvFxuICAgICAgICAvLyDkvovlpoIuJGhw5pivYnVmZuS5i+WQjueahOeUn+WRveWAvOS4iumZkO+8jC5ocOaYr+W9k+WJjeeUn+WRveWAvFxuICAgICAgICBkYXRhLmhwID0gZGF0YS4kaHA7XG4gICAgICAgIGRhdGEuc3AgPSBkYXRhLiRzcDtcblxuICAgICAgICBpZiAoZGF0YS5idWZmICYmIGRhdGEubmVyZikge1xuICAgICAgICAgIGRhdGEuYnVmZi5mb3JFYWNoKChlbGVtZW50KSA9PiB7XG5cbiAgICAgICAgICB9KTtcbiAgICAgICAgICBkYXRhLm5lcmYuZm9yRWFjaCgoZWxlbWVudCkgPT4ge1xuXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgeCAoKSB7XG4gICAgICByZXR1cm4gdGhpcy5kYXRhLng7XG4gICAgfVxuXG4gICAgc2V0IHggKHZhbHVlKSB7XG4gICAgICBpZiAoTnVtYmVyLmlzRmluaXRlKHZhbHVlKSAmJiBOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSkge1xuICAgICAgICB0aGlzLmRhdGEueCA9IHZhbHVlO1xuICAgICAgICB0aGlzLnNwcml0ZS54ID0gdmFsdWUgKiAzMiArIDE2O1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih2YWx1ZSwgaW50ZXJuYWwodGhpcyksIHRoaXMpO1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lLkFjdG9yIGdvdCBpbnZhbGlkIHgsIHggaGFzIHRvIGJlIGEgbnVtYmVyIGFuZCBpbnRlZ2VyXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGdldCB5ICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmRhdGEueTtcbiAgICB9XG5cbiAgICBzZXQgeSAodmFsdWUpIHtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWUpICYmIE51bWJlci5pc0ludGVnZXIodmFsdWUpKSB7XG4gICAgICAgIHRoaXMuZGF0YS55ID0gdmFsdWU7XG4gICAgICAgIHRoaXMuc3ByaXRlLnkgPSB2YWx1ZSAqIDMyICsgMTY7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKHZhbHVlLCBpbnRlcm5hbCh0aGlzKSwgdGhpcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWUuQWN0b3IgZ290IGludmFsaWQgeSwgeSBoYXMgdG8gYmUgYSBudW1iZXIgYW5kIGludGVnZXJcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IHZpc2libGUgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3ByaXRlLnZpc2libGU7XG4gICAgfVxuXG4gICAgc2V0IHZpc2libGUgKHZhbHVlKSB7XG4gICAgICB0aGlzLnNwcml0ZS52aXNpYmxlID0gdmFsdWU7XG4gICAgICBpbnRlcm5hbCh0aGlzKS5pbmZvQm94LnZpc2libGUgPSB2YWx1ZTtcbiAgICB9XG5cbiAgICBnZXQgYWxwaGEgKCkge1xuICAgICAgcmV0dXJuIHRoaXMuc3ByaXRlLmFscGhhO1xuICAgIH1cblxuICAgIHNldCBhbHBoYSAodmFsdWUpIHtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWUpICYmIHZhbHVlID49IDAgJiYgdmFsdWUgPD0gMSkge1xuICAgICAgICB0aGlzLnNwcml0ZS5hbHBoYSA9IHZhbHVlO1xuICAgICAgICBpbnRlcm5hbCh0aGlzKS5pbmZvQm94LmFscGhhID0gdmFsdWU7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKHZhbHVlLCB0aGlzKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5BY3Rvci5hbHBoYSBnb3QgaW52YWxpZCB2YWx1ZVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBnZXQgcG9zaXRpb24gKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgeDogdGhpcy54LFxuICAgICAgICB5OiB0aGlzLnlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgc2V0IHBvc2l0aW9uICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5BY3Rvci5wb3NpdGlvbiByZWFkb25seVwiKTtcbiAgICB9XG5cbiAgICBnZXQgZGlyZWN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLnNwcml0ZS5jdXJyZW50QW5pbWF0aW9uLm1hdGNoKC91cHxsZWZ0fGRvd258cmlnaHQvKVswXTtcbiAgICB9XG5cbiAgICBzZXQgZGlyZWN0aW9uICh2YWx1ZSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5BY3Rvci5kaXJlY3Rpb24gcmVhZG9ubHlcIik7XG4gICAgfVxuXG4gICAgZ2V0IGZhY2VQb3NpdGlvbiAoKSB7XG4gICAgICBsZXQgcCA9IHRoaXMucG9zaXRpb247XG4gICAgICBzd2l0Y2ggKHRoaXMuZGlyZWN0aW9uKSB7XG4gICAgICAgIGNhc2UgXCJ1cFwiOlxuICAgICAgICAgIHAueSAtPSAxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwiZG93blwiOlxuICAgICAgICAgIHAueSArPSAxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwibGVmdFwiOlxuICAgICAgICAgIHAueCAtPSAxO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICBjYXNlIFwicmlnaHRcIjpcbiAgICAgICAgICBwLnggKz0gMTtcbiAgICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIHJldHVybiBwO1xuICAgIH1cblxuICAgIHNldCBmYWNlUG9zaXRpb24gKHZhbHVlKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJHYW1lLkFjdG9yLmZhY2VQb3NpdGlvbiByZWFkb25seVwiKTtcbiAgICB9XG5cbiAgICByZWZyZXNoQmFyICgpIHtcbiAgICAgIGxldCBwcml2YXRlcyA9IGludGVybmFsKHRoaXMpO1xuXG4gICAgICBpZiAocHJpdmF0ZXMuaHBiYXIgJiYgcHJpdmF0ZXMubXBiYXIpIHtcbiAgICAgICAgbGV0IGhwY29sb3IgPSBcImdyZWVuXCI7XG4gICAgICAgIGlmICgodGhpcy5kYXRhLmhwIC8gdGhpcy5kYXRhLiRocCkgPCAwLjI1KVxuICAgICAgICAgIGhwY29sb3IgPSBcInJlZFwiO1xuICAgICAgICBlbHNlIGlmICgodGhpcy5kYXRhLmhwIC8gdGhpcy5kYXRhLiRocCkgPCAwLjUpXG4gICAgICAgICAgaHBjb2xvciA9IFwieWVsbG93XCI7XG5cbiAgICAgICAgcHJpdmF0ZXMuaHBiYXIuY2xlYXIoKS5yZWN0KHtcbiAgICAgICAgICB4OiAxLFxuICAgICAgICAgIHk6IDEsXG4gICAgICAgICAgd2lkdGg6IE1hdGguZmxvb3IoKHRoaXMuZGF0YS5ocCAvIHRoaXMuZGF0YS4kaHApICogMjgpLFxuICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICBmaWxsOiBocGNvbG9yLFxuICAgICAgICAgIFwic3Ryb2tlLXdpZHRoXCI6IDBcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcHJpdmF0ZXMubXBiYXIuY2xlYXIoKS5yZWN0KHtcbiAgICAgICAgICB4OiAxLFxuICAgICAgICAgIHk6IDEsXG4gICAgICAgICAgd2lkdGg6IE1hdGguZmxvb3IoKHRoaXMuZGF0YS5zcCAvIHRoaXMuZGF0YS4kc3ApICogMjgpLFxuICAgICAgICAgIGhlaWdodDogMixcbiAgICAgICAgICBmaWxsOiBcImJsdWVcIixcbiAgICAgICAgICBcInN0cm9rZS13aWR0aFwiOiAwXG4gICAgICAgIH0pO1xuICAgICAgfVxuICAgIH1cblxuICAgIGRpc3RhbmNlICgpIHtcbiAgICAgIGxldCB4ID0gbnVsbCwgeSA9IG51bGw7XG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAyICYmIE51bWJlci5pc0Zpbml0ZShhcmd1bWVudHNbMF0pICYmIE51bWJlci5pc0Zpbml0ZShhcmd1bWVudHNbMV0pKSB7XG4gICAgICAgIHggPSBhcmd1bWVudHNbMF07XG4gICAgICAgIHkgPSBhcmd1bWVudHNbMV07XG4gICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gMSAmJiBOdW1iZXIuaXNGaW5pdGUoYXJndW1lbnRzWzBdLngpICYmIE51bWJlci5pc0Zpbml0ZShhcmd1bWVudHNbMF0ueSkpIHtcbiAgICAgICAgeCA9IGFyZ3VtZW50c1swXS54O1xuICAgICAgICB5ID0gYXJndW1lbnRzWzBdLnk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFyZ3VtZW50cyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIkdhbWUuQWN0b3IuZGlzdGFuY2UgSW52YWxpZCBhcmd1bWVudHNcIik7XG4gICAgICB9XG4gICAgICBsZXQgZCA9IDA7XG4gICAgICBkICs9IE1hdGgucG93KHRoaXMueCAtIHgsIDIpO1xuICAgICAgZCArPSBNYXRoLnBvdyh0aGlzLnkgLSB5LCAyKTtcbiAgICAgIGQgPSBNYXRoLnNxcnQoZCk7XG4gICAgICByZXR1cm4gZDtcbiAgICB9XG5cbiAgICBkZWNyZWFzZUhQIChwb3dlcikge1xuICAgICAgdGhpcy5kYXRhLmhwIC09IHBvd2VyO1xuICAgICAgdGhpcy5yZWZyZXNoQmFyKCk7XG4gICAgfVxuXG4gICAgZGVjcmVhc2VTUCAoc3ApIHtcbiAgICAgIHRoaXMuZGF0YS5zcCAtPSBzcDtcbiAgICAgIHRoaXMucmVmcmVzaEJhcigpO1xuICAgIH1cblxuICAgIGRlYWQgKGF0dGFja2VyKSB7XG4gICAgICBpZiAodGhpcy5kYXRhLmhwIDw9IDApIHtcbiAgICAgICAgaWYgKHRoaXMuZGF0YS50eXBlID09IFwiaGVyb1wiKSB7XG4gICAgICAgICAgR2FtZS53aW5kb3dzLm92ZXIub3Blbihg5L2g6KKrJHthdHRhY2tlci5kYXRhLm5hbWV95omT5q275LqGYCk7XG4gICAgICAgIH0gZWxzZSB7XG5cbiAgICAgICAgICB0aGlzLmVyYXNlKCk7XG4gICAgICAgICAgR2FtZS5hcmVhLmFjdG9ycy5kZWxldGUodGhpcyk7XG5cbiAgICAgICAgICBsZXQgaXRlbXMgPSB0aGlzLmRhdGEuaXRlbXMgfHwgeyBnb2xkOiAxIH07XG5cbiAgICAgICAgICBHYW1lLmFkZEJhZyh0aGlzLnggLHRoaXMueSkudGhlbigoYmFnKSA9PiB7XG4gICAgICAgICAgICBmb3IgKGxldCBpdGVtSWQgaW4gaXRlbXMpIHtcbiAgICAgICAgICAgICAgaWYgKGJhZy5pbm5lci5oYXNPd25Qcm9wZXJ0eShpdGVtSWQpKSB7XG4gICAgICAgICAgICAgICAgYmFnLmlubmVyW2l0ZW1JZF0gKz0gaXRlbXNbaXRlbUlkXTtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBiYWcuaW5uZXJbaXRlbUlkXSA9IGl0ZW1zW2l0ZW1JZF07XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9KTtcblxuICAgICAgICAgIGF0dGFja2VyLmVtaXQoXCJraWxsXCIsIGZhbHNlLCB0aGlzKTtcblxuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOmXquS4gOmXquS6uueJqe+8jOS+i+Wmguiiq+WHu+S4reaXtueahOaViOaenCAqL1xuICAgIGZsYXNoICgpIHtcbiAgICAgIHRoaXMuc3ByaXRlLmFscGhhID0gMC41O1xuICAgICAgU3ByaXRlLlRpY2tlci5hZnRlcigxMCwgKCkgPT4ge1xuICAgICAgICB0aGlzLnNwcml0ZS5hbHBoYSA9IDE7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiog5Y+X5YiwYXR0YWNrZXLnmoRza2lsbOaKgOiDveeahOS8pOWusyAqL1xuICAgIGRhbWFnZSAoYXR0YWNrZXIsIHNraWxsKSB7XG5cbiAgICAgIHRoaXMuZW1pdChcImRhbWFnZWRcIik7XG5cbiAgICAgIGxldCBwb3dlciA9IHNraWxsLnBvd2VyO1xuICAgICAgbGV0IHR5cGUgPSBza2lsbC50eXBlO1xuXG4gICAgICBsZXQgY29sb3IgPSBcIndoaXRlXCI7XG4gICAgICBpZiAodGhpcy5kYXRhLnR5cGUgPT0gXCJoZXJvXCIpIHtcbiAgICAgICAgY29sb3IgPSBcInJlZFwiO1xuICAgICAgfVxuXG4gICAgICBpZiAodHlwZSA9PSBcIm5vcm1hbFwiKSB7XG4gICAgICAgIHBvd2VyICs9IGF0dGFja2VyLmRhdGEuYXRrO1xuICAgICAgICBwb3dlciAtPSB0aGlzLmRhdGEuZGVmXG4gICAgICAgIHBvd2VyID0gTWF0aC5tYXgoMCwgcG93ZXIpO1xuICAgICAgfSBlbHNlIHsgLy8gdHlwZSA9PSBtYWdpY1xuICAgICAgICBwb3dlciArPSBhdHRhY2tlci5kYXRhLm1hdGs7XG4gICAgICAgIHBvd2VyIC0gdGhpcy5kYXRhLm1kZWZcbiAgICAgICAgcG93ZXIgPSBNYXRoLm1heCgwLCBwb3dlcik7XG4gICAgICB9XG5cbiAgICAgIGxldCB0ZXh0ID0gbnVsbDtcbiAgICAgIGxldCBzdGF0ZSA9IG51bGw7XG5cbiAgICAgIGlmIChNYXRoLnJhbmRvbSgpIDwgdGhpcy5kYXRhLmRvZGdlKSB7IC8vIOmXqumBv+S6hlxuICAgICAgICBzdGF0ZSA9IFwiZG9kZ2VcIjtcbiAgICAgICAgdGV4dCA9IG5ldyBTcHJpdGUuVGV4dCh7XG4gICAgICAgICAgdGV4dDogXCJtaXNzXCIsXG4gICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgIGZvbnRTaXplOiAxNlxuICAgICAgICB9KTtcbiAgICAgIH0gZWxzZSBpZiAoTWF0aC5yYW5kb20oKSA8IGF0dGFja2VyLmRhdGEuY3JpdGljYWwpIHsgLy8g6YeN5Ye75LqGXG4gICAgICAgIHN0YXRlID0gXCJjcml0aWNhbFwiO1xuICAgICAgICBwb3dlciAqPSAyO1xuICAgICAgICB0ZXh0ID0gbmV3IFNwcml0ZS5UZXh0KHtcbiAgICAgICAgICB0ZXh0OiBcIi1cIiArIHBvd2VyLFxuICAgICAgICAgIGNvbG9yOiBjb2xvcixcbiAgICAgICAgICBmb250U2l6ZTogMzJcbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMuZmxhc2goKTtcbiAgICAgICAgdGhpcy5kZWNyZWFzZUhQKHBvd2VyKTtcbiAgICAgIH0gZWxzZSB7IC8vIOaZrumAmuWHu+S4rVxuICAgICAgICBzdGF0ZSA9IFwiaGl0XCI7XG4gICAgICAgIHRleHQgPSBuZXcgU3ByaXRlLlRleHQoe1xuICAgICAgICAgIHRleHQ6IFwiLVwiICsgcG93ZXIsXG4gICAgICAgICAgY29sb3I6IGNvbG9yLFxuICAgICAgICAgIGZvbnRTaXplOiAxNlxuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5mbGFzaCgpO1xuICAgICAgICB0aGlzLmRlY3JlYXNlSFAocG93ZXIpO1xuICAgICAgfVxuXG5cbiAgICAgIGlmIChzdGF0ZSAhPSBcImRvZGdlXCIgJiYgdGhpcyAhPSBHYW1lLmhlcm8pIHtcbiAgICAgICAgaWYgKEdhbWUuc291bmRzLmh1cnQpIHtcbiAgICAgICAgICBHYW1lLnNvdW5kcy5odXJ0LmxvYWQoKTtcbiAgICAgICAgICBHYW1lLnNvdW5kcy5odXJ0LnZvbHVtZSA9IDAuMjtcbiAgICAgICAgICBHYW1lLnNvdW5kcy5odXJ0LnBsYXkoKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG5cbiAgICAgIHRleHQuY2VudGVyWCA9IE1hdGguZmxvb3IodGV4dC53aWR0aCAvIDIpO1xuICAgICAgdGV4dC5jZW50ZXJZID0gTWF0aC5mbG9vcih0ZXh0LmhlaWdodCk7XG4gICAgICB0ZXh0LnggPSB0aGlzLnNwcml0ZS54O1xuICAgICAgdGV4dC55ID0gdGhpcy5zcHJpdGUueTtcblxuICAgICAgdGV4dC54ICs9IFNwcml0ZS5yYW5kKC0xMCwgMTApO1xuXG4gICAgICBHYW1lLmxheWVycy5hY3RvckxheWVyLmFwcGVuZENoaWxkKHRleHQpO1xuXG4gICAgICBsZXQgc3BlZWQgPSBTcHJpdGUucmFuZCgxLCAzKTtcblxuICAgICAgU3ByaXRlLlRpY2tlci53aGlsZXMoMTAwLCAobGFzdCkgPT4ge1xuICAgICAgICB0ZXh0LnkgLT0gc3BlZWQ7XG4gICAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgICAgR2FtZS5sYXllcnMuYWN0b3JMYXllci5yZW1vdmVDaGlsZCh0ZXh0KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIC8vIOa1i+ivleaYr+WQpuatu+S6oVxuICAgICAgdGhpcy5kZWFkKGF0dGFja2VyKTtcblxuICAgIH1cblxuICAgIC8qKiDmkq3mlL7kuIDkuKrliqjnlLsgKi9cbiAgICBwbGF5IChhbmltYXRpb24sIHByaW9yaXR5KSB7XG4gICAgICAvLyDmlrDliqjnlLvpu5jorqTkvJjlhYjnuqfkuLowXG4gICAgICBpZiAoIU51bWJlci5pc0Zpbml0ZShwcmlvcml0eSkpIHtcbiAgICAgICAgcHJpb3JpdHkgPSAwO1xuICAgICAgfVxuXG4gICAgICAvLyDml6DliqjnlLvmiJbogIXlgZzmraLnirbmgIHvvIznjrDmnInkvJjlhYjnuqfkuLotMe+8iOacgOS9jue6p++8iVxuICAgICAgaWYgKHR5cGVvZiB0aGlzLmFuaW1hdGlvblByaW9yaXR5ID09IFwidW5kZWZpbmVkXCIgfHwgdGhpcy5zcHJpdGUucGF1c2VkID09IHRydWUpIHtcbiAgICAgICAgdGhpcy5hbmltYXRpb25Qcmlvcml0eSA9IC0xO1xuICAgICAgfVxuXG4gICAgICBpZiAoXG4gICAgICAgIHRoaXMuZGF0YS5hbmltYXRpb25zLmhhc093blByb3BlcnR5KGFuaW1hdGlvbikgJiZcbiAgICAgICAgcHJpb3JpdHkgPj0gdGhpcy5hbmltYXRpb25Qcmlvcml0eSAmJlxuICAgICAgICBhbmltYXRpb24gIT0gdGhpcy5zcHJpdGUuY3VycmVudEFuaW1hdGlvblxuICAgICAgKSB7XG4gICAgICAgIHRoaXMuYW5pbWF0aW9uUHJpb3JpdHkgPSBwcmlvcml0eTtcbiAgICAgICAgdGhpcy5zcHJpdGUucGxheShhbmltYXRpb24pO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8qKiDlgZzmraIgKi9cbiAgICBzdG9wICgpIHtcbiAgICAgIGlmICghdGhpcy5zcHJpdGUuY3VycmVudEFuaW1hdGlvbikgcmV0dXJuO1xuXG4gICAgICBpZiAoKHRoaXMuc3ByaXRlLnBhdXNlZCAmJiAhdGhpcy5zcHJpdGUuY3VycmVudEFuaW1hdGlvbi5tYXRjaCgvZmFjZS8pKVxuICAgICAgICB8fCB0aGlzLnNwcml0ZS5jdXJyZW50QW5pbWF0aW9uLm1hdGNoKC93YWxrfHJ1bi8pKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5kaXJlY3Rpb24pIHtcbiAgICAgICAgICBjYXNlIFwidXBcIjpcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnBsYXkoXCJmYWNldXBcIik7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICBjYXNlIFwiZG93blwiOlxuICAgICAgICAgICAgdGhpcy5zcHJpdGUucGxheShcImZhY2Vkb3duXCIpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgY2FzZSBcImxlZnRcIjpcbiAgICAgICAgICAgIHRoaXMuc3ByaXRlLnBsYXkoXCJmYWNlbGVmdFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIGNhc2UgXCJyaWdodFwiOlxuICAgICAgICAgICAgdGhpcy5zcHJpdGUucGxheShcImZhY2VyaWdodFwiKTtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqIOWQkeaMh+WummRpcmVjdGlvbuaWueWQkemHiuaUvuS4gOS4quaKgOiDvSAqL1xuICAgIGZpcmUgKGlkLCBkaXJlY3Rpb24pIHtcbiAgICAgIC8vIOWQjOS4gOaXtumXtOWPquiDveaWveWxleS4gOS4qnNraWxsXG4gICAgICBpZiAodGhpcy5hdHRhY2tpbmcpXG4gICAgICAgIHJldHVybiAwO1xuXG4gICAgICBsZXQgc2tpbGwgPSBHYW1lLnNraWxsc1tpZF07XG4gICAgICBpZiAoIXNraWxsKVxuICAgICAgICByZXR1cm4gMDtcblxuICAgICAgLy8g5Y+q5pyJ5b2T6L+Z5Liqc2tpbGznmoRjb29sZG93bue7k1xuICAgICAgbGV0IG5vdyA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICAgICAgaWYgKFxuICAgICAgICBOdW1iZXIuaXNGaW5pdGUodGhpcy5sYXN0QXR0YWNrKSAmJlxuICAgICAgICBOdW1iZXIuaXNGaW5pdGUodGhpcy5sYXN0QXR0YWNrQ29vbGRvd24pICYmXG4gICAgICAgIChub3cgLSB0aGlzLmxhc3RBdHRhY2spIDwgdGhpcy5sYXN0QXR0YWNrQ29vbGRvd25cbiAgICAgICkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKHNraWxsLmRhdGEuY29zdCA+IHRoaXMuZGF0YS5zcCkge1xuICAgICAgICByZXR1cm4gMDtcbiAgICAgIH1cblxuICAgICAgaWYgKCFkaXJlY3Rpb24pIHtcbiAgICAgICAgZGlyZWN0aW9uID0gdGhpcy5kaXJlY3Rpb247XG4gICAgICB9XG5cbiAgICAgIGlmICggLy8g546p5a625L2/55So5oqA6IO95piv5Y+v6IO95pyJ5p2h5Lu255qE77yM5L6L5aaC5YmR5oqA6IO96ZyA6KaB6KOF5aSH5YmRXG4gICAgICAgIHRoaXMudHlwZSA9PSBcImhlcm9cIiAmJlxuICAgICAgICBza2lsbC5kYXRhLmNvbmRpdGlvbiAmJlxuICAgICAgICBza2lsbC5kYXRhLmNvbmRpdGlvbigpID09IGZhbHNlXG4gICAgICApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgICB9XG5cbiAgICAgIHRoaXMubGFzdEF0dGFjayA9IG5vdztcbiAgICAgIHRoaXMubGFzdEF0dGFja0Nvb2xkb3duID0gc2tpbGwuZGF0YS5jb29sZG93bjtcbiAgICAgIHRoaXMuYXR0YWNraW5nID0gdHJ1ZTtcblxuICAgICAgaWYgKHRoaXMuZ29pbmcpIHtcbiAgICAgICAgdGhpcy5nb2luZyA9IGZhbHNlO1xuICAgICAgfVxuXG4gICAgICBHYW1lLklucHV0LmNsZWFyRGVzdCgpO1xuXG4gICAgICB0aGlzLmRhdGEuc3AgLT0gc2tpbGwuZGF0YS5jb3N0O1xuICAgICAgdGhpcy5yZWZyZXNoQmFyKCk7XG5cbiAgICAgIHNraWxsLmZpcmUodGhpcywgZGlyZWN0aW9uLCAoaGl0dGVkKSA9PiB7XG4gICAgICAgIHRoaXMuYXR0YWNraW5nID0gZmFsc2U7XG4gICAgICAgIGlmIChoaXR0ZWQubGVuZ3RoID4gMCkge1xuICAgICAgICAgIGhpdHRlZFswXS5kYW1hZ2UodGhpcywgc2tpbGwpO1xuICAgICAgICB9XG4gICAgICAgIHRoaXMuZW1pdChcImNoYW5nZVwiKTtcbiAgICAgIH0pO1xuXG4gICAgICByZXR1cm4gc2tpbGwuZGF0YS5jb29sZG93bjtcbiAgICB9XG5cbiAgICAvKiog6KGM6LWw5Yiw5oyH5a6a5Zyw54K5ICovXG4gICAgZ290byAoeCwgeSwgc3RhdGUpIHtcbiAgICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgaWYgKHRoaXMuZ29pbmcpIHtcbiAgICAgICAgICB0aGlzLmdvaW5nTmV4dCA9ICgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuZ290byh4LCB5LCBzdGF0ZSkudGhlbihyZXNvbHZlKTtcbiAgICAgICAgICB9O1xuICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBkZXN0QmxvY2tlZCA9IHRoaXMuY2hlY2tDb2xsaXNpb24oeCwgeSk7XG5cbiAgICAgICAgaWYgKGRlc3RCbG9ja2VkKSB7XG4gICAgICAgICAgaWYgKHRoaXMueCA9PSB4KSB7XG4gICAgICAgICAgICBpZiAodGhpcy55IC0geSA9PSAtMSkge1xuICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgdGhpcy5mYWNlKFwiZG93blwiKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMueSAtIHkgPT0gMSkge1xuICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgdGhpcy5mYWNlKFwidXBcIik7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAodGhpcy55ID09IHkpIHtcbiAgICAgICAgICAgIGlmICh0aGlzLnggLSB4ID09IC0xKSB7XG4gICAgICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgICAgICB0aGlzLmZhY2UoXCJyaWdodFwiKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKHRoaXMueCAtIHggPT0gMSkge1xuICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgdGhpcy5mYWNlKFwibGVmdFwiKTtcbiAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IHBvc2l0aW9uQ2hvaWNlID0gW107XG4gICAgICAgIC8vIOS4iuS4i+W3puWPs1xuICAgICAgICBpZiAodGhpcy5jaGVja0NvbGxpc2lvbih4LCB5LTEpID09IGZhbHNlKSB7XG4gICAgICAgICAgcG9zaXRpb25DaG9pY2UucHVzaCh7eDogeCwgeTogeS0xLCBhZnRlcjogXCJkb3duXCJ9KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5jaGVja0NvbGxpc2lvbih4LCB5KzEpID09IGZhbHNlKSB7XG4gICAgICAgICAgcG9zaXRpb25DaG9pY2UucHVzaCh7eDogeCwgeTogeSsxLCBhZnRlcjogXCJ1cFwifSk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHRoaXMuY2hlY2tDb2xsaXNpb24oeC0xLCB5KSA9PSBmYWxzZSkge1xuICAgICAgICAgIHBvc2l0aW9uQ2hvaWNlLnB1c2goe3g6IHgtMSwgeTogeSwgYWZ0ZXI6IFwicmlnaHRcIn0pO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmNoZWNrQ29sbGlzaW9uKHgrMSwgeSkgPT0gZmFsc2UpIHtcbiAgICAgICAgICBwb3NpdGlvbkNob2ljZS5wdXNoKHt4OiB4KzEsIHk6IHksIGFmdGVyOiBcImxlZnRcIn0pO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBwb3NpdGlvbkNob2ljZSkgeyAvLyDorqHnrpflnLDlnYDot53nprtcbiAgICAgICAgICBlbGVtZW50LmRpc3RhbmNlID0gdGhpcy5kaXN0YW5jZShlbGVtZW50LngsIGVsZW1lbnQueSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyDmjInnhaflnLDlnYDnmoTot53nprvku47ov5HliLDov5zmjpLluo/vvIjku47lsI/liLDlpKfvvIlcbiAgICAgICAgcG9zaXRpb25DaG9pY2Uuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICAgIHJldHVybiBhLmRpc3RhbmNlIC0gYi5kaXN0YW5jZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgLy8g5aaC5p6c55yf5q2j55qE55uu55qE5Zyw5pyJ5Y+v6IO96LWw77yM5o+S5YWl5Yiw56ys5LiA5L2N77yM5YaZ5Zyo6L+Z6YeM5piv5Zug5Li655uu55qE5Zyw5bm25LiN5LiA5a6a5pivZGlzdGFuY2XmnIDlsI/nmoRcbiAgICAgICAgaWYgKHRoaXMuY2hlY2tDb2xsaXNpb24oeCwgeSkgPT0gZmFsc2UpIHtcbiAgICAgICAgICBwb3NpdGlvbkNob2ljZS5zcGxpY2UoMCwgMCwge3g6IHgsIHk6IHl9KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBpbmRleCA9IDA7XG4gICAgICAgIGxldCBvdGhlckNob2ljZSA9IGZhbHNlO1xuXG4gICAgICAgIGxldCBUZXN0UG9zaXRpb24gPSAoKSA9PiB7XG4gICAgICAgICAgaWYgKGluZGV4IDwgcG9zaXRpb25DaG9pY2UubGVuZ3RoKSB7XG4gICAgICAgICAgICBsZXQgZGVzdCA9IHBvc2l0aW9uQ2hvaWNlW2luZGV4XTsgLy8g5L+d5a2Y56ys5LiA5Liq6YCJ6aG5XG4gICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgR2FtZS5Bc3Rhci5nZXRQYXRoKHt4OiB0aGlzLngsIHk6IHRoaXMueX0sIGRlc3QpLnRoZW4oKHJlc3VsdCkgPT4ge1xuICAgICAgICAgICAgICB0aGlzLmdldHRpbmdQYXRoID0gZmFsc2U7XG4gICAgICAgICAgICAgIGlmICh0aGlzLmdvaW5nTmV4dCkge1xuICAgICAgICAgICAgICAgIGxldCBjID0gdGhpcy5nb2luZ05leHQ7XG4gICAgICAgICAgICAgICAgdGhpcy5nb2luZ05leHQgPSBudWxsO1xuICAgICAgICAgICAgICAgIHRoaXMuZ29pbmcgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcyA9PSBHYW1lLmhlcm8pIHtcbiAgICAgICAgICAgICAgICAgIEdhbWUuSW5wdXQuY2xlYXJEZXN0KCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGMoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHRoaXMuZ29pbmcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgaWYgKHJlc3VsdCkge1xuICAgICAgICAgICAgICAgIGlmICh0aGlzID09IEdhbWUuaGVybykge1xuICAgICAgICAgICAgICAgICAgR2FtZS5JbnB1dC5zZXREZXN0KGRlc3QueCwgZGVzdC55KTtcbiAgICAgICAgICAgICAgICB9IGVsc2UgeyAvLyBub3QgaGVyb1xuICAgICAgICAgICAgICAgICAgaWYgKHJlc3VsdC5sZW5ndGggPiAzMCkge1xuICAgICAgICAgICAgICAgICAgICAvLyB0b28gZmFyXG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5nb3RvUGF0aChyZXN1bHQsIHN0YXRlLCBkZXN0LmFmdGVyKS50aGVuKHJlc29sdmUpO1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gVGVzdFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAob3RoZXJDaG9pY2UgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgb3RoZXJDaG9pY2UgPSB0cnVlO1xuICAgICAgICAgICAgICBsZXQgb3RoZXJQb3NpdGlvbkNob2ljZSA9IFtdO1xuICAgICAgICAgICAgICAvLyDlm5vkuKrop5JcbiAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tDb2xsaXNpb24oeC0xLCB5LTEpID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJQb3NpdGlvbkNob2ljZS5wdXNoKHt4OiB4LTEsIHk6IHktMSwgYWZ0ZXI6IFwicmlnaHRcIn0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQ29sbGlzaW9uKHgrMSwgeS0xKSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG90aGVyUG9zaXRpb25DaG9pY2UucHVzaCh7eDogeCsxLCB5OiB5LTEsIGFmdGVyOiBcImxlZnRcIn0pO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGlmICh0aGlzLmNoZWNrQ29sbGlzaW9uKHgtMSwgeSsxKSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG90aGVyUG9zaXRpb25DaG9pY2UucHVzaCh7eDogeC0xLCB5OiB5KzEsIGFmdGVyOiBcInJpZ2h0XCJ9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0NvbGxpc2lvbih4KzEsIHkrMSkgPT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgICBvdGhlclBvc2l0aW9uQ2hvaWNlLnB1c2goe3g6IHgrMSwgeTogeSsxLCBhZnRlcjogXCJsZWZ0XCJ9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAvLyDlm5vkuKrov5zmlrnlkJFcbiAgICAgICAgICAgICAgaWYgKHRoaXMuY2hlY2tDb2xsaXNpb24oeCwgeS0yKSA9PSBmYWxzZSkge1xuICAgICAgICAgICAgICAgIG90aGVyUG9zaXRpb25DaG9pY2UucHVzaCh7eDogeCwgeTogeS0yLCBhZnRlcjogXCJkb3duXCJ9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0NvbGxpc2lvbih4LCB5KzIpID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJQb3NpdGlvbkNob2ljZS5wdXNoKHt4OiB4LCB5OiB5KzIsIGFmdGVyOiBcInVwXCJ9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0NvbGxpc2lvbih4LTIsIHkpID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJQb3NpdGlvbkNob2ljZS5wdXNoKHt4OiB4LTIsIHk6IHksIGFmdGVyOiBcInJpZ2h0XCJ9KTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAodGhpcy5jaGVja0NvbGxpc2lvbih4KzIsIHkpID09IGZhbHNlKSB7XG4gICAgICAgICAgICAgICAgb3RoZXJQb3NpdGlvbkNob2ljZS5wdXNoKHt4OiB4KzIsIHk6IHksIGFmdGVyOiBcImxlZnRcIn0pO1xuICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgZm9yIChsZXQgZWxlbWVudCBvZiBvdGhlclBvc2l0aW9uQ2hvaWNlKSB7IC8vIOiuoeeul+WcsOWdgOi3neemu1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZGlzdGFuY2UgPSB0aGlzLmRpc3RhbmNlKGVsZW1lbnQueCwgZWxlbWVudC55KTtcbiAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgIC8vIOaMieeFp+WcsOWdgOeahOi3neemu+S7jui/keWIsOi/nOaOkuW6j++8iOS7juWwj+WIsOWkp++8iVxuICAgICAgICAgICAgICBvdGhlclBvc2l0aW9uQ2hvaWNlLnNvcnQoKGEsIGIpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYS5kaXN0YW5jZSAtIGIuZGlzdGFuY2U7XG4gICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgIGlmIChvdGhlclBvc2l0aW9uQ2hvaWNlLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbkNob2ljZSA9IG90aGVyUG9zaXRpb25DaG9pY2U7XG4gICAgICAgICAgICAgICAgVGVzdFBvc2l0aW9uKCk7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IC8vIOWGjeasoeWwneivleemu+WcsOeCueacgOi/keeahOWcsOeCuVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIFRlc3RQb3NpdGlvbigpO1xuXG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDmjInnhafmjIflrprnmoRwYXRo5ZKMc3RhdGXooYzotbBcbiAgICAgKiDooYzotbDnu5PmnZ/lkI7lpoLmnpxhZnRlcuacieWumuS5ie+8jOWImemdouWQkWFmdGVy55qE5pa55ZCRXG4gICAgICovXG4gICAgZ290b1BhdGggKHBhdGgsIHN0YXRlLCBhZnRlcikge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgdGhpcy5nb2luZyA9IHRydWU7XG4gICAgICAgIGxldCBpbmRleCA9IDE7XG4gICAgICAgIGxldCBXYWxrID0gKCkgPT4ge1xuICAgICAgICAgIGlmIChHYW1lLnBhdXNlZCkge1xuICAgICAgICAgICAgdGhpcy5zdG9wKCk7XG4gICAgICAgICAgICB0aGlzLmdvaW5nID0gZmFsc2U7XG4gICAgICAgICAgICBpZiAodGhpcyA9PSBHYW1lLmhlcm8pIHtcbiAgICAgICAgICAgICAgR2FtZS5JbnB1dC5jbGVhckRlc3QoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHRoaXMuZ29pbmdOZXh0KSB7XG4gICAgICAgICAgICBsZXQgYyA9IHRoaXMuZ29pbmdOZXh0O1xuICAgICAgICAgICAgdGhpcy5nb2luZ05leHQgPSBudWxsO1xuICAgICAgICAgICAgdGhpcy5nb2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgaWYgKHRoaXMgPT0gR2FtZS5oZXJvKSB7XG4gICAgICAgICAgICAgIEdhbWUuSW5wdXQuY2xlYXJEZXN0KCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgaWYgKGluZGV4IDwgcGF0aC5sZW5ndGgpIHtcbiAgICAgICAgICAgIGxldCBjdXJyZW50ID0ge3g6IHRoaXMueCwgeTogdGhpcy55fTtcbiAgICAgICAgICAgIGxldCBkZXN0ID0gcGF0aFtpbmRleF07XG4gICAgICAgICAgICBsZXQgZGlyZWN0aW9uID0gbnVsbDtcbiAgICAgICAgICAgIGlmIChkZXN0LnggPT0gY3VycmVudC54KSB7XG4gICAgICAgICAgICAgIGlmIChkZXN0LnkgPiBjdXJyZW50LnkpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBcImRvd25cIjtcbiAgICAgICAgICAgICAgfSBlbHNlIGlmIChkZXN0LnkgPCBjdXJyZW50LnkpIHtcbiAgICAgICAgICAgICAgICBkaXJlY3Rpb24gPSBcInVwXCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzdC55ID09IGN1cnJlbnQueSkge1xuICAgICAgICAgICAgICBpZiAoZGVzdC54ID4gY3VycmVudC54KSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gXCJyaWdodFwiXG4gICAgICAgICAgICAgIH0gZWxzZSBpZiAoZGVzdC54IDwgY3VycmVudC54KSB7XG4gICAgICAgICAgICAgICAgZGlyZWN0aW9uID0gXCJsZWZ0XCI7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGRpcmVjdGlvbikge1xuICAgICAgICAgICAgICBsZXQgY3VycmVudERpcmVjdGlvbiA9IHRoaXMuZGlyZWN0aW9uO1xuICAgICAgICAgICAgICBpZiAoZGlyZWN0aW9uICE9IGN1cnJlbnREaXJlY3Rpb24pIHtcbiAgICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmZhY2UoZGlyZWN0aW9uKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICB0aGlzLmdvKHN0YXRlLCBkaXJlY3Rpb24pLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIFdhbGsoKVxuICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgaW5kZXgrKztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgeyAvLyDmraPluLjnu5PmnZ9cbiAgICAgICAgICAgIGlmIChhZnRlcikge1xuICAgICAgICAgICAgICB0aGlzLnN0b3AoKTtcbiAgICAgICAgICAgICAgdGhpcy5mYWNlKGFmdGVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0aGlzID09IEdhbWUuaGVybykge1xuICAgICAgICAgICAgICBHYW1lLklucHV0LmNsZWFyRGVzdCgpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgdGhpcy5nb2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBXYWxrKCk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDorqnkurrnianpnaLlkJHmn5DkuKpkaXJlY3Rpb25cbiAgICAgKi9cbiAgICBmYWNlIChkaXJlY3Rpb24pIHtcbiAgICAgIGxldCBhbmltYXRpb24gPSBcImZhY2VcIiArIGRpcmVjdGlvbjtcbiAgICAgIGlmICh0aGlzLmFuaW1hdGlvbiAhPSBhbmltYXRpb24pIHtcbiAgICAgICAgdGhpcy5zcHJpdGUucGxheShhbmltYXRpb24pO1xuICAgICAgICB0aGlzLmVtaXQoXCJjaGFuZ2VcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICog5Y+C5pWwdOS4reiusOW9leS6huafkOS4quaWueagvOeahOaWueS9jXh577yM5rWL6K+V6L+Z5Liq5pa55qC85piv5ZCm5ZKM546p5a625pyJ5Yay56qBXG4gICAgICog6L+U5ZuedHJ1ZeS4uuacieeisOaSnu+8jOi/lOWbnmZhbHNl5Li65peg56Kw5pKeXG4gICAgICovXG4gICAgY2hlY2tDb2xsaXNpb24gKHgsIHkpIHtcbiAgICAgIC8vIOWcsOWbvui+uee8mOeisOaSnlxuICAgICAgaWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPj0gR2FtZS5hcmVhLm1hcC5kYXRhLndpZHRoIHx8IHkgPj0gR2FtZS5hcmVhLm1hcC5kYXRhLmhlaWdodCkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIC8vIOWcsOWbvueisOaSnlxuICAgICAgaWYgKEdhbWUuYXJlYS5tYXAuaGl0VGVzdCh4LCB5KSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cblxuICAgICAgLy8g6KeS6Imy56Kw5pKeXG4gICAgICBpZiAoR2FtZS5hcmVhLmFjdG9ycykge1xuICAgICAgICBmb3IgKGxldCBhY3RvciBvZiBHYW1lLmFyZWEuYWN0b3JzKSB7XG4gICAgICAgICAgaWYgKGFjdG9yICE9IHRoaXMgJiYgYWN0b3IuaGl0VGVzdCh4LCB5KSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIOWcsOWbvuS4iueahOeJqeWTgeeisOaSnlxuICAgICAgaWYgKEdhbWUuYXJlYS5pdGVtcykge1xuICAgICAgICBmb3IgKGxldCBpdGVtIG9mIEdhbWUuYXJlYS5pdGVtcykge1xuICAgICAgICAgIGlmIChpdGVtLmhpdFRlc3QoeCwgeSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICByZXR1cm4gZmFsc2U7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIOa1i+ivleS6uueJqeeisOaSnlxuICAgICAqL1xuICAgIGhpdFRlc3QgKHgsIHkpIHtcbiAgICAgIGlmICh0aGlzLmRhdGEuaGl0QXJlYSAmJiB0aGlzLmRhdGEuaGl0QXJlYSBpbnN0YW5jZW9mIEFycmF5KSB7XG4gICAgICAgIGZvciAobGV0IHAgb2YgdGhpcy5kYXRhLmhpdEFyZWEpIHtcbiAgICAgICAgICBpZiAoeCA9PSB0aGlzLnggKyBwWzBdICYmIHkgPT0gdGhpcy55ICsgcFsxXSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IodGhpcy5kYXRhKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5BY3Rvci5oaXRUZXN0IGludmFsaWQgZGF0YVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiDnlKhzdGF0ZeeahOWnv+aAge+8iHdhbGvvvIxydW7vvInlkJFkaXJlY3Rpb27mlrnlkJHotbBcbiAgICAgKiDlpoLmnpzkurrniannjrDlnKjkuI3mmK9kaXJlY3Rpb27mlrnlkJHnmoTvvIzkvJjlhYjovazlpLRcbiAgICAgKi9cbiAgICBnbyAoc3RhdGUsIGRpcmVjdGlvbikge1xuICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgaWYgKEdhbWUucGF1c2VkKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8g5aaC5p6c5q2j5Zyo5oiY5paX5Yqo55S777yM5YiZ5LiN6LWwXG4gICAgICAgIGlmIChcbiAgICAgICAgICB0aGlzLnNwcml0ZS5wYXVzZWQgPT0gZmFsc2UgJiZcbiAgICAgICAgICB0aGlzLnNwcml0ZS5jdXJyZW50QW5pbWF0aW9uLm1hdGNoKC9za2lsbGNhc3R8dGhydXN0fHNsYXNofHNob290LylcbiAgICAgICAgKSB7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRoaXMud2Fsa2luZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmF0dGFja2luZykge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmRpcmVjdGlvbiAhPSBkaXJlY3Rpb24pIHtcbiAgICAgICAgICB0aGlzLndhbGtpbmcgPSB0cnVlO1xuICAgICAgICAgIHRoaXMuc3RvcCgpO1xuICAgICAgICAgIHRoaXMuZmFjZShkaXJlY3Rpb24pO1xuICAgICAgICAgIC8vIHdhaXQgNCB0aWNrc1xuICAgICAgICAgIFNwcml0ZS5UaWNrZXIuYWZ0ZXIoNCwgKCkgPT4ge1xuICAgICAgICAgICAgdGhpcy53YWxraW5nID0gZmFsc2U7XG4gICAgICAgICAgfSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG5ld1Bvc2l0aW9uID0gdGhpcy5mYWNlUG9zaXRpb247XG5cbiAgICAgICAgaWYgKHRoaXMuY2hlY2tDb2xsaXNpb24obmV3UG9zaXRpb24ueCwgbmV3UG9zaXRpb24ueSkgPT0gZmFsc2UpIHtcbiAgICAgICAgICAvLyDmsqHnorDmkp7vvIzlvIDlp4vooYzotbBcbiAgICAgICAgICB0aGlzLndhbGtpbmcgPSB0cnVlO1xuXG4gICAgICAgICAgLy8g5oqK6KeS6Imy5L2N572u6K6+572u5Li65paw5L2N572u77yM5Li65LqG5Y2g6aKG6L+Z5Liq5L2N572u77yM6L+Z5qC35YW25LuW6KeS6Imy5bCx5Lya56Kw5pKeXG4gICAgICAgICAgLy8g5L2G5piv5LiN6IO955SodGhpcy54ID0gbmV3WOi/meagt+iuvue9ru+8jOWboOS4unRoaXMueOeahOiuvue9ruS8muWQjOaXtuiuvue9rnRoaXMuc3ByaXRlLnhcbiAgICAgICAgICBsZXQgb2xkWCA9IHRoaXMuZGF0YS54O1xuICAgICAgICAgIGxldCBvbGRZID0gdGhpcy5kYXRhLnk7XG4gICAgICAgICAgdGhpcy5kYXRhLnggPSBuZXdQb3NpdGlvbi54O1xuICAgICAgICAgIHRoaXMuZGF0YS55ID0gbmV3UG9zaXRpb24ueTtcblxuICAgICAgICAgIC8vIHdhbGtcbiAgICAgICAgICAvLyDov5nkupvmlbDnu4Tlkozlv4XpobvmmK8zMu+8jOS4uuS6huS/neivgeS4gOasoWdv6KGM6LWwMzLkuKrlg4/ntKBcbiAgICAgICAgICBsZXQgc3BlZWQgPSBbMywzLDIsMywzLDIsMywzLDIsMywzLDJdOyAvLyDlkozmmK8zMlxuICAgICAgICAgIGlmIChzdGF0ZSA9PSBcInJ1blwiKSB7XG4gICAgICAgICAgICAvLyBzcGVlZCA9IFs2LDcsNiw3LDZdOyAvLyDlkozmmK8zMlxuICAgICAgICAgICAgc3BlZWQgPSBbNCw0LDQsNCw0LDQsNCw0XTsgLy8g5ZKM5pivMzJcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgd2hpbGVzSWQgPSBTcHJpdGUuVGlja2VyLndoaWxlcyhzcGVlZC5sZW5ndGgsIChsYXN0KSA9PiB7XG4gICAgICAgICAgICBpZiAoR2FtZS5wYXVzZWQpIHtcbiAgICAgICAgICAgICAgdGhpcy5kYXRhLnggPSBvbGRYO1xuICAgICAgICAgICAgICB0aGlzLmRhdGEueSA9IG9sZFk7XG4gICAgICAgICAgICAgIHRoaXMud2Fsa2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJjaGFuZ2VcIik7XG4gICAgICAgICAgICAgIFNwcml0ZS5UaWNrZXIuY2xlYXJXaGlsZXMod2hpbGVzSWQpO1xuICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChsYXN0KSB7XG4gICAgICAgICAgICAgIHRoaXMueCA9IG5ld1Bvc2l0aW9uLng7XG4gICAgICAgICAgICAgIHRoaXMueSA9IG5ld1Bvc2l0aW9uLnk7XG4gICAgICAgICAgICAgIHRoaXMud2Fsa2luZyA9IGZhbHNlO1xuICAgICAgICAgICAgICB0aGlzLmVtaXQoXCJjaGFuZ2VcIik7XG4gICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHN3aXRjaCAoZGlyZWN0aW9uKSB7XG4gICAgICAgICAgICAgICAgY2FzZSBcInVwXCI6XG4gICAgICAgICAgICAgICAgICB0aGlzLnNwcml0ZS55IC09IHNwZWVkLnBvcCgpO1xuICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSBcImRvd25cIjpcbiAgICAgICAgICAgICAgICAgIHRoaXMuc3ByaXRlLnkgKz0gc3BlZWQucG9wKCk7XG4gICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBjYXNlIFwibGVmdFwiOlxuICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUueCAtPSBzcGVlZC5wb3AoKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgXCJyaWdodFwiOlxuICAgICAgICAgICAgICAgICAgdGhpcy5zcHJpdGUueCArPSBzcGVlZC5wb3AoKTtcbiAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSk7XG5cbiAgICAgICAgICAvLyDmkq3mlL7ooYzotbDliqjnlLtcbiAgICAgICAgICB0aGlzLnBsYXkoc3RhdGUgKyBkaXJlY3Rpb24sIDEpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICAvKiog5ZyoR2FtZS5hY3RvckxheWVy5LiK5Yig6Zmk5Lq654mpICovXG4gICAgZXJhc2UgKCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICBHYW1lLmxheWVycy5hY3RvckxheWVyLnJlbW92ZUNoaWxkKHRoaXMuc3ByaXRlKTtcbiAgICAgIEdhbWUubGF5ZXJzLmluZm9MYXllci5yZW1vdmVDaGlsZChwcml2YXRlcy5pbmZvQm94KTtcbiAgICB9XG5cbiAgICAvKiog5ZyoR2FtZS5hY3RvckxheWVy5LiK5pi+56S65Lq654mpICovXG4gICAgZHJhdyAoKSB7XG4gICAgICBsZXQgcHJpdmF0ZXMgPSBpbnRlcm5hbCh0aGlzKTtcbiAgICAgIGlmIChOdW1iZXIuaXNJbnRlZ2VyKHRoaXMueCkgJiYgTnVtYmVyLmlzSW50ZWdlcih0aGlzLnkpKSB7XG4gICAgICAgIHRoaXMueCA9IHRoaXMuZGF0YS54O1xuICAgICAgICB0aGlzLnkgPSB0aGlzLmRhdGEueTtcblxuICAgICAgICBpbnRlcm5hbCh0aGlzKS5pbmZvQm94LnggPSB0aGlzLnNwcml0ZS54O1xuICAgICAgICBpbnRlcm5hbCh0aGlzKS5pbmZvQm94LnkgPSB0aGlzLnNwcml0ZS55IC0gdGhpcy5zcHJpdGUuY2VudGVyWSAtIDIwO1xuXG4gICAgICAgIEdhbWUubGF5ZXJzLmFjdG9yTGF5ZXIuYXBwZW5kQ2hpbGQodGhpcy5zcHJpdGUpO1xuICAgICAgICBHYW1lLmxheWVycy5pbmZvTGF5ZXIuYXBwZW5kQ2hpbGQocHJpdmF0ZXMuaW5mb0JveCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKHRoaXMuZGF0YS54LCB0aGlzLmRhdGEueSwgdGhpcy5kYXRhKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiR2FtZS5BY3Rvci5kcmF3IGludmFsaWQgZGF0YS54L2RhdGEueVwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKiog6ZWc5aS056e75Yqo5Yiw5Lit5b+D5Li66L+Z5Liq5Lq654mpICovXG4gICAgZm9jdXMgKCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICBwcml2YXRlcy5pbmZvQm94LnggPSB0aGlzLnNwcml0ZS54O1xuICAgICAgcHJpdmF0ZXMuaW5mb0JveC55ID0gdGhpcy5zcHJpdGUueSAtIHRoaXMuc3ByaXRlLmNlbnRlclkgLSAyMDtcblxuICAgICAgR2FtZS5zdGFnZS5jZW50ZXJYID0gTWF0aC5yb3VuZCh0aGlzLnNwcml0ZS54IC0gR2FtZS5jb25maWcud2lkdGggLyAyKTtcbiAgICAgIEdhbWUuc3RhZ2UuY2VudGVyWSA9IE1hdGgucm91bmQodGhpcy5zcHJpdGUueSAtIEdhbWUuY29uZmlnLmhlaWdodCAvIDIpO1xuICAgIH1cblxuICB9KTsgLy8gR2FtZS5BY3RvclxuXG59KSgpO1xuIl19