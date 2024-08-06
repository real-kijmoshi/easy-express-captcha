const gen = require("./generator");


const defaultSettings = {
    generator: {},
    inputName: "captcha",
    honeypot: {
        enabled: false,
        inputNames: ["i am a robot"]
    },
    refresh: {
        enabled: true,
        path: "/refresh"
    },
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
@param {Object} refresh - Express route handler for refreshing the captcha image.
@param {boolean} refresh.enabled - Enable the refresh route.
@param {string} refresh.path - Path for the refresh route.
@returns {Function} Express middleware function for captcha handling.
@requires module:express-session
*/


module.exports = (settings) => {
    settings = { ...defaultSettings, ...settings };
    settings.honeypot = { ...defaultSettings.honeypot, ...settings.honeypot };
    settings.generator = { ...defaultSettings.generator, ...settings.generator };
    settings.refresh = { enabled: false, path: "/refresh", ...settings.refresh };


    return (req, res, next) => {
        req.generateCaptcha = () => {
            //test session
            if(!req.session) {
                throw new Error("express-session is required for captcha middleware");
            }

            const captcha = gen.generate(settings.generator);

            req.session.captcha = captcha.text;

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
                    ${
                        settings.refresh.enabled ? `<button type="button" class="captcha-refresh">Refresh</button>` : ""
                    }

                    <script>
                        document.addEventListener("DOMContentLoaded", () => {
                            const refreshButton = document.querySelector(".captcha-refresh");

                            if(refreshButton) {
                                refreshButton.addEventListener("click", () => {
                                    fetch("${settings.refresh.path}", { method: "POST" })
                                        .then(res => res.blob())
                                        .then(blob => blob.text())
                                        .then(dataUrl => {
                                            const image = document.querySelector(".captcha-image img");
                                            image.src = dataUrl
                                        });
                                });
                            }
                        })
                    </script>
                </div>
            `;
        };

        

        if(settings.refresh.enabled && req.method === "POST" && req.path === settings.refresh.path) {
            const captcha = gen.generate(settings.generator);

            req.session.captcha = captcha.text;

            res.setHeader("Content-Type", "image/png");
            res.send(captcha.image);
            res.end();
            return;
        }

        req.validCaptcha = false;
        req.invalidReason = "";

        if(req.method === "POST" && req.body) {
            const { captcha } = req.body;
            
            if(settings.honeypot.enabled) {
                const honeypot = settings.honeypot.inputNames.some(name => req.body[name]?.length > 0);
                
                if(honeypot) {
                    req.invalidReason = "Honeypot field filled";
                    next();
                }
            }

            if(!captcha) {
                req.invalidReason = "Missing captcha";
                next();
            }

            
            if(captcha != req.session.captcha) {
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