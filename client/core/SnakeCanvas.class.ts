import {OwdModuleAppWindowInstance} from "@owd-client/types";
// @ts-ignore todo fix p5 types
import p5 from 'p5'

export default class SnakeCanvas {
  private readonly store
  private readonly window

  private canvas: {
    p5: any,
    block: {
      width: number,
      height: number
    }
  } = {
    p5: null,
    block: {
      width: 28,
      height: 28
    }
  }

  private bonus: {
    toggle: boolean,
    opacity: number
  } = {
    toggle: false,
    opacity: 50
  }

  private theme: any

  constructor(store: any, window: OwdModuleAppWindowInstance) {
    this.store = store
    this.window = window

    this.theme = store.state.snake.theme
  }

  get game() {
    return this.store.getters['snake/game']
  }

  create() {
    // init canvas
    this.canvasInitialize().then(() => {
      console.log('[owd] snake canvas initialized')
    })

    // subscribe to snake changes
    this.store.subscribe((mutation: any) => {
      if (mutation.type === 'snake/SET_SNAKE_STATUS') {
        this.resetCanvas();
        this.drawCanvas();
        this.drawBonus();
      }
    })
  }

  destroy() {
    this.canvas.p5.remove()
  }

  private async canvasInitialize() {
    return new Promise((resolve) => {
      const config = (p: any) => {
        p.setup = () => {
          const canvas = p.createCanvas(560, 560);

          canvas.fill(...this.theme.canvas);
          canvas.parent('snake-canvas-container-' + this.window.uniqueID);
          canvas.id('snake-canvas-' + this.window.uniqueID)

          p.noLoop();

          resolve(true);
        };
      };

      this.canvas.p5 = new p5(config);
    })
  }

  private resetCanvas() {
    const p = this.canvas.p5;
    if (!p) return;

    p.fill(...this.theme.canvas);
    p.rect(-5, -5, 570, 570);
  }

  private drawCanvas() {
    const p = this.canvas.p5;

    if (!p) {
      return false
    }

    p.stroke(19, 19, 19);

    for (let s = 0; s < this.game.snake.body.length; s++) {
      const element = this.game.snake.body[s],
        x = element[0] * this.canvas.block.width,
        y = element[1] * this.canvas.block.height;

      if (this.game.snake.damaged === false) {
        if ((this.game.snake.body.length - (this.game.snake.body.length - 2)) > s) {
          p.fill(...this.theme.snake.body);
        } else {
          p.fill(...this.theme.snake.tail);
        }
      } else {
        p.fill(...this.theme.snake.damaged);
      }

      p.rect(x, y, this.canvas.block.width, this.canvas.block.height);
    }
  }

  private drawBonus() {
    const p = this.canvas.p5;

    if (!p) {
      return false
    }

    if (this.bonus.toggle === false) {
      this.bonus.opacity = this.bonus.opacity + 5;
      if (Number(this.bonus.opacity) > 50) {
        this.bonus.toggle = true;
      }
    } else {
      // @ts-ignore
      this.bonus.opacity = this.bonus.opacity - 5;
      if (Number(this.bonus.opacity) === 10) {
        this.bonus.toggle = false;
      }
    }

    for (const i in this.game.goodies) {
      let color;
      switch (this.game.goodies[i].type) {
        case 1: // special
          color = '#e8c404';
          break;
        case 2: // slow
          color = '#148b98';
          break;
        case 3: // fast
          color = '#ff6e17';
          break;
        case 4: // random
          color = '#8951bc';
          break;
        case 5: // invisible
          color = '#eeeeee';
          break;
        default:
          color = '#66c115';
          break;
      }

      color = this.shadeColor(color, Number('-0.' + this.bonus.opacity.toString()));
      p.fill(color);
      p.rect(this.game.goodies[i].pos[0] * this.canvas.block.width, this.game.goodies[i].pos[1] * this.canvas.block.height, this.canvas.block.width, this.canvas.block.height);
    }
  }

  private shadeColor(color: string, percent: number) {
    let f = parseInt(color.slice(1), 16),
      t = percent < 0 ? 0 : 255,
      p = percent < 0 ? percent * -1 : percent,
      R = f >> 16,
      G = f >> 8 & 0x00FF,
      B = f & 0x0000FF;
    return "#" + (0x1000000 + (Math.round((t - R) * p) + R) * 0x10000 + (Math.round((t - G) * p) + G) * 0x100 + (Math.round((t - B) * p) + B)).toString(16).slice(1);
  }
}