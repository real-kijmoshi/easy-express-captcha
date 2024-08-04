const express = require('express');
const captcha = require('.');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(captcha({
    generator: {
        captcha: {
            length: 5
        },
        strokes: {
            count: 4,
            width: 2
        },
        noise: {
            density: 0.1
        },
    },
    inputName: "captcha" // For more info, check the options section
}));

app.get('/', (req, res) => {
    const captcha = req.generateCaptcha();
    res.send(`
        <form action="/submit" method="post">
            ${captcha}
            <button type="submit">Submit</button>
        </form>
    `);
});

app.post('/submit', (req, res) => {
    if (req.validCaptcha) {
        res.send('Captcha is correct');
    } else {
        res.send('Captcha is incorrect');
    }
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});