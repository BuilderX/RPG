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
 * @fileoverview Define the Sprite.Webgl, a renderer, other choice from Sprite.Canvas
 * @author mail@qhduan.com (QH Duan)
 */
"use strict";

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function () {
  "use strict";

  var internal = Sprite.Namespace();

  function isPOT(value) {
    return value > 0 && (value - 1 & value) === 0;
  }

  /**
    Use mediump precision in WebGL when possible
    Highp in fragment shaders is an optional part of the OpenGL ES 2.0 spec,
    so not all hardware supports it
    lowp mediump highp
    https://developers.google.com/web/updates/2011/12/Use-mediump-precision-in-WebGL-when-possible?hl=en
     brightness and contrast's formular from https://github.com/evanw/glfx.js
  */
  var vertexShaderSrc = "\n  precision mediump float;\n  attribute vec2 a_texCoord;\n  varying vec2 v_texCoord;\n\n  attribute vec2 aVertex;\n  uniform vec2 resolution;\n\n  uniform vec4 position;\n\n  void main(void) {\n     vec2 a = aVertex * (position.zw / resolution) + (position.xy / resolution);\n     vec2 b = a * 2.0 - 1.0;\n\n     gl_Position = vec4(b * vec2(1.0, -1.0), 0.0, 1.0);\n     v_texCoord = a_texCoord;\n  }";

  var fragmentShaderSrc = "\n  precision mediump float;\n\n  uniform vec4 crop;\n  uniform float brightness;\n  uniform float alpha;\n  uniform float contrast;\n\n  uniform sampler2D image;\n\n  // the texCoords passed in from the vertex shader.\n  varying vec2 v_texCoord;\n\n  void main(void) {\n\n    vec2 t = v_texCoord;\n    t.x *= crop.z;\n    t.y *= crop.w;\n    t += crop.xy;\n\n     vec4 color = texture2D(image, t).rgba;\n\n     if (contrast != 0.0) {\n       if (contrast > 0.0) {\n         color.xyz = (color.xyz - 0.5) / (1.0 - contrast) + 0.5;\n       } else {\n         color.xyz = (color.xyz - 0.5) * (1.0 + contrast) + 0.5;\n       }\n     }\n\n     if (brightness != 0.0) {\n       color.xyz += brightness;\n     }\n\n     if (alpha != 1.0) {\n       color.a *=  alpha;\n     }\n\n     gl_FragColor = color;\n  }";

  /**
   * Renderer using webgl
   * @class
   */
  Sprite.assign("Webgl", (function () {
    _createClass(SpriteWebgl, null, [{
      key: "support",

      /**
       * @static
       * @return {boolean} The browser whether or not support WebGL
       */
      value: function support() {
        var canvas = document.createElement("canvas");
        var gl = canvas.getContext("webgl");
        if (!gl) {
          canvas.getContext("experimental-webgl");
        }
        if (!gl) {
          return false;
        }
        return true;
      }

      /**
       * Construct a renderer width certain width and height
       * @constructor
       */
    }]);

    function SpriteWebgl(width, height) {
      _classCallCheck(this, SpriteWebgl);

      var privates = internal(this);

      var canvas = document.createElement("canvas");
      canvas.width = width || 640;
      canvas.height = height || 480;

      var options = {
        antialias: false,
        preserveDrawingBuffer: true
      };

      var gl = canvas.getContext("webgl", options);
      if (!gl) {
        gl = canvas.getContext("experimental-webgl", options);
      }
      privates.gl = gl;

      if (!gl) {
        throw new Error("Sprite.Webgl webgl is not supported");
      }

      privates.color = [0, 0, 0];
      privates.filter = new Map();
      privates.textureCache = new Map();
      privates.canvas = canvas;
      privates.maxTextureSize = gl.getParameter(gl.MAX_TEXTURE_SIZE);

      gl.viewport(0, 0, canvas.width, canvas.height);

      var vertShaderObj = gl.createShader(gl.VERTEX_SHADER);
      var fragShaderObj = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(vertShaderObj, vertexShaderSrc);
      gl.shaderSource(fragShaderObj, fragmentShaderSrc);
      gl.compileShader(vertShaderObj);
      gl.compileShader(fragShaderObj);

      var program = gl.createProgram();
      gl.attachShader(program, vertShaderObj);
      gl.attachShader(program, fragShaderObj);

      gl.linkProgram(program);
      gl.useProgram(program);

      gl.cullFace(gl.BACK);
      gl.frontFace(gl.CW);
      gl.enable(gl.CULL_FACE);
      gl.enable(gl.BLEND);
      gl.disable(gl.DEPTH_TEST);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      privates.cropLoc = gl.getUniformLocation(program, "crop");
      privates.brightnessLoc = gl.getUniformLocation(program, "brightness");
      privates.contrastLoc = gl.getUniformLocation(program, "contrast");
      privates.alphaLoc = gl.getUniformLocation(program, "alpha");
      privates.resolutionLoc = gl.getUniformLocation(program, "resolution");
      gl.uniform2f(privates.resolutionLoc, canvas.width, canvas.height);

      privates.positionLoc = gl.getUniformLocation(program, "position");

      privates.tLoc = gl.getAttribLocation(program, "a_texCoord");
      gl.enableVertexAttribArray(privates.tLoc);
      privates.texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, privates.texCoordBuffer);
      gl.vertexAttribPointer(privates.tLoc, 2, gl.FLOAT, false, 0, 0);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), gl.STATIC_DRAW);

      privates.vLoc = gl.getAttribLocation(program, "aVertex");
      gl.enableVertexAttribArray(privates.vLoc);
      privates.vertexBuff = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, privates.vertexBuff);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(privates.vLoc);
      gl.vertexAttribPointer(privates.vLoc, 2, gl.FLOAT, false, 0, 0);

      privates.currentTexture = null;

      // setting, don't move
      this.filter("brightness", 0);
      this.filter("contrast", 0);
      this.alpha = 1;

      console.log("webgl inited. max texture size: %d", gl.getParameter(gl.MAX_TEXTURE_SIZE));
    }

    _createClass(SpriteWebgl, [{
      key: "drawImage9",
      value: function drawImage9(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        var privates = internal(this);
        var gl = privates.gl;

        var texture = this.createTexture(gl, image);
        if (privates.currentTexture != texture) {
          gl.bindTexture(gl.TEXTURE_2D, texture);
          privates.currentTexture = texture;
        }

        gl.uniform4f(privates.cropLoc, sx / image.width, sy / image.height, sw / image.width, sh / image.height);
        gl.uniform4f(privates.positionLoc, dx, dy, dw, dh);

        gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
      }
    }, {
      key: "release",
      value: function release() {
        var privates = internal(this);
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = privates.textureCache.values()[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var texture = _step.value;

            privates.gl.deleteTexture(texture);
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

        privates.textureCache = new Map();
      }
    }, {
      key: "createTexture",
      value: function createTexture(gl, image) {
        var privates = internal(this);
        if (privates.textureCache.has(image)) {
          return privates.textureCache.get(image);
        } else {
          gl.activeTexture(gl.TEXTURE0);
          var texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

          // test width&height is power of 2, eg. 256, 512, 1024
          // may speed up
          if (isPOT(image.width) && isPOT(image.height)) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
            gl.generateMipmap(gl.TEXTURE_2D);
          } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          }

          gl.bindTexture(gl.TEXTURE_2D, null);
          privates.textureCache.set(image, texture);
          return texture;
        }
      }
    }, {
      key: "drawImage",
      value: function drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        if (arguments.length == 9) {
          // all right
        } else if (arguments.length == 5) {
            // drawImage (image, dx, dy, dw, dh);
            dx = sx;
            dy = sy;
            dw = sw;
            dh = sh;
            sx = 0;
            sy = 0;
            sw = image.width;
            sh = image.height;
          } else if (arguments.length == 3) {
            // drawImage (image, dx, dy);
            dx = sx;
            dy = sy;
            dw = image.width;
            dh = image.height;
            sx = 0;
            sy = 0;
            sw = image.width;
            sh = image.height;
          } else {
            console.error(arguments, this);
            throw new Error("Sprite.Webgl.drawImage invalid arguments");
          }

        /*
        if (dx > this.width || dy > this.height) {
          return;
        }
         if ((dx + dw) < 0 || (dy + dh) < 0) {
          return;
        }
         if (
          !Number.isInteger(image.width) ||
          !Number.isInteger(image.height) ||
          image.width <= 0 ||
          image.height <= 0 ||
          image.width > privates.maxTextureSize ||
          image.height > privates.maxTextureSize
        ) {
          console.error(image, privates, this);
          throw new Error("Sprite.Webgl.drawImage invalid image");
        }
        */

        this.drawImage9(image, sx, sy, sw, sh, dx, dy, dw, dh);
      }
    }, {
      key: "filter",

      /**
       * @param {string} name The name of filter you want get or set
       * @param {number} value Number or undefined, if undefined ,return current value
       */
      value: function filter(name, value) {
        var privates = internal(this);
        var gl = privates.gl;
        if (Number.isFinite(value)) {
          privates.filter.set(name, value);
          gl.uniform1f(privates.brightnessLoc, privates.filter.get("brightness"));
          gl.uniform1f(privates.contrastLoc, privates.filter.get("contrast"));
        } else {
          return privates.get(name);
        }
      }
    }, {
      key: "clear",
      value: function clear() {
        var privates = internal(this);
        var gl = privates.gl;
        var color = privates.color;
        gl.clearColor(color[0], color[1], color[2], 1); // black
        gl.clear(gl.COLOR_BUFFER_BIT);
      }
    }, {
      key: "alpha",
      get: function get() {
        var privates = internal(this);
        return privates.alpha;
      },
      set: function set(value) {
        var privates = internal(this);
        var gl = privates.gl;
        if (Number.isFinite(value) && !isNaN(value) && value >= 0 && value <= 1) {
          if (value != privates.alpha) {
            privates.alpha = value;
            gl.uniform1f(privates.alphaLoc, privates.alpha);
          }
        } else {
          console.error(value, this);
          throw new Error("Sprite.Webgl got invalid alpha number");
        }
      }

      /**
       * @return {string} The color, eg "#00ff00"
       */
    }, {
      key: "color",
      get: function get() {
        var privates = internal(this);
        var color = privates.color;
        var r = color[0].toString(16);
        var g = color[1].toString(16);
        var b = color[2].toString(16);
        if (r.length < 2) r = "0" + r;
        if (g.length < 2) g = "0" + g;
        if (b.length < 2) b = "0" + b;
        return "#" + r + g + b;
      },

      /**
       * @param {string} value The new color, eg "#00ff00"
       */
      set: function set(value) {
        var privates = internal(this);
        var m = value.match(/^#([\da-fA-F][\da-fA-F])([\da-fA-F][\da-fA-F])([\da-fA-F][\da-fA-F])$/);
        if (m) {
          var r = m[1];
          var g = m[2];
          var b = m[3];
          privates.color[0] = parseInt(r, 16);
          privates.color[1] = parseInt(g, 16);
          privates.color[2] = parseInt(b, 16);
        } else {
          console.error(value, this);
          throw new Error("Sprite.Webgl.color invalid color format");
        }
      }
    }, {
      key: "width",
      get: function get() {
        var privates = internal(this);
        return privates.canvas.width;
      },
      set: function set(value) {
        var privates = internal(this);
        if (Number.isFinite(value) && !isNaN(value) && value > 0 && value <= 4096) {
          if (value != privates.canvas.width) {
            privates.canvas.width = value;
            privates.gl.viewport(0, 0, privates.canvas.width, privates.canvas.height);
            privates.gl.uniform2f(privates.resolutionLoc, privates.canvas.width, privates.canvas.height);
          }
        } else {
          console.error(value, this);
          throw new Error("Sprite.Webgl got invalid width number");
        }
      }
    }, {
      key: "height",
      get: function get() {
        var privates = internal(this);
        return privates.canvas.height;
      },
      set: function set(value) {
        var privates = internal(this);
        if (Number.isFinite(value) && !isNaN(value) && value > 0 && value <= 4096) {
          if (value != privates.canvas.height) {
            privates.canvas.height = value;
            privates.gl.viewport(0, 0, privates.canvas.width, privates.canvas.height);
            privates.gl.uniform2f(resolutionLoc, privates.canvas.width, privates.canvas.height);
          }
        } else {
          console.error(value, this);
          throw new Error("Sprite.Webgl got invalid height number");
        }
      }
    }, {
      key: "canvas",
      get: function get() {
        return internal(this).canvas;
      },
      set: function set(value) {
        console.error(value, this);
        throw new Error("Sprite.Webgl.canvas cannot write");
      }
    }]);

    return SpriteWebgl;
  })());
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9TcHJpdGUvU3ByaXRlV2ViZ2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JBLENBQUMsWUFBWTtBQUNaLGNBQVksQ0FBQzs7QUFFWixNQUFJLFFBQVEsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7O0FBR2xDLFdBQVMsS0FBSyxDQUFFLEtBQUssRUFBRTtBQUNyQixXQUFPLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxBQUFDLEtBQUssR0FBRyxDQUFDLEdBQUksS0FBSyxDQUFBLEtBQU0sQ0FBQyxDQUFDO0dBQ2pEOzs7Ozs7Ozs7O0FBV0QsTUFBSSxlQUFlLHNaQWdCakIsQ0FBQzs7QUFFSCxNQUFJLGlCQUFpQix3eUJBdUNuQixDQUFDOzs7Ozs7QUFNSCxRQUFNLENBQUMsTUFBTSxDQUFDLE9BQU87aUJBQVEsV0FBVzs7Ozs7OzthQU12QixtQkFBRztBQUNoQixZQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBQzlDLFlBQUksRUFBRSxHQUFHLE1BQU0sQ0FBQyxVQUFVLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEMsWUFBSSxDQUFDLEVBQUUsRUFBRTtBQUNQLGdCQUFNLENBQUMsVUFBVSxDQUFDLG9CQUFvQixDQUFDLENBQUM7U0FDekM7QUFDRCxZQUFJLENBQUMsRUFBRSxFQUFFO0FBQ1AsaUJBQU8sS0FBSyxDQUFDO1NBQ2Q7QUFDRCxlQUFPLElBQUksQ0FBQztPQUNiOzs7Ozs7OztBQU1XLGFBdEJlLFdBQVcsQ0FzQnpCLEtBQUssRUFBRSxNQUFNLEVBQUU7NEJBdEJELFdBQVc7O0FBdUJwQyxVQUFJLFFBQVEsR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLENBQUM7O0FBRTlCLFVBQUksTUFBTSxHQUFHLFFBQVEsQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLENBQUM7QUFDOUMsWUFBTSxDQUFDLEtBQUss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QUFDLE1BQU0sQ0FBQyxDQUFDO1dBQ3JGO1NBQ0YsTUFBTTtBQUNMLGlCQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQixnQkFBTSxJQUFJLEtBQUssQ0FBQyx3Q0FBd0MsQ0FBQyxDQUFDO1NBQzNEO09BQ0Y7OztXQUVVLGVBQUc7QUFDWixlQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUM7T0FDOUI7V0FFVSxhQUFDLEtBQUssRUFBRTtBQUNqQixlQUFPLENBQUMsS0FBSyxDQUFDLEtBQUssRUFBRSxJQUFJLENBQUMsQ0FBQztBQUMzQixjQUFNLElBQUksS0FBSyxDQUFDLGtDQUFrQyxDQUFDLENBQUM7T0FDckQ7OztXQW5YMEIsV0FBVztPQXFYdEMsQ0FBQztDQUlKLENBQUEsRUFBRyxDQUFDIiwiZmlsZSI6IlNwcml0ZVdlYmdsLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLypcblxuMkQgR2FtZSBTcHJpdGUgTGlicmFyeSwgQnVpbHQgdXNpbmcgSmF2YVNjcmlwdCBFUzZcbkNvcHlyaWdodCAoQykgMjAxNSBxaGR1YW4oaHR0cDovL3FoZHVhbi5jb20pXG5cblRoaXMgcHJvZ3JhbSBpcyBmcmVlIHNvZnR3YXJlOiB5b3UgY2FuIHJlZGlzdHJpYnV0ZSBpdCBhbmQvb3IgbW9kaWZ5XG5pdCB1bmRlciB0aGUgdGVybXMgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGFzIHB1Ymxpc2hlZCBieVxudGhlIEZyZWUgU29mdHdhcmUgRm91bmRhdGlvbiwgZWl0aGVyIHZlcnNpb24gMyBvZiB0aGUgTGljZW5zZSwgb3JcbihhdCB5b3VyIG9wdGlvbikgYW55IGxhdGVyIHZlcnNpb24uXG5cblRoaXMgcHJvZ3JhbSBpcyBkaXN0cmlidXRlZCBpbiB0aGUgaG9wZSB0aGF0IGl0IHdpbGwgYmUgdXNlZnVsLFxuYnV0IFdJVEhPVVQgQU5ZIFdBUlJBTlRZOyB3aXRob3V0IGV2ZW4gdGhlIGltcGxpZWQgd2FycmFudHkgb2Zcbk1FUkNIQU5UQUJJTElUWSBvciBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRS4gIFNlZSB0aGVcbkdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlIGZvciBtb3JlIGRldGFpbHMuXG5cbllvdSBzaG91bGQgaGF2ZSByZWNlaXZlZCBhIGNvcHkgb2YgdGhlIEdOVSBHZW5lcmFsIFB1YmxpYyBMaWNlbnNlXG5hbG9uZyB3aXRoIHRoaXMgcHJvZ3JhbS4gIElmIG5vdCwgc2VlIDxodHRwOi8vd3d3LmdudS5vcmcvbGljZW5zZXMvPi5cblxuKi9cblxuLyoqXG4gKiBAZmlsZW92ZXJ2aWV3IERlZmluZSB0aGUgU3ByaXRlLldlYmdsLCBhIHJlbmRlcmVyLCBvdGhlciBjaG9pY2UgZnJvbSBTcHJpdGUuQ2FudmFzXG4gKiBAYXV0aG9yIG1haWxAcWhkdWFuLmNvbSAoUUggRHVhbilcbiAqL1xuKGZ1bmN0aW9uICgpIHtcbiBcInVzZSBzdHJpY3RcIjtcblxuICBsZXQgaW50ZXJuYWwgPSBTcHJpdGUuTmFtZXNwYWNlKCk7XG5cblxuICBmdW5jdGlvbiBpc1BPVCAodmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWUgPiAwICYmICgodmFsdWUgLSAxKSAmIHZhbHVlKSA9PT0gMDtcbiAgfVxuXG4gIC8qKlxuICAgIFVzZSBtZWRpdW1wIHByZWNpc2lvbiBpbiBXZWJHTCB3aGVuIHBvc3NpYmxlXG4gICAgSGlnaHAgaW4gZnJhZ21lbnQgc2hhZGVycyBpcyBhbiBvcHRpb25hbCBwYXJ0IG9mIHRoZSBPcGVuR0wgRVMgMi4wIHNwZWMsXG4gICAgc28gbm90IGFsbCBoYXJkd2FyZSBzdXBwb3J0cyBpdFxuICAgIGxvd3AgbWVkaXVtcCBoaWdocFxuICAgIGh0dHBzOi8vZGV2ZWxvcGVycy5nb29nbGUuY29tL3dlYi91cGRhdGVzLzIwMTEvMTIvVXNlLW1lZGl1bXAtcHJlY2lzaW9uLWluLVdlYkdMLXdoZW4tcG9zc2libGU/aGw9ZW5cblxuICAgIGJyaWdodG5lc3MgYW5kIGNvbnRyYXN0J3MgZm9ybXVsYXIgZnJvbSBodHRwczovL2dpdGh1Yi5jb20vZXZhbncvZ2xmeC5qc1xuICAqL1xuICBsZXQgdmVydGV4U2hhZGVyU3JjID0gYFxuICBwcmVjaXNpb24gbWVkaXVtcCBmbG9hdDtcbiAgYXR0cmlidXRlIHZlYzIgYV90ZXhDb29yZDtcbiAgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7XG5cbiAgYXR0cmlidXRlIHZlYzIgYVZlcnRleDtcbiAgdW5pZm9ybSB2ZWMyIHJlc29sdXRpb247XG5cbiAgdW5pZm9ybSB2ZWM0IHBvc2l0aW9uO1xuXG4gIHZvaWQgbWFpbih2b2lkKSB7XG4gICAgIHZlYzIgYSA9IGFWZXJ0ZXggKiAocG9zaXRpb24uencgLyByZXNvbHV0aW9uKSArIChwb3NpdGlvbi54eSAvIHJlc29sdXRpb24pO1xuICAgICB2ZWMyIGIgPSBhICogMi4wIC0gMS4wO1xuXG4gICAgIGdsX1Bvc2l0aW9uID0gdmVjNChiICogdmVjMigxLjAsIC0xLjApLCAwLjAsIDEuMCk7XG4gICAgIHZfdGV4Q29vcmQgPSBhX3RleENvb3JkO1xuICB9YDtcblxuICBsZXQgZnJhZ21lbnRTaGFkZXJTcmMgPSBgXG4gIHByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuXG4gIHVuaWZvcm0gdmVjNCBjcm9wO1xuICB1bmlmb3JtIGZsb2F0IGJyaWdodG5lc3M7XG4gIHVuaWZvcm0gZmxvYXQgYWxwaGE7XG4gIHVuaWZvcm0gZmxvYXQgY29udHJhc3Q7XG5cbiAgdW5pZm9ybSBzYW1wbGVyMkQgaW1hZ2U7XG5cbiAgLy8gdGhlIHRleENvb3JkcyBwYXNzZWQgaW4gZnJvbSB0aGUgdmVydGV4IHNoYWRlci5cbiAgdmFyeWluZyB2ZWMyIHZfdGV4Q29vcmQ7XG5cbiAgdm9pZCBtYWluKHZvaWQpIHtcblxuICAgIHZlYzIgdCA9IHZfdGV4Q29vcmQ7XG4gICAgdC54ICo9IGNyb3AuejtcbiAgICB0LnkgKj0gY3JvcC53O1xuICAgIHQgKz0gY3JvcC54eTtcblxuICAgICB2ZWM0IGNvbG9yID0gdGV4dHVyZTJEKGltYWdlLCB0KS5yZ2JhO1xuXG4gICAgIGlmIChjb250cmFzdCAhPSAwLjApIHtcbiAgICAgICBpZiAoY29udHJhc3QgPiAwLjApIHtcbiAgICAgICAgIGNvbG9yLnh5eiA9IChjb2xvci54eXogLSAwLjUpIC8gKDEuMCAtIGNvbnRyYXN0KSArIDAuNTtcbiAgICAgICB9IGVsc2Uge1xuICAgICAgICAgY29sb3IueHl6ID0gKGNvbG9yLnh5eiAtIDAuNSkgKiAoMS4wICsgY29udHJhc3QpICsgMC41O1xuICAgICAgIH1cbiAgICAgfVxuXG4gICAgIGlmIChicmlnaHRuZXNzICE9IDAuMCkge1xuICAgICAgIGNvbG9yLnh5eiArPSBicmlnaHRuZXNzO1xuICAgICB9XG5cbiAgICAgaWYgKGFscGhhICE9IDEuMCkge1xuICAgICAgIGNvbG9yLmEgKj0gIGFscGhhO1xuICAgICB9XG5cbiAgICAgZ2xfRnJhZ0NvbG9yID0gY29sb3I7XG4gIH1gO1xuXG4gIC8qKlxuICAgKiBSZW5kZXJlciB1c2luZyB3ZWJnbFxuICAgKiBAY2xhc3NcbiAgICovXG4gIFNwcml0ZS5hc3NpZ24oXCJXZWJnbFwiLCBjbGFzcyBTcHJpdGVXZWJnbCB7XG5cbiAgICAvKipcbiAgICAgKiBAc3RhdGljXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn0gVGhlIGJyb3dzZXIgd2hldGhlciBvciBub3Qgc3VwcG9ydCBXZWJHTFxuICAgICAqL1xuICAgIHN0YXRpYyBzdXBwb3J0ICgpIHtcbiAgICAgIGxldCBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiY2FudmFzXCIpO1xuICAgICAgbGV0IGdsID0gY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbFwiKTtcbiAgICAgIGlmICghZ2wpIHtcbiAgICAgICAgY2FudmFzLmdldENvbnRleHQoXCJleHBlcmltZW50YWwtd2ViZ2xcIik7XG4gICAgICB9XG4gICAgICBpZiAoIWdsKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdCBhIHJlbmRlcmVyIHdpZHRoIGNlcnRhaW4gd2lkdGggYW5kIGhlaWdodFxuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yICh3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICBsZXQgcHJpdmF0ZXMgPSBpbnRlcm5hbCh0aGlzKTtcblxuICAgICAgbGV0IGNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJjYW52YXNcIik7XG4gICAgICBjYW52YXMud2lkdGggPSB3aWR0aCB8fCA2NDA7XG4gICAgICBjYW52YXMuaGVpZ2h0ID0gaGVpZ2h0IHx8IDQ4MDtcblxuICAgICAgbGV0IG9wdGlvbnMgPSB7XG4gICAgICAgIGFudGlhbGlhczogZmFsc2UsXG4gICAgICAgIHByZXNlcnZlRHJhd2luZ0J1ZmZlcjogdHJ1ZVxuICAgICAgfTtcblxuICAgICAgbGV0IGdsID0gY2FudmFzLmdldENvbnRleHQoXCJ3ZWJnbFwiLCBvcHRpb25zKTtcbiAgICAgIGlmICghZ2wpIHtcbiAgICAgICAgZ2wgPSBjYW52YXMuZ2V0Q29udGV4dChcImV4cGVyaW1lbnRhbC13ZWJnbFwiLCBvcHRpb25zKTtcbiAgICAgIH1cbiAgICAgIHByaXZhdGVzLmdsID0gZ2w7XG5cbiAgICAgIGlmICghZ2wpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3ByaXRlLldlYmdsIHdlYmdsIGlzIG5vdCBzdXBwb3J0ZWRcIik7XG4gICAgICB9XG5cbiAgICAgIHByaXZhdGVzLmNvbG9yID0gWzAsIDAsIDBdO1xuICAgICAgcHJpdmF0ZXMuZmlsdGVyID0gbmV3IE1hcCgpO1xuICAgICAgcHJpdmF0ZXMudGV4dHVyZUNhY2hlID0gbmV3IE1hcCgpO1xuICAgICAgcHJpdmF0ZXMuY2FudmFzID0gY2FudmFzO1xuICAgICAgcHJpdmF0ZXMubWF4VGV4dHVyZVNpemUgPSBnbC5nZXRQYXJhbWV0ZXIoZ2wuTUFYX1RFWFRVUkVfU0laRSk7XG5cbiAgICAgIGdsLnZpZXdwb3J0KDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgIGxldCB2ZXJ0U2hhZGVyT2JqID0gZ2wuY3JlYXRlU2hhZGVyKGdsLlZFUlRFWF9TSEFERVIpO1xuICAgICAgbGV0IGZyYWdTaGFkZXJPYmogPSBnbC5jcmVhdGVTaGFkZXIoZ2wuRlJBR01FTlRfU0hBREVSKTtcbiAgICAgIGdsLnNoYWRlclNvdXJjZSh2ZXJ0U2hhZGVyT2JqLCB2ZXJ0ZXhTaGFkZXJTcmMpO1xuICAgICAgZ2wuc2hhZGVyU291cmNlKGZyYWdTaGFkZXJPYmosIGZyYWdtZW50U2hhZGVyU3JjKTtcbiAgICAgIGdsLmNvbXBpbGVTaGFkZXIodmVydFNoYWRlck9iaik7XG4gICAgICBnbC5jb21waWxlU2hhZGVyKGZyYWdTaGFkZXJPYmopO1xuXG4gICAgICBsZXQgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKTtcbiAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0U2hhZGVyT2JqKTtcbiAgICAgIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnU2hhZGVyT2JqKTtcblxuICAgICAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSk7XG4gICAgICBnbC51c2VQcm9ncmFtKHByb2dyYW0pO1xuXG4gICAgICBnbC5jdWxsRmFjZShnbC5CQUNLKTtcbiAgICAgIGdsLmZyb250RmFjZShnbC5DVyk7XG4gICAgICBnbC5lbmFibGUoZ2wuQ1VMTF9GQUNFKTtcbiAgICAgIGdsLmVuYWJsZShnbC5CTEVORCk7XG4gICAgICBnbC5kaXNhYmxlKGdsLkRFUFRIX1RFU1QpO1xuICAgICAgZ2wuYmxlbmRGdW5jKGdsLlNSQ19BTFBIQSwgZ2wuT05FX01JTlVTX1NSQ19BTFBIQSk7XG5cbiAgICAgIHByaXZhdGVzLmNyb3BMb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJjcm9wXCIpO1xuICAgICAgcHJpdmF0ZXMuYnJpZ2h0bmVzc0xvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcImJyaWdodG5lc3NcIik7XG4gICAgICBwcml2YXRlcy5jb250cmFzdExvYyA9IGdsLmdldFVuaWZvcm1Mb2NhdGlvbihwcm9ncmFtLCBcImNvbnRyYXN0XCIpO1xuICAgICAgcHJpdmF0ZXMuYWxwaGFMb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJhbHBoYVwiKTtcbiAgICAgIHByaXZhdGVzLnJlc29sdXRpb25Mb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgXCJyZXNvbHV0aW9uXCIpO1xuICAgICAgZ2wudW5pZm9ybTJmKHByaXZhdGVzLnJlc29sdXRpb25Mb2MsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgIHByaXZhdGVzLnBvc2l0aW9uTG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIFwicG9zaXRpb25cIik7XG5cblxuICAgICAgcHJpdmF0ZXMudExvYyA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIFwiYV90ZXhDb29yZFwiKTtcbiAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHByaXZhdGVzLnRMb2MpO1xuICAgICAgcHJpdmF0ZXMudGV4Q29vcmRCdWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKTtcbiAgICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBwcml2YXRlcy50ZXhDb29yZEJ1ZmZlcik7XG4gICAgICBnbC52ZXJ0ZXhBdHRyaWJQb2ludGVyKHByaXZhdGVzLnRMb2MsIDIsIGdsLkZMT0FULCBmYWxzZSwgMCwgMCk7XG4gICAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUixcbiAgICAgICAgbmV3IEZsb2F0MzJBcnJheShcbiAgICAgICAgICBbXG4gICAgICAgICAgICAwLCAxLFxuICAgICAgICAgICAgMCwgMCxcbiAgICAgICAgICAgIDEsIDAsXG4gICAgICAgICAgICAxLCAxXG4gICAgICAgICAgXVxuICAgICAgICApLFxuICAgICAgICBnbC5TVEFUSUNfRFJBV1xuICAgICAgKTtcblxuICAgICAgcHJpdmF0ZXMudkxvYyA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIFwiYVZlcnRleFwiKTtcbiAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHByaXZhdGVzLnZMb2MpO1xuICAgICAgcHJpdmF0ZXMudmVydGV4QnVmZiA9IGdsLmNyZWF0ZUJ1ZmZlcigpO1xuICAgICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIHByaXZhdGVzLnZlcnRleEJ1ZmYpO1xuICAgICAgZ2wuYnVmZmVyRGF0YShcbiAgICAgICAgZ2wuQVJSQVlfQlVGRkVSLFxuICAgICAgICBuZXcgRmxvYXQzMkFycmF5KFtcbiAgICAgICAgICAwLCAxLFxuICAgICAgICAgIDAsIDAsXG4gICAgICAgICAgMSwgMCxcbiAgICAgICAgICAxLCAxXG4gICAgICAgIF0pLFxuICAgICAgICBnbC5TVEFUSUNfRFJBV1xuICAgICAgKTtcbiAgICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KHByaXZhdGVzLnZMb2MpO1xuICAgICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihwcml2YXRlcy52TG9jLCAyLCBnbC5GTE9BVCwgZmFsc2UsIDAsIDApO1xuXG4gICAgICBwcml2YXRlcy5jdXJyZW50VGV4dHVyZSA9IG51bGw7XG5cbiAgICAgIC8vIHNldHRpbmcsIGRvbid0IG1vdmVcbiAgICAgIHRoaXMuZmlsdGVyKFwiYnJpZ2h0bmVzc1wiLCAwKTtcbiAgICAgIHRoaXMuZmlsdGVyKFwiY29udHJhc3RcIiwgMCk7XG4gICAgICB0aGlzLmFscGhhID0gMTtcblxuICAgICAgY29uc29sZS5sb2coXCJ3ZWJnbCBpbml0ZWQuIG1heCB0ZXh0dXJlIHNpemU6ICVkXCIsXG4gICAgICAgIGdsLmdldFBhcmFtZXRlcihnbC5NQVhfVEVYVFVSRV9TSVpFKSk7XG4gICAgfVxuXG4gICAgZHJhd0ltYWdlOSAoaW1hZ2UsIHN4LCBzeSwgc3csIHNoLCBkeCwgZHksIGR3LCBkaCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICBsZXQgZ2wgPSBwcml2YXRlcy5nbDtcblxuICAgICAgbGV0IHRleHR1cmUgPSB0aGlzLmNyZWF0ZVRleHR1cmUoZ2wsIGltYWdlKTtcbiAgICAgIGlmIChwcml2YXRlcy5jdXJyZW50VGV4dHVyZSAhPSB0ZXh0dXJlKSB7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xuICAgICAgICBwcml2YXRlcy5jdXJyZW50VGV4dHVyZSA9IHRleHR1cmU7XG4gICAgICB9XG5cbiAgICAgIGdsLnVuaWZvcm00Zihwcml2YXRlcy5jcm9wTG9jLFxuICAgICAgICBzeC9pbWFnZS53aWR0aCwgc3kvaW1hZ2UuaGVpZ2h0LCBzdy9pbWFnZS53aWR0aCwgc2gvaW1hZ2UuaGVpZ2h0KTtcbiAgICAgIGdsLnVuaWZvcm00Zihwcml2YXRlcy5wb3NpdGlvbkxvYywgZHgsIGR5LCBkdywgZGgpO1xuXG4gICAgICBnbC5kcmF3QXJyYXlzKGdsLlRSSUFOR0xFX0ZBTiwgMCwgNCk7XG4gICAgfVxuXG4gICAgcmVsZWFzZSAoKSB7XG4gICAgICBsZXQgcHJpdmF0ZXMgPSBpbnRlcm5hbCh0aGlzKTtcbiAgICAgIGZvciAobGV0IHRleHR1cmUgb2YgcHJpdmF0ZXMudGV4dHVyZUNhY2hlLnZhbHVlcygpKSB7XG4gICAgICAgIHByaXZhdGVzLmdsLmRlbGV0ZVRleHR1cmUodGV4dHVyZSk7XG4gICAgICB9XG4gICAgICBwcml2YXRlcy50ZXh0dXJlQ2FjaGUgPSBuZXcgTWFwKCk7XG4gICAgfVxuXG4gICAgY3JlYXRlVGV4dHVyZSAoZ2wsIGltYWdlKSB7XG4gICAgICBsZXQgcHJpdmF0ZXMgPSBpbnRlcm5hbCh0aGlzKTtcbiAgICAgIGlmIChwcml2YXRlcy50ZXh0dXJlQ2FjaGUuaGFzKGltYWdlKSkge1xuICAgICAgICByZXR1cm4gcHJpdmF0ZXMudGV4dHVyZUNhY2hlLmdldChpbWFnZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBnbC5hY3RpdmVUZXh0dXJlKGdsLlRFWFRVUkUwKTtcbiAgICAgICAgbGV0IHRleHR1cmUgPSBnbC5jcmVhdGVUZXh0dXJlKCk7XG4gICAgICAgIGdsLmJpbmRUZXh0dXJlKGdsLlRFWFRVUkVfMkQsIHRleHR1cmUpO1xuICAgICAgICBnbC50ZXhJbWFnZTJEKGdsLlRFWFRVUkVfMkQsIDAsICBnbC5SR0JBLCAgZ2wuUkdCQSwgZ2wuVU5TSUdORURfQllURSwgaW1hZ2UpO1xuICAgICAgICBnbC50ZXhQYXJhbWV0ZXJpKGdsLlRFWFRVUkVfMkQsIGdsLlRFWFRVUkVfV1JBUF9TLCBnbC5DTEFNUF9UT19FREdFKTtcbiAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX1dSQVBfVCwgZ2wuQ0xBTVBfVE9fRURHRSk7XG4gICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NQUdfRklMVEVSLCBnbC5ORUFSRVNUKTtcblxuICAgICAgICAvLyB0ZXN0IHdpZHRoJmhlaWdodCBpcyBwb3dlciBvZiAyLCBlZy4gMjU2LCA1MTIsIDEwMjRcbiAgICAgICAgLy8gbWF5IHNwZWVkIHVwXG4gICAgICAgIGlmIChpc1BPVChpbWFnZS53aWR0aCkgJiYgaXNQT1QoaW1hZ2UuaGVpZ2h0KSkge1xuICAgICAgICAgIGdsLnRleFBhcmFtZXRlcmkoZ2wuVEVYVFVSRV8yRCwgZ2wuVEVYVFVSRV9NSU5fRklMVEVSLCBnbC5MSU5FQVJfTUlQTUFQX0xJTkVBUik7XG4gICAgICAgICAgZ2wuZ2VuZXJhdGVNaXBtYXAoZ2wuVEVYVFVSRV8yRCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZ2wudGV4UGFyYW1ldGVyaShnbC5URVhUVVJFXzJELCBnbC5URVhUVVJFX01JTl9GSUxURVIsIGdsLk5FQVJFU1QpO1xuICAgICAgICB9XG5cbiAgICAgICAgZ2wuYmluZFRleHR1cmUoZ2wuVEVYVFVSRV8yRCwgbnVsbCk7XG4gICAgICAgIHByaXZhdGVzLnRleHR1cmVDYWNoZS5zZXQoaW1hZ2UsIHRleHR1cmUpO1xuICAgICAgICByZXR1cm4gdGV4dHVyZTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBkcmF3SW1hZ2UgKGltYWdlLCBzeCwgc3ksIHN3LCBzaCwgZHgsIGR5LCBkdywgZGgpIHtcbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID09IDkpIHtcbiAgICAgICAgLy8gYWxsIHJpZ2h0XG4gICAgICB9IGVsc2UgaWYgKGFyZ3VtZW50cy5sZW5ndGggPT0gNSkge1xuICAgICAgICAvLyBkcmF3SW1hZ2UgKGltYWdlLCBkeCwgZHksIGR3LCBkaCk7XG4gICAgICAgIGR4ID0gc3g7XG4gICAgICAgIGR5ID0gc3k7XG4gICAgICAgIGR3ID0gc3c7XG4gICAgICAgIGRoID0gc2g7XG4gICAgICAgIHN4ID0gMDtcbiAgICAgICAgc3kgPSAwO1xuICAgICAgICBzdyA9IGltYWdlLndpZHRoO1xuICAgICAgICBzaCA9IGltYWdlLmhlaWdodDtcbiAgICAgIH0gZWxzZSBpZiAoYXJndW1lbnRzLmxlbmd0aCA9PSAzKSB7XG4gICAgICAgIC8vIGRyYXdJbWFnZSAoaW1hZ2UsIGR4LCBkeSk7XG4gICAgICAgIGR4ID0gc3g7XG4gICAgICAgIGR5ID0gc3k7XG4gICAgICAgIGR3ID0gaW1hZ2Uud2lkdGg7XG4gICAgICAgIGRoID0gaW1hZ2UuaGVpZ2h0O1xuICAgICAgICBzeCA9IDA7XG4gICAgICAgIHN5ID0gMDtcbiAgICAgICAgc3cgPSBpbWFnZS53aWR0aDtcbiAgICAgICAgc2ggPSBpbWFnZS5oZWlnaHQ7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKGFyZ3VtZW50cywgdGhpcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNwcml0ZS5XZWJnbC5kcmF3SW1hZ2UgaW52YWxpZCBhcmd1bWVudHNcIik7XG4gICAgICB9XG5cbiAgICAgIC8qXG4gICAgICBpZiAoZHggPiB0aGlzLndpZHRoIHx8IGR5ID4gdGhpcy5oZWlnaHQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBpZiAoKGR4ICsgZHcpIDwgMCB8fCAoZHkgKyBkaCkgPCAwKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgaWYgKFxuICAgICAgICAhTnVtYmVyLmlzSW50ZWdlcihpbWFnZS53aWR0aCkgfHxcbiAgICAgICAgIU51bWJlci5pc0ludGVnZXIoaW1hZ2UuaGVpZ2h0KSB8fFxuICAgICAgICBpbWFnZS53aWR0aCA8PSAwIHx8XG4gICAgICAgIGltYWdlLmhlaWdodCA8PSAwIHx8XG4gICAgICAgIGltYWdlLndpZHRoID4gcHJpdmF0ZXMubWF4VGV4dHVyZVNpemUgfHxcbiAgICAgICAgaW1hZ2UuaGVpZ2h0ID4gcHJpdmF0ZXMubWF4VGV4dHVyZVNpemVcbiAgICAgICkge1xuICAgICAgICBjb25zb2xlLmVycm9yKGltYWdlLCBwcml2YXRlcywgdGhpcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNwcml0ZS5XZWJnbC5kcmF3SW1hZ2UgaW52YWxpZCBpbWFnZVwiKTtcbiAgICAgIH1cbiAgICAgICovXG5cbiAgICAgIHRoaXMuZHJhd0ltYWdlOShpbWFnZSwgc3gsIHN5LCBzdywgc2gsIGR4LCBkeSwgZHcsIGRoKTtcbiAgICB9XG5cbiAgICBnZXQgYWxwaGEgKCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICByZXR1cm4gcHJpdmF0ZXMuYWxwaGE7XG4gICAgfVxuXG4gICAgc2V0IGFscGhhICh2YWx1ZSkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICBsZXQgZ2wgPSBwcml2YXRlcy5nbDtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWUpICYmXG4gICAgICAgICFpc05hTih2YWx1ZSkgJiZcbiAgICAgICAgdmFsdWUgPj0gMCAmJlxuICAgICAgICB2YWx1ZSA8PSAxXG4gICAgICApIHtcbiAgICAgICAgaWYgKHZhbHVlICE9IHByaXZhdGVzLmFscGhhKSB7XG4gICAgICAgICAgcHJpdmF0ZXMuYWxwaGEgPSB2YWx1ZTtcbiAgICAgICAgICBnbC51bmlmb3JtMWYocHJpdmF0ZXMuYWxwaGFMb2MsIHByaXZhdGVzLmFscGhhKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih2YWx1ZSwgdGhpcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNwcml0ZS5XZWJnbCBnb3QgaW52YWxpZCBhbHBoYSBudW1iZXJcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQHJldHVybiB7c3RyaW5nfSBUaGUgY29sb3IsIGVnIFwiIzAwZmYwMFwiXG4gICAgICovXG4gICAgZ2V0IGNvbG9yICgpIHtcbiAgICAgIGxldCBwcml2YXRlcyA9IGludGVybmFsKHRoaXMpO1xuICAgICAgbGV0IGNvbG9yID0gcHJpdmF0ZXMuY29sb3I7XG4gICAgICBsZXQgciA9IGNvbG9yWzBdLnRvU3RyaW5nKDE2KTtcbiAgICAgIGxldCBnID0gY29sb3JbMV0udG9TdHJpbmcoMTYpO1xuICAgICAgbGV0IGIgPSBjb2xvclsyXS50b1N0cmluZygxNik7XG4gICAgICBpZiAoci5sZW5ndGggPCAyKSByID0gXCIwXCIgKyByO1xuICAgICAgaWYgKGcubGVuZ3RoIDwgMikgZyA9IFwiMFwiICsgZztcbiAgICAgIGlmIChiLmxlbmd0aCA8IDIpIGIgPSBcIjBcIiArIGI7XG4gICAgICByZXR1cm4gXCIjXCIgKyByICsgZyArIGI7XG4gICAgfVxuICAgIC8qKlxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSBUaGUgbmV3IGNvbG9yLCBlZyBcIiMwMGZmMDBcIlxuICAgICAqL1xuICAgIHNldCBjb2xvciAodmFsdWUpIHtcbiAgICAgIGxldCBwcml2YXRlcyA9IGludGVybmFsKHRoaXMpO1xuICAgICAgbGV0IG0gPSB2YWx1ZS5tYXRjaCgvXiMoW1xcZGEtZkEtRl1bXFxkYS1mQS1GXSkoW1xcZGEtZkEtRl1bXFxkYS1mQS1GXSkoW1xcZGEtZkEtRl1bXFxkYS1mQS1GXSkkLyk7XG4gICAgICBpZiAobSkge1xuICAgICAgICBsZXQgciA9IG1bMV07XG4gICAgICAgIGxldCBnID0gbVsyXTtcbiAgICAgICAgbGV0IGIgPSBtWzNdO1xuICAgICAgICBwcml2YXRlcy5jb2xvclswXSA9IHBhcnNlSW50KHIsIDE2KTtcbiAgICAgICAgcHJpdmF0ZXMuY29sb3JbMV0gPSBwYXJzZUludChnLCAxNik7XG4gICAgICAgIHByaXZhdGVzLmNvbG9yWzJdID0gcGFyc2VJbnQoYiwgMTYpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih2YWx1ZSwgdGhpcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNwcml0ZS5XZWJnbC5jb2xvciBpbnZhbGlkIGNvbG9yIGZvcm1hdFwiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gbmFtZSBUaGUgbmFtZSBvZiBmaWx0ZXIgeW91IHdhbnQgZ2V0IG9yIHNldFxuICAgICAqIEBwYXJhbSB7bnVtYmVyfSB2YWx1ZSBOdW1iZXIgb3IgdW5kZWZpbmVkLCBpZiB1bmRlZmluZWQgLHJldHVybiBjdXJyZW50IHZhbHVlXG4gICAgICovXG4gICAgZmlsdGVyIChuYW1lLCB2YWx1ZSkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICBsZXQgZ2wgPSBwcml2YXRlcy5nbDtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWUpKSB7XG4gICAgICAgIHByaXZhdGVzLmZpbHRlci5zZXQobmFtZSwgdmFsdWUpO1xuICAgICAgICBnbC51bmlmb3JtMWYocHJpdmF0ZXMuYnJpZ2h0bmVzc0xvYywgcHJpdmF0ZXMuZmlsdGVyLmdldChcImJyaWdodG5lc3NcIikpO1xuICAgICAgICBnbC51bmlmb3JtMWYocHJpdmF0ZXMuY29udHJhc3RMb2MsIHByaXZhdGVzLmZpbHRlci5nZXQoXCJjb250cmFzdFwiKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXR1cm4gcHJpdmF0ZXMuZ2V0KG5hbWUpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGNsZWFyICgpIHtcbiAgICAgIGxldCBwcml2YXRlcyA9IGludGVybmFsKHRoaXMpO1xuICAgICAgbGV0IGdsID0gcHJpdmF0ZXMuZ2w7XG4gICAgICBsZXQgY29sb3IgPSBwcml2YXRlcy5jb2xvcjtcbiAgICAgIGdsLmNsZWFyQ29sb3IoY29sb3JbMF0sIGNvbG9yWzFdLCBjb2xvclsyXSwgMSk7IC8vIGJsYWNrXG4gICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUKTtcbiAgICB9XG5cbiAgICBnZXQgd2lkdGggKCkge1xuICAgICAgbGV0IHByaXZhdGVzID0gaW50ZXJuYWwodGhpcyk7XG4gICAgICByZXR1cm4gcHJpdmF0ZXMuY2FudmFzLndpZHRoO1xuICAgIH1cblxuICAgIHNldCB3aWR0aCAodmFsdWUpIHtcbiAgICAgIGxldCBwcml2YXRlcyA9IGludGVybmFsKHRoaXMpO1xuICAgICAgaWYgKE51bWJlci5pc0Zpbml0ZSh2YWx1ZSkgJiZcbiAgICAgICAgIWlzTmFOKHZhbHVlKSAmJlxuICAgICAgICB2YWx1ZSA+IDAgJiZcbiAgICAgICAgdmFsdWUgPD0gNDA5NlxuICAgICAgKSB7XG4gICAgICAgIGlmICh2YWx1ZSAhPSBwcml2YXRlcy5jYW52YXMud2lkdGgpIHtcbiAgICAgICAgICBwcml2YXRlcy5jYW52YXMud2lkdGggPSB2YWx1ZTtcbiAgICAgICAgICBwcml2YXRlcy5nbC52aWV3cG9ydCgwLCAwLCBwcml2YXRlcy5jYW52YXMud2lkdGgsIHByaXZhdGVzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgIHByaXZhdGVzLmdsLnVuaWZvcm0yZihcbiAgICAgICAgICAgIHByaXZhdGVzLnJlc29sdXRpb25Mb2MsXG4gICAgICAgICAgICBwcml2YXRlcy5jYW52YXMud2lkdGgsXG4gICAgICAgICAgICBwcml2YXRlcy5jYW52YXMuaGVpZ2h0XG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY29uc29sZS5lcnJvcih2YWx1ZSwgdGhpcyk7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlNwcml0ZS5XZWJnbCBnb3QgaW52YWxpZCB3aWR0aCBudW1iZXJcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGhlaWdodCAoKSB7XG4gICAgICBsZXQgcHJpdmF0ZXMgPSBpbnRlcm5hbCh0aGlzKTtcbiAgICAgIHJldHVybiBwcml2YXRlcy5jYW52YXMuaGVpZ2h0O1xuICAgIH1cblxuICAgIHNldCBoZWlnaHQgKHZhbHVlKSB7XG4gICAgICBsZXQgcHJpdmF0ZXMgPSBpbnRlcm5hbCh0aGlzKTtcbiAgICAgIGlmIChOdW1iZXIuaXNGaW5pdGUodmFsdWUpICYmXG4gICAgICAgICFpc05hTih2YWx1ZSkgJiZcbiAgICAgICAgdmFsdWUgPiAwICYmXG4gICAgICAgIHZhbHVlIDw9IDQwOTZcbiAgICAgICkge1xuICAgICAgICBpZiAodmFsdWUgIT0gcHJpdmF0ZXMuY2FudmFzLmhlaWdodCkge1xuICAgICAgICAgIHByaXZhdGVzLmNhbnZhcy5oZWlnaHQgPSB2YWx1ZTtcbiAgICAgICAgICBwcml2YXRlcy5nbC52aWV3cG9ydCgwLCAwLCBwcml2YXRlcy5jYW52YXMud2lkdGgsIHByaXZhdGVzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICAgIHByaXZhdGVzLmdsLnVuaWZvcm0yZihyZXNvbHV0aW9uTG9jLCBwcml2YXRlcy5jYW52YXMud2lkdGgsIHByaXZhdGVzLmNhbnZhcy5oZWlnaHQpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjb25zb2xlLmVycm9yKHZhbHVlLCB0aGlzKTtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiU3ByaXRlLldlYmdsIGdvdCBpbnZhbGlkIGhlaWdodCBudW1iZXJcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgZ2V0IGNhbnZhcyAoKSB7XG4gICAgICByZXR1cm4gaW50ZXJuYWwodGhpcykuY2FudmFzO1xuICAgIH1cblxuICAgIHNldCBjYW52YXMgKHZhbHVlKSB7XG4gICAgICBjb25zb2xlLmVycm9yKHZhbHVlLCB0aGlzKTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcIlNwcml0ZS5XZWJnbC5jYW52YXMgY2Fubm90IHdyaXRlXCIpO1xuICAgIH1cblxuICB9KTtcblxuXG5cbn0pKCk7XG4iXX0=
