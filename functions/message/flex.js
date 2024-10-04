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
                              "type": "button",
                              "action": {
                                  "type": "message",
                                  "label": "ประกันสังคม",
                                  "text": "ประกันสังคม" // ลบเครื่องหมายคำพูดซ้ำออก
                              },
                              "style": "primary",
                              "color": "#ff66c4",
                              "margin": "sm"
                          },
                          {
                              "type": "button",
                              "action": {
                                  "type": "message",
                                  "label": "วันหยุดพักผ่อนประจำปี",
                                  "text": "วันหยุดพักผ่อนประจำปี" // ลบเครื่องหมายคำพูดซ้ำออก
                              },
                              "style": "primary",
                              "color": "#ff66c4",
                              "margin": "sm"
                          },
                          {
                              "type": "button",
                              "action": {
                                  "type": "message",
                                  "label": "สิทธิ์ในการซื้อสินค้าในราคาพนักงาน",
                                  "text": "สิทธิ์ในการซื้อสินค้าในราคาพนักงาน" // ลบเครื่องหมายคำพูดซ้ำออก
                              },
                              "style": "primary",
                              "color": "#ff66c4",
                              "margin": "sm"
                          },
                          {
                              "type": "button",
                              "action": {
                                  "type": "message",
                                  "label": "การปรับเงินเดือนประจำปี", // แก้ไขชื่อให้ถูกต้อง
                                  "text": "การปรับเงินเดือนประจำปี" // ลบเครื่องหมายคำพูดซ้ำออก
                              },
                              "style": "primary",
                              "color": "#ff66c4",
                              "margin": "sm"
                          },
                          {
                              "type": "button",
                              "action": {
                                  "type": "message",
                                  "label": "การให้โบนัสประจำปี",
                                  "text": "การให้โบนัสประจำปี" // ลบเครื่องหมายคำพูดซ้ำออก
                              },
                              "style": "primary",
                              "color": "#ff66c4",
                              "margin": "sm"
                          }
                      ]
                  }
              ]
          }
      }
  };
};
