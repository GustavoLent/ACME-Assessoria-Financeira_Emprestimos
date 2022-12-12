const assert = require("assert");

const LoansRepository = require("../repositories/loansRepository");
const LoanStatus = require("../enums/loanStatus");
const FinancialService = require("../services/financialService");

module.exports = class CreditAnalysisUseCase {
	constructor(loansRepository, financialService) {
		assert(financialService instanceof FinancialService);
		assert(loansRepository instanceof LoansRepository);

		this.financialService = financialService;
		this.loansRepository = loansRepository;
	}

	async processCreditAnalysisResult({ userID = 0, statusID = 0 }) {
		console.info(`processCreditAnalysisResult userID ${userID} statusID ${statusID}`);

		try {
			const res = await this.loansRepository.findUserOpenLoans({ userID });

			if (res.length > 0) {
				const loan = res[0];

				const { ID, value } = loan;

				if (statusID == LoanStatus.APPROVED) {
					console.info("statusID === LoanStatus.APPROVED");

					await this.financialService.postLoanGranted({ userID, value });
				}

				await this.loansRepository.updateLoanStatus({ ID, statusID });

				console.info(`[CreditAnalysisUseCase updateLoanStatus] updated successfully the loan for user ${userID}`);
				return;
			}

			console.info(`[CreditAnalysisUseCase updateLoanStatus] Not found any open loan for user ${userID}`);
		} catch (e) {
			console.error(`[CreditAnalysisUseCase updateLoanStatus] Error on user ${userID}. ${e}`);
		}
	}
};