const express = require("express");

module.exports = class HTTPService {

	static startServer({ onStart = () => { }, port = 0, routers = [], }) {
		const app = express();

		app.use(express.json());

		for (const router of routers) {
			app.use(router);
		}

		app.listen(port, onStart);
	}

};