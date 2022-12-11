const path = require("path");

require("dotenv").config({ path: path.resolve(__dirname, ".env") });

const LoanRouter = require("./src/httpRouters/loanRouter");
const LoansRepository = require("./src/repositories/loansRepository");
const AMQPService = require("./src/services/amqpService");
const AuthorizationService = require("./src/services/authorizationService");
const DatabaseService = require("./src/services/databaseService");
const HTTPService = require("./src/services/httpService");
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

		const loanUseCase = new LoanUseCase(amqpService, loansRepository);
		const { createLoan, getLoans } = loanUseCase;

		const loanRouter = LoanRouter.getRouter({ createLoan, getLoans, context: loanUseCase });

		HTTPService.startServer({
			authorizationFunction: AuthorizationService.decode,
			onStart: () => console.log(`HTTP listening on port ${process.env.HTTP_PORT}`),
			port: process.env.HTTP_PORT,
			routers: [loanRouter],
		});

	} catch (error) {
		console.error(`Error when initializing the API! ${error}`);
	}
})();

