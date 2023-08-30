require('dotenv').config();

module.exports = {
  
  maxRetries: 3,  //Amount of times a block will be checked before failing and exiting the app.
  debugMode: true,  //Debug mode true or false. True will show logging in the console.
  ethThreshold: 4.9, //This will trigger the alert to show in green and also ping the role ID below.
  roleIdToPing: '1146277454617514035', //send a ping to a role if ethThreshold is met
  
  //--
  //DO NOT modify below this comment. You must set these values in the .env file. 
  infuraUrl: process.env.INFURA_URL,
  discordChannelId: process.env.DISCORD_CHANNEL_ID,
  discordBotToken: process.env.DISCORD_BOT_TOKEN
};