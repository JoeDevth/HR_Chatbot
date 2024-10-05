const axios = require("axios");

exports.forwardGemini = async (req) => {
  try {
    // ตรวจสอบคำที่ซ้ำและไม่ต้องการส่งต่อ
    const disallowedWords = ["อื่นๆ", "วันลา","111000","222000","333000","444000","555000","666000","777000","888000","999000","เพิ่มวันลา","การลา"];  

    // แปลง req.body เป็น string เพื่อให้สามารถใช้ includes ได้
    const bodyString = JSON.stringify(req.body);

    // ตรวจสอบใน bodyString ว่ามีคำที่ไม่ต้องการหรือไม่
    const hasDisallowedWords = disallowedWords.some(word => bodyString.includes(word));

    // ถ้าพบคำที่ซ้ำหรือไม่ต้องการ ให้ return หรือโยน error กลับไป
    if (hasDisallowedWords) {
      console.log("Request contains disallowed words:", bodyString);
      return { message: "คำซ้ำหรือคำที่ไม่ต้องการไม่สามารถส่งต่อได้" };
    }

    req.headers.host = "script.google.com";
    const url = 'https://script.google.com/macros/s/AKfycbzOBPhIu-n_jQx86ZNOr16RWd8MpDpJFDrGB_LHSFW3UKNymzskg2RekoNukG2mUH77mw/exec';
    const response = await axios({
      url: url,
      method: "post",
      headers: req.headers,
      data: req.body
    });
    return response;
  } catch (error) {
    console.error('Error forwarding request to Google Gemini:', error.message);
    throw error;
  }
};
