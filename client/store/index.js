export default {
  state: {
    apiBaseUrl: 'https://hacklover-snake-server.herokuapp.com',
    eventSource: null,
    eventLog: null
  },

  getters: {
    apiInputUrl(state) {
      return state.apiBaseUrl + '/api/input'
    },
    apiVoteUrl(state) {
      return state.apiBaseUrl + '/api/vote'
    }
  },

  mutations: {
    SET_EVENT_SOURCE(state, eventSource) {
      state.eventSource = eventSource
    },
    EVENT_LOG(state, log) {
      state.eventLog = log;
    }
  },

  actions: {
    snakeConnect({state, commit, dispatch}) {
      const eventSource = new EventSource(state.apiBaseUrl + '/api/sse');

      eventSource.onmessage = (message) => {
        const event = JSON.parse(message.data);

        if (event) {
          commit('EVENT_LOG', event)
        }
      };

      eventSource.onerror = () => {
        commit('SET_CONNECTED', false);
        eventSource.close();

        setTimeout(() => dispatch('snakeStart'), 5000);
      };

      commit('SET_EVENT_SOURCE', eventSource)
    },
    snakeDisconnect({state, commit}) {
      state.eventSource.close();
      commit('SET_EVENT_SOURCE', null)
    }
  }
}
