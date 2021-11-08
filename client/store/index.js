import Snake from '../core/Snake.class';

let timeoutInvisibility

export default {
  state: {
    instance: null,

    server: {
      baseUrl: 'https://hacklover-snake-server.herokuapp.com',
      connected: false
    },

    snake: {
      mode: 'default',
      direction: '',
      body: [],
      damaged: false,
      speed: 0
    },

    canvasContainerClasses: [],

    goodies: [],

    stats: {
      score: 0,
      goodies: 0,
      moves: 0,
      speed: 0
    },

    theme: {
      canvas: [53],
      canvasAlt: [17],
      snake: {
        body: [4, 150, 193],
        tail: [4, 160, 193],
        damaged: [245, 47, 47]
      },
      goodies: {
        special: [232, 196, 4],
        slow: [20, 139, 152],
        fast: [255, 110, 23],
        random: [137, 81, 188],
        invisible: [238, 238, 238],
        default: [102, 193, 21]
      }
    }
  },

  getters: {
    instance(state) {
      return state.instance
    },
    server(state) {
      let hostname = state.server.baseUrl.split('.')

      if (hostname.length > 2) {
        hostname = hostname.slice(-2)
      } else {
        hostname = 'server'
      }

      return {
        name: hostname,
        connected: state.server.connected
      }
    },
    game(state) {
      return {
        snake: state.snake,
        goodies: state.goodies,
        stats: state.stats,
        canvas: {
          container: { classes: state.canvasContainerClasses }
        }
      }
    },
    serverApiUpdates(state) {
      return state.server.baseUrl + '/api/sse'
    },
    serverApiInput(state) {
      return state.server.baseUrl + '/api/input'
    }
  },

  mutations: {
    SET_INSTANCE(state, instance) {
      state.instance = instance
    },

    SET_CONNECTED(state, value) {
      state.server.connected = value;
    },

    SET_SNAKE_STATUS(state, data) {
      state.snake = data.snake
      state.goodies = data.goodies
      state.stats = data.stats
    },

    SET_BONUS_EATEN(state, type) {
      // add shake effect
      if (!state.canvasContainerClasses.includes('shake')) {
        state.canvasContainerClasses.push('shake');
      }

      setTimeout(function () {
        // special bonus effect
        switch (type) {
          case 5:
            if (!state.canvasContainerClasses.includes('invisible')) {
              state.canvasContainerClasses.push('invisible');
            }

            clearTimeout(timeoutInvisibility);
            timeoutInvisibility = setTimeout(function () {
              state.canvasContainerClasses.splice(state.canvasContainerClasses.indexOf('invisible'), 1);
            }, 10000);
            break;
        }

        // remove shake effect
        state.canvasContainerClasses.splice(state.canvasContainerClasses.indexOf('shake'), 1);
      }, 300);
    }
  },

  actions: {
    initialize({commit}, window) {
      const instance = new Snake(this, window)

      if (instance) {
        commit('SET_INSTANCE', instance)
      }
    },

    terminate({getters}) {
      getters.instance.terminate()
    },

    connect({getters}) {
      getters.instance.server.connect()
    },

    disconnect({getters}) {
      getters.instance.server.disconnect()
    },

    sendDirection({getters}, direction) {
      getters.instance.input.sendDirection(direction)
    }
  }
}
