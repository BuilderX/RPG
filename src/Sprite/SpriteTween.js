/*

2D Game Sprite Library, Built using JavaScript ES6
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

/**
 * @fileoverview Define the Sprite in window, declare the Sprite.Base
 * @author mail@qhduan.com (QH Duan)
 */

(function (Sprite) {
  "use strict";

  let internal = Sprite.Namespace();

  class Tween {
    constructor (object) {
      internal(this).object = object;
      internal(this).callback = null;
    }

    to (attributes, time) {

      let splice = Math.min(100, time);

      let t = time / splice;

      let step = {};

      for (let key in attributes) {
        step[key] = (attributes[key] - internal(this).object[key]) / splice;
      }

      var count = 0;
      var inter = setInterval(() => {
        count++;
        if (count >= splice) {
          for (let key in attributes) {
            internal(this).object[key] = attributes[key];
          }
          clearInterval(inter);
          if (internal(this).callback) {
            internal(this).callback();
          }
          return;
        }

        for (let key in step) {
          internal(this).object[key] += step[key];
        }

      }, t);

      return this;
    }

    call (callback) {
      if (typeof callback == "function") {
        internal(this).callback = callback;
      }
    }
  };

  Sprite.Tween = class SpriteTween extends Sprite.Event {

    constructor () {
      super();
    }

    static get (object) {
      return new Tween(object);
    }
  };

})(Sprite);
