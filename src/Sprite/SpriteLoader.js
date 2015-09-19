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
 * @fileoverview Sprite.Loader, fetch resource
 * @author mail@qhduan.com (QH Duan)
 */

(function () {
 "use strict";

  let internal = Sprite.Namespace();

  /**
   * Cache all url and element
   */
  let Cache = new Map();
  /**
   * When some url in Downloading, the url is downloading,
   * and other thread want it have to wait
   */
  let Downloading = new Map();

  function Fetch (url, callback, timeout) {

    let Finish = (obj) => {
      Cache.set(url, obj);
      if (typeof callback == "function") {
        callback(obj);
      }
      if (Downloading.has(url)) {
        let callbacks = Downloading.get(url);
        for (let callback of callbacks) {
          if (typeof callback == "function") {
            callback(obj);
          }
        }
        Downloading.delete(url);
      }
    }

    if (Cache.has(url)) {
      Finish(Cache.get(url));
      return;
    }

    if (Downloading.has(url)) {
      Downloading.get(url).push(callback);
      return;
    }

    Downloading.set(url, []);

    let req = new XMLHttpRequest();
    req.open("GET", url, true);
    req.timeout = 15000; // 15 seconds

    let type = null;
    if (url.match(/jpg$|jpeg$|png$|bmp$|gif$/i)) {
      req.responseType = "blob";
      type = "image";
    } else if (url.match(/wav$|mp3$|ogg$/i)) {
      req.responseType = "blob"
      type = "audio";
    } else if (url.match(/json$/i)) {
      // req.responseType = "text"
      req.responseType = "json";
      type = "json";
    } else {
      console.error(url);
      throw new Error("Sprite.Loader.Fetch got an invalid url");
    }

    if (typeof callback != "function")
      callback = function () {};

    req.ontimeout = function () {
      if (timeout) {
        console.error(url);
        throw new Error("Sprite.Loader.Fetch timeout twice");
      } else {
        Fetch(url, callback, true);
      }
    };

    req.onreadystatechange = function () {
      if (req.readyState == 4) {
        if (req.response) {
          if (type == "image") {
            let blob = req.response;
            let image = new Image();
            image.onload = function () {
              // window.URL.revokeObjectURL(image.src);
              image.onload = null;
              Finish(image);
            };
            image.src = window.URL.createObjectURL(blob);
          } else if (type == "audio") {
            let blob = req.response;
            let audio = new Audio();
            audio.oncanplay = function () {
              // 如果reoke掉audio，那么audio.load()方法则不能用了
              // window.URL.revokeObjectURL(audio.src);
              audio.oncanplay = null;
              Finish(audio);
            };
            audio.src = window.URL.createObjectURL(blob);
          } else if (type == "json") {
            let json = req.response;
            if (!json) {
              console.error(url);
              throw new Error("Sprite.Loader invalid json");
            }
            Finish(json);
          }
        } else {
          console.error(req.readyState, req.status, req.statusText);
          throw new Error("Sprite.Loader.Fetch Error");
        }
      }
    };
    req.send();
  }

  /**
   * Class for fetch resources
   * @class
   */
  Sprite.assign("Loader", class SpriteLoader extends Sprite.Event {

    /**
     * Create a Sprite.Loader object
     * @static
     */
    static create () {
      return new Sprite.Loader();
    }

    /**
     * Construct Sprite.Laoder
     * @constructor
     */
    constructor () {
      super();
      let privates = internal(this);

      privates.list = [];
      privates.progress = 0;
    }

    /**
     * @return {number} Return current download progress
     */
    get progress () {
      let privates = internal(this);
      return privates.progress;
    }

    set progress (value) {
      throw new Error("Sprite.Loader.progress readonly");
    }

    /**
     * Add one or more urls
     * eg. add("a.txt") add("a.txt", "b.txt") add(["a.txt", "b.txt"], "c.txt")
     * @param {Object} urls, one or more urls.
     */
    add (urls) {
      let privates = internal(this);
      let args = Array.prototype.slice.call(arguments);

      for (let element of args) {
        if (element instanceof Array) {
          privates.list = privates.list.concat(element);
        } else if (typeof element == "string" && element.length > 0) {
          privates.list.push(element);
        } else {
          console.error(element, args, this);
          throw new Error("Sprite.Loader.add invalid argument");
        }
      }
      return this;
    }

    /**
     * Begin to download
     */
    start () {
      let privates = internal(this);
      let done = 0;
      let ret = [];
      ret.length = privates.list.length;

      let Done = () => {
        done++;

        privates.progress = done / ret.length;
        this.emit("progress");

        if (done >= ret.length) {
          this.emit("complete", true, ret);
        }
      }

      privates.list.forEach((element, index) => {
        Fetch(element, (result) => {
          ret[index] = result;
          Done();
        });
      });
      return this;
    }

  });


})();
