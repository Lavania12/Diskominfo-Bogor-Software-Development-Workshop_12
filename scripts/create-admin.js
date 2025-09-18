const bcrypt = require("bcrypt");
const { Sequelize, DataTypes } = require("sequelize");

// Create SQLite connection for development
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./database.sqlite",
  logging: false,
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
      validate: {
        len: [3, 50],
        notEmpty: true,
      },
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
        notEmpty: true,
      },
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [6, 255],
        notEmpty: true,
      },
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

async function createDefaultAdmin() {
  try {
    console.log("🚀 Starting database initialization...");
    
    // Initialize database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    
    // Sync database
    await sequelize.sync({ alter: true });
    console.log("✅ Database models synchronized.");
    
    console.log("📊 Checking for existing admin...");
    
    // Check if admin already exists
    const existingAdmin = await Admin.findOne({
      where: {
        username: "admin"
      }
    });

    if (existingAdmin) {
      console.log("✅ Admin already exists with username: admin");
      console.log("📧 Email:", existingAdmin.email);
      console.log("🕒 Created at:", existingAdmin.created_at);
      return;
    }

    console.log("👤 Creating default admin...");
    
    // Hash password
    const hashedPassword = await bcrypt.hash("admin123", 10);
    
    // Create default admin
    const admin = await Admin.create({
      username: "admin",
      email: "admin@diskominfo-bogor.go.id",
      password: hashedPassword,
      is_active: true
    });

    console.log("✅ Default admin created successfully!");
    console.log("👤 Username: admin");
    console.log("📧 Email: admin@diskominfo-bogor.go.id");
    console.log("🔑 Password: admin123");
    console.log("🆔 Admin ID:", admin.id);
    console.log("🕒 Created at:", admin.created_at);
    
    console.log("\n📝 Login credentials:");
    console.log("   Username: admin");
    console.log("   Password: admin123");
    console.log("   Email: admin@diskominfo-bogor.go.id");
    
  } catch (error) {
    console.error("❌ Error creating default admin:", error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

// Run the script
createDefaultAdmin();
