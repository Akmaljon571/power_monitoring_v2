const readline = require('readline')
const mongoose = require('mongoose')
const { adminModel } = require('../models/admin')
const bcrypt = require('bcryptjs')
require('dotenv').config()

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

mongoose.connect(process.env.DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const getUserInputStep1 = async () => {
    const allAdmin = await adminModel.find()
    const find = allAdmin.find(e => e.role == 'admin')
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
        const salt = await bcrypt.genSalt(10);
        await adminModel.create({
            name: "Admin",
            login: username,
            password: await bcrypt.hash(password, salt),
            role: 'admin'
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
