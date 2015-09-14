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

/// @file SpriteStage.js
/// @namespace Sprite
/// class Sprite.Stage

(function (Sprite) {
  "use strict";

  /// @class Sprite.Stage
  /// inherit the Sprite.Container
  Sprite.Stage = class Stage extends Sprite.Container {

    /// @function Sprite.Stage.constructor
    /// consturct a Sprite.Stage with width and height
    /// @param width, the width of stage you need
    /// @param height, the height of stage you need
    constructor (width, height) {
      super();

      if (Sprite.Webgl.support()) {
        this._renderer = new Sprite.Webgl(width, height);
        this._rendererType = "webgl";
      } else if (Sprite.Canvas.support()) {
        this._renderer = new Sprite.Canvas(width, height);
        this._rendererType = "canvas";
      } else {
        throw new Error("Sprite.Stage all renderer not support");
      }

      var mousedown = false;

      this.canvas.addEventListener("mousedown", (event) => {
        event.preventDefault();
        if (this.convertMouseEvent(event))
          this.pressdown();
      });

      this.canvas.addEventListener("mousemove", (event) => {
        event.preventDefault();
        if (this.convertMouseEvent(event))
          this.pressmove();
      });

      this.canvas.addEventListener("mouseup", (event) => {
        event.preventDefault();
        if (this.convertMouseEvent(event))
          this.pressup();
      });

      this.canvas.addEventListener("touchstart", (event) => {
        event.preventDefault();
        if (this.convertMouseEvent(event))
          this.pressdown();
      });

      this.canvas.addEventListener("touchmove", (event) => {
        event.preventDefault();
        if (this.convertMouseEvent(event))
          this.pressmove();
      });

      this.canvas.addEventListener("touchend", (event) => {
        event.preventDefault();
        if (this.convertMouseEvent(event))
          this.pressup();
      });

      this.canvas.addEventListener("touchleave", (event) => {
        event.preventDefault();
        if (this.convertMouseEvent(event))
          this.pressup();
      });

      this.pressdownElement = null;

    }

    get renderer () {
      return this._renderer;
    }

    set renderer (value) {
      throw new Error("Sprite.Stage renderer readonly");
    }

    filter (name, value) {
      return this.renderer.filter(name, value);
    }

    findHit (event) {
      var hitted = super.hitTest(this.mouseX, this.mouseY);
      hitted.reverse();
      if (hitted.length)
        return hitted;
      return null;
    }

    convertMouseEvent (event) {
      var x;
      var y;
      var type;
      var rect = this.canvas.getBoundingClientRect();

      if (event.targetTouches && event.targetTouches.length == 1) {
        var touch = event.targetTouches[0];
        x = touch.pageX - rect.left;
        y = touch.pageX - rect.top;
        type = "touch";
      } else {
        x = event.pageX - rect.left;
        y = event.pageY - rect.top;
        type = "mouse";
      }

      var scaleX = rect.width / this.width;
      var scaleY = rect.height / this.height;

      x = Math.floor(x / scaleX);
      y = Math.floor(y / scaleY);

      if (x >= 0 && y >= 0) {
        this.mouseX = x;
        this.mouseY = y;
        this.mouseType = type;
        return true;
      } else {
        return false;
      }
    }

    pressdown () {
      var hit = this.findHit("pressdown");
      if (hit) {
        hit.forEach((element) => {
          element.emit("pressdown", false);
        });
      }

      hit = this.findHit("click");
      if (hit) {
        this.pressdownElement = hit;
      }

      this.emit("stagemousedown");
    }

    pressmove (mouse) {
      var hit = this.findHit("pressmove");
      if (hit) {
        hit.forEach((element) => {
          element.emit("pressmove", false);
        });
      }
    }

    pressup (mouse) {
      var hit = this.findHit("pressup");
      if (hit) {
        hit.forEach((element) => {
          element.emit("pressup", false);
        });
      }

      hit = this.findHit("click");
      if (hit) {
        hit.forEach((element) => {
          if (this.pressdownElement && this.pressdownElement.indexOf(element) != -1) {
            element.emit("click");
          }
        });
      }

      this.pressdownElement = null;

      this.emit("stagemouseup");
    }

    get width () {
      return this._renderer.width;
    }

    set width (value) {
      this._renderer.width = value;
      this._stageCacheCanvas.width = this._renderer.width;
    }

    get height () {
      return this._renderer.height;
    }

    set height (value) {
      this._renderer.height = value;
      this._stageCacheCanvas.height = this._renderer.height;
    }

    get color () {
      return this._color;
    }

    set color (value) {
      if (this._color != value) {
        this._color = value;
        this.update();
      }
    }

    get canvas () {
      return this.renderer.canvas;
    }

    set canvas (value) {
      throw new Error("Sprite.Stage.canvas readonly")
    }

    /// @function Sprite.Stage.clear
    /// clear the stage
    clear () {
      this.renderer.clear();
    }

    update () {
      this.draw();
    }

    requestScreenshot (callback) {
      this._screenshot = function (url) {
        var img = new Image();
        img.src = url;
        if (img.complete) {
          callback(img);
        } else {
          img.onload = function () {
            callback(img);
          };
        }
      };
    }

    draw () {
      this.emit("drawStart");

      if (this.children.length <= 0) return false;

      this.clear();

      this.children.forEach((element) => {
        element.draw(this.renderer);
      });

      if (this._screenshot) {
        this._screenshot(this.canvas.toDataURL());
        this._screenshot = null;
      }

      this.emit("drawEnd");
    }
  };

})(Sprite);
