# easy-express-captcha

![npm](https://img.shields.io/npm/v/easy-express-captcha)
![npm](https://img.shields.io/npm/dt/easy-express-captcha)
![NPM](https://img.shields.io/npm/l/easy-express-captcha)
![GitHub last commit](https://img.shields.io/github/last-commit/real-kijmoshi/easy-express-captcha)

Easy Express Captcha is a simple captcha middleware for Express.js. It uses custom captcha generation and verification to ensure fast and secure captcha handling. It's easy to integrate into any Express.js application and highly customizable to suit your needs. Perfect for protecting your forms from spam and bots.

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
    generator: {
        captcha: {
            length: 5
        }
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
```

### Result

![Captcha Preview](https://raw.githubusercontent.com/real-kijmoshi/easy-express-captcha/main/preview.png)

## Options

### Generator Options

#### canvas
- `width`: The width of the captcha. Default is 200.
- `height`: The height of the captcha. Default is 100.

#### captcha
- `length`: The length of the captcha. Default is 6.
- `spacing`:
  - `min`: The minimum spacing between characters. Default is 30.
  - `max`: The maximum spacing between characters. Default is 40.

#### colors
- `background`: The background color of the captcha. Default is random.
- `text`: The text color of the captcha. Default is random.
- `noise`: The noise color of the captcha. Default is random.
- `strokes`: The strokes color of the captcha. Default is [random, random, random].

#### text
- `font`: The font of the captcha. Default is 'bold 36px Arial'.
- `characters`: The characters to use in the captcha. Default is 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'.

#### noise
- `density`: The density of the noise. Default is 0.3.
- `curveCount`: The number of curves in the noise. Default is 10.

#### strokes
- `count`: The number of strokes in the captcha. Default is 4.
- `width`: The width of the strokes. Default is 2.

### Middleware Options

- `inputName`: The name of the input field. Default is 'captcha'.
- `honeypot`: 
  - `enabled`: Enable honeypot fields. Default is false.
  - `inputNames`: Array of honeypot input names. Default is ['i am a robot'].

## License

MIT

## Author

Made with ❤️ by [kijmoshi](https://kijmoshi.xyz)

## Support

Any support is appreciated. You can support me by giving a ⭐ to this repository or by [buying me a coffee](https://www.buymeacoffee.com/kijmoshi).
