const express = require("express");
const expressAdapter = require("../adapters/expressAdapter");

module.exports = class LoanRouter {
	// eslint-disable-next-line no-unused-vars
	static getRouter({ createLoan = async (req, res) => { }, getLoans = async (req, res) => { }, context }) {
		const router = express.Router();

		router.post("/createLoan", async (req, res) => await expressAdapter({ callback: createLoan, context, req, res }));
		router.get("/getLoans", async (req, res) => await expressAdapter({ callback: getLoans, context, req, res }));

		return router;
	}
};