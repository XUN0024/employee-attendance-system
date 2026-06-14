const bcrypt = require('bcryptjs');

async function hashPassword(password) {
    const saltRounds = 10;
    const hash = await bcrypt.hash(password, saltRounds);
    console.log(`Password: ${password}`);
    console.log(`Hashed: ${hash}`);
    console.log(`\nSQL Update Command:`);
    console.log(`UPDATE employees SET employee_password = '${hash}' WHERE employee_id = 'ADMIN001';`);
}

// Hash the admin password
hashPassword('admin123');
