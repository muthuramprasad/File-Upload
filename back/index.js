const express = require('express');
const cors = require('cors');
const multer = require('multer');
const mongoose = require('mongoose');
const path = require('path');
const app = express();

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/multer-images', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const imageSchema = new mongoose.Schema({
    filename: String,
    filepath: String,
    originalname: String,
    name: String,  // Add a name field
    uploadDate: {
        type: Date,
        default: Date.now,
    },
});

const Image = mongoose.model('Image', imageSchema);

app.use(express.json());
app.use(cors());
app.use('/public', express.static(path.join(__dirname, 'public')));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        return cb(null, './public/Images');
    },
    filename: function (req, file, cb) {
        return cb(null, `${Date.now()}_${file.originalname}`);
    }
});

const upload = multer({ storage: storage });

app.post('/upload', upload.single('file'), async (req, res) => {
    console.log(req.body);
    console.log(req.file);

    // Save file metadata and name to MongoDB
    const newImage = new Image({
        filename: req.file.filename,
        filepath: req.file.path,
        originalname: req.file.originalname,
        name: req.body.name,  // Save the name
    });

    try {
        await newImage.save();
        res.status(200).send('File uploaded and saved to database successfully');
    } catch (error) {
        res.status(500).send('Error saving file metadata to database');
    }
});

app.get('/images', async (req, res) => {
    try {
        const images = await Image.find();
        res.json(images);
    } catch (error) {
        res.status(500).send('Error fetching images from database');
    }
});

app.listen(8000, () => {
    console.log('Server is running on port 8000');
});
