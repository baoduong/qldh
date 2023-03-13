import puppeteer from 'puppeteer';
import Base64 from 'Base64';
// const video_url = 'https://www.facebook.com/100068724216478/videos/120030864206638/';
const video_url = 'https://www.facebook.com/PewPewReal/videos/tay-%C4%91%C3%A2u-tay-%C4%91%C3%A2u/2940185089446805/';


const handler = async (event) => {
    const { queryStringParameters } = event;
    const { videoId, pageId, commentId } = queryStringParameters;

    const browser = await puppeteer.launch();

    const page = await browser.newPage();
    await page.goto(video_url);


    // Load latest comment
    try {
        const xpathSelector = "//div[@aria-label[contains(., 'a few seconds ago')]][last()]";
        await page.waitForXPath(xpathSelector);
        const elementComments = await page.$x(xpathSelector);

        console.log('List of comment within 1 minute: ', elementComments.length);
        let commentChecking;
        for (let index = 0; index < elementComments.length; index++) {
            const element = elementComments[index];
            // const comment = await element.$x('.//*[@dir="auto"]');
            const divAtag = await element.$x('.//div[1]/div/span/a');
            const href = divAtag[0] ? await divAtag[0].evaluate(ele => {
                return ele.getAttribute('href');
            }) : undefined;
            console.log('href: ', href);
            if (href) {
                const _href = String(href).split('?');
                let commentIdFromComment = decodeURIComponent(_href[1]);
                commentIdFromComment = commentIdFromComment.replace('&__tn__=R', '');

                const buff = Buffer.from(commentIdFromComment);
                commentIdFromComment = buff.toString('utf8');
                commentIdFromComment = commentIdFromComment.split(':')[1];
                console.log('commentId', commentIdFromComment);
                if (commentId === commentIdFromComment) {
                    commentChecking = elementComments[index];
                    break;
                }
            }

        }

        // const latestComment = await latestEle.$x('.//*[@dir="auto"]');
        // const innerTextCommentor = await latestComment[0].getProperty('innerText');
        // const name = await innerTextCommentor.jsonValue();
        // const innerTextHandle = await latestComment[1].getProperty('innerText');
        // const innerText = await innerTextHandle.jsonValue();

        // const divAtag = await latestEle.$x('.//div[1]/div/span/a');

        // const href = await divAtag[0].evaluate(ele => {
        //     return ele.getAttribute('href');
        // });

        // let userId;
        // if (href.search('https://www.facebook.com/people') == 0) {
        //     userId = href.replace('https://www.facebook.com/people/', '').split('/')[0];
        // } else {
        //     userId = href.replace('https://www.facebook.com/', '').split('?')[0];
        // }

        // userId = decodeURI(userId);

        // await page.goto(href);

        // const img = await page.evaluateHandle(() =>
        //     document.querySelector('image')
        // );

        // const imgUrl = await img.evaluate(ele => {
        //     return ele.getAttribute('xlink:href')
        // });

        // const commentInfo = {
        //     commentor: {
        //         author: name,
        //         userId,
        //         imgUrl
        //     },
        //     message: innerText,
        // };

        // console.log(commentInfo);
        // const response = {
        //     statusCode: 200,
        //     body: JSON.stringify(commentInfo),
        // };
        // return response;
    } catch (error) {
        console.error('Error: ', error);
    }


    await browser.close();
    return {
        statusCode: 200,
        body: 'Puppeteer is working now !!!',
    };

};

handler();