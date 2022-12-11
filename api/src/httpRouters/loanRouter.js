const express = require("express");
const ExpressAdapter = require("../adapters/expressAdapter");
const RoleLevels = require("../enums/RoleLevels");

module.exports = class LoanRouter {
	// eslint-disable-next-line no-unused-vars
	static getRouter({ createLoan = async (req, res) => { }, getLoans = async (req, res) => { }, context }) {
		const router = express.Router();

		router.post(
			"/createLoan",
			async (req, res) => await ExpressAdapter.handler({ callback: createLoan, context, req, res })
		);

		router.get(
			"/getLoans",
			(req, res, next) => ExpressAdapter.authorizationChecker({ req, res, next, requiredRole: RoleLevels.ADMIN }),
			async (req, res) => await ExpressAdapter.handler({ callback: getLoans, context, req, res })
		);

		return router;
	}
};