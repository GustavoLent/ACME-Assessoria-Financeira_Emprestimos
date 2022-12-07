const express = require('express')
const DatabaseService = require('./src/services/databaseService');
const APIException = require('./src/models/APIException');
const HTTPResponse = require('./src/models/HTTPResponse');
const AMQPService = require('./src/services/amqpService');

const app = express()

app.use(express.json());

const loans = []
const amqpUrl = 'amqp://localhost:5673';

app.post('/createLoan', async (req, res) => {
  if (!req.body) {
    res.send('Missing body')
    return
  }

  if (!req.body.username) {
    res.send('Missing username')
    return
  }

  if (!req.body.loanvalue) {
    res.send('Missing loanvalue')
    return
  }

  const { username, loanvalue } = req.body;
  const loan = { username, loanvalue };

  const found = loans.find(openLoan => openLoan.username === username);

  if (found) {
    res.send('User already has an open loan!')
    return
  }

  try {

    const databaseService = new DatabaseService();
    const conn = await databaseService.connect();
    const dbRes = await databaseService.findLoans(conn);

    console.log('Publishing...');

    const amqpService = new AMQPService();
    await amqpService.connect()

    const exchange = 'loans';
    const queue = 'loanProcessing';
    const routingKey = 'newLoan';

    amqpService.channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(loan)));
    loans.push(loan);
    console.log('Message published');
    res.send('Message published');

  } catch (e) {

    if (e instanceof APIException) {
      const status = e.statusCode ? e.statusCode : 500
      const message = e.message ? e.message : "Fuuuuuuu"

      HTTPResponse.response({ res, status, body: { message } })
    }

    console.error('Error in publishing message', e);
  } finally {
    console.info('Closing rabbitChannel and rabbitConnection if available');
    console.info('Channel and rabbitConnection closed');
  }
})

app.get('/getLoans', (req, res) => {
  res.send(JSON.stringify(loans, null, 2))
})

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`)
})