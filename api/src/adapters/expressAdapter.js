const HTTPStatus = require("../enums/HTTPStatus");

module.exports = class ExpressAdapter {
	static async handler({ callback = async () => { }, context, req, res, defaultStatus = HTTPStatus.OK, defaultData = {} }) {
		try {
			const result = await Promise.resolve(callback.bind(context)({ body: req.body, user: req.user }));

			res.status(result.status || defaultStatus).json({ ...result.data } || defaultData);

		} catch (error) {
			console.error(`[ExpressAdapter handler] Error. ${error}`);

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({});
		}
	}

	static authorizationChecker({ req, res, next, requiredRole }) {
		try {
			const { role } = req.user;

			if (role >= requiredRole) return next();

			return res.status(HTTPStatus.FORBIDDEN).json({});
		} catch (error) {
			console.error(`[ExpressAdapter authorizationChecker] Error. ${error}`);

			res.status(HTTPStatus.INTERNAL_SERVER_ERROR).json({});
		}
	}
};