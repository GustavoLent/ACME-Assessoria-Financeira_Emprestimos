const assert = require("assert");

const DatabaseService = require("../services/databaseService");


module.exports = class LoansRepository {
	constructor(databaseService) {
		assert(databaseService instanceof DatabaseService);

		this.databaseService = databaseService;
	}

	async findAllLoans() {
		return await this.databaseService.runQuery({
			query: "select l.value, l.userID, l.`date`, s.description from loans.loans l join loans.status s on l.statusID = s.ID ORDER BY l.`date`;"
		});
	}

	async findUserOpenLoans({ userID }) {
		const openLoanStatus = [process.env.DATABASE_STATUS_STARTED, process.env.DATABASE_STATUS_PENDING].join(",");

		return await this.databaseService.runQuery({
			query: "select * from loans.loans where statusID in (?) and userID = ?;",
			values: [openLoanStatus, userID]
		});
	}

	async findUserLoans({ userID }) {
		return await this.databaseService.runQuery({
			query: "select l.value, l.date, s.description from loans.loans l join loans.status s where userID = ?;",
			values: [userID]
		});
	}

	async insertNewLoan({ userID, value, date }) {
		const statusID = process.env.DATABASE_STATUS_STARTED;

		return await this.databaseService.runQuery({
			query: "INSERT INTO loans.loans (userID, value, `date`, statusID) VALUES(?, ?, ?, ?);",
			values: [userID, value, date, statusID]
		});
	}
};