const Project = require('../models/Project');

// Get Projects Page
exports.getProjects = (req, res, next) => {
  const userId = req.session.user._id; // Get the logged-in user's ID

  // Fetch projects assigned to the user
  Project.find({ assignedUsers: userId }) // Assuming 'assignedUsers' field in Project model
    .then(projects => {
      res.render('pages/projects', {
        pageTitle: 'Projects',
        path: '/projects',
        projects: projects // Pass projects to the view
      });
    })
    .catch(err => {
      console.log(err);
      res.redirect('/');
    });
};


exports.createProject = async (req, res) => {
  const { name, description, deadline, priority } = req.body;
  const newProject = new Project({ name, description, deadline, priority });
  await newProject.save();
  res.redirect('/projects');
};
