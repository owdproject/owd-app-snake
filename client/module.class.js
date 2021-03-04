import {ModuleApp} from "@owd-client/core";

import snakeStore from './store'

export default class SnakeModule extends ModuleApp {
  constructor(context) {
    super(context)
  }

  loadStore() {
    return snakeStore
  }

  loadCommands({store}) {
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