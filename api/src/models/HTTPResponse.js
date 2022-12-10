module.exports = class HTTPResponse {
	constructor({ status, data }) {
		this.status = status;
		this.data = data;
	}
};