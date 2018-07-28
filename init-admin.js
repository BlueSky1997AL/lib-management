const DB = require('nedb');
const db = new DB({ filename: 'Lib_DB', autoload: true });

const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'password';

db.insert(
    { type: 'admin', username: ADMIN_USERNAME, password: ADMIN_PASSWORD },
    () => {
        console.log(`Already insert admin user "${ADMIN_USERNAME}", password is "${ADMIN_PASSWORD}"`);
    }
);