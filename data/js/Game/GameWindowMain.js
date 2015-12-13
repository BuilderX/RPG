"use strict";

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

  var win = Game.windows.main = Game.Window.create("mainWindow");

  win.html = "\n    <div id=\"mainWindowBox\">\n      <h1>Elliorwis</h1>\n      <h4>艾利韦斯</h4>\n      <br>\n      <button id=\"mainWindowContinue\" class=\"brownButton\">继续旅程</button>\n      <br>\n      <button id=\"mainWindowNew\" class=\"brownButton\">新的旅程</button>\n      <br>\n      <button id=\"mainWindowLoad\" class=\"brownButton\">读取进度</button>\n      <br>\n      <button id=\"mainWindowFullscreen\" class=\"brownButton\">全屏</button>\n    </div>\n  ";

  win.css = "\n    #mainWindowBox {\n      text-align: center;\n      height: 412px;\n      background-color: rgba(240, 217, 194, 0.85);\n      border: 20px solid rgba(134, 93, 52, 0.85);\n    }\n\n    #mainWindowFullscreen {\n      position: absolute;\n      left: 640px;\n      top: 30px;\n    }\n\n    .mainWindow h1 {\n      font-size: 60px;\n      margin-bottom: 0;\n    }\n\n    .mainWindow h4 {\n      margin-bottom: 0;\n    }\n\n    .mainWindow button {\n      width: 120px;\n      height: 60px;\n      margin-top: 10px;\n    }\n  ";

  var mainWindowContinue = win.querySelector("#mainWindowContinue");
  var mainWindowNew = win.querySelector("#mainWindowNew");
  var mainWindowLoad = win.querySelector("#mainWindowLoad");
  var mainWindowFullscreen = win.querySelector("#mainWindowFullscreen");

  mainWindowFullscreen.addEventListener("click", function (event) {
    Game.windows.setting.toggle();
  });

  win.on("beforeShow", function () {
    if (!Game.Archive.last()) {
      mainWindowContinue.style.visibility = "hidden";
    } else {
      mainWindowContinue.style.visibility = "visible";
    }
  });

  mainWindowContinue.addEventListener("click", function (event) {
    win.hide();
    setTimeout(function () {
      Game.Archive.load();
    }, 20);
  });

  mainWindowNew.addEventListener("click", function (event) {
    win.hide();
    Game.register.reg();
  });

  mainWindowLoad.addEventListener("click", function (event) {
    win.hide();
    Game.windows.archive.open();
  });
})();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9HYW1lL0dhbWVXaW5kb3dNYWluLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFvQkEsQ0FBQyxZQUFZO0FBQ1gsY0FBWSxDQUFDOztBQUViLE1BQUksR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDOztBQUUvRCxLQUFHLENBQUMsSUFBSSwrYkFhUCxDQUFDOztBQUVGLEtBQUcsQ0FBQyxHQUFHLG1oQkE0Qk4sQ0FBQzs7QUFFRixNQUFJLGtCQUFrQixHQUFHLEdBQUcsQ0FBQyxhQUFhLENBQUMscUJBQXFCLENBQUMsQ0FBQztBQUNsRSxNQUFJLGFBQWEsR0FBRyxHQUFHLENBQUMsYUFBYSxDQUFDLGdCQUFnQixDQUFDLENBQUM7QUFDeEQsTUFBSSxjQUFjLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO0FBQzFELE1BQUksb0JBQW9CLEdBQUcsR0FBRyxDQUFDLGFBQWEsQ0FBQyx1QkFBdUIsQ0FBQyxDQUFDOztBQUV0RSxzQkFBb0IsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsVUFBQyxLQUFLLEVBQUs7QUFDeEQsUUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLENBQUM7R0FDL0IsQ0FBQyxDQUFDOztBQUVILEtBQUcsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFlBQVk7QUFDL0IsUUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQUU7QUFDeEIsd0JBQWtCLENBQUMsS0FBSyxDQUFDLFVBQVUsR0FBRyxRQUFRLENBQUM7S0FDaEQsTUFBTTtBQUNMLHdCQUFrQixDQUFDLEtBQUssQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO0tBQ2pEO0dBQ0YsQ0FBQyxDQUFDOztBQUVILG9CQUFrQixDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFVLEtBQUssRUFBRTtBQUM1RCxPQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWCxjQUFVLENBQUMsWUFBWTtBQUNyQixVQUFJLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxDQUFDO0tBQ3JCLEVBQUUsRUFBRSxDQUFDLENBQUM7R0FDUixDQUFDLENBQUM7O0FBRUgsZUFBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFVLEtBQUssRUFBRTtBQUN2RCxPQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWCxRQUFJLENBQUMsUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO0dBQ3JCLENBQUMsQ0FBQzs7QUFFSCxnQkFBYyxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxVQUFVLEtBQUssRUFBRTtBQUN4RCxPQUFHLENBQUMsSUFBSSxFQUFFLENBQUM7QUFDWCxRQUFJLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQztHQUM3QixDQUFDLENBQUM7Q0FHSixDQUFBLEVBQUcsQ0FBQyIsImZpbGUiOiJHYW1lV2luZG93TWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIi8qXG5cbkEtUlBHIEdhbWUsIEJ1aWx0IHVzaW5nIEphdmFTY3JpcHQgRVM2XG5Db3B5cmlnaHQgKEMpIDIwMTUgcWhkdWFuKGh0dHA6Ly9xaGR1YW4uY29tKVxuXG5UaGlzIHByb2dyYW0gaXMgZnJlZSBzb2Z0d2FyZTogeW91IGNhbiByZWRpc3RyaWJ1dGUgaXQgYW5kL29yIG1vZGlmeVxuaXQgdW5kZXIgdGhlIHRlcm1zIG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBhcyBwdWJsaXNoZWQgYnlcbnRoZSBGcmVlIFNvZnR3YXJlIEZvdW5kYXRpb24sIGVpdGhlciB2ZXJzaW9uIDMgb2YgdGhlIExpY2Vuc2UsIG9yXG4oYXQgeW91ciBvcHRpb24pIGFueSBsYXRlciB2ZXJzaW9uLlxuXG5UaGlzIHByb2dyYW0gaXMgZGlzdHJpYnV0ZWQgaW4gdGhlIGhvcGUgdGhhdCBpdCB3aWxsIGJlIHVzZWZ1bCxcbmJ1dCBXSVRIT1VUIEFOWSBXQVJSQU5UWTsgd2l0aG91dCBldmVuIHRoZSBpbXBsaWVkIHdhcnJhbnR5IG9mXG5NRVJDSEFOVEFCSUxJVFkgb3IgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UuICBTZWUgdGhlXG5HTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZSBmb3IgbW9yZSBkZXRhaWxzLlxuXG5Zb3Ugc2hvdWxkIGhhdmUgcmVjZWl2ZWQgYSBjb3B5IG9mIHRoZSBHTlUgR2VuZXJhbCBQdWJsaWMgTGljZW5zZVxuYWxvbmcgd2l0aCB0aGlzIHByb2dyYW0uICBJZiBub3QsIHNlZSA8aHR0cDovL3d3dy5nbnUub3JnL2xpY2Vuc2VzLz4uXG5cbiovXG5cbihmdW5jdGlvbiAoKSB7XG4gIFwidXNlIHN0cmljdFwiO1xuXG4gIGxldCB3aW4gPSBHYW1lLndpbmRvd3MubWFpbiA9IEdhbWUuV2luZG93LmNyZWF0ZShcIm1haW5XaW5kb3dcIik7XG5cbiAgd2luLmh0bWwgPSBgXG4gICAgPGRpdiBpZD1cIm1haW5XaW5kb3dCb3hcIj5cbiAgICAgIDxoMT5FbGxpb3J3aXM8L2gxPlxuICAgICAgPGg0PuiJvuWIqemfpuaWrzwvaDQ+XG4gICAgICA8YnI+XG4gICAgICA8YnV0dG9uIGlkPVwibWFpbldpbmRvd0NvbnRpbnVlXCIgY2xhc3M9XCJicm93bkJ1dHRvblwiPue7p+e7reaXheeoizwvYnV0dG9uPlxuICAgICAgPGJyPlxuICAgICAgPGJ1dHRvbiBpZD1cIm1haW5XaW5kb3dOZXdcIiBjbGFzcz1cImJyb3duQnV0dG9uXCI+5paw55qE5peF56iLPC9idXR0b24+XG4gICAgICA8YnI+XG4gICAgICA8YnV0dG9uIGlkPVwibWFpbldpbmRvd0xvYWRcIiBjbGFzcz1cImJyb3duQnV0dG9uXCI+6K+75Y+W6L+b5bqmPC9idXR0b24+XG4gICAgICA8YnI+XG4gICAgICA8YnV0dG9uIGlkPVwibWFpbldpbmRvd0Z1bGxzY3JlZW5cIiBjbGFzcz1cImJyb3duQnV0dG9uXCI+5YWo5bGPPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIGA7XG5cbiAgd2luLmNzcyA9IGBcbiAgICAjbWFpbldpbmRvd0JveCB7XG4gICAgICB0ZXh0LWFsaWduOiBjZW50ZXI7XG4gICAgICBoZWlnaHQ6IDQxMnB4O1xuICAgICAgYmFja2dyb3VuZC1jb2xvcjogcmdiYSgyNDAsIDIxNywgMTk0LCAwLjg1KTtcbiAgICAgIGJvcmRlcjogMjBweCBzb2xpZCByZ2JhKDEzNCwgOTMsIDUyLCAwLjg1KTtcbiAgICB9XG5cbiAgICAjbWFpbldpbmRvd0Z1bGxzY3JlZW4ge1xuICAgICAgcG9zaXRpb246IGFic29sdXRlO1xuICAgICAgbGVmdDogNjQwcHg7XG4gICAgICB0b3A6IDMwcHg7XG4gICAgfVxuXG4gICAgLm1haW5XaW5kb3cgaDEge1xuICAgICAgZm9udC1zaXplOiA2MHB4O1xuICAgICAgbWFyZ2luLWJvdHRvbTogMDtcbiAgICB9XG5cbiAgICAubWFpbldpbmRvdyBoNCB7XG4gICAgICBtYXJnaW4tYm90dG9tOiAwO1xuICAgIH1cblxuICAgIC5tYWluV2luZG93IGJ1dHRvbiB7XG4gICAgICB3aWR0aDogMTIwcHg7XG4gICAgICBoZWlnaHQ6IDYwcHg7XG4gICAgICBtYXJnaW4tdG9wOiAxMHB4O1xuICAgIH1cbiAgYDtcblxuICBsZXQgbWFpbldpbmRvd0NvbnRpbnVlID0gd2luLnF1ZXJ5U2VsZWN0b3IoXCIjbWFpbldpbmRvd0NvbnRpbnVlXCIpO1xuICBsZXQgbWFpbldpbmRvd05ldyA9IHdpbi5xdWVyeVNlbGVjdG9yKFwiI21haW5XaW5kb3dOZXdcIik7XG4gIGxldCBtYWluV2luZG93TG9hZCA9IHdpbi5xdWVyeVNlbGVjdG9yKFwiI21haW5XaW5kb3dMb2FkXCIpO1xuICBsZXQgbWFpbldpbmRvd0Z1bGxzY3JlZW4gPSB3aW4ucXVlcnlTZWxlY3RvcihcIiNtYWluV2luZG93RnVsbHNjcmVlblwiKTtcblxuICBtYWluV2luZG93RnVsbHNjcmVlbi5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgKGV2ZW50KSA9PiB7XG4gICAgR2FtZS53aW5kb3dzLnNldHRpbmcudG9nZ2xlKCk7XG4gIH0pO1xuXG4gIHdpbi5vbihcImJlZm9yZVNob3dcIiwgZnVuY3Rpb24gKCkge1xuICAgIGlmICghR2FtZS5BcmNoaXZlLmxhc3QoKSkge1xuICAgICAgbWFpbldpbmRvd0NvbnRpbnVlLnN0eWxlLnZpc2liaWxpdHkgPSBcImhpZGRlblwiO1xuICAgIH0gZWxzZSB7XG4gICAgICBtYWluV2luZG93Q29udGludWUuc3R5bGUudmlzaWJpbGl0eSA9IFwidmlzaWJsZVwiO1xuICAgIH1cbiAgfSk7XG5cbiAgbWFpbldpbmRvd0NvbnRpbnVlLmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICB3aW4uaGlkZSgpO1xuICAgIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgR2FtZS5BcmNoaXZlLmxvYWQoKTtcbiAgICB9LCAyMCk7XG4gIH0pO1xuXG4gIG1haW5XaW5kb3dOZXcuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHdpbi5oaWRlKCk7XG4gICAgR2FtZS5yZWdpc3Rlci5yZWcoKTtcbiAgfSk7XG5cbiAgbWFpbldpbmRvd0xvYWQuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsIGZ1bmN0aW9uIChldmVudCkge1xuICAgIHdpbi5oaWRlKCk7XG4gICAgR2FtZS53aW5kb3dzLmFyY2hpdmUub3BlbigpO1xuICB9KTtcblxuXG59KSgpO1xuIl19
