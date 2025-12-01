const express = require("express");
const passport = require("passport");
const router = express.Router();

const ProjectObject = require("../models/project");
const ERROR_CODES = require("../utils/errorCodes");
const { capture } = require("../services/sentry");

// Create a new project
router.post("/", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { name, budget } = req.body;

    if (!name || !budget) {
      return res.status(400).send({ ok: false, code: ERROR_CODES.INVALID_BODY });
    }

    const project = await ProjectObject.create({
      name,
      budget,
      userId: req.user._id,
    });

    return res.status(200).send({ ok: true, data: project });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Get all projects for the authenticated user
router.get("/", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const projects = await ProjectObject.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return res.status(200).send({ ok: true, data: projects });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Get a single project by ID
router.get("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const project = await ProjectObject.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!project) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    return res.status(200).send({ ok: true, data: project });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Delete a project
router.delete("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const ExpenseObject = require("../models/expense");
    const project = await ProjectObject.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!project) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    // Delete all expenses associated with this project
    await ExpenseObject.deleteMany({ projectId: req.params.id });
    
    await ProjectObject.findOneAndDelete({ _id: req.params.id });
    return res.status(200).send({ ok: true });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

// Update a project
router.put("/:id", passport.authenticate("user", { session: false }), async (req, res) => {
  try {
    const { name, budget } = req.body;
    const project = await ProjectObject.findOne({ _id: req.params.id, userId: req.user._id });
    
    if (!project) {
      return res.status(404).send({ ok: false, code: ERROR_CODES.NOT_FOUND });
    }

    if (name) project.name = name;
    if (budget !== undefined) project.budget = budget;
    
    await project.save();
    return res.status(200).send({ ok: true, data: project });
  } catch (error) {
    capture(error);
    return res.status(500).send({ ok: false, code: ERROR_CODES.SERVER_ERROR, error });
  }
});

module.exports = router;
