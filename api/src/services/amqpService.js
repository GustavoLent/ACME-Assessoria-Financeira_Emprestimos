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

	async openChannelToPubish({ exchange = "", queue = "", routingKey = "" }) {
		const { connection } = this;

		const channel = await connection.createChannel();

		await channel.assertExchange(exchange, "direct", { durable: true });
		await channel.assertQueue(queue, { durable: true });
		await channel.bindQueue(queue, exchange, routingKey);

		return channel;
	}

	async openChannelToConsume({ queue = "" }) {
		const { connection } = this;

		const channel = await connection.createChannel();
		channel.prefetch(10);

		await channel.assertQueue(queue, { durable: true });
		return channel;
	}

	async openConnection({ amqpUrl = "" }) {
		this.connection = await amqplib.connect(amqpUrl, "heartbeat=60");
	}

	// eslint-disable-next-line no-unused-vars
	async openConsumer({ queue = "", onMessage = async (msg = "") => { } }) {
		const channel = await this.openChannelToConsume({ queue });

		await channel.consume(
			queue,
			async (msg) => {
				await onMessage(msg);
				channel.ack(msg);
			}
		);
	}

	async publishMessage({ exchange = "", message = "", queue = "", routingKey = "" }) {
		const channel = await this.openChannelToPubish({ exchange, queue, routingKey });

		channel.publish(exchange, routingKey, Buffer.from(message));

		await this.closeChannel({ channel });
	}

};