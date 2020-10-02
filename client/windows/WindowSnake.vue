<template>
  <Window :title="data.title" :window="data">
    <div class="snake-container">
      <div id="snake-canvas-container" :class="canvasContainerClasses.join(' ')" />
      <div class="snake-sidebar-container">
          <div class="snake-sidebar">

            <ul class="stats">
              <li>
                Score: <b v-text="stats.score.toLocaleString()" />
              </li>
              <li>
                Moves: <span v-text="stats.moves.toLocaleString()" />
              </li>
              <li>
                Goodies: <span v-text="stats.goodies.toLocaleString()" />
              </li>
              <li>
                Mode: <span v-text="snake.mode"></span>
              </li>
              <li>
                <template v-if="snake.mode === 'lazy'">
                  Speed: <span>0</span>
                </template>
                <template v-else>
                  Speed: <span v-text="'1 move / ' + snakeSpeed + 's'" />
                </template>
              </li>
              <!--
              <li>
                <div class="democracy-bar-container">
                  <span class="anarchy">Anarchy</span>
                  <span class="democracy-bar">
                    <span class="democracy-bar-value" :style="`width: ${democracyLevel}%;`"></span>
                  </span>
                  <span class="democracy">Democracy</span>
                </div>
              </li>
              -->
            </ul>

            <ul class="power-ups">
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
  </Window>
</template>

<script>
  import Window from "~/core/components/window/Window";
  import p5 from 'p5';

  export default {
    name: "WindowSnake",
    components: {Window},
    props: {
      data: Object
    },
    data() {
      return {
        // snake canvas
        canvas: {
          instance: null,
          class: '',
          blockWidth: 28,
          blockHeight: 28,
          stageWidth: 40,
          stageHeight: 40
        },
        canvasContainerClasses: [],

        // snake sse
        snake: {
          mode: 'default',
          direction: 'right',
          speed: 5000,
          elements: [],
          damaged: false,
          idle: false,
        },
        goodies: [],
        stats: {
          score: 0,
          goodies: 0,
          moves: 0,
          lastMoves: [],
        },
        democracyLevel: 0,

        // bonus animation
        bonus: {
          toggle: false,
          opacity: false
        }
      }
    },
    computed: {
      snakeSpeed: function () {
        return this.snake.speed / 1000;
      }
    },
    async mounted() {
      await this.canvasInitialize();

      // start on window mount
      if (!this.data.storage.closed) {
        await this.$store.dispatch('snake/snakeConnect');
      }

      // intercept $store mutation
      this.$store.subscribe((mutation) => {
        if (mutation.type === 'snake/EVENT_LOG') {
          const event = mutation.payload;

          switch(event.name) {
            case 'snake-update':
              this.snake = event.data.snake;
              this.goodies = event.data.goodies;
              this.stats = event.data.stats;
              this.democracyLevel = event.data.democracyLevel;

              this.drawCanvas();
              this.drawBonus();
              break;
            case 'snake-bonus-eaten':
              this.bonusEaten(event.data.type);
              break;
          }
        }
      });
    },
    watch: {
      // handle window opening state
      'data.storage.closed': function (val) {
        if (val === true) {
          this.$store.dispatch('snake/snakeDisconnect');
        } else {
          this.$store.dispatch('snake/snakeConnect');
        }
      }
    },
    methods: {
      async canvasInitialize() {
        return new Promise((resolve) => {
          const config = (p) => {
            p.setup = () => {
              const canvas = p.createCanvas(560, 560);

              canvas.fill(17, 17, 17);
              canvas.parent("snake-canvas-container");
              canvas.id("snake-canvas");

              p.noLoop();

              this.resetCanvas();

              resolve();
            };

            p.draw = () => {
              this.drawBonus();
            }
          };

          this.canvas.instance = new p5(config);
        })
      },

      resetCanvas() {
        const p = this.canvas.instance;
        if (!p) return;

        p.fill(17, 17, 17);
        p.rect(-5, -5, 570, 570);
      },

      drawCanvas() {
        const p = this.canvas.instance;
        if (!p) return;

        this.resetCanvas();

        p.stroke(19, 19, 19);

        for (let s = 0; s < this.snake.body.length; s++) {
          let element = this.snake.body[s],
            x = element[0] * this.canvas.blockWidth,
            y = element[1] * this.canvas.blockHeight;

          if (this.snake.damaged === false) {
            if ((this.snake.body.length - (this.snake.body.length - 2)) > s) {
              p.fill(4, 150, 193);
            } else {
              p.fill(4, 160, 193);
            }
          } else {
            p.fill(245, 47, 47);
          }

          p.rect(x, y, this.canvas.blockWidth, this.canvas.blockHeight);
        }
      },

      drawBonus() {
        const p = this.canvas.instance;
        if (!p) return;

        if (this.bonus.toggle === false) {
          this.bonus.opacity = this.bonus.opacity + 5;
          if (this.bonus.opacity > 50) {
            this.bonus.toggle = true;
          }
        } else {
          this.bonus.opacity = this.bonus.opacity - 5;
          if (this.bonus.opacity === 10) {
            this.bonus.toggle = false;
          }
        }

        if (this.bonus.opacity.length === 1) {
          this.bonus.opacity = '0' + this.bonus.opacity;
        }

        for (let i in this.goodies) {
          let color;
          switch (this.goodies[i].type) {
            case 1: // special
              color = '#E8C404';
              break;
            case 2: // slow
              color = '#148B98';
              break;
            case 3: // fast
              color = '#FF6E17';
              break;
            case 4: // random
              color = '#8951bc';
              break;
            case 5: // invisible
              color = '#EEEEEE';
              break;
            default:
              color = '#66C115';
              break;
          }

          color = this.shadeColor(color, '-0.' + this.bonus.opacity);
          p.fill(color);
          p.rect(this.goodies[i].pos[0] * this.canvas.blockWidth, this.goodies[i].pos[1] * this.canvas.blockHeight, this.canvas.blockWidth, this.canvas.blockHeight);
        }
      },

      bonusEaten(type) {
        const self = this;

        // default shake effect
        if (!this.canvasContainerClasses.includes('shake')) {
          this.canvasContainerClasses.push('shake');
        }

        setTimeout(function () {
          // special bonus effect
          switch (type) {
            case 5:
              if (!self.canvasContainerClasses.includes('invisible')) {
                self.canvasContainerClasses.push('invisible');
              }

              clearTimeout(self.invisibilityTimeout);
              self.invisibilityTimeout = setTimeout(function () {

                const classInvisibleIndex = self.canvasContainerClasses.indexOf('invisible');
                self.canvasContainerClasses.splice(classInvisibleIndex, 1);

              }, 10000);
              break;
          }

          const classShakeIndex = self.canvasContainerClasses.indexOf('shake');
          self.canvasContainerClasses.splice(classShakeIndex, 1);
        }, 200);
      },

      shadeColor(color, percent) {
        let f = parseInt(color.slice(1), 16),
          t = percent < 0 ? 0 : 255,
          p = percent < 0 ? percent * -1 : percent,
          R = f >> 16,
          G = f >> 8 & 0x00FF,
          B = f & 0x0000FF;
        return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
      }
    }
  }
