require('dotenv').config();
const { getAppOnlyAccessToken } = require("./api/_lib/auth");

(async () => {
  try {
    const token = await getAppOnlyAccessToken();
    require('fs').writeFileSync('token.txt', token);
    console.log("Token saved to token.txt");

  } catch (err) {
    console.error("AUTH ERROR:");
    console.error(err);
  }
})();
