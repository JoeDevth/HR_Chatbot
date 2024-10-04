const axios = require("axios");



exports.forwardGoogleSheets2 = async (req) => {
    try {
    req.headers.host = "script.google.com";
    const url = 'https://script.google.com/macros/s/AKfycbz4r4_qmpg5vKPCz9mg5xZhGcMBOUuE9tOwad6TQetsbUqkVbr1DmHf6r5ZVV1LZrSEuA/exec'
      const response = await axios({
        url: url,
        method: "post",
        headers: req.headers,
        data: req.body
      });
      return response;
    } catch (error) {
      console.error('Error forwarding request to Google Sheets:', error.message);
      throw error;
    }
  };