# easy-express-captcha

![npm](https://img.shields.io/npm/v/easy-express-captcha)
![npm](https://img.shields.io/npm/dt/easy-express-captcha)
![NPM](https://img.shields.io/npm/l/easy-express-captcha)
![GitHub last commit](https://img.shields.io/github/last-commit/real-kijmoshi/easy-express-captcha)
 
easy express captcha is a simple captcha middleware for express.js. It uses custom captcha generation and verification to ensure fast and secure captcha generation and verification. It is easy to use and can be integrated into any express.js application with ease. It is also highly customizable and can be configured to suit your needs. It is perfect for protecting your forms from spam and bots.

## Installation
```bash
npm install easy-express-captcha
```

## Usage
```javascript
const express = require('express');
const captcha = require('easy-express-captcha');

const app = express();

app.use(express.urlencoded({ extended: false }));

app.use(captcha({
    captcha: {
        length: 5
    },
    inputName: "captcha" //for more info check the options section
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
```

### Result
![](https://raw.githubusercontent.com/real-kijmoshi/easy-express-captcha/main/preview.png)


## Options


## canvas
**width** - The width of the captcha. Default is 200.
**height** - The height of the captcha. Default is 100.

### captcha
**length** - The length of the captcha. Default is 6.
#### - spacing
**min** - The minimum spacing between characters. Default is 30.
**max** - The maximum spacing between characters. Default is 40.

### colors
**background** - The background color of the captcha. Default is random.
**text** - The text color of the captcha. Default is random.
**noise** - The noise color of the captcha. Default is random.
**strokes** - The strokes color of the captcha. Default is [random, random, random].

### text
**font** - The font of the captcha. Default is 'bold 30px Arial'.
**characters** - The characters to use in the captcha. Default is 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.

### noise
**density** - The density of the noise. Default is 0.03.
**curveCount** - The number of curves in the noise. Default is 2.

### strokes
**count** - The number of strokes in the captcha. Default is 3.
**width** - The width of the strokes. Default is 2.

### inputName
**inputName** - The name of the input field. Default is 'captcha'.

## License
MIT

## Author
made with ❤️ by [kijmoshi](https://kijmoshi.xyz)

## Support
any support is appreciated. you can support me by giving a ⭐ to this repository or by buying me a coffee [here](https://www.buymeacoffee.com/kijmoshi)