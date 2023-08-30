//settings
const { infuraUrl, discordChannelId, discordBotToken, maxRetries, debugMode  } = require('./settings');
const { getNewTokens, checkBalance } = require('./web3Utils');
const debugLog = require('./debugUtils');
const { client, sendDiscordMessage } = require('./discordUtils');

const Web3 = require('web3');
const { Client, GatewayIntentBits, MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');

debugLog("DEBUG MODE: ON");
const deployedContracts = new Set();

const checkNewTokens = async () => {
    const newTokens = await getNewTokens();
    for (const token of newTokens) {
        if (!deployedContracts.has(token.address)) {
            deployedContracts.add(token.address);
            await sendDiscordMessage(token);
        }
    }
};

client.once('ready', async () => {
    debugLog(`Logged in as ${client.user.tag}`);
    debugLog('Bot is online!');

    // Send a test message
    sendDiscordMessage({ name: 'TestToken', address: '0xTestAddress' });

    await checkNewTokens();
    setInterval(checkNewTokens, 60000);
});

client.login(discordBotToken);
