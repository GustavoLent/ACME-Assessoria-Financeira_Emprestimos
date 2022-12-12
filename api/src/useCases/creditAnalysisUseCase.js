const assert = require("assert");

const LoansRepository = require("../repositories/loansRepository");

module.exports = class CreditAnalysisUseCase {
	constructor(loansRepository) {
		assert(loansRepository instanceof LoansRepository);

		this.loansRepository = loansRepository;
	}

	async updateLoanStatus({ userID = 0, statusID = 0 }) {
		try {
			await this.loansRepository.updateLoanStatus({ userID, statusID });

			console.info(`[CreditAnalysisUseCase updateLoanStatus] updated successfully the loan for user ${userID}`);
		} catch (e) {
			console.error(`[CreditAnalysisUseCase updateLoanStatus] Error on user ${userID}. ${e}`);
		}
	}
};