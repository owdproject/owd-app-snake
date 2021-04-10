import {OwdModuleAppWindowInstance} from "@owd-client/types";

export default class SnakeServer {
  private readonly store
  private readonly window

  private eventSource: any = null

  private intervalReconnect: any = null

  constructor(store: any, window: OwdModuleAppWindowInstance) {
    this.store = store
    this.window = window
  }

  initialize() {
    this.connect()
  }

  destroy() {
    this.disconnect()
  }

  get connected() {
    return this.store.getters['snake/server'].connected
  }

  /**
   * Connect to Web Plays Snake
   * https://github.com/hacklover/snake-server
   *
   * @private
   */
  private connect() {
    // check if is already connected
    if (this.connected) {
      return false
    }

    setTimeout(() => {
      // connect to SSE
      this.eventSource = new EventSource(this.store.getters['snake/serverApiUpdates']);

      // set onMessage event
      this.eventSource.onmessage = (message: any) => {
        const event = JSON.parse(message.data);

        if (event) {
          clearInterval(this.intervalReconnect)

          if (!this.connected) {
            this.store.commit('snake/SET_CONNECTED', true)
          }

          if (event.name === 'snake-update') {
            this.store.commit('snake/SET_SNAKE_STATUS', event.data)
          }

          if (event.name === 'snake-bonus-eaten') {
            this.store.commit('snake/SET_BONUS_EATEN', event.data.type)
          }
        }
      }

      // set onError event
      this.eventSource.onerror = () => {
        this.eventSource.close();

        if (this.connected) {
          this.store.commit('snake/SET_CONNECTED', false)
        }

        clearInterval(this.intervalReconnect);
        this.intervalReconnect = setInterval(() => this.connect(), 5000);
      }
    }, 1000)
  }

  /**
   * Disconnect from Web Plays Snake
   * https://github.com/hacklover/snake-server
   *
   * @private
   */
  private disconnect() {
    // check if is already disconnected
    if (!this.connected) {
      return false
    }

    this.store.commit('snake/SET_CONNECTED', false)

    this.eventSource.close();
  }
}