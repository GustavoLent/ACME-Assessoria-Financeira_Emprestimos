const HTTPStatus = require("../models/HTTPStatus");

module.exports = async function expressAdapter({ callback = async () => { }, context, req, res, defaultStatus = HTTPStatus.OK, defaultData = {} }) {

	try {
		const result = await callback.bind(context)(req);

		res.status(result.status || defaultStatus).json({ ...result.data } || defaultData);

	} catch (error) {
		console.error(`Error on controller "createLoan". ${error}`);

		res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({});
	}
};