const assert = require("assert");

const AMQPService = require("../services/amqpService");
const DatabaseService = require("../services/databaseService");
const HTTPStatus = require("../models/HTTPStatus");
const HTTPResponse = require("../models/HTTPResponse");

const loans = [];

module.exports = class LoanUseCase {
	constructor(amqpService, databaseService) {
		assert(amqpService instanceof AMQPService);
		assert(databaseService instanceof DatabaseService);

		this.amqpService = amqpService;
		this.databaseService = databaseService;
	}

	async createLoan(req) {
		const { databaseService, amqpService } = this;

		if (!req.body) {
			return new HTTPResponse({ status: HTTPStatus.BAD_REQUEST, data: { message: "Missing loan informations" } });
		}

		if (!req.body.username) {
			return new HTTPResponse({ status: HTTPStatus.BAD_REQUEST, data: { message: "Missing username" } });
		}

		if (!req.body.loanvalue) {
			return new HTTPResponse({ status: HTTPStatus.BAD_REQUEST, data: { message: "Missing loanvalue" } });
		}

		const { username, loanvalue } = req.body;
		const loan = { username, loanvalue };

		const found = loans.find(openLoan => openLoan.username === username);

		if (found) {
			return new HTTPResponse({ status: HTTPStatus.BAD_REQUEST, data: { message: "Loan already started" } });
		}

		try {
			const dbRes = await databaseService.findLoans();
			console.log(dbRes);

			await amqpService.publishMessage({
				exchange: process.env.AMQP_EXCHANGE_LOANS,
				message: JSON.stringify(loan),
				queue: process.env.AMQP_EXCHANGE_LOAN_PROCESSING
			});

			loans.push(loan);

			return new HTTPResponse({ status: HTTPStatus.OK, data: { message: "Message published" } });
		} catch (e) {
			console.error("Error in createLoan. ", e);

			const status = e.statusCode ? e.statusCode : HTTPStatus.INTERNAL_SERVER_ERROR;
			const message = e.message ? e.message : "Unexpected error when creating the loan ";

			return new HTTPResponse({ status, data: { message } });
		}
	}

	async getLoans(req) {
		return new HTTPResponse({ status: HTTPStatus.OK, data: { message: JSON.stringify(loans, null, 2) } });
	}
};