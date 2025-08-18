const bcrypt = require('bcryptjs');

async function testPassword() {
    const plainPassword = 'admin123';
    const storedHash = '$2b$10$GTkFXXk7whyq.4R38KaJ6.vzx8Cy0wot9xktbWZFMn8evv0K38dF2';
    
    console.log('Testing password verification...');
    console.log('Plain password:', plainPassword);
    console.log('Stored hash:', storedHash);
    
    try {
        const isValid = await bcrypt.compare(plainPassword, storedHash);
        console.log('Password valid:', isValid);
    } catch (error) {
        console.error('Error:', error.message);
    }
}

testPassword();
