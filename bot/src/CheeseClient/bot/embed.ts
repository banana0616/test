import { MessageEmbed, Message } from 'discord.js';

Message.prototype.embed = function() {
    return new MessageEmbed().setColor('GREEN')
}