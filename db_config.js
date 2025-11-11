const mysql = require('mysql');

// معلومات الاتصال بقاعدة البيانات
const dbConfig = {
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'am_store',
};

// إنشاء اتصال بقاعدة البيانات
const connection = mysql.createConnection(dbConfig);

// الاتصال بقاعدة البيانات
connection.connect((err) => {
    if (err) {
        console.error('Error connecting to database: ' + err.stack);
        return;
    }

    console.log('Connected to database as id ' + connection.threadId);
});

module.exports = connection;