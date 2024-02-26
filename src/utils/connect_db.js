const mongoose = require('mongoose')

module.exports.connectDB = async (app, PORT, DB) => {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        }).catch(console.log)
        app.listen(PORT, () => console.log(`Server run: ${PORT}`));
    } catch (error) {
        console.log('Serverda xatolik yuz berdi', error.message);
        process.exit(1);
    }
};
