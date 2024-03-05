const { Client } = require('discord.js-selfbot-v13')
const Client = new Client({ checkUpdate: false });
const axios = require('axios');
const config = require('./config.json');
const ownerId = config.userid;
const prefix = config.prefix;

client.on('message', async (message) => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'send' && args.length === 2 && message.author.id === ownerId) {
    const ltcAddress = args[0];
    const amountInput = args[1];
    const ltcAmount = parseFloat(amountInput);

    if (isNaN(ltcAmount)) {
      return message.channel.send('Invalid amount. Please provide a valid number.');
    }

    try {
      const coingeckoResp = await axios.get(
        'https://api.coingecko.com/api/v3/simple/price?ids=litecoin&vs_currencies=usd'
      );
      const ltcToUsdRate = coingeckoResp.data.litecoin.usd;
      const convertedLtcAmount = parseFloat((ltcAmount / ltcToUsdRate).toFixed(8));

      const txId = await sendLTC(ltcAddress, convertedLtcAmount);
      message.channel.send(`Transaction successful! Transaction ID: ${txId}`);
    } catch (error) {
      console.error(error);
      message.channel.send('An error occurred while processing the transaction.');
    }
  }
});

async function sendLTC(address, amount) {
  const resp = await axios.post(
    'https://api.tatum.io/v3/litecoin/transaction',
    {
      fromAddress: [
        {
          address: config.ltc_address,
          privateKey: config.ltckey'
        }
      ],
      to: [
        {
          address: address,
          value: amount
        }
      ],
      fee: '0.00005', 
      changeAddress: config.ltc_address
    },
    {
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': config.apikey
      }
    }
  );

  
  return resp.data.txId;
}


client.login(config.token)
  
