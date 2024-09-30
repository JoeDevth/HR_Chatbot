exports.exampleFlex = () => {
    return {
        "type": "flex",
        "altText": "สวัสดิการ",
        "contents": {
          "type": "bubble",
          "hero": {
            "type": "image",
            "url": "https://bucket.ex10.tech/images/6a746c0d-7e8d-11ef-ab4d-0242ac12000e/originalContentUrl.png",
            "size": "full",
            "aspectRatio": "20:13",
            "aspectMode": "cover"
          },
          "body": {
            "type": "box",
            "layout": "vertical",
            "contents": [
              {
                "type": "text",
                "text": "สวัสดิการ",
                "weight": "bold",
                "size": "xl",
                "margin": "md"
              },
              {
                "type": "text",
                "text": "กฎเกณฑ์สิทธิ์และการใช้สวัสดิการ",
                "size": "sm",
                "color": "#666666",
                "wrap": true
              },
              {
                "type": "separator",
                "margin": "xl"
              },
              {
                "type": "box",
                "layout": "vertical",
                "margin": "md",
                "contents": [
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "ค่ารักษาพยาบาล",
                        "text": "\"ค่ารักษาพยาบาล\""
                      },
                      "style": "primary",
                      "color": "#ef2a7c",
                      "margin": "sm"
                    },
                    {
                      "type": "button",
                      "action": {
                        "type": "message",
                        "label": "ค่ารักษาฟันและเหงือก",
                        "text": "\"ค่ารักษาฟันและเหงือก\""
                      },
                      "style": "primary",
                      "color": "#ef2a7c",
                      "margin": "sm"
                    }
                  ]
                }
              ]
            }
          }
        }
    }