const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');
const User = require('../models/User');

// Configure Nodemailer with SendGrid
const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key: <YOUR-API-KEY>,
    },
  })
);

// Login Page
exports.getLogin = (req, res) => {
  const message = req.flash('error');
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage: message.length > 0 ? message[0] : null,
    csrfToken: req.csrfToken()
  });
};

// Login POST
// Login POST
exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  User.findOne({ email: email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email');
        return res.redirect('/login');
      }

      bcrypt.compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.user = user;
            req.session.isLoggedIn = true;

            // Redirect to the projects page after successful login
            return req.session.save(err => {
              if (err) {
                console.log(err);
              }
              res.redirect('/projects'); // Redirect to the projects page
            });
          }
          req.flash('error', 'Invalid password');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });

    })
    .catch(err => console.log(err));
};


// Register Page
exports.getSignup = (req, res) => {
  const message = req.flash('error');
  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    errorMessage: message.length > 0 ? message[0] : null,
    csrfToken: req.csrfToken()
  });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);
  if(!errors.isEmpty()){
      console.log(errors.array());
      return res.status(422).render('auth/signup', {
          pageTitle: 'Signup',
          path: '/signup',
          errorMessage: errors.array()[0].msg
      });
  }
  User.findOne({email: email})
  .then(userDoc =>{
      if(userDoc){
          req.flash('error','E-mail Exists Alredy')
          return res.redirect('/signup');
      }
      return bcrypt
      .hash(password,12)
      .then(hashedPassword =>{
          const user = new User({
              email:email,
              password: hashedPassword,
              cart: {items: []}
          });
          return user.save();
      })
      .then(result =>{
          res.redirect('/login');
          return transporter.sendMail({
              to:email,
              from:'prasadbhavani823@gmail.com',
              subject:'Signup Succeded!',
              html: '<h1>You Successfully signed up!</h1>'
          });
      })
      .catch(err => console.log(err));
  })
  .catch(err => console.log(err));
};

// Logout
exports.postLogout = (req, res) => {
  req.session.destroy(err => {
    if (err) console.log(err);
    res.redirect('/');
  });
};

// Password Reset (Request Page)
exports.getReset = (req, res) => {
  const message = req.flash('error');
  res.render('auth/reset', {
    pageTitle: 'Reset Password',
    path: '/reset',
    errorMessage: message.length > 0 ? message[0] : null,
  });
};

// Password Reset (Request Submission)
exports.postReset = async (req, res) => {
  try {
    const buffer = crypto.randomBytes(32);
    const token = buffer.toString('hex');
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
      req.flash('error', 'No account found with that email.');
      return res.redirect('/reset');
    }

    user.resetToken = token;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    res.redirect('/');
    transporter.sendMail({
      to: req.body.email,
      from: 'prasadbhavani823@gmail.com',
      subject: 'Password Reset',
      html: `
        <p>You requested a password reset.</p>
        <p>Click this <a href="http://localhost:3000/reset/${token}">link</a> to reset your password.</p>
      `,
    });
  } catch (err) {
    console.error('Error during password reset request:', err);
    res.redirect('/reset');
  }
};

// New Password Page
exports.getNewPassword = async (req, res) => {
  const token = req.params.resetToken;

  try {
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      req.flash('error', 'Token expired or invalid.');
      return res.redirect('/reset');
    }

    res.render('auth/new-password', {
      pageTitle: 'New Password',
      path: '/new-password',
      errorMessage: null,
      userId: user._id.toString(),
      passwordToken: token,
    });
  } catch (err) {
    console.error('Error getting new password page:', err);
    res.redirect('/reset');
  }
};

// New Password Submission
exports.postNewPassword = async (req, res) => {
  const { password, userId, passwordToken } = req.body;

  try {
    const user = await User.findOne({
      _id: userId,
      resetToken: passwordToken,
      resetTokenExpiration: { $gt: Date.now() },
    });

    if (!user) {
      req.flash('error', 'Invalid or expired token.');
      return res.redirect('/reset');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;

    await user.save();
    res.redirect('/login');
  } catch (err) {
    console.error('Error updating password:', err);
    res.redirect('/reset');
  }
};
