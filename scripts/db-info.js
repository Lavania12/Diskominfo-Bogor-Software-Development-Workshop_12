const { initializeDatabase } = require("../lib/sequelize");

async function run() {
  try {
    console.log("🔎 Inspecting DB connection...");
    await initializeDatabase();
    const { sequelize } = require("../lib/sequelize");
    const dialect = sequelize.getDialect();
    const config = sequelize.config || {};
    console.log("Dialect:", dialect);
    console.log("Host:", config.host || "(N/A)");
    console.log("Database:", config.database || "(N/A)");
    console.log("Username:", config.username || "(N/A)");
    console.log("Pool:", sequelize.options && sequelize.options.pool);
    console.log("✅ Connection OK");
  } catch (e) {
    console.error("❌ Connection failed:", e.message);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();


