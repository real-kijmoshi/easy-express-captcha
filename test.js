const express = require('express');
const easyCaptcha = require('.');
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(easyCaptcha({
    generator: {
        captcha: {
            length: 5
        },
        strokes: {
            count: 2,
            width: 2
        },
        noise: {
            density: 0.01
        },
        text: {
            font: "bold 40px Roboto",
            characters: "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
        },
    },
    honeypot: {
        enabled: true,
        inputNames: ["i am a robot"]
    },
    inputName: "captcha" // For more info, check the options section
}));

app.get('/', (req, res) => {
    const captcha = req.generateCaptcha();
    res.send(`
        <form action="/submit" method="post">
            ${captcha}
            <button type="submit">Submit</button>


            <p>
                you can also try to fill the honeypot field: <input type="checkbox" name="i am a robot" />
            </p>
        </form>


        <p>
            If you want to play around with the captcha settings, check the <a href="/sandbox">sandbox</a>.
        </p>
    `);
});

app.post('/submit', (req, res) => {
    if(req.validCaptcha) {
        res.send('Captcha is valid');
    } else {
        res.send(`Captcha is invalid: ${req.invalidReason}`);
    }
})




app.get('/sandbox', (req, res) => {
    const settings = {
        generator: {
            captcha: {
                length: Number(req.query.captchaLength) || 5
            },
            strokes: {
                count: Number(req.query.strokeCount) || 2,
                width: Number(req.query.strokeWidth) || 2
            },
            noise: {
                density: Number(req.query.noiseDensity) || 0.01
            },
            text: {
                font: req.query.textFont || "bold 40px Roboto",
                characters: req.query.textCharacters || "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
            }
        }
    };

    const captcha = easyCaptcha.generator.generate(settings.generator);
    res.send(`
        <form action="/submit" method="post">
            <img src="${captcha.image}" />
            <input type="text" name="captcha" placeholder="Enter the code" />
            <button type="submit">Submit</button>
            <span id="output"></span>
        </form>

        <div style="display: flex; flex-direction: column;">
            <label for="captchaLength">Captcha length:</label>
            <input type="number" name="captchaLength" id="captchaLength" value="${settings.generator.captcha.length}" />
        
            <label for="strokeCount">Stroke count:</label>
            <input type="number" name="strokeCount" id="strokeCount" value="${settings.generator.strokes.count}" />

            <label for="strokeWidth">Stroke width:</label>
            <input type="number" name="strokeWidth" id="strokeWidth" value="${settings.generator.strokes.width}" />

            <label for="noiseDensity">Noise density:</label>
            <input type="number" name="noiseDensity" id="noiseDensity" value="${settings.generator.noise.density}" />

            <label for="textFont">Text font:</label>
            <input type="text" name="textFont" id="textFont" value="${settings.generator.text.font}" />

            <label for="textCharacters">Text characters:</label>
            <input type="text" name="textCharacters" id="textCharacters" value="${settings.generator.text.characters}" />

            <button type="submit" id="update">Update</button>
        </div>


        <script>
            document.getElementById("update").addEventListener("click", () => {
                const params = new URLSearchParams();

                params.append("captchaLength", document.getElementById("captchaLength").value);
                params.append("strokeCount", document.getElementById("strokeCount").value);
                params.append("strokeWidth", document.getElementById("strokeWidth").value);
                params.append("noiseDensity", document.getElementById("noiseDensity").value);
                params.append("textFont", document.getElementById("textFont").value);
                params.append("textCharacters", document.getElementById("textCharacters").value);

                window.location.href = "/sandbox?" + params.toString();
            })

            const output = document.getElementById("output");
            const captcha = document.getElementById("captcha");
            document.querySelector("form").addEventListener("submit", e => {
                e.preventDefault();
                
                if(captcha.value === "${captcha.text}") {
                    output.textContent = "Captcha is valid";
                } else {
                    output.textContent = "Captcha is invalid";
                }
            });
        </script>
    `);
});

app.listen(process.env.PORT || 3000, () => {
    console.log('Server started');
})