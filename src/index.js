require('dotenv').config();
const http = require('http');
const app = require('./app');
const { initSocket } = require('./config/socket');
const db = require('./models');

const server = http.createServer(app);
initSocket(server);

const PORT = process.env.PORT || 3001;

db.sequelize
  .authenticate()
  .then(() => {
    console.log('Database connected successfully');
    return db.sequelize.sync({ alter: process.env.NODE_ENV === 'development' });
  })
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Resonance Backend running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to start server:', err);
    process.exit(1);
  });
