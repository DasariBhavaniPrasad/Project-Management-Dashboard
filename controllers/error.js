// Handles 404 errors
exports.get404 = (req, res) => {
    res.status(404).render('pages/404', { title: 'Page Not Found' });
  };
  
  // Handles other server errors
  exports.get500 = (err, req, res, next) => {
    console.error(err.stack); // Log error details for debugging
    res.status(500).render('pages/500', { title: 'Server Error' });
  };
  