import { ShardingManager } from 'discord.js';
import path from 'path';
import config from './CheeseClient/config';

const manager = new ShardingManager(path.join(__dirname, 'bot.ts'), config.bot.shards)

manager.on('shardCreate', shard => console.log(`Create Shard #${shard.id}`))

manager.spawn()