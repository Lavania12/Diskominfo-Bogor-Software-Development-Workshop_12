const bcrypt = require("bcrypt");
const { initializeDatabase } = require("../lib/sequelize");

const emailsToSeed = [
  "fanani@diskominfo.go.id",
  "samsul@diskominfo.go.id",
  "arif@diskominfo.go.id",
  "rizky@diskominfo.go.id",
  "imam@diskominfo.go.id",
  "budi.santoso@diskominfo.go.id",
  "siti.rahayu@diskominfo.go.id",
  "agus.wijaya@diskominfo.go.id",
  "dewi.kartika@diskominfo.go.id",
  "joko.susilo@diskominfo.go.id",
];

async function run() {
  try {
    console.log("🚀 Initializing database (using shared Sequelize instance)...");
    await initializeDatabase();
    const { Admin } = require("../lib/sequelize");

    const passwordHash = await bcrypt.hash("admin123", 10);

    for (const email of emailsToSeed) {
      const username = email.split("@")[0];
      const [admin, created] = await Admin.findOrCreate({
        where: { email },
        defaults: { username, email, password: passwordHash },
      });
      if (!created) {
        await admin.update({ username, password: passwordHash });
      }
      console.log(email, created ? "CREATED" : "UPDATED");
    }

    console.log("✅ Seeding completed");
  } catch (err) {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

run();


