import Command from './abstractions/Command.js'

/**
 * @class
 * @classdesc The invoker is a class that is used to set a command and execute it.
 * @property {Command} command
 * @property {Object} options
 */
export default class Invoker {

    /**
     * @constructor
     * @param {Object} options
     */
    constructor(options = {}) {
        this.options = options
        this.log = []
        this.onLog = []
    }

    /**
     * The setCommand method is called to set the command of the invoker.
     * 
     * @param {Command} command
     * @throws {Error} If command is not a Command
     * @returns {void}
     */
    setCommand(command) {
        if (!(command instanceof Command)) {
            this.logCommand('Error: Command must be an instance of Command')
            throw new Error('Must be a Command')
        }

        this.command = command
        this.command?.setInvoker(this)
    }

    logCommand(message) {
        const time = new Date().toLocaleTimeString()
        this.log.push(`${time} - ${message}`)
        this.onLog.forEach(callback => callback(message))
    }

    addLogListener(callback) {
        this.onLog.push(callback)
    }

    /**
     * The execute method is called to execute the command.
     * 
     * @returns {Promise<void>}
     */
    async execute() {
        if (this.command) {
            this.logCommand(`Executing command ${this.command.toString()}`)
            await this.command.execute()
        }
    }

    /**
     * Set the command and instantly execute it.
     * 
     * @param {Command} command
     * @returns {Promise<void>}
     */
    async invoke(command) {
        this.setCommand(command)
        await this.execute()
    }
}
