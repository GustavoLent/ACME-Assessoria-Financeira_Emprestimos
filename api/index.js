
const LoanRouter = require("./src/httpRouters/loanRoutes");
const AMQPService = require("./src/services/amqpService");
const DatabaseService = require("./src/services/databaseService");
const HTTPService = require("./src/services/httpService");
const LoanUseCase = require("./src/useCases/loanUseCase");

(async function main() {
	try {
		const amqpService = new AMQPService();
		await amqpService.openConnection({ amqpUrl: "amqp://localhost:5673" });
		console.info("- Connected on AMQP");

		const databaseService = new DatabaseService();
		await databaseService.connect({ host: "localhost", user: "root", database: "loans", password: "123456", port: 6033 });
		console.info("- Connected on Database");

		const loanUseCase = new LoanUseCase(amqpService, databaseService);
		const { createLoan, getLoans } = loanUseCase;

		const loanRouter = LoanRouter.getRouter({ createLoan, getLoans, context: loanUseCase });

		HTTPService.startServer({
			routers: [loanRouter],
			port: 3000,
			onStart: () => console.log(`- HTTP listening on port ${3000}`)
		});

	} catch (error) {
		console.error(`Error when initializing the API! ${error}`);
	}
})();

