const mysql = require("mysql2");
const APIException = require("../models/APIException");
const HTTPStatus = require("../models/HTTPStatus");

module.exports = class DatabaseService {
	constructor() {
		this.connection = undefined;
	}

	async connect({ host = "", user = "", database = "", password = "", port = 0 }) {
		const pool = mysql.createPool({ host, user, database, password, port });
		this.connection = pool.promise();

		return Promise.resolve();
	}

	async findLoans() {
		const { connection } = this;

		try {
			const result = await connection.execute("SELECT * FROM loans");

			return result[0];
		} catch (error) {
			console.error(error);
			throw new APIException("Error when querying the database!", HTTPStatus.INTERNAL_SERVER_ERROR);
		}
	}
};