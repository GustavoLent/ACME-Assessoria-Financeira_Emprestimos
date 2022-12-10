const amqplib = require("amqplib");
const { Buffer } = require("node:buffer");

module.exports = class AMQPService {
	constructor() {
		this.connection = undefined;
	}

	async closeChannel({ channel }) {
		return await channel.close();
	}

	async closeConnection() {
		return await this.connection.close();
	}

	async openChannel({ exchange = "", queue = "", routingKey = "" }) {
		const { connection } = this;

		const channel = await connection.createChannel();

		await channel.assertExchange(exchange, "direct", { durable: true });
		await channel.assertQueue(queue, { durable: true });
		await channel.bindQueue(queue, exchange, routingKey);

		return channel;
	}

	async openConnection({ amqpUrl = "" }) {
		this.connection = await amqplib.connect(amqpUrl, "heartbeat=60");
	}

	async publishMessage({ exchange = "", message = "", queue = "", routingKey = "" }) {
		const channel = await this.openChannel({ exchange, queue, routingKey });

		channel.publish(exchange, routingKey, Buffer.from(message));

		await this.closeChannel({ channel });
	}
};