const assert = require("assert");
const CreditAnalysisUseCase = require("../useCases/creditAnalysisUseCase");
const AMQPService = require("../services/amqpService");
const LoanMessage = require("../models/loanMessage");

module.exports = class CreditAnalysisService {
	constructor(amqpService, creditAnalysisUseCase) {
		assert(amqpService instanceof AMQPService);
		assert(creditAnalysisUseCase instanceof CreditAnalysisUseCase);

		this.amqpService = amqpService;
		this.creditAnalysisUseCase = creditAnalysisUseCase;
	}

	async startConsumingCreditAnalysisResults({ onStart = () => { } }) {
		const { amqpService, creditAnalysisUseCase } = this;

		try {
			amqpService.openConsumer({
				queue: process.env.AMQP_QUEUE_LOAN_ENDED_PROCESSING,
				onMessage: async (msg) => {
					try {
						const message = JSON.parse(msg.content.toString());

						const { userID, result: statusID } = message;

						await creditAnalysisUseCase.processCreditAnalysisResult({ userID, statusID });
					} catch (error) {
						console.error(`[CreditAnalysisService startConsumingCreditAnalysisResults] Error on consuming. ${error}`);
					}
				}
			});

			onStart();
		} catch (error) {
			console.error(`[CreditAnalysisService startConsumingCreditAnalysisResults] Error when starting the consumer. ${error}`);
		}
	}

	async startNewCreditAnalysis({ userID, value, date }) {
		const { amqpService } = this;

		try {
			const loanMessage = new LoanMessage(userID, value, date);

			await amqpService.publishMessage({
				exchange: process.env.AMQP_EXCHANGE_LOANS,
				message: JSON.stringify(loanMessage),
				queue: process.env.AMQP_QUEUE_LOAN_START_PROCESSING,
				routingKey: process.env.AMQP_ROUTING_KEY
			});
		} catch (error) {
			console.error(`[CreditAnalysisService consumeProcessedCreditAnalysis] Error when starting a new credit analysis. ${error}`);
		}
	}
};