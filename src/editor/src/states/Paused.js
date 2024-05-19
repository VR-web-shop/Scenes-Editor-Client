import State from '../abstractions/State.js'

/**
 * @class Paused
 * @classdesc The Paused state is executed when the editor is paused.
 * @extends State
 */
export default class Paused extends State {
    enter() {
        console.log('Entering Paused state')
        /**
         * Pause all the plugins
         */
        for (const key in this.context.options.plugins) {
            this.context.options.plugins[key].pause()
        }

        /**
         * Stop the view rendering
         */
        this.context.options.view.stopRender()
    }
}
