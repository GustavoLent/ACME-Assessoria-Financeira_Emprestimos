const HTTPStatus = require("./HTTPStatus")

module.exports = class HTTPResponse {
    static response({ res, status, body }) {
        return res.status(status).json(...body)
    }

    static ok({ res, body }) {
        return HTTPResponse.response({ res, status: HTTPStatus.OK, body })
    }

    static error({ res, body }) {
        return HTTPResponse.response({ res, status: HTTPStatus.INTERNAL_SERVER_ERROR, body })
    }
}