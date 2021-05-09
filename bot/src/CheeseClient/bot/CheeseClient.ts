import {Client, Message, MessageEmbed, Team, User, Collection} from 'discord.js'
import { Command } from './typing';
import config from '../config';
import Dokdo from 'dokdo'
import path from 'path';
import fs from 'fs';
import './embed';

export default class Cheese extends Client {
    config = config
    constructor() {
        super()

        this.commands = new Collection()
        this.aliases = new Collection()

        this.on('ready', () => {
            if (!this.shard) {
                console.log('shard only!')
                return process.exit(0)
            }
        })
        
    }
    async reloadCommands() {
        this.commands.clear()
        this.aliases.clear()
        Object.keys(require.cache).filter(r => !r.includes('node_modules')).forEach(r => delete require.cache[r])
        fs.readdirSync(path.join(__dirname, '../../commands')).forEach(dir => {
            const filter = fs.readdirSync(path.join(__dirname, '../../commands', dir)).filter(r => r.endsWith('.command.ts') || r.endsWith('.command.js'))
            filter.forEach(f => {
                const cmd: Command = require(path.join(__dirname, '../../commands', dir, f)).default
                if (!cmd.perms) cmd.perms = []
                if (!cmd.owner) cmd.owner = false
                this.commands.set(cmd.name, {
                    name: cmd.name,
                    aliases: cmd.aliases,
                    category: dir,
                    owner: cmd.owner,
                    perms: cmd.perms,
                    run: cmd.run
                })
                console.log(`Load Command: ${cmd.name}`)
                cmd.aliases.forEach(alias => this.aliases.set(alias, cmd.name))
            })
        })
    }
    async login() {
        require('./handler')
        await super.login(this.config.bot.token)
        const app = await this.fetchApplication()
        this.reloadCommands()
        let owners: string[] = []
        if (app.owner instanceof Team) {
            owners = app.owner.members.map((r) => r.id)
        } else if (app.owner instanceof User) {
            owners = [app.owner.id]
        }
        const dokdo = new Dokdo(this, {
            noPerm() {
                return
            },
            owners,
            prefix: this.config.bot.prefix
        })
        this.on('message', dokdo.run.bind(dokdo))
        return this.config.bot.token
    }
}