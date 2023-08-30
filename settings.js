require('dotenv').config();

module.exports = {
  
  maxRetries: 3,  //Amount of times a block will be checked before failing and exiting the app.
  debugMode: true,  // Directly setting it here
  
  //--
  //DO NOT modify below this comment. You must set these values in the .env file. 
  infuraUrl: process.env.INFURA_URL,
  discordChannelId: process.env.DISCORD_CHANNEL_ID,
  discordBotToken: process.env.DISCORD_BOT_TOKEN
};