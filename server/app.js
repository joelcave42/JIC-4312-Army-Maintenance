const express = require('express');
const app = express();
const faultRoutes = require('./routes/faults');

// ... other middleware ...

// This is important - how are you mounting the routes?
app.use('/api/v1/faults', faultRoutes);  // Should be something like this 