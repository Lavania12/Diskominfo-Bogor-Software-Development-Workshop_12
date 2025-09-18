const bcrypt = require("bcrypt");
const { Sequelize, DataTypes, Op } = require("sequelize");

// Create SQLite connection for development
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: console.log, // Enable logging
});

// Define Admin model locally
const Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false,
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    tableName: "admins",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
);

async function debugLogin() {
  try {
    console.log("🔍 Debugging login process...");
    
    // Initialize database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    
    // Test with email
    const testEmail = "admin@diskominfo-bogor.go.id";
    const testPassword = "admin123";
    
    console.log(`\n🔐 Testing with email: ${testEmail}`);
    
    // Cari admin berdasarkan email
    const admin = await Admin.findOne({
      where: {
        email: testEmail,
        is_active: true
      }
    });
    
    console.log("Admin found:", admin ? "Yes" : "No");
    
    if (admin) {
      console.log("Admin details:");
      console.log("- ID:", admin.id);
      console.log("- Username:", admin.username);
      console.log("- Email:", admin.email);
      console.log("- Active:", admin.is_active);
      console.log("- Password hash:", admin.password.substring(0, 20) + "...");
      
      // Test password comparison
      console.log("\n🔐 Testing password comparison...");
      const isValidPassword = await bcrypt.compare(testPassword, admin.password);
      console.log("Password valid:", isValidPassword);
      
      if (isValidPassword) {
        console.log("✅ Login should work!");
      } else {
        console.log("❌ Password mismatch!");
        
        // Test with different password
        console.log("\n🔐 Testing with 'admin123' (exact match)...");
        const testPassword2 = "admin123";
        const isValidPassword2 = await bcrypt.compare(testPassword2, admin.password);
        console.log("Password 'admin123' valid:", isValidPassword2);
      }
    } else {
      console.log("❌ No admin found with email:", testEmail);
      
      // Check all admins
      const allAdmins = await Admin.findAll();
      console.log("\n📊 All admins in database:");
      allAdmins.forEach((admin, index) => {
        console.log(`${index + 1}. ${admin.username} (${admin.email})`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error debugging login:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run the script
debugLogin();
