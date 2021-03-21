import {OwdModuleAppWindowInstance} from '@owd-client/types';

import SnakeServer from './SnakeServer.class';
import SnakeCanvas from './SnakeCanvas.class';
import SnakeInput from './SnakeInput.class';

export default class Snake {
  private server
  private canvas
  private input

  constructor(store: any, window: OwdModuleAppWindowInstance) {
    this.server = new SnakeServer(store, window)
    this.canvas = new SnakeCanvas(store, window)
    this.input = new SnakeInput(store, window)

    this.initialize()
  }

  initialize() {
    this.canvas.create()
    this.input.create()
  }

  terminate() {
    this.canvas.destroy()
    this.input.destroy()
  }
}