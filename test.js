const express = require('express');
const captcha = require('.');

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(captcha({
    captcha: {
        length: 5
    },
    inputName: "captcha",
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

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started');
});