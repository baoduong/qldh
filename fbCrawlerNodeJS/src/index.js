const puppeteer = require('/opt/chromiumPuppeteer');
const dbService = require('./dbService');

exports.handler = async (event) => {
    // console.log('event', event);
    const { queryStringParameters } = event;
    const { videoId, pageId, commentId } = queryStringParameters;

    if (!videoId || !pageId || !commentId) {
        return {
            statusCode: 201,
            body: 'No video infomation'
        };
    }

    const comment = await dbService.getCommentId(commentId);
    if (comment) {
        return {
            statusCode: 200,
            body: JSON.stringify(comment),
        };
    }

    const browser = await puppeteer.puppeteer();

    const video_url = `https://www.facebook.com/${pageId}/videos/${videoId}`;
    console.log('video_url: ', video_url);
    const page = await browser.newPage();
    await page.goto(video_url);

    try {
        let customerId, commentInfo, commentor, imgUrl;


        const xpathSelector = "//div[@aria-label[contains(., 'a few seconds ago')]][last()]";
        await page.waitForXPath(xpathSelector, {
            timeout: 10000
        });
        const elementComments = await page.$x(xpathSelector);
        console.log('List of comment within 1 minute: ', elementComments.length);

        let commentChecking;
        for (let index = 0; index < elementComments.length; index++) {
            const element = elementComments[index];
            const divAtag = await element.$x('.//div[1]/div/span/a');
            const href = divAtag[0] ? await divAtag[0].evaluate(ele => {
                return ele.getAttribute('href');
            }) : undefined;
            console.log('href: ', href);
            if (href) {
                const _href = String(href).split('?');
                let commentIdFromComment = decodeURIComponent(_href[1]);
                commentIdFromComment = commentIdFromComment.replace('&__tn__=R', '');

                const buff = Buffer.from(commentIdFromComment, 'base64');
                commentIdFromComment = buff.toString('utf-8');
                commentIdFromComment = commentIdFromComment.split(':')[1];
                console.log('commentId', commentIdFromComment);
                if (commentId === commentIdFromComment) {
                    commentChecking = {
                        element: elementComments[index],
                        href
                    };
                    break;
                }
            }
        }


        if (commentChecking) {
            const latestComment = await commentChecking.element.$x('.//*[@dir="auto"]');
            const innerTextCommentor = await latestComment[0].getProperty('innerText');
            const name = await innerTextCommentor.jsonValue();
            const innerTextHandle = await latestComment[1].getProperty('innerText');
            const innerText = await innerTextHandle.jsonValue();

            const href = commentChecking.href;
            if (href.search('https://www.facebook.com/people') == 0) {
                customerId = href.replace('https://www.facebook.com/people/', '').split('/')[0];
            } else {
                customerId = href.replace('https://www.facebook.com/', '').split('?')[0];
            }

            commentor = await dbService.getUserById(customerId);
            if (!commentor) {
                await page.goto(href);
                const imgTag = await page.evaluateHandle(() =>
                    document.querySelector('image')
                );

                imgUrl = await imgTag.evaluate(ele => {
                    return ele.getAttribute('xlink:href');
                });

                commentor = {
                    userId: customerId,
                    name,
                    imgUrl
                };
                //TODO: Save user
            }

            commentInfo = {
                commentId,
                userId: customerId,
                message: innerText
            };
            await dbService.saveComment(commentInfo);
        } else {
            throw new Error('Không tìm thấy bình luận');
        }
        await browser.close();
        console.log(commentInfo);
        const response = {
            statusCode: 200,
            body: JSON.stringify(commentInfo),
        };
        return response;
    } catch (error) {
        await browser.close();
        console.error('Error: ', error);
        const response = {
            statusCode: 400,
            body: 'Có lỗi xảy ra, liên hệ Bảo Dương',
        };
        return response;
    }
};
