const axios = require("axios");



exports.forwardGoogleSheets = async (req) => {
    try {
    req.headers.host = "script.google.com";
    const url = 'https://script.google.com/macros/s/AKfycbyDU769MIwRxKY7ntfD0vH6vCwiODKlbBrjqjBwgCRHN4fl8CxnZwazBPF-9b__VSUpvg/exec'
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