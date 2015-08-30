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

/// @file SpriteEvent.js
/// @namespace Sprite
/// class Sprite.Event

(function (Sprite) {
  "use strict";

  /// @class Sprite.Event
  Sprite.Event = class Event {

    /// @function Sprite.Event.constructor
    /// construct a Sprite.Event
    constructor () {
      this._listeners = {};
      this._once = {};
      this._parent = null;
    }

    get parent () {
      return this._parent;
    }

    set parent (value) {
      this._parent = value;
    }

    /// @function Sprite.Event.hasEvent
    hasEvent (event) {
      if (this._listeners[event])
        return true;
      return false;
    }

    /// @function Sprite.Event.on
    /// book a listener of event in this object
    /// @param event, the event to book
    /// @param listener, the listener to book
    on (event, listener) {
      if (this._once[event]) {
        listener({
          type: event,
          target: this,
          data: this._once[event]
        });
        return;
      }

      if (!this._listeners[event])
        this._listeners[event] = {};

      var id = Sprite.uuid();

      this._listeners[event][id] = listener;
      return id;
    }

    /// @function Sprite.Event.off
    /// release a event listener
    /// @param event, the event to release
    /// @param id, the id on the book
    off (event, id) {
      if (this._listeners[event] && this._listeners[event][id]) {
        delete this._listeners[event][id];
        return true;
      }
      return false;
    }

    /// @function Sprite.Event.emit
    /// emit a event
    /// @param event, the event you want emit
    /// @param once, is it an once event? eg. oncomplete onload maybe an once event
    /// @param data, optional, the data you want send to listener
    emit (event, once, data) {
      if (once) {
        if (typeof data != "undefined") {
          this._once[event] = data;
        } else {
          this._once[event] = true;
        }
      }

      var pop = true;

      if (this._listeners[event]) {

        for (let key in this._listeners[event]) {
          if (this._listeners[event][key]({
            type: event,
            target: this,
            data: data
          }) === false) {
            pop = false;
          }
        }
      }

      if (this.parent && pop == true) {
        this.parent.emit(event, false, data);
      }
    }
  };

})(Sprite);
