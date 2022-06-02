// Import the Firebase SDK for Google Cloud Functions.
const functions = require('firebase-functions');
// Import and initialize the Firebase Admin SDK.
const admin = require('firebase-admin');
admin.initializeApp();
exports.startBot = functions.https.onRequest((req, res) => {

	require('dotenv').config() // Load .env file
	const axios = require('axios')
	const Discord = require('discord.js')
	const client = new Discord.Client()
	
	function getPrices() {
	

		// Moralis API for price data
		axios.get(`https://deep-index.moralis.io/api/v2/erc20/${process.env.CONTRACT_ADDRESS}/price?chain=${process.env.BLOCK_CHAIN}`,{
			headers: {
			  'accept': 'application/json',
			  'X-API-Key': process.env.API_KEY
			}
		}).then(res => {
			console.log(res.data)
			// If response is valid
			if(res.data && res.data.usdPrice) {
				let currentPrice = res.data.usdPrice || 0 // If price exists if not default to zero
				let coinName = process.env.COIN_NAME[0].toUpperCase() + process.env.COIN_NAME.substring(1)
				client.user.setPresence({
					game: {
						name: `${process.env.CURRENCY_SYMBOL}${(currentPrice).toLocaleString('fullwide', { useGrouping: true, maximumSignificantDigits:6}).replace(/,/g,process.env.THOUSAND_SEPARATOR)} | ${process.env.SYMBOL.toUpperCase()}`,
						type: 3 
					}
				})
				let nickName = `${coinName}`
				client.guilds.get(process.env.SERVER_ID).me.setNickname(nickName)
	
				console.log('Updated price to', currentPrice)
				console.log(nickName)
			}
			else
				console.log('Token is invalid', process.env.COIN_NAME)
	
		}).catch(err => console.log('API access Error, double check if you have filled up a valid contract address and chain:', err))
	}
	
	// Runs when client connects to Discord.
	client.on('ready', () => {
		console.log('Logged in as', client.user.tag)
	
		getPrices() // Ping server once on startup
		// Ping the server and set the new status message every x minutes. (Minimum of 1 minute)
		setInterval(getPrices, Math.max(1, process.env.MC_PING_FREQUENCY || 1) * 60 * 1000)
	})
	
	// Login to Discord
	client.login(process.env.DISCORD_TOKEN)
	
	
	res.json({result: `Bot started`});
})

