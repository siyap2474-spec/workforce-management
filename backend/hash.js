const bcrypt = require("bcryptjs");

const run = async () => {
  const hash = await bcrypt.hash("Admin@123", 10);
  console.log(hash);
};

run();