const mysql = require("mysql2");
const APIException = require("../models/APIException");
const HTTPStatus = require("../enums/HTTPStatus");

module.exports = class DatabaseService {
	constructor() {
		this.connection = undefined;
	}

	async connect({ host = "", user = "", database = "", password = "", port = 0 }) {
		const pool = mysql.createPool({ host, user, database, password, port });
		this.connection = pool.promise();

		return Promise.resolve();
	}

	async runQuery({ query = "", values = [] }) {
		try {
			const result = await this.connection.execute(query, values);

			return result[0];
		} catch (error) {
			console.error(`[DatabaseService runQuery] Error. ${error}`);

			throw new APIException({ message: "Error when querying the database!", status: HTTPStatus.INTERNAL_SERVER_ERROR });
		}
	}
};