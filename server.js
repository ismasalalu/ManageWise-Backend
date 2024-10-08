// =================================== DEPENDENCY =====================================
const express = require('express');
const cors = require('cors');
const path = require('path');
const Mongob = require('./utils/mongodb/mongodb.js');
const multer = require('multer');

//==================================== ROUTES =========================================
//const test = require('./routes/test/test');
const userAuth = require('./routes/auth/userAuth.js');
const DDdata = require('./routes/dashboard/DData.js');
const update = require('./routes/update/update.js');
const admin = require('./routes/admin/admin.js');
const task = require('./routes/task/task.js');

// ===================================================================================

const app = express();

// Middleware to handle CORS
app.use(cors());

// Parse JSON bodies for all routes
app.use(express.json());

// Parse URL-encoded bodies for all routes
app.use(express.urlencoded({ extended: true }));

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, 'client/build')));

    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
    });
}

// =================================== WHERE API ROUTES START =====================================================

app.get('/', (req, res) => {
  res.jsonp({message: "Hello, from izz"});
});

//app.use("/test", test);

app.use('/auth', userAuth);                 // user authentication related routes
app.use('/api/data', DDdata);               // dashboard data related routes
app.use('/api/task', task);                 // task related routes
app.use('/update', update);                 // update related routes
app.use('/api/admin', admin);               // admin related routes
//app.use('/api/archive', archive);           // archive related routes

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// =================================== 404 Not Found Handler ========================================
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;
