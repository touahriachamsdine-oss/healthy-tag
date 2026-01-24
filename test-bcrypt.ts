
import bcrypt from 'bcryptjs';

async function test() {
    try {
        const password = 'pass';
        const hash = await bcrypt.hash(password, 12);
        console.log('Hash produced:', hash);
        const match = await bcrypt.compare(password, hash);
        console.log('Comparison match:', match);
        process.exit(0);
    } catch (error) {
        console.error('Bcrypt test failed:', error);
        process.exit(1);
    }
}

test();
