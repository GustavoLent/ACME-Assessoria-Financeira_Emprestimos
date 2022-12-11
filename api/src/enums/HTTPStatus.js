module.exports = {
	/** Request sucessfully ended */
	OK: 200,

	/** Client syntax error */
	BAD_REQUEST: 400,

	/** An authentication is needed */
	UNAUTHORIZED: 401,

	/** The user does not have authorization to access the content */
	FORBIDDEN: 403,

	/** Server unexpected error */
	INTERNAL_SERVER_ERROR: 500,
};