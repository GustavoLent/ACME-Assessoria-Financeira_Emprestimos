const assert = require("assert");

const HTTPResponse = require("../models/HTTPResponse");
const HTTPStatus = require("../enums/HTTPStatus");
const LoansRepository = require("../repositories/loansRepository");
const CreditAnalysisService = require("../services/creditAnalysisService");

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
	constructor(creditAnalysisService, loansRepository) {
		assert(creditAnalysisService instanceof CreditAnalysisService);
		assert(loansRepository instanceof LoansRepository);

		this.creditAnalysisService = creditAnalysisService;
		this.loansRepository = loansRepository;
	}

	async createLoan({ body, user }) {
		const { creditAnalysisService, loansRepository } = this;

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

			await creditAnalysisService.startNewCreditAnalysis({ userID, value, date });

			await loansRepository.insertNewLoan({ userID, value, date });

			return new HTTPResponse({ status: HTTPStatus.OK, data: { message: "Message published" } });
		} catch (e) {
			console.error(`[LoanUseCase createLoan] Error. ${e}`);

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
			console.error(`[LoanUseCase getLoans] Error. ${e}`);

			const status = e.statusCode ? e.statusCode : HTTPStatus.INTERNAL_SERVER_ERROR;
			const message = e.message ? e.message : "Unexpected error when creating the loan ";

			return new HTTPResponse({ status, data: { message } });
		}

	}

	async processCreditAnalysis({ userID = 0, statusID = "" }) {
		try {
			await this.loansRepository.updateLoanStatus({ userID, statusID });

			console.info(`[LoanUseCase processCreditAnalysis] updated successfully the loan for user ${userID}`);
		} catch (e) {
			console.error(`[LoanUseCase processCreditAnalysis] Error on user ${userID}. ${e}`);
		}
	}
};