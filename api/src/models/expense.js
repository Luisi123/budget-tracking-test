const mongoose = require("mongoose");

const MODELNAME = "expense";

const Schema = new mongoose.Schema({
  projectId: { type: String, required: true },
  amount: { type: Number, required: true },
  category: { type: String, trim: true },
  description: { type: String, trim: true },
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
