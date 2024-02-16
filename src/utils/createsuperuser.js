import readline from 'readline'
import dotenv from 'dotenv'
import mongoose from 'mongoose';
import Auth from '../model/auth.js';
import { createHash } from './bcrypt.js';
dotenv.config()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const getUserInputStep1 = async () => {
    const allAdmin = await Auth.find()
    const find = allAdmin.find(e => e.status == 'superAdmin')
    if (!find) {
        rl.question('Step 1: Please enter Username: ', async (username) => {
            await getUserInputStep2(username);
        });
    } else {
        console.log('SuperAdmin mavjud...')
        rl.close();
        process.exit();
    }
}

const getUserInputStep2 = async (username) => {
    rl.question('Step 2: Please enter password: ', async (password) => {
        await Auth.create({
            auth_login: username,
            auth_password: await createHash(password),
            status: 'superAdmin'
        })
        console.log('Create Super User...')
        rl.close();
        process.exit();
    });
}

(async () => {
    await getUserInputStep1();
})();


// Bu file Yengi Eng kotta super Admin yaratish uchun ishlatilinadi.
// Bu hech qaysi file ga ulanmaydi. Faqat terminal orqali foydalanadi
