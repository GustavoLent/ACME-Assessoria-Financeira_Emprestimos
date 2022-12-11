const express = require("express");
const HTTPStatus = require("../enums/HTTPStatus");

module.exports = class HTTPService {

	static startServer({
		onStart = () => { },
		// eslint-disable-next-line no-unused-vars
		authorizationFunction = ({ token = "" }) => { },
		port = 0,
		routers = []
	}) {
		const app = express();

		app.use(express.json());
		app.use((req, res, next) => {
			try {

				const token = req.headers["authorization"];
				req["user"] = authorizationFunction({ token });

				return next();
			} catch (_) { /* empty */ }

			return res.status(HTTPStatus.UNAUTHORIZED).json({ message: "Authentication is required" });
		});

		for (const router of routers) {
			app.use(router);
		}

		app.listen(port, onStart);
	}

};