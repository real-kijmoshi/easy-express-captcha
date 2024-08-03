const gen = require("./generator");

const codes = new Map();

const uuidGen = () => {
    let uuid = "";
    
    do {
        uuid = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
    } while (codes[uuid]);

    return uuid;
};


module.exports = (settings) => {
    return (req, res, next) => {
        req.generateCaptcha = () => {
            const id = uuidGen();
            const captcha = gen.svg({ ...settings });

            codes.set(id, captcha.text);

            if(!settings.inputName) {
                settings.inputName = "captcha";
            }

            return `
                <div class="captcha-container">
                    <img src="${captcha.image}" alt="Captcha" />
                    <input type="text" name="${settings.inputName}" placeholder="Enter the code" class="captcha-input" />
                    <input type="hidden" name="captchaId" value="${id}" />
                </div>
            `;
        };

        req.validCaptcha = false;

        if(req.method === "POST" && req.body) {
            const { captchaId, captcha } = req.body;
            if(!captchaId || !captcha) {
                next();
            }

            const code = codes.get(captchaId);
            if(!code) {
                next();
            }

            req.validCaptcha = code === captcha;
        }

        next();
    };
}

module.exports.generator = gen;