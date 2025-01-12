const Task = require('../models/Task');
const Project = require('../models/Project');

exports.getTasks = async (req, res) => {
  const projects = await Project.find();
  const tasks = await Task.find().populate('project');
  res.render('pages/tasks', { title: 'Tasks', projects, tasks });
};

exports.createTask = async (req, res) => {
  const { name, status, project } = req.body;
  const newTask = new Task({ name, status, project });
  await newTask.save();
  res.redirect('/tasks');
};
