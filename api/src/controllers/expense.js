const express = require("express");
const passport = require("passport");
const router = express.Router();

const ExpenseObject = require("../models/expense");
const ProjectObject = require("../models/project");
const ERROR_CODES = require("../utils/errorCodes");
const { capture } = require("../services/sentry");

// Create a new expense
router.post("/", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { projectId, amount, category, description } = req.body;

    if (!projectId || !amount) {
      return res.status(400).send({ ok: false, code: ERROR_CODES.INVALID_BODY });
    }

    // Verify the project belongs to the user
    const project = await ProjectObject.findOne({ _id: projectId, userId: req.user._id });
    if (!project) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    const expense = await ExpenseObject.create({
      projectId,
      amount,
      category: category || "Uncategorized",
      description: description || "",
    });

    return res.status(200).send({ ok: true, data: expense });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Get all expenses for a specific project
router.get("/project/:projectId", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { projectId } = req.params;

    // Verify the project belongs to the user
    const project = await ProjectObject.findOne({ _id: projectId, userId: req.user._id });
    if (!project) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    const expenses = await ExpenseObject.find({ projectId }).sort({ date: -1 });
    return res.status(200).send({ ok: true, data: expenses });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Get a single expense by ID
router.get("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const expense = await ExpenseObject.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    // Verify the expense's project belongs to the user
    const project = await ProjectObject.findOne({ _id: expense.projectId, userId: req.user._id });
    if (!project) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    return res.status(200).send({ ok: true, data: expense });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Delete an expense
router.delete("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const expense = await ExpenseObject.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    // Verify the expense's project belongs to the user
    const project = await ProjectObject.findOne({ _id: expense.projectId, userId: req.user._id });
    if (!project) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    await ExpenseObject.findByIdAndDelete(req.params.id);
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Update an expense
router.put("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { amount, category, description } = req.body;
    const expense = await ExpenseObject.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    // Verify the expense's project belongs to the user
    const project = await ProjectObject.findOne({ _id: expense.projectId, userId: req.user._id });
    if (!project) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    if (amount !== undefined) expense.amount = amount;
    if (category !== undefined) expense.category = category;
    if (description !== undefined) expense.description = description;
    
    await expense.save();
    return res.status(200).send({ ok: true, data: expense });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

module.exports = router;
