const path = require('path');

// File upload logic
exports.getUploadPage = (req, res) => {
  res.render('pages/upload', { title: 'File Upload' });
};

// Handles file upload
exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).send('No file uploaded.');
  }
  res.send(`File uploaded successfully: ${req.file.filename}`);
};

// Retrieves uploaded files
exports.getFiles = (req, res) => {
  const uploadsDir = path.join(__dirname, '../public/uploads');
  const fs = require('fs');

  fs.readdir(uploadsDir, (err, files) => {
    if (err) {
      return res.status(500).send('Unable to retrieve files.');
    }
    res.render('pages/files', { title: 'Uploaded Files', files });
  });
};
