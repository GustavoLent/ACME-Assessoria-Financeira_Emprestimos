const express = require('express')
const amqplib = require('amqplib');

const app = express()

app.use(express.json());

const loans = []
const amqpUrl = 'amqp://localhost:5673';

app.post('/createLoan', async (req, res) => {
    if(!req.body){
        res.send('Missing body')
        return
    }

    if(!req.body.username){
        res.send('Missing username')
        return
    }

    if(!req.body.loanvalue){
        res.send('Missing loanvalue')
        return
    }

    const { username, loanvalue } = req.body;
    const loan = {username, loanvalue};

    const found = loans.find(openLoan => openLoan.username === username);

    if(found){
        res.send('User already has an open loan!')
        return
    }

    const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
    const channel = await connection.createChannel();
  
    try {
      console.log('Publishing...');
      const exchange = 'loans';
      const queue = 'loanProcessing';
      const routingKey = 'newLoan';

      await channel.assertExchange(exchange, 'direct', {durable: true});
      await channel.assertQueue(queue, {durable: true});
      await channel.bindQueue(queue, exchange, routingKey);

      channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(loan)));
      loans.push(loan);
      console.log('Message published');
      res.send('Message published');
    
    } catch(e) {
      console.error('Error in publishing message', e);
    } finally {
      console.info('Closing channel and connection if available');

      await channel.close();
      await connection.close();

      console.info('Channel and connection closed');
    }
})

app.get('/getLoans', (req, res) => {    
    res.send(JSON.stringify(loans, null, 2))
})

app.listen(3000, () => {
  console.log(`Example app listening on port ${3000}`)
})