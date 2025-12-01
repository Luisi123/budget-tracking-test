const mongoose = require("mongoose");

const MODELNAME = "project";

const Schema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  budget: { type: Number, required: true },
  userId: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const OBJ = mongoose.model(MODELNAME, Schema);
module.exports = OBJ;
