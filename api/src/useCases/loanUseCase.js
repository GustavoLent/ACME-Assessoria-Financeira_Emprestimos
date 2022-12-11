const assert = require("assert");

const AMQPService = require("../services/amqpService");
const HTTPResponse = require("../models/HTTPResponse");
const HTTPStatus = require("../enums/HTTPStatus");
const LoansRepository = require("../repositories/loansRepository");
const LoanMessage = require("../models/LoanMessage");

const now = () => {
	const date = new Date();

	let year = date.getFullYear();
	let month = ("0" + (date.getMonth() + 1)).slice(-2);
	let day = ("0" + date.getDate()).slice(-2);
	let hour = date.getHours();
	let minute = date.getMinutes();
	let seconds = date.getSeconds();

	return `${year}-${month}-${day} ${hour}:${minute}:${seconds}`;
};

module.exports = class LoanUseCase {
	constructor(amqpService, loansRepository) {
		assert(amqpService instanceof AMQPService);
		assert(loansRepository instanceof LoansRepository);

		this.amqpService = amqpService;
		this.loansRepository = loansRepository;
	}

	async createLoan({ body, user }) {
		const { loansRepository, amqpService } = this;

		if (!body) {
			return new HTTPResponse({ status: HTTPStatus.BAD_REQUEST, data: { message: "Missing loan informations" } });
		}

		if (!body.value) {
			return new HTTPResponse({ status: HTTPStatus.BAD_REQUEST, data: { message: "Missing loan value" } });
		}

		try {
			const { id: userID } = user;

			const userOpenLoans = await loansRepository.findUserOpenLoans({ userID });

			if (userOpenLoans.length > 0) {
				return new HTTPResponse({ status: HTTPStatus.BAD_REQUEST, data: { message: "User already has open loans processing" } });
			}

			const { value } = body;
			const date = now();
			const loanMessage = new LoanMessage(userID, value, date);

			await amqpService.publishMessage({
				exchange: process.env.AMQP_EXCHANGE_LOANS,
				message: JSON.stringify(loanMessage),
				queue: process.env.AMQP_EXCHANGE_LOAN_PROCESSING
			});

			await loansRepository.insertNewLoan({ userID, value, date });

			return new HTTPResponse({ status: HTTPStatus.OK, data: { message: "Message published" } });
		} catch (e) {
			console.error("Error in createLoan. ", e);

			const status = e.statusCode ? e.statusCode : HTTPStatus.INTERNAL_SERVER_ERROR;
			const message = e.message ? e.message : "Unexpected error when creating the loan ";

			return new HTTPResponse({ status, data: { message } });
		}
	}

	async getLoans() {
		const { loansRepository } = this;

		try {
			const loans = await loansRepository.findAllLoans();
			return new HTTPResponse({ status: HTTPStatus.OK, data: { loans } });
		} catch (e) {
			console.error("Error in getLoans. ", e);

			const status = e.statusCode ? e.statusCode : HTTPStatus.INTERNAL_SERVER_ERROR;
			const message = e.message ? e.message : "Unexpected error when creating the loan ";

			return new HTTPResponse({ status, data: { message } });
		}

	}
};