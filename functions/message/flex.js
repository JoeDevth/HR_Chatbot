exports.exampleFlex = () => {
    return {
        "type": "flex",
        "altText": "สวัสดิการของบริษัทฯ",
        "contents": {
            "type": "bubble",
            "hero": {
                "type": "image",
                "url": "https://bucket.ex10.tech/images/66be3fba-8232-11ef-ab4d-0242ac12000e/originalContentUrl.jpg",
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
                                "type": "text",
                                "text": "-ประกันสังคม",
                                "size": "md",
                                "color": "#000000",
                                "margin": "sm"
                            },
                            {
                                "type": "text",
                                "text": "-วันหยุดพักผ่อนประจำปี",
                                "size": "md",
                                "color": "#000000",
                                "margin": "sm"
                            },
                            {
                                "type": "text",
                                "text": "-สิทธิ์ในการซื้อสินค้าในราคาพนักงาน",
                                "size": "md",
                                "color": "#000000",
                                "margin": "sm"
                            },
                            {
                                "type": "text",
                                "text": "-การปรับเงินเดือนประจำปี",
                                "size": "md",
                                "color": "#000000",
                                "margin": "sm"
                            },
                            {
                                "type": "text",
                                "text": "-การให้โบนัสประจำปี",
                                "size": "md",
                                "color": "#000000",
                                "margin": "sm"
                            }
                        ]
                    }
                ]
            }
        }
    };
  };
  