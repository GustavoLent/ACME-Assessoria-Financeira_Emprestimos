const amqplib = require('amqplib');

module.exports = class AMQPService {
    constructor() {
        this.channel = undefined
        this.connection = undefined
    }

    async connect() {
        const amqpUrl = 'amqp://localhost:5673';
        const connection = await amqplib.connect(amqpUrl, 'heartbeat=60');
        const channel = await connection.createChannel();

        const exchange = 'loans';
        const queue = 'loanProcessing';
        const routingKey = 'newLoan';

        await channel.assertExchange(exchange, 'direct', { durable: true });
        await channel.assertQueue(queue, { durable: true });
        await channel.bindQueue(queue, exchange, routingKey);

        this.connection = connection
        this.channel = channel
    }

    async close() {
        await this.channel.close();
        await this.connection.close();
    }
}