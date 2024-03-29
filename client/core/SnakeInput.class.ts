import {OwdModuleAppWindowInstance} from "@owd-client/types";
import {watch} from "@vue/runtime-core/";
import axios from "axios";

export default class SnakeInput {
  private readonly store
  private readonly window

  private keyCodePressed: number = -1

  private watcher: any = {
    focused: false,
    minimized: false
  }

  constructor(store: any, window: OwdModuleAppWindowInstance) {
    this.store = store
    this.window = window
  }

  create() {
    const self = this

    // handle context with addEventListener/removeEventListener
    function handleKeyUp(e: any) {
      // set keycode
      self.keyCodePressed = e.keyCode

      // run real handleKeyUp method
      self.handleKeyUp.call(self)
    }

    // if focused, add keyup event listener
    if (this.window.storage.focused) {
      document.addEventListener('keyup', handleKeyUp, false)
    }

    // watch window focusing status, add keyup event listener
    this.watcher.focused = watch(() => this.window.storage.focused, function (value: boolean) {
      document[value ? 'addEventListener' : 'removeEventListener']('keyup', handleKeyUp, false)
    })

    // watch window opening status, connect or disconnect from sse
    this.watcher.minimized = watch(() => this.window.storage.minimized, function (value: boolean) {
      self.store.dispatch(!value ? 'snake/connect' : 'snake/disconnect')
    })
  }

  destroy() {
    // reset watchers
    this.watcher.focused()
    this.watcher.minimized()
  }

  /**
   * Handle keycode pressed
   */
  handleKeyUp() {
    let direction: string = ''

    switch (this.keyCodePressed) {
      case 37:
      case 65:
        direction = 'left'
        break;
      case 38:
      case 87:
        direction = 'up'
        break;
      case 39:
      case 68:
        direction = 'right'
        break;
      case 40:
      case 83:
        direction = 'down'
        break;
    }

    this.sendDirection(direction)
  }

  /**
   * Send direction
   * @param direction
   */
  sendDirection(direction: string) {
    axios.post(this.store.getters['snake/serverApiInput'], {direction}).then(() => {
      console.log(`[owd] snake direction sent: ${direction}`)
    })
  }
}