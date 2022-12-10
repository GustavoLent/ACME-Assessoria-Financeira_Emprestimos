const jwt = require("jsonwebtoken");

module.exports = class AuthorizationService {
	static decode({ token }) {
		return jwt.verify(token, process.env.HTTP_JWT_SECRET);
	}
};