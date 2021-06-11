import {ModuleApp} from "@owd-client/core/index";
import {OwdModuleAppLoadCommandsContext} from "@owd-client/types";
import snakeStore from './store'
import snakeConfig from '~/../config/snake/config.json'

// window components
import WindowSnake from "./windows/WindowSnake.vue";

export default class SnakeModule extends ModuleApp {
  loadModule() {
    return {
      name: "snake",
      singleton: true,
      config: snakeConfig,
      windows: [
        {
          component: WindowSnake,
          name: "WindowSnake",
          category: "games",
          title: "Snake 2D",
          icon: "mdi-cube-unfolded",
          menu: true,
          minimized: false,
          resizable: true,
          forceMobileMaximized: true,
          size: {
            width: 480,
            height: 320
          },
          position: {
            x: -1,
            y: 0,
            z: 0
          }
        }
      ]
    }
  }

  loadStore() {
    return snakeStore
  }

  loadCommands({store}: OwdModuleAppLoadCommandsContext) {
    return {
      'snake': function (t, args) {
        if (args.length === 0) {
          t.writeln("\r\n\n\x1b[1;36mSNAKE USAGE\n");
          t.writeln("\x1b[0msnake up\x1B[37m" + "             Move it up");
          t.writeln("\x1b[0msnake left\x1B[37m" + "           Move it left");
          t.writeln("\x1b[0msnake right\x1B[37m" + "          Move it right");
          t.writeln("\x1b[0msnake down\x1B[37m" + "           Move it down");

          // open snake windows
          store.dispatch('core/window/windowOpen', 'WindowSnake');
        } else {
          switch (args[0].trim().toLowerCase()) {
            case 'up':
            case 'left':
            case 'right':
            case 'down':
              store.dispatch('snake/sendDirection', args[0]);
              break;
          }
        }
      }
    }
  }
}