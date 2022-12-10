const amqplib = require("amqplib");
const amqpUrl = "amqp://localhost:5673";

async function processMessage(msg) {
	console.log(msg.content.toString(), "Call email API here");
	//call your email service here to send the email
}

(async () => {
	const connection = await amqplib.connect(amqpUrl, "heartbeat=60");
	const channel = await connection.createChannel();
	channel.prefetch(10);
	const queue = "loanProcessing";

	await channel.assertQueue(queue, { durable: true });
	await channel.consume(queue, async (msg) => {
		console.log("processing messages");
		await processMessage(msg);
		await channel.ack(msg);
	},
		{
			noAck: false,
			consumerTag: "email_consumer"
		});
	console.log(" [*] Waiting for messages. To exit press CTRL+C");
})();
