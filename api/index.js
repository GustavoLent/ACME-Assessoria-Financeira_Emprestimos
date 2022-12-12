const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const LoanRouter = require("./src/httpRouters/loanRouter");
const LoansRepository = require("./src/repositories/loansRepository");
const AMQPService = require("./src/services/amqpService");
const AuthorizationService = require("./src/services/authorizationService");
const CreditAnalysisService = require("./src/services/creditAnalysisService");
const DatabaseService = require("./src/services/databaseService");
const HTTPService = require("./src/services/httpService");
const CreditAnalysisUseCase = require("./src/useCases/creditAnalysisUseCase");
const LoanUseCase = require("./src/useCases/loanUseCase");

(async function main() {
	try {
		const amqpService = new AMQPService();
		await amqpService.openConnection({ amqpUrl: process.env.AMQP_URL });
		console.info("Connected on AMQP");

		const databaseService = new DatabaseService();
		await databaseService.connect({
			host: process.env.DATABASE_HOST,
			user: process.env.DATABASE_USERS,
			database: process.env.DATABASE,
			password: process.env.DATABASE_PASSWORD,
			port: process.env.DATABASE_PORT,
		});
		console.info("Connected on Database");

		const loansRepository = new LoansRepository(databaseService);

		const creditAnalysisUseCase = new CreditAnalysisUseCase(loansRepository);
		const creditAnalysisService = new CreditAnalysisService(amqpService, creditAnalysisUseCase);

		await creditAnalysisService.startConsumingCreditAnalysisResults({
			onStart: () => console.info("Started consuming the Credit Analysis Results")
		});

		const loanUseCase = new LoanUseCase(creditAnalysisService, loansRepository);
		const { createLoan, getLoans } = loanUseCase;

		const loanRouter = LoanRouter.getRouter({ createLoan, getLoans, context: loanUseCase });

		HTTPService.startServer({
			authorizationFunction: AuthorizationService.decode,
			onStart: () => console.log(`HTTP listening on port ${process.env.HTTP_PORT}`),
			port: process.env.HTTP_PORT,
			routers: [loanRouter],
		});

	} catch (error) {
		console.error(`[main] Error when initializing the API! ${error}`);
	}
})();