</script>

<style lang="scss">
  #snake-canvas {
    position: relative;
    width: auto !important;
    height: auto !important;
    max-width: 100%;
    max-height: 100%;
    transform: translateY(-50%);
    top: 50%;
  }

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
</style>

<style scoped lang="scss">
  .snake-container {
    display: grid;
    grid-template-columns: calc(100% - 170px) 170px;
    height: 100%;

    #snake-canvas-container {
      max-height: 100%;
      transition: opacity 1s ease-in-out;
      overflow: hidden;

      &.invisible {
        opacity: 0.1;
      }

      &.shake {
        animation-name: shake-little;
        animation-duration: 150ms;
        animation-timing-function: ease-in-out;
        animation-iteration-count: infinite;
      }
    }

    .snake-sidebar-container {
      overflow: hidden;
      margin-left: 12px;
      line-height: 18px;
      user-select: none;
      cursor: default;

      .snake-sidebar {
        position: relative;
        top: 50%;
        transform: translateY(-50%);

        ul.stats {
          margin: -4px 0 0 0;
          padding: 0;

          li {
            > span {
              color: #6b6b6b;
              margin-left: 2px;
              font-size: 12px;
            }

            b {
              color: #66c114;
              font-size: 12px;
              font-weight: bold;
              margin-left: 2px;
            }
          }
        }

        ul.power-ups {
          margin: 15px 0 0 0;
          padding: 0;
          font-size: 12px;

          @media (max-width: 320px) and (max-height: 568px) {
            display: none;
          }

          li {
            display: inline-block;
            background: #1d1d1d;
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

        .democracy-bar-container {
          position: relative;
          width: 158px;
          margin: 8px auto 0 auto;
          font-size: 10px;
          text-transform: uppercase;
          color: rgba(255, 255, 255, 0.18);
          font-family: monospace, FreeMono;
          letter-spacing: 1px;

          .anarchy {
            position: absolute;
            top: 0;
            left: 0;
            width: 50%;
            padding: 0 5px;
            box-sizing: border-box;
            line-height: 20.5px;
            z-index: 2;
            transition: opacity 0.75s ease-in-out;

            &.active {
              cursor: pointer;
            }
          }

          .democracy {
            position: absolute;
            top: 0;
            right: 0;
            width: 50%;
            padding: 0 5px;
            box-sizing: border-box;
            line-height: 20.5px;
            z-index: 2;
            transition: opacity 0.75s ease-in-out;

            &.active {
              cursor: pointer;
            }
          }

          .democracy-bar {
            position: relative;
            display: inline-block;
            border: 1px solid rgba(255, 255, 255, 0.15);
            height: 17px;
            border-radius: 2px;
            margin: 0;
            width: calc(100% - 2px);
            font-size: 13px;

            &:after {
              position: absolute;
              top: 0;
              left: 50%;
              height: 100%;
              border-right: 1px solid rgba(255, 255, 255, 0.15);
              content: '';
            }

            .democracy-bar-value {
              position: absolute;
              top: 0;
              left: 0;
              bottom: 0;
              width: 0;
              background: #1b1b1b;
              transition: width 0.5s ease-in-out;
            }

            span {
              margin: 0;

              &.democracy {
                float: right;
              }
            }
          }
        }
      }
    }

    @media (max-width: 823px) and (min-width: 375px) {
      grid-template-columns: 50% 50%;
      text-align: center;

      #snake-canvas-container {
        #snake-canvas {
          position: relative;
          top: 50%;
          transform: translateY(-50%);
        }
      }
    }

    @media (max-width: 485px) {
      grid-template-columns: 100%;
      text-align: center;

      #snake-canvas-container {
        height: 60%;
      }

      .snake-sidebar-container {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        height: calc(40% - 12px);
      }
    }
  }

  // https://elrumordelaluz.github.io/csshake/
  @keyframes shake-little {
    2% {
      transform: translate(1px, 2px) rotate(.5deg)
    }
    4% {
      transform: translate(1px, 0px) rotate(.5deg)
    }
    6% {
      transform: translate(1px, 1px) rotate(.5deg)
    }
    8% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    10% {
      transform: translate(0px, 2px) rotate(.5deg)
    }
    12% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    14% {
      transform: translate(1px, 0px) rotate(.5deg)
    }
    16% {
      transform: translate(1px, 1px) rotate(.5deg)
    }
    18% {
      transform: translate(0px, 1px) rotate(.5deg)
    }
    20% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    22% {
      transform: translate(1px, 0px) rotate(.5deg)
    }
    24% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    26% {
      transform: translate(2px, 1px) rotate(.5deg)
    }
    28% {
      transform: translate(1px, 0px) rotate(.5deg)
    }
    30% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    32% {
      transform: translate(0px, 1px) rotate(.5deg)
    }
    34% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    36% {
      transform: translate(0px, 2px) rotate(.5deg)
    }
    38% {
      transform: translate(0px, 1px) rotate(.5deg)
    }
    40% {
      transform: translate(1px, 1px) rotate(.5deg)
    }
    42% {
      transform: translate(1px, 0px) rotate(.5deg)
    }
    44% {
      transform: translate(2px, 1px) rotate(.5deg)
    }
    46% {
      transform: translate(1px, 1px) rotate(.5deg)
    }
    48% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    50% {
      transform: translate(1px, 2px) rotate(.5deg)
    }
    52% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    54% {
      transform: translate(1px, 1px) rotate(.5deg)
    }
    56% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    58% {
      transform: translate(2px, 0px) rotate(.5deg)
    }
    60% {
      transform: translate(1px, 1px) rotate(.5deg)
    }
    62% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    64% {
      transform: translate(1px, 1px) rotate(.5deg)
    }
    66% {
      transform: translate(0px, 1px) rotate(.5deg)
    }
    68% {
      transform: translate(2px, 1px) rotate(.5deg)
    }
    70% {
      transform: translate(0px, 1px) rotate(.5deg)
    }
    72% {
      transform: translate(1px, 0px) rotate(.5deg)
    }
    74% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    76% {
      transform: translate(2px, 0px) rotate(.5deg)
    }
    78% {
      transform: translate(0px, 1px) rotate(.5deg)
    }
    80% {
      transform: translate(1px, 2px) rotate(.5deg)
    }
    82% {
      transform: translate(1px, 0px) rotate(.5deg)
    }
    84% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    86% {
      transform: translate(2px, 0px) rotate(.5deg)
    }
    88% {
      transform: translate(1px, 1px) rotate(.5deg)
    }
    90% {
      transform: translate(0px, 1px) rotate(.5deg)
    }
    92% {
      transform: translate(2px, 1px) rotate(.5deg)
    }
    94% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    96% {
      transform: translate(0px, 0px) rotate(.5deg)
    }
    98% {
      transform: translate(0px, 2px) rotate(.5deg)
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
