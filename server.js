require('dotenv').config({ path: __dirname + '/.env' });
const app = require('./src/app');
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});