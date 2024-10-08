'use strict';
const app = require('./app');

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, _ => {
    console.log(`Server running on port ${PORT}`);
});