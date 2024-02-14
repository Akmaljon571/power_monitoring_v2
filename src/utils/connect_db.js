const mongoose = require('mongoose')

module.exports.connectDB = async (app, PORT, DB) => {
    try {
        await mongoose.connect(DB, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        })
        console.log('Connect to MongoDB');
        app.listen(PORT, () => console.log(`App has been started on port ${PORT}`));
    } catch (error) {
        console.log('Serverda xatolik yuz berdi', error.message);
        process.exit(1);
    }
};
