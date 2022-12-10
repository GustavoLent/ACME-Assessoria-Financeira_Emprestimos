module.exports = class LoanMessage {
	constructor(userID, value, date) {
		this.userID = userID;
		this.value = value;
		this.date = date;
	}
};