const mysql = require('mysql2');
const config = require('../config/config');

const pool = mysql.createPool(config.database);

const promisePool = pool.promise();

// Test the connection
promisePool.getConnection()
  .then(connection => {
    console.log('✅ Database connected successfully!');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Database connection failed:', err.message);
    console.log('💡 Make sure MySQL is running and database exists');
  });

module.exports = promisePool;
