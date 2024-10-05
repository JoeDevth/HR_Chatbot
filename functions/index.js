const { setGlobalOptions } = require("firebase-functions/v2");
const { onRequest } = require("firebase-functions/v2/https");

setGlobalOptions({
    region: "asia-northeast1",
    memory: "1GB",
    concurrency: 40,
})

const line = require('./util/line.util');
const dialogflow = require('./util/dialogflow.util');
const firebase = require('./util/firebase.util');
const flex = require('./message/flex');
const googlesheets = require('./util/sheets_api');
const googlesheets_addleave = require('./util/sheet_api_addLeave');
const gemini = require('./util/geminiAPI');


exports.helloWorld = onRequest((request, response) => {
    response.send(`Method : ${request, method} `);
});

function validateWebhook(request, response) {
    if (request.method !== "POST") {
        return response.status(200).send("Method Not Allowed");
    }
    if (!line.verifySignature(request.headers["x-line-signature"], request.body)) {
        return response.status(401).send("Unauthorized");
    }
}

exports.webhook = onRequest(async (request, response) => {
    validateWebhook(request, response)

    const events = request.body.events
    for (const event of events) {
        let profile = {}

        console.log("event", JSON.stringify(event));
        if (event.source.userId === "Udeadbeefdeadbeefdeadbeefdeadbeef") {
            return response.status(200).end();
        }
        switch (event.type) {

            case "follow":
                /*
                    Greeting Message for new friend
                */
                profile = await line.getProfile(event.source.userId)

                console.log(":------");
                console.log(JSON.stringify(profile));
                console.log(":------");


                let text = `ยินดีต้อนรับคุณ ${profile.displayName} คุณสามารถพูดคุย สนทนากับ admin ได้เลย`
                if (event.follow.isUnblocked) {
                    /*
                        Greeting Message for Old Friend
                        https://developers.line.biz/en/reference/messaging-api/#follow-event
                        https://linedevth.line.me/th/knowledge-api/follow-event
                    */
                    text = `ยินดีต้อนการกลับมา ${profile.displayName} ต้องการให้ช่วยอะไรมั้ยครับ`
                }
                await line.replyWithLongLived(event.replyToken, [{
                    "type": "text",
                    "text": text,
                }])
                break;
            case "unfollow":
                /*
                    Unsend event
                    https://developers.line.biz/en/reference/messaging-api/#unsend-event
                */
                console.log(JSON.stringify(event));
                break;
            case "message":
                /*
                    Message
                    https://developers.line.biz/en/reference/messaging-api/#message-event
                */
                if (event.message.type === "text") {

                    if (event.source.type !== "group") {
                        // Display a loading animation in one-on-one chats between users and LINE Official Accounts.
                        await line.isAnimationLoading(event.source.userId)
                    }

                    let textMessage = event.message.text
                    profile = await line.getProfile(event.source.userId)

                    console.log(":------");
                    console.log(JSON.stringify(profile));
                    console.log(":------");


                    const sayhiKeywords = ["สวัสดี", "ดี", "hi", "หวัดดีจ้า", "สวัสดีจ้า", "สวัสดีครับ", "สวัสดีค่ะ", "Hi",];
                    const timetoworkKeywords = ["เข้างาน", "เข้างานกี่โมง", "เวลาเริ่มงาน", "เวลาเริ่มงานกี่โมง", "เวลาทำงาน"]
                    const DressingKeywords = ["แต่งตัว", "แต่งตัวกี่ครั้ง", "แต่งตัวยังไง", "การแต่งกาย", "ชุดทำงาน"]
                    const SalaryperiodKeywords = ["เงินเดือน", "เงินเดือนกี่เดือน", "เงินเดือนออกตอนไหน", "เงินออกวันที่เท่าไหร่", "ได้เงินยังไง", "เงินออกตอนไหน"]
                    const benefitKeywords = ["เงินสุขภาพ", "สวัสดิการทั้งหมด", "สวัสดิการทั้งหมดกี่เงิน", "สวัสดิการมีอะไรบ้าง", "สวัสดิการ"]
                    const contactHrKeywords = ["ติดต่อhr", "ติดต่อhrที่ไหน", "ติดต่อhrที่ยังไง", "ติดต่อhrได้กี่โมง", "ขอคุยกับhr", "HR", "ติดต่อHR"]
                    const hollydayKeywords = ["หยุดวันไหน", "วันหยุด", "ปฏิทิน", "หยุดชดเชย"]
                    const latetoworkKeywords = ["ไปทำงานสาย","ไปสาย","เข้างานช้า","เข้างานสาย"]
                    const recordtoworkKeywords =["การบันทึกเวลา","การลงเวลาทำงาน","บันทึกเวลางาน"]
                    const testworkKeywords = ["พนักงานทดลองงาน","ทดลองงาน","การทดลองงาน","ฝึกงาน","งานฝึก"]
                    const bonustoworkKeywords = ["การคิดเงินโบนัสประจำปี ","เงินโบนัส","หักโบนัส","หักเเงิน"]

                    if (sayhiKeywords.some(keyword => textMessage.includes(keyword))) {
                      // ตัวอย่างการตอบกลับสำหรับการทักทาย
                     await line.replyWithStateless(event.replyToken, [{ type: 'text', text: 'น้อง MERGE สวัสดีครับ' }]);  

                    } else if (benefitKeywords.some(keyword => textMessage.includes(keyword))) {
                         // ตัวอย่างการตอบกลับด้วย Flex Message สวัสดิการ
                                await line.replyWithStateless(event.replyToken, [flex.exampleFlex()]);

                    } else if (textMessage === "ประกาศและแบบฟอร์ม") {
                        await line.replyWithStateless(event.replyToken, [{
                            "type": "flex",
                            "altText": "ประกาศและแบบฟอร์ม",
                            "contents": {
                              "type": "carousel",
                              "contents": [
                                {
                                  "type": "bubble",
                                  "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                      {
                                        "type": "image",
                                        "url": "https://bucket.ex10.tech/images/047835f8-8225-11ef-ab4d-0242ac12000e/originalContentUrl.png",
                                        "size": "full",
                                        "aspectMode": "cover",
                                        "aspectRatio": "2:3",
                                        "gravity": "top"
                                      },
                                      {
                                        "type": "box",
                                        "layout": "baseline",
                                        "contents": [
                                          {
                                            "type": "text",
                                            "text": "คู่มือพนักงาน",
                                            "color": "#ffffff",
                                            "align": "center",
                                            "size": "lg",
                                            "offsetTop": "lg"
                                          }
                                        ],
                                        "cornerRadius": "xxl",
                                        "offsetTop": "xxl",
                                        "backgroundColor": "#ff66c4",
                                        "offsetStart": "50px",
                                        "height": "50px",
                                        "width": "200px",
                                        "position": "absolute",
                                        "alignItems": "center",
                                        "justifyContent": "center"
                                      }
                                    ],
                                    "paddingAll": "0px",
                                    "action": {
                                      "type": "uri",
                                      "uri": "https://drive.google.com/file/d/17eQBqRF6QyXFwqwsw4sGS2QGAJ38GMZz/view?usp=sharing",
                                      "label": "เปิด"
                                    },
                                    "background": {
                                      "type": "linearGradient",
                                      "angle": "0deg",
                                      "startColor": "#000000",
                                      "endColor": "#ffffff"
                                    }
                                  }
                                },
                                {
                                  "type": "bubble",
                                  "body": {
                                    "type": "box",
                                    "layout": "vertical",
                                    "contents": [
                                      {
                                        "type": "image",
                                        "url": "https://bucket.ex10.tech/images/047835f8-8225-11ef-ab4d-0242ac12000e/originalContentUrl.png",
                                        "size": "full",
                                        "aspectMode": "cover",
                                        "aspectRatio": "2:3",
                                        "gravity": "top"
                                      },
                                      {
                                        "type": "box",
                                        "layout": "vertical",
                                        "contents": [
                                          {
                                            "type": "text",
                                            "text": "วินัยและโทษทางวินัย",
                                            "color": "#ffffff",
                                            "align": "center",
                                            "size": "lg",
                                            "offsetTop": "xs",
                                            "offsetStart": "lg"
                                          }
                                        ],
                                        "position": "absolute",
                                        "cornerRadius": "xxl",
                                        "offsetTop": "xxl",
                                        "backgroundColor": "#ff66c4",
                                        "offsetStart": "50px",
                                        "height": "50px",
                                        "width": "200px",
                                        "justifyContent": "center"
                                      }
                                    ],
                                    "paddingAll": "0px",
                                    "action": {
                                      "type": "uri",
                                      "uri": "https://drive.google.com/file/d/1gslugsIFyrF_ujEguGU5jkBIzm2wK1pf/view?usp=sharing",
                                      "label": "เปิด"
                                    }
                                  }
                                }
                              ]
                            }
                          }])
                    } else if (textMessage === "เรียนรู้ออนไลน์") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "imagemap",
                            "baseUrl": "https://ex10.tech/store/v1/public/content/upload/imagemap/f85b9d67-905c-48c5-ad6c-c32f12f18f9e",
                            "altText": "เรียนรู้ออนไลน์",
                            "baseSize": {
                                "width": 1040,
                                "height": "585"
                            },
                            "actions": [
                                {
                                    "type": "uri",
                                    "area": {
                                        "x": 0,
                                        "y": 9,
                                        "width": 1036,
                                        "height": 574
                                    },
                                    "linkUri": "https://drive.google.com/file/d/12ZUXBtpCREyxzzWBfj9-i3P3mADy_JAU/view?usp=sharing?openExternalBrowser=1"
                                }
                            ]
                        }])

                    } else if (textMessage === "พูดคุยกับน้อง MERGE") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "“สวัสดีครับ! ยินดีที่ได้พบกันครับ หากคุณมีคำถามหรือต้องการความช่วยเหลืออะไร สามารถบอกได้เลยนะครับ ผมยินดีที่จะช่วยคุณครับ!”$",
                            "emojis": [
                                {
                                    "index": 123,
                                    "productId": "5ac1bfd5040ab15980c9b435",
                                    "emojiId": "011"
                                }
                            ],
                            "quickReply": {
                                "items": [{
                                    "type": "action",

                                    "action": {
                                        "type": "message",
                                        "label": "ปรึกษา",
                                        "text": "ปรึกษา"
                                    }
                                }, {
                                    "type": "action",

                                    "action": {
                                        "type": "message",
                                        "label": "จบบทสนทนา",
                                        "text": "จบบทสนทนา"
                                    }
                                },
                                {
                                    "type": "action",
                                    "imageUrl": "",
                                    "action": {
                                        "type": "message",
                                        "label": "ติดต่อHR",
                                        "text": "ติดต่อHR"
                                    }
                                },]
                            }
                        }])

                    } else if (textMessage === "เมนูหลัก") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "imagemap",
                            "baseUrl": "https://ex10.tech/store/v1/public/content/upload/imagemap/a4090660-aec2-4b59-8ac5-744d8d378d7a",
                            "altText": "เมนูหลัก",   
                            "baseSize": {
                                "width": 1040,
                                "height": "701"
                            },
                            "actions": [
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 44,
                                        "y": 49,
                                        "width": 308,
                                        "height": 287
                                    },
                                    "text": "ประกาศและแบบฟอร์ม"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 372,
                                        "y": 57,
                                        "width": 297,
                                        "height": 283
                                    },
                                    "text": "สวัสดิการ"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 688,
                                        "y": 57,
                                        "width": 297,
                                        "height": 281
                                    },
                                    "text": "วันลาและหลักเกณฑ์การลา"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 46,
                                        "y": 371,
                                        "width": 300,
                                        "height": 283
                                    },
                                    "text": "ปฎิทินวันหยุด"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 380,
                                        "y": 363,
                                        "width": 285,
                                        "height": 289
                                    },
                                    "text": "\"HRMS Online\""
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 699,
                                        "y": 371,
                                        "width": 291,
                                        "height": 283
                                    },
                                    "text": "คุยกับน้อง MERGE"
                                }
                            ],
                            "quickReply": {
                                "items": [{
                                    "type": "action",

                                    "action": {
                                        "type": "message",
                                        "label": "เมนูบอท",
                                        "text": "เมนูบอท"
                                    }
                                },
                                ]
                            }
                        }])

                    } else if (textMessage === "เมนูบอท") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "imagemap",
                            "baseUrl": "https://ex10.tech/store/v1/public/content/upload/imagemap/abdd4ee2-51f9-48a2-9d0c-92a1e760220a",
                            "altText": "เมนูบอท",
                            "baseSize": {
                                "width": 1040,
                                "height": "701"
                            },
                            "actions": [
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 43,
                                        "y": 57,
                                        "width": 297,
                                        "height": 281
                                    },
                                    "text": "ค้นหาเพื่อน"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 374,
                                        "y": 47,
                                        "width": 289,
                                        "height": 291
                                    },
                                    "text": "ปรึกษา"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 702,
                                        "y": 61,
                                        "width": 289,
                                        "height": 277
                                    },
                                    "text": "สอบถามข้อมูลส่วนตัว"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 39,
                                        "y": 369,
                                        "width": 308,
                                        "height": 279
                                    },
                                    "text": "เอกสารช่วยส่งสุข"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 376,
                                        "y": 361,
                                        "width": 287,
                                        "height": 287
                                    },
                                    "text": "เรียนรู้ออนไลน์"
                                },
                                {
                                    "type": "message",
                                    "area": {
                                        "x": 692,
                                        "y": 371,
                                        "width": 297,
                                        "height": 281
                                    },
                                    "text": "อื่นๆ"
                                }
                            ],
                            "quickReply": {
                                "items": [{
                                    "type": "action",

                                    "action": {
                                        "type": "message",
                                        "label": "ปรึกษา",
                                        "text": "ปรึกษา"
                                    }
                                },
                                {
                                    "type": "action",
                                    "imageUrl": "",
                                    "action": {
                                        "type": "message",
                                        "label": "ติดต่อHR",
                                        "text": "ติดต่อHR"
                                    }
                                },]
                            }
                        }])

                    } else if (textMessage === "สอบถามข้อมูลส่วนตัว") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "📊 ข้อมูลส่วนตัวที่ต้องการ 📊\n\nเงินเดือน: คุณได้รับเงินเดือนอยู่ที่เท่าไร? 💵\nวันลาคงเหลือ: เหลือวันลาอีกกี่วัน? 🏖️\nตำแหน่ง: คุณดำรงตำแหน่งอะไรในบริษัท? 🏢\n\n👉 กรุณาพิมพ์รหัสพนักงานของคุณ เช่น \"111000\" เพื่อให้เราช่วยคุณได้อย่างรวดเร็ว! ✨"
                        }])

                    } else if (textMessage === "\"วันหยุด\"") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "📅 วันหยุดประจำสัปดาห์\n\nพนักงานทั่วไป 🛌 หยุดสัปดาห์ละ 2 วันเต็ม\n\nสำหรับหน่วยงานที่ต้องทำงานต่อเนื่อง 24 ชั่วโมง 🌐ขึ้นอยู่กับดุลยพินิจของผู้บังคับบัญชา โดยจะให้ผลัดกันหยุดอย่างน้อย 1 วันครึ่งต่อสัปดาห์ 🚨\n\n🎉 วันหยุดตามประเพณี\nบริษัทฯ กำหนดวันหยุดตามประเพณีอย่างน้อย 13 วันต่อปี 📆 รวมถึงวันแรงงานแห่งชาติด้วย 💪"
                        , "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "วันลาและหลักเกณฑ์การลา"
                                        }
                                    }
                                ]
                            }  
                        }])

                    } else if (textMessage === "\"วันหยุดพักผ่อน\"") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "🌿 สิทธิลาพักผ่อนประจำปี\nพนักงานที่เพิ่งเริ่มบรรจุในปีแรก 📅 ยังไม่มีสิทธิลาหยุดพักผ่อน\nเมื่อทำงานครบ 1 ปีเต็ม 🎉 มีสิทธิลาพักผ่อนได้ 6 วันทำงาน\nเมื่อทำงานครบ 2 ปีเต็ม 🎉 มีสิทธิลาพักผ่อนได้ 7 วันทำงาน\nเมื่อทำงานครบ 3 ปีเต็ม 🎉 มีสิทธิลาพักผ่อนได้ 8 วันทำงาน\n\n🗓️ การสะสมวันหยุด\nบริษัทฯ อนุญาตให้สะสมวันหยุดพักผ่อนได้ไม่เกิน 1 ปี รวมสูงสุดไม่เกิน 15 วัน ✅ การลาหยุดพักผ่อนต้องตรวจสอบวันหยุดที่เหลือกับแผนกบุคคล และยื่นใบลาล่วงหน้าต่อผู้บังคับบัญชา 📄 ห้ามส่งใบลาย้อนหลังเด็ดขาด❌ สามารถหยุดงานได้เมื่อได้รับการอนุมัติแล้วเท่านั้น ✔️"
                        , "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "วันลาและหลักเกณฑ์การลา"
                                        }
                                    }
                                ]
                            }  
                        }])

                    } else if (textMessage === "\"หลักเกณฑ์การลา\"") {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "👶 ลาคลอด\nพนักงานสตรีที่ตั้งครรภ์มีสิทธิลาคลอดได้ 98 วัน 🗓️ (ไม่รวมวันลาป่วย) โดยจะได้รับค่าจ้างจากบริษัทฯ จำนวน 45 วัน 💼 และจากประกันสังคมสำหรับวันที่เหลือ 🏥\n\n📋 ลากิจ\nพนักงานสามารถลากิจได้ไม่เกิน 6 วันทำงาน/ปี ✍️ หากลากิจเกิน 6 วัน จะหมดสิทธิ์พิจารณาเลื่อนขั้นเงินเดือนในปีนั้น 📉\nการลากิจต้องได้รับอนุญาตจากผู้บังคับบัญชา และยื่นใบลาล่วงหน้าอย่างน้อย 3 วัน 📝 ห้ามลากิจย้อนหลัง❌ หากไม่ได้รับอนุญาตจะถือว่าขาดงาน\nเหตุผลการลากิจต้องสมควร ⚖️ หากไม่สมควร ผู้บังคับบัญชามีสิทธิ์ไม่อนุญาต\nในกรณีฉุกเฉิน รีบด่วน 🚨 ต้องแจ้งให้ผู้บังคับบัญชาทราบก่อนเวลาทำงานปกติ มิฉะนั้นจะถือว่าขาดงาน ⚠️\n\n🤒 ลาป่วย\nพนักงานสามารถลาป่วยได้ไม่เกิน 30 วันทำงาน/ปี โดยได้รับค่าจ้าง 🏥\nหากลาป่วยเกิน 3 วันทำงาน ต้องมีใบรับรองแพทย์แนบกับใบลา 📄\nในกรณีลาป่วยกระทันหัน ต้องแจ้งให้ผู้บังคับบัญชาหรือแผนกบุคคลทราบก่อนเวลาทำงาน 🕒\n\n🚫 การขาดงาน\nการไม่มาทำงานโดยไม่แจ้งผู้บังคับบัญชาก่อนเวลางาน จะถือว่าขาดงาน ❌"
                               , "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เพิ่มวันลา",
                                            "text": "เพิ่มวันลา"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "วันลาและหลักเกณฑ์การลา"
                                        }
                                    }, {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "อื่นๆ",
                                            "text": "อื่นๆ"
                                        }
                                    },
                                    
                                ]
                            }  
                        }])

                    } else if (textMessage === "พนักงานทดลองงาน"){ {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "❌ ไม่มีสิทธิลาหยุดงาน\nพนักงานไม่มีสิทธิลาหยุด เว้นแต่ในกรณีจำเป็นจริงๆ 🛑 และในวันที่ไม่ได้มาทำงาน บริษัทฯ จะไม่จ่ายค่าแรงให้ 💼\n\n📉 สิทธิ์ในการยกเลิกจ้างระหว่างทดลองงาน\nบริษัทฯ มีสิทธิยกเลิกการจ้างงานได้ทันที 🚫 ในระหว่างช่วงทดลองงาน 119 วัน หากผลการปฏิบัติงานไม่เป็นที่พอใจ\n\n💊 สวัสดิการสำหรับพนักงานทดลองงาน\nพนักงานที่อยู่ในช่วงทดลองงาน 🏥 จะได้รับสวัสดิการรักษาพยาบาลเฉพาะสำหรับผู้ป่วยนอกเท่านั้น 🔄"
                               , "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ข้อมูลส่วนตัว",
                                            "text": "สอบถามข้อมูลส่วนตัว"
                                        }
                                    }, {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "เพิ่มเติมอื่นๆ"
                                        }
                                    },
                                    
                                ]
                            }  
                        }])
                    }
                    } else if (hollydayKeywords.some(keyword => textMessage.includes(keyword))) {
                        await line.replyWithStateless(event.replyToken, [
                            {
                                "type": "imagemap",
                                "baseUrl": "https://ex10.tech/store/v1/public/content/upload/imagemap/d8277a9a-eaea-4b31-b608-c09b99114277",
                                "altText": "วันหยุด",
                                "baseSize": {
                                    "width": 1040,
                                    "height": 1040
                                },
                                "actions": [
                                    {
                                        "type": "message",
                                        "area": {
                                            "x": 906,
                                            "y": 16,
                                            "width": 1,
                                            "height": 1
                                        },
                                        "text": "."
                                    }
                                ]
                            },
                            {
                                "type": "text",
                                "text": "คุณต้องการทำอะไรต่อ?",
                                "quickReply": {
                                    "items": [
                                        {
                                            "type": "action",
                                            "action": {
                                                "type": "message",
                                                "label": "เพิ่มวันลา",
                                                "text": "เพิ่มวันลา"
                                            }
                                        },
                                        {
                                            "type": "action",
                                            "action": {
                                                "type": "message",  // แก้ไขเป็น message type
                                                "label": "อื่นๆ",
                                                "text": "อื่นๆ"
                                            }
                                        }
                                    ]
                                }
                            }
                        ]);
                    } else if (timetoworkKeywords.some(keyword => textMessage.includes(keyword))) {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "🕒 เวลาทำงานของคุณ 🕒\nวันจันทร์ - วันศุกร์: พร้อมให้บริการคุณตลอดสัปดาห์!\n\nเวลาทำงาน: 8:00 - 17:00 น., 9:00 – 18:00 น.    ⏰\nเวลาพัก: 12:00 - 13:00 น. 🥪 \n\nใช้เวลานี้เพื่อเติมพลังและเตรียมพร้อมสำหรับช่วงบ่าย!\n\n✨ หวังว่าคุณจะมีวันที่สดใสและมีประสิทธิภาพในการทำงานนะคะ! 🌟"
                        }, {
                            "type": "text",
                            "text": "คุณต้องการทำอะไรต่อ?",
                            "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ข้อมูลส่วนตัว",
                                            "text": "สอบถามข้อมูลส่วนตัว"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "อื่นๆ"
                                        }
                                    },
                                ]
                            }
                        }
                        ]);

                    } else if (DressingKeywords.some(keyword => textMessage.includes(keyword))) {
                        await line.replyWithStateless(event.replyToken, [{
                            "type": "flex",
                            "altText": "การแต่งตัวในที่ทำงาน",
                            "contents": {
                                "type": "carousel",
                                "contents": [
                                    {
                                        "type": "bubble",
                                        "body": {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "image",
                                                    "url": "https://bucket.ex10.tech/images/1564aaad-822d-11ef-ab4d-0242ac12000e/originalContentUrl.png",
                                                    "size": "full",
                                                    "aspectMode": "cover",
                                                    "aspectRatio": "2:3",
                                                    "gravity": "top"
                                                }
                                            ],
                                            "paddingAll": "0px"
                                        }
                                    },
                                    {
                                        "type": "bubble",
                                        "body": {
                                            "type": "box",
                                            "layout": "vertical",
                                            "contents": [
                                                {
                                                    "type": "image",
                                                    "url": "https://bucket.ex10.tech/images/fc23bd08-822c-11ef-ab4d-0242ac12000e/originalContentUrl.png",
                                                    "size": "full",
                                                    "aspectMode": "cover",
                                                    "aspectRatio": "2:3",
                                                    "gravity": "top"
                                                }
                                            ],
                                            "paddingAll": "0px"
                                        }
                                    }
                                ]
                            }
                        }, {
                            "type": "text",
                            "text": "👔 ระเบียบการแต่งกายของพนักงาน\nเพื่อความเรียบร้อยและความเหมาะสมในที่ทำงาน 🏢 จึงกำหนดการแต่งกายดังนี้:\n\nพนักงานชาย 👨‍💼 ต้องแต่งกายด้วยเสื้อผ้าที่สุภาพและไม่ขาด ✔️\n\nพนักงานหญิง 👩‍💼 ต้องสวมใส่เสื้อผ้าที่สุภาพ ไม่ขาด และไม่โป๊ เพื่อความเหมาะสมในที่ทำงาน ✔️",
                            "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "สอบถามข้อมูลส่วนตัว",
                                            "text": "สอบถามข้อมูลส่วนตัว"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "อื่นๆ"
                                        }
                                    }
                                ]
                            }
                        }]);
                    } else if (contactHrKeywords.some(keyword => textMessage.includes(keyword))) {
                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "ถ้าคุณมีคำถามหรือต้องการพูดคุยกับเรา โทรติดต่อหาเราได้เลยนะครับ 🥰\n\n☎️ ฝ่ายทรัพยากรบุคคล\n088-888-8888\n\nเราพร้อมที่จะช่วยคุณทุกเมื่อ"
                        }, {
                            "type": "text",
                            "text": "คุณต้องการทำอะไรต่อ?",
                            "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "action": {
                                            "type": "message",  // แก้ไขเป็น message type
                                            "label": "อื่นๆ",
                                            "text": "อื่นๆ"
                                        }
                                    }
                                ]
                            }
                        }]);
                    } else if (SalaryperiodKeywords.some(keyword => textMessage.includes(keyword))) {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "💼 บริษัทขอแจ้งให้ทราบว่า เราจะดำเนินการจ่ายเงินเดือน 💰 ค่าจ้าง และค่าตอบแทนให้คุณ  เป็นประจำทุกวันที่ 📅 ... ของทุกเดือน\n\nโดยผ่านบัญชีเงินฝากออมทรัพย์ของคุณ 🏦 ทั้งนี้\nหากวันจ่ายเงินตรงกับวันหยุด 🛑\nเราจะจัดการจ่ายให้ล่วงหน้าในวันทำการก่อนหน้าวันหยุด เพื่อให้คุณได้รับค่าตอบแทนตามกำหนดอย่างไม่ขาดตกบกพร่อง 💸"
                        }, {
                            "type": "text",
                            "text": "คุณต้องการทำอะไรต่อ?",
                            "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ข้อมูลส่วนตัว",
                                            "text": "สอบถามข้อมูลส่วนตัว"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "อื่นๆ"
                                        }
                                    },
                                ]
                            }
                        }
                        ]);
                    } else if (latetoworkKeywords.some(keyword => textMessage.includes(keyword))) {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "⏰ หากพนักงานมาทำงานสายเกินกว่า 3 ครั้งใน 1 เดือน\n💼 จะต้องได้รับการตักเตือนเพื่อปรับปรุงการทำงาน\n🚨 เพื่อให้ทุกคนรักษาวินัยและความรับผิดชอบร่วมกัน ✨"
                          }, {
                            "type": "text",
                            "text": "คุณต้องการทำอะไรต่อ?",
                            "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ข้อมูลส่วนตัว",
                                            "text": "สอบถามข้อมูลส่วนตัว"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "อื่นๆ"
                                        }
                                    },
                                ]
                            }
                        }
                        ]);
                    } else if (recordtoworkKeywords.some(keyword => textMessage.includes(keyword))) {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "👋 เพื่อความถูกต้องและเป็นระบบ\n📊ขอให้พนักงานทุกคนสแกนลายนิ้วมือเข้า-ออกงานทุกครั้ง\n🕒เพื่อบันทึกเวลาการทำงานอย่างครบถ้วนและถูกต้อง"
                          }, {
                            "type": "text",
                            "text": "คุณต้องการทำอะไรต่อ?",
                            "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ข้อมูลส่วนตัว",
                                            "text": "สอบถามข้อมูลส่วนตัว"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "อื่นๆ"
                                        }
                                    },
                                ]
                            }
                        }
                        ]);
                    } else if (testworkKeywords.some(keyword => textMessage.includes(keyword))) {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "❌ ไม่มีสิทธิลาหยุดงาน\nพนักงานไม่มีสิทธิลาหยุด เว้นแต่ในกรณีจำเป็นจริงๆ 🛑 และในวันที่ไม่ได้มาทำงาน บริษัทฯ จะไม่จ่ายค่าแรงให้ 💼\n\n📉 สิทธิ์ในการยกเลิกจ้างระหว่างทดลองงาน\nบริษัทฯ มีสิทธิยกเลิกการจ้างงานได้ทันที 🚫 ในระหว่างช่วงทดลองงาน 119 วัน หากผลการปฏิบัติงานไม่เป็นที่พอใจ\n\n💊 สวัสดิการสำหรับพนักงานทดลองงาน\nพนักงานที่อยู่ในช่วงทดลองงาน 🏥 จะได้รับสวัสดิการรักษาพยาบาลเฉพาะสำหรับผู้ป่วยนอกเท่านั้น 🔄"
                          }, {
                            "type": "text",
                            "text": "คุณต้องการทำอะไรต่อ?",
                            "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ข้อมูลส่วนตัว",
                                            "text": "สอบถามข้อมูลส่วนตัว"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "เพิ่มเติมอื่นๆ"
                                        }
                                    },
                                ]
                            }
                        }
                        ]);
                    } else if (bonustoworkKeywords.some(keyword => textMessage.includes(keyword))) {

                        await line.replyWithStateless(event.replyToken, [{
                            "type": "text",
                            "text": "💰 การคิดเงินโบนัสประจำปี\nการคิดโบนัสประจำปีจะคำนวณตามจำนวนวันลาต่างๆ ดังนี้:\n\nขาดงาน ❌ หัก 3% ต่อวัน\nลากิจ 📋 หัก 2% ต่อวัน\nลาป่วย 🤒 หัก 1% ต่อวัน (ถ้ามีใบรับรองแพทย์ หัก 0.5%)\nลาคลอด 👶 หัก 0.5% ต่อวัน\nเจ็บป่วยจากการทำงานหรือเข้าพักในโรงพยาบาล 🏥 หัก 0.5% ต่อวัน\nมาทำงานสาย ⏰ หัก 1% ทุก 5 ครั้งแรก และหัก 0.25% ต่อครั้ง ในครั้งต่อไป\n\n🏆 เพื่อรักษาสิทธิในการรับโบนัสเต็มจำนวน ควรปฏิบัติงานตรงเวลาและลดการลาหยุดที่ไม่จำเป็น!"
                          }, {
                            "type": "text",
                            "text": "คุณต้องการทำอะไรต่อ?",
                            "quickReply": {
                                "items": [
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "เมนูหลัก",
                                            "text": "เมนูหลัก"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ข้อมูลส่วนตัว",
                                            "text": "สอบถามข้อมูลส่วนตัว"
                                        }
                                    },
                                    {
                                        "type": "action",
                                        "imageUrl": "",
                                        "action": {
                                            "type": "message",
                                            "label": "ย้อนกลับ",
                                            "text": "เพิ่มเติมอื่นๆ"
                                        }
                                    },
                                ]
                            }
                        }
                        ]);
                    } else {

                        googlesheets_addleave.forwardGoogleSheets2(request),
                        googlesheets.forwardGoogleSheets(request),
                        gemini.forwardGemini(request)
                        //dialogflow.forwardDialogflow(request) // ตรวจสอบให้แน่ใจว่านี่คือฟังก์ชันที่ถูกต้อง

                    }
                    
                    
                } else {
                
                   
                    
                    
                    /*
                    # Handle Other Message Type
                    - Image : https://developers.line.biz/en/reference/messaging-api/#image-message
                    - Video : https://developers.line.biz/en/reference/messaging-api/#video-message
                    - Audio : https://developers.line.biz/en/reference/messaging-api/#audio-message
                    - Location : https://developers.line.biz/en/reference/messaging-api/#location-message
                    - Sticker : https://developers.line.biz/en/reference/messaging-api/#sticker-message
                    */

                    /*
                        https://medium.com/linedevth/111ea6c17ada
                    */
                    let msg = JSON.stringify(event)

                    if (event.source.type === "group") {

                        const validateEventType = ['image', 'audio', 'video', 'file']
                        if (validateEventType.includes(event.message.type)) {
                            const resGetContent = await line.getContent(event.message, event.message.id)
                            console.log("binary ", binary.fileName);
                            // fileName = resGetContent.fileName
                            // todo save binary to firestore
                            binary = resGetContent.binary

                            const publicUrl = await firebase.saveImageToStorage(event.source.groupId, resGetContent.fileName, resGetContent.binary)
                            await firebase.insertImageGroup(event.source.groupId, event.message.id, publicUrl)
                            msg = publicUrl
                        }
                    }

                    await line.replyWithLongLived(event.replyToken, [{
                        "type": "text",
                        "text": msg,
                    }])
                } break;
            case "unsend":
                /*
                    unsend
                    https://developers.line.biz/en/reference/messaging-api/#unsend-event
                */
                profile = await line.getProfile(event.source.userId)
                console.log(`พบ ${profile.displayName} unsend`);
                break;
            case "join":
                /*
                    join
                    https://developers.line.biz/en/reference/messaging-api/#join-event
                */

                await line.replyWithLongLived(event.replyToken, [{
                    "type": "text",
                    "text": `ยินดีที่ได้รู้จัก`,
                    "quickReply": {
                        "items": [{
                            "type": "action",

                            "action": {
                                "type": "message",
                                "label": "สวัสดี",
                                "text": "สวัสดี"
                            }
                        }, {
                            "type": "action",

                            "action": {
                                "type": "clipboard",
                                "label": "คัดลองคำ",
                                "clipboardText": "สวัสดี"
                            }
                        }]
                    }
                }])
                break;
            case "leave":
                /*
                    leave
                    https://developers.line.biz/en/reference/messaging-api/#leave-event
                */
                console.log(JSON.stringify(event));
                break;
            case "memberJoined":
                /*
                    memberJoined
                    https://developers.line.biz/en/reference/messaging-api/#member-joined-event
                */
                console.log(JSON.stringify(event));
                for (let member of event.joined.members) {
                    if (member.type === "user") {
                        console.log(JSON.stringify(event));
                        await line.replyWithLongLived(event.replyToken, [{
                            "type": "text",
                            "text": JSON.stringify(event),
                            "quickReply": {
                                "items": [{
                                    "type": "action",
                                    "imageUrl": "https://bucket.ex10.tech/images/9f2a63dc-d84e-11ee-97d4-0242ac12000b/originalContentUrl.png",
                                    "action": {
                                        "type": "message",
                                        "label": "สวัสดี",
                                        "text": "สวัสดี"
                                    }
                                }]
                            }
                        }])
                    }
                }
                break;
            case "memberLeft":
                /*
                    memberLeft
                    https://developers.line.biz/en/reference/messaging-api/#member-left-event
                */
                console.log(JSON.stringify(event));
                break;
            case "postback":
                /*
                    postback
                    https://developers.line.biz/en/reference/messaging-api/#postback-event
                */
                console.log(JSON.parse(event.postback.data));
                await line.replyWithLongLived(event.replyToken, [{
                    "type": "text",
                    "text": JSON.stringify(event.postback.data),
                }])
                break;

            default:
                return response.end();
        }

    }

    return response.end();

});

exports.dialogflow = onRequest(async (request, response) => {

    /*
        receive dialogflow
        bonus
    */
    const object = request.body
    const replyToken = object.originalDetectIntentRequest.payload.data.replyToken
    await line.replyWithLongLived(replyToken, [{
        "type": "text",
        "text": "กินไรดีจ้ะ",
    }])
    return response.end();

});
