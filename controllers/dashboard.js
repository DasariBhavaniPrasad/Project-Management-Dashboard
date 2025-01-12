const Project = require('../models/Project');
const Task = require('../models/Task');

exports.getDashboard = async (req, res) => {
  const projects = await Project.find();
  const tasks = await Task.find().populate('project');
  res.render('pages/dashboard', { title: 'Dashboard', projects, tasks });
};
