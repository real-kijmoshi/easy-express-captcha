const gen = require("./generator");

const codes = new Map();

const uuidGen = () => {
    let uuid = "";
    
    do {
        uuid = Math.random().toString(36).substring(2, 8) + Math.random().toString(36).substring(2, 8);
    } while (codes[uuid]);

    return uuid;
};

const defaultSettings = {
    generator: {},
    inputName: "captcha",
    honeypot: {
        enabled: false,
        inputNames: ["i am a robot"]
    }
};

/**

Express middleware for captcha generation and validation.
@param {Object} settings - Configuration options for the captcha middleware.
@param {Object} [settings.generator={}] - Options for captcha image generation.
@param {Object} [settings.generator.canvas] - Canvas settings.
@param {number} [settings.generator.canvas.width=200] - Width of the captcha image.
@param {number} [settings.generator.canvas.height=100] - Height of the captcha image.
@param {Object} [settings.generator.captcha] - Captcha text settings.
@param {number} [settings.generator.captcha.length=6] - Length of the captcha text.
@param {Object} [settings.generator.captcha.spacing] - Spacing between characters.
@param {number} [settings.generator.captcha.spacing.min=30] - Minimum spacing between characters.
@param {number} [settings.generator.captcha.spacing.max=40] - Maximum spacing between characters.
@param {Object} [settings.generator.colors] - Color settings for various elements.
@param {string} [settings.generator.colors.background="random"] - Background color of the captcha.
@param {string} [settings.generator.colors.text="random"] - Color of the captcha text.
@param {string} [settings.generator.colors.noise="random"] - Color of noise elements.
@param {string[]} [settings.generator.colors.strokes=["random","random","random"]] - Colors for stroke elements.
@param {Object} [settings.generator.text] - Text rendering settings.
@param {string} [settings.generator.text.font="bold 36px Arial"] - Font for captcha text.
@param {string} [settings.generator.text.characters="ABCDEFGHJKLMNPQRSTUVWXYZ23456789"] - Characters to use in captcha.
@param {Object} [settings.generator.noise] - Noise generation settings.
@param {number} [settings.generator.noise.density=0.3] - Density of noise elements.
@param {number} [settings.generator.noise.curveCount=10] - Number of noise curves.
@param {Object} [settings.generator.strokes] - Stroke element settings.
@param {number} [settings.generator.strokes.count=4] - Number of stroke elements.
@param {number} [settings.generator.strokes.width=2] - Width of stroke elements.
@param {string} [settings.inputName="captcha"] - Name of the input field for captcha solution.
@param {Object} [settings.honeypot] - Honeypot field settings for bot detection.
@param {boolean} [settings.honeypot.enabled=false] - Enable honeypot fields.
@param {string[]} [settings.honeypot.inputNames=["i am a robot"]] - Names of honeypot input fields.
@returns {Function} Express middleware function for captcha handling.
*/


module.exports = (settings) => {
    settings = { ...defaultSettings, ...settings };
    settings.honeypot = { ...defaultSettings.honeypot, ...settings.honeypot };
    settings.generator = { ...defaultSettings.generator, ...settings.generator };

    return (req, res, next) => {
        req.generateCaptcha = () => {
            const id = uuidGen();
            const captcha = gen.generate(settings.generator);

            codes.set(id, captcha.text);

            return `
                <div class="captcha-container">
                    <div class="captcha-image">
                        <img src="${captcha.image}" />
                    </div>
                    ${
                        settings.honeypot.enabled
                            ? settings.honeypot.inputNames.map(name => `<input type="checkbox" name="${name}" style="width: 0.1px; height: 0.1px; opacity: 0.1; position: absolute; left: -9999px;" />`).join("")
                            : ""
                    }
                    <input type="text" name="${settings.inputName}" placeholder="Enter the code" class="captcha-input" />
                    <input type="hidden" name="captchaId" value="${id}" />
                </div>
            `;
        };

        req.validCaptcha = false;
        req.invalidReason = "";

        if(req.method === "POST" && req.body) {
            const { captchaId, captcha } = req.body;
            
            if(settings.honeypot.enabled) {
                const honeypot = settings.honeypot.inputNames.some(name => req.body[name]?.length > 0);
                
                if(honeypot) {
                    req.invalidReason = "Honeypot field filled";
                    next();
                }
            }

            if(!captchaId || !captcha) {
                req.invalidReason = "Missing captcha";
                next();
            }

            const code = codes.get(captchaId);
            if(!code) {
                req.invalidReason = "Invalid captcha ID";
                next();
            }

            if(captcha != code) {
                req.invalidReason = "Invalid captcha";
                next();
            } else {
                req.validCaptcha = true;
            }
        }

        next();
    };
}

module.exports.generator = gen;