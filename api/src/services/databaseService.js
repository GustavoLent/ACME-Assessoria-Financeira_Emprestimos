const mysql = require('mysql2/promise');
const APIException = require('../models/APIException');
const HTTPStatus = require('../models/HTTPStatus');

module.exports = class DatabaseService {

    async connect() {
        return await mysql.createConnection({ host: 'localhost', user: 'root', database: 'loans', password: "123456", port: 6033 });
    }

    async findLoans(connection) {
        try {
            const result = await connection.execute('SELECT * FROM loans');

            return result[0]
        } catch (error) {
            console.error(error)
            throw new APIException("Error when querying the database!", HTTPStatus.INTERNAL_SERVER_ERROR)
        }
    }

}