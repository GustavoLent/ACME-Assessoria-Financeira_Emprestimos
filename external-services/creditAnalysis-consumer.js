const amqplib = require("amqplib");

const AMQP_URL = "amqp://localhost:5673"
const AMQP_QUEUE_LOAN_START_PROCESSING = "loanStartProcessing"

async function processMessage(msg) {
	console.info(`Received: ${msg.content.toString()}`);
}

async function connect() {
	const connection = await amqplib.connect(AMQP_URL, "heartbeat=60");
	const channel = await connection.createChannel();
	channel.prefetch(10);

	await channel.assertQueue(AMQP_QUEUE_LOAN_START_PROCESSING, { durable: true });
	return channel
}

(async () => {
	const channel = await connect()

	await channel.consume(
		AMQP_QUEUE_LOAN_START_PROCESSING,
		async (msg) => {
			await processMessage(msg);
			channel.ack(msg);
		}
	);

	console.info("Credit Analysis [Consumer] started listening!");
})();
