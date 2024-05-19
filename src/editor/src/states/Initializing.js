import State from '../abstractions/State.js'
import Executing from './Executing.js';

/**
 * @class Initializing
 * @classdesc The Initializing state is the first state that the editor will be in.
 * @extends State
 */
export default class Initializing extends State {
    enter() {
        console.log('Entering Initializing state')
        /**
         * Setup the view
         */
        this.context.options.view.setup(this.context)

        /**
         * Setup all the plugins
         */
        for (const key in this.context.options.plugins) {
            this.context.options.plugins[key].setup(this.context)
        }

        /**
         * Move to the executing state
         */
        this.context.changeState(new Executing()) 
    }
}
