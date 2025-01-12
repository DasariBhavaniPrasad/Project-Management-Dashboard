const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const path = require('path');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const projectRoutes = require('./routes/project');
const taskRoutes = require('./routes/task');
const uploadRoutes = require('./routes/upload');
const errorController = require('./controllers/error');

const User = require('./models/User');

const MONGODB_URI = 'mongodb+srv://BhavaniPrasad:bhavani1@mongodb.pquf7qp.mongodb.net/ProjectManagementDashboard?retryWrites=true&w=majority&appName=MongoDB';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions',
});

const csrfProtection = csrf();

app.set('view engine', 'ejs');
app.set('views', 'views');

// Middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'my secret',
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);


app.use(csrfProtection);
app.use(flash());

// Add user to `req` if logged in
app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      if (user) {
        req.user = user;
      }
      next();
    })
    .catch((err) => console.log(err));
});

// Add local variables for templates
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// Routes
app.get('/', (req, res, next) => {
  res.render('dashboard/home', { pageTitle: 'Home', path: '/' });
});
app.use('/', authRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/projects', projectRoutes);
app.use('/tasks', taskRoutes);
app.use('/upload', uploadRoutes);

app.use(errorController.get404);

// Database Connection and Server Startup
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB Atlas...');
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.log(err);
  });
