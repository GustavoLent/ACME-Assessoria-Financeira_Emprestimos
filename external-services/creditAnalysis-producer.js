const amqplib = require('amqplib');

(async function main() {
	const AMQP_URL = "amqp://localhost:5673"
	const AMQP_EXCHANGE_LOANS = "loans"
	const AMQP_QUEUE_LOAN_ENDED_PROCESSING = "loanEndedProcessing"

	try {
		const connection = await amqplib.connect(AMQP_URL, 'heartbeat=60');
		const channel = await connection.createChannel();

		await channel.assertExchange(AMQP_EXCHANGE_LOANS, 'direct');
		await channel.assertQueue(AMQP_QUEUE_LOAN_ENDED_PROCESSING);
		await channel.bindQueue(AMQP_QUEUE_LOAN_ENDED_PROCESSING, AMQP_EXCHANGE_LOANS);

		const status = { APPROVED: 2, REJECTED: 3 }

		const analysisResult = { userID: 1, result: status.APPROVED };
		const message = JSON.stringify(analysisResult)

		channel.publish(AMQP_EXCHANGE_LOANS, "", Buffer.from(message));

		await channel.close();
		await connection.close();
	} catch (e) {
		console.error('Error in publishing message', e);
	}
})();