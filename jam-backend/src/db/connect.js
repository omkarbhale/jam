const mongoose = require("mongoose");

module.exports = async () => {
	await mongoose.connect(process.env.MONGODB_URI);
	console.log("Connected to MongoDB");
};
