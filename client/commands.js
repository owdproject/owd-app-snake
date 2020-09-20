import axios from "axios";

export default ({ store, terminal }) => {
  return {
    'snake': function (...args) {
      if (args.length === 0) {
        this.echo();
        this.echo(terminal.textColor("SNAKE USAGE", terminal.defaultColors.menu));
        this.echo(terminal.textColor("snake up", "white") + "             Move it up");
        this.echo(terminal.textColor("snake left", "white") + "           Move it left");
        this.echo(terminal.textColor("snake right", "white") + "          Move it right");
        this.echo(terminal.textColor("snake down", "white") + "           Move it down");
        this.echo();
        // this.echo(terminal.textColor("snake anarchy", "white") + "        Vote for anarchy mode");
        // this.echo(terminal.textColor("snake democracy", "white") + "      Vote for democracy mode");
        // this.echo();

        // open snake windows
        store.dispatch('core/windows/windowOpen', 'WindowSnake');
      } else {
        this.pause();

        // when argument is not passed with --, args is not an array
        if (!Array.isArray(args)) {
          args = window.jQuery.terminal.parse_options(args)._;
        }

        switch (args[0].trim().toLowerCase()) {
          case 'up':
          case 'left':
          case 'right':
          case 'down':
            axios.post(store.getters['snake/apiInputUrl'], {
              direction: args[0]
            });
            break;

          case 'anarchy':
          case 'democracy':
            axios.post(store.getters['snake/apiVoteUrl'], {
              vote: args[0]
            });
            break;
        }

        this.resume();
      }
    }
  }
}
