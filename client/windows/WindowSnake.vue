<template>
  <WindowApp :window="props.window">
    <div class="snake-container">
      <div
        :id="`snake-canvas-container-${props.window.uniqueID}`"
        :class="['snake-canvas__container', game.canvas.container.classes.join(' ')]"
      >

        <div
          v-if="!server.connected"
          class="snake-canvas"
        >
          <span
            class="snake-canvas__loading"
            v-text="`Connecting to ${server.name}...`"
          />
        </div>

      </div>
      <div class="snake-sidebar__container">

        <div class="snake-sidebar">
          <ul class="snake-sidebar__stats">
            <li>
              Score: <b v-text="game.stats.score.toLocaleString()" />
            </li>
            <li>
              Moves: <span v-text="game.stats.moves.toLocaleString()" />
            </li>
            <li>
              Goodies: <span v-text="game.stats.goodies.toLocaleString()" />
            </li>
            <li>
              Mode: <span v-text="game.snake.mode" />
            </li>
            <li>
              <template v-if="game.snake.mode === 'lazy'">
                Speed: <span>0</span>
              </template>
              <template v-else>
                Speed: <span v-text="'1 move / ' + game.snake.speed / 1000 + 's'" />
              </template>
            </li>
          </ul>

          <ul class="snake-sidebar__power-ups">
            <li>
              <span class="square square-0" />
              <span>Bonus</span>
            </li>
            <li>
              <span class="square square-1" />
              <span>Special bonus</span>
            </li>
            <li>
              <span class="square square-2" />
              <span>Lazy mode</span>
            </li>
            <li>
              <span class="square square-4" />
              <span>Random direction</span>
            </li>
            <li>
              <span class="square square-5" />
              <span>Invisible</span>
            </li>
          </ul>
        </div>

      </div>
    </div>
  </WindowApp>
</template>

<script setup>
import {onMounted, onUnmounted, computed, defineProps} from 'vue'
  import {useStore} from 'vuex';

  const props = defineProps({
    window: Object
  })

  const server = computed(() => store.getters['snake/server'])
  const game = computed(() => store.getters['snake/game'])

  const store = useStore()

  onMounted(() => {
    store.dispatch('snake/initialize', props.window)
  })

  onUnmounted(() => {
    store.dispatch('snake/terminate')
  })
</script>

<style lang="scss">
  #app.is-windows {
    .snake-container .snake-sidebar .column-1 {
      ul.power-ups {
        font-size: 12px;
      }

      ul.stats li>span {
        font-size: 12px;
      }
    }
  }

  .snake-container {
    display: grid;
    grid-template-columns: calc(100% - 170px) 170px;
    pointer-events: none;
    height: 100%;
  }

  .snake-canvas__container {
    position: relative;

    &.invisible canvas {
      opacity: 0.1;
    }

    &.shake canvas {
      animation-name: shake-little;
      animation-duration: 150ms;
      animation-timing-function: ease-in-out;
      animation-iteration-count: infinite;
    }

    .snake-canvas {
      &__loading {
        position: absolute;
        top: 50%;
        left: 0;
        right: 0;
        transform: translateY(-50%);
        width: 100%;
        text-align: center;
      }
    }

    canvas {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      object-fit: contain;
      width: 100% !important;
      height: 100% !important;
      transition: opacity 1s ease-in-out;
      overflow: hidden;
    }
  }

  .snake-sidebar__container {
    overflow: hidden;
    margin-left: 12px;
    line-height: 18px;
    user-select: none;
    cursor: default;

    .snake-sidebar {
      position: relative;
      top: 50%;
      transform: translateY(-50%);

      ul.snake-sidebar__stats {
        margin: -4px 0 0 0;
        padding: 0;
        font-size: 13px;

        li {
          > span {
            color: $owd-window-text-active;
            margin-left: 2px;
            font-size: 12px;
          }

          b {
            color: #1da705;
            font-size: 12px;
            font-weight: bold;
            margin-left: 2px;
          }
        }
      }

      ul.snake-sidebar__power-ups {
        margin: 15px 0 0 0;
        padding: 0;
        font-size: 12px;

        @media (max-width: 320px) and (max-height: 568px) {
          display: none;
        }

        li {
          display: inline-block;
          background: $owd-window-content-tag;
          margin: 0 6px 6px 0;
          padding: 2px 10px 2px 8px;
          border-radius: 10px;

          &:last-child {
            margin-bottom: 0;
          }

          .square {
            width: 9px;
            height: 9px;
            margin: 0 8px 0 2px;
            display: inline-block;
            vertical-align: 0;
            border-radius: 1px;

            &.square-0 {
              background: #66C115;
            }

            &.square-1 {
              background: #E8C404;
            }

            &.square-2 {
              background: #1C8591;
            }

            &.square-3 {
              background: #FF6E17;
            }

            &.square-4 {
              background: #8951bc;
            }

            &.square-5 {
              background: #EEEEEE;
            }
          }
        }
      }
    }
  }

  // https://elrumordelaluz.github.io/csshake/
  @keyframes shake-little {
    @for $i from 1 through 49 {
      $x: (random(3) - 1) + px;
      $y: (random(3) - 1) + px;

      #{$i * 2%} {
        transform: translate($x, $y) rotate(.5deg);
      }
    }

    0%, 100% {
      transform: translate(0, 0) rotate(0)
    }
  }

  @keyframes slide-up {
    0% {
      opacity: 0;
      transform: translateY(-10px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>
