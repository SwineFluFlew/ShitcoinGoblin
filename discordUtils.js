const { Client, MessageEmbed, MessageActionRow, MessageButton   } = require('discord.js');
const { discordChannelId, discordBotToken, debugMode, ethThreshold, roleIdToPing } = require('./settings');
const debugLog = require('./debugUtils');

// Initialize Discord Client
const client = new Client({
    intents: [
        'GUILDS',
        'GUILD_MESSAGES'
    ],
});

const sendDiscordMessage = async (token) => {
    const channel = client.channels.cache.get(discordChannelId);
    const balance = parseFloat(token.balance);
    let embedColor = '#0099ff';
    let pingText = "";
    let balanceFieldTitle = 'Owner Balance';

    if (balance > ethThreshold) {
        embedColor = '#00ff00'; // green
        balanceFieldTitle = `Owner Balance (Over ${ethThreshold} ETH)`;
    }

    if (balance > ethThreshold && roleIdToPing) {
        pingText = `<@&${roleIdToPing}> `;
    }


    if (channel) {
        const embedTitle = token.symbol ? `New Token: ${token.symbol}` : 'New Token: Unknown';
        const embed = new MessageEmbed()
            .setTitle(embedTitle)  // <:clown2:1007817304291147796>
            .setColor(embedColor)
            .setURL(`https://etherscan.io/address/${token.address}`)
            .setTimestamp();  

        // Add fields with inline: true for name and totalSupply to make them appear in the same row
        embed.addFields(
            { name: 'Name', value: token.name || 'Unknown', inline: true },
            { name: 'Total Supply', value: token.totalSupply || 'Unknown', inline: true },
            { name: 'Contract Address', value: `[${token.address}](https://etherscan.io/address/${token.address})`, inline: false }
        );

        //if (token.symbol) embed.addFields({ name: 'Symbol', value: token.symbol, inline: false });
       // if (token.decimals) embed.addFields({ name: 'Decimals', value: token.decimals, inline: false });
        if (token.owner) embed.addFields({ name: 'Owner', value: token.owner, inline: false });
        if (token.balance !== undefined) {
            embed.addFields({ name: balanceFieldTitle, value: `${token.balance} ETH`, inline: false });
        }
        // Create buttons
        const dexScreenerButton = new MessageButton()
            .setStyle('LINK')
            .setLabel('DexScreener')
            .setURL(`https://dexscreener.com/ethereum/${token.address}`);

        const etherscanButton = new MessageButton()
            .setStyle('LINK')
            .setLabel('Etherscan')
            .setURL(`https://etherscan.io/address/${token.address}`);

        // Create an action row
        const row = new MessageActionRow().addComponents(dexScreenerButton, etherscanButton);

        channel.send({ pingText, embeds: [embed], components: [row] })
            .then(() => debugLog(`Message sent!`))
            .catch(err => debugLog(`Failed to send message: ${err}`));
    }
};

module.exports = {
    client,
    sendDiscordMessage
};