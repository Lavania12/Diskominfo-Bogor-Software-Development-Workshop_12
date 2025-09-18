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

async function checkAdmins() {
  try {
    console.log("🔍 Checking admin data in database...");
    
    // Initialize database connection
    await sequelize.authenticate();
    console.log("✅ Database connection established successfully.");
    
    // Get all admins
    const admins = await Admin.findAll();
    
    console.log(`📊 Found ${admins.length} admin(s) in database:`);
    
    if (admins.length === 0) {
      console.log("❌ No admins found in database!");
      console.log("💡 Run 'npm run create-admin' to create default admin");
    } else {
      admins.forEach((admin, index) => {
        console.log(`\n👤 Admin ${index + 1}:`);
        console.log(`   ID: ${admin.id}`);
        console.log(`   Username: ${admin.username}`);
        console.log(`   Email: ${admin.email}`);
        console.log(`   Active: ${admin.is_active}`);
        console.log(`   Last Login: ${admin.last_login || 'Never'}`);
        console.log(`   Created: ${admin.created_at}`);
        console.log(`   Password Hash: ${admin.password.substring(0, 20)}...`);
      });
    }
    
  } catch (error) {
    console.error("❌ Error checking admins:", error);
  } finally {
    await sequelize.close();
    process.exit(0);
  }
}

// Run the script
checkAdmins();
