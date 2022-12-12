const assert = require("assert");
const AMQPService = require("./amqpService");
const GrantedLoanMessage = require("../models/grantedLoanMessage");

module.exports = class FinancialService {
	constructor(amqpService) {
		assert(amqpService instanceof AMQPService);

		this.amqpService = amqpService;
	}

	async postLoanGranted({ userID, value }) {
		const { amqpService } = this;

		try {
			const grantedLoanMessage = new GrantedLoanMessage(userID, value);
			console.info(`grantedLoanMessage ${grantedLoanMessage}`);

			await amqpService.publishMessage({
				exchange: process.env.AMQP_EXCHANGE_LOANS,
				message: JSON.stringify(grantedLoanMessage),
				queue: process.env.AMQP_QUEUE_LOAN_GRANTED,
				routingKey: process.env.AMQP_ROUTING_KEY
			});
		} catch (error) {
			console.error(`[FinancialService consumeProcessedCreditAnalysis] Error when starting a new credit analysis. ${error}`);
		}
	}
};