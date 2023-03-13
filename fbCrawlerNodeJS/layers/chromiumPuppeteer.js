const chromium = require('./nodejs/node_modules/chrome-aws-lambda/build');

exports.puppeteer = async function () {
    const browser = await chromium.puppeteer.launch({
        args: chromium.args,
        defaultViewport: chromium.defaultViewport,
        executablePath: await chromium.executablePath,
        headless: chromium.headless,
        ignoreHTTPSErrors: true,
    });

    return browser;
};

exports.healthcheck = function () {
    return "Puppeteer is working!";
};

exports.decodeSting = function (encodeString) {
    const buf = Buffer.from(encodeString, 'base64');
    const decodeString = buf.toString('utf-8');
    return decodeString;
};