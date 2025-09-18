const bcrypt = require("bcrypt");
const { Sequelize, DataTypes, Op } = require("sequelize");

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

async function simulateLoginAPI(username, password) {
  try {
    console.log(`🔐 Simulating login API for: ${username}`);
    
    // Initialize database connection
    await sequelize.authenticate();
    
    // Validasi input
    if (!username || !password) {
      return {
        success: false,
        message: "Username dan password wajib diisi",
        status: 400
      };
    }

    // Cari admin berdasarkan username atau email
    const admin = await Admin.findOne({
      where: {
        [Op.or]: [
          { username: username },
          { email: username }
        ],
        is_active: true
      }
    });

    if (!admin) {
      return {
        success: false,
        message: "Username atau password salah",
        status: 401
      };
    }

    // Verifikasi password
    const isValidPassword = await bcrypt.compare(password, admin.password);

    if (!isValidPassword) {
      return {
        success: false,
        message: "Username atau password salah",
        status: 401
      };
    }

    // Update last login
    await admin.update({
      last_login: new Date()
    });

    // Return success response (tanpa password)
    const adminData = {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      is_active: admin.is_active,
      last_login: admin.last_login,
      created_at: admin.created_at
    };

    return {
      success: true,
      message: "Login berhasil",
      admin: adminData,
      status: 200
    };

  } catch (error) {
    console.error("Login error:", error);
    return {
      success: false,
      message: "Terjadi kesalahan server",
      status: 500
    };
  }
}

async function testLoginCredentials() {
  try {
    console.log("🧪 Testing login credentials...\n");
    
    const testCases = [
      { username: "admin", password: "admin123" },
      { username: "admin@diskominfo-bogor.go.id", password: "admin123" },
      { username: "wronguser", password: "admin123" },
      { username: "admin", password: "wrongpass" }
    ];
    
    for (const testCase of testCases) {
      const result = await simulateLoginAPI(testCase.username, testCase.password);
      
      console.log(`Test: ${testCase.username} / ${testCase.password}`);
      console.log(`Result: ${result.success ? '✅ SUCCESS' : '❌ FAILED'}`);
      console.log(`Status: ${result.status}`);
      console.log(`Message: ${result.message}`);
      
      if (result.success) {
        console.log(`Admin Data:`, {
          id: result.admin.id,
          username: result.admin.username,
          email: result.admin.email
        });
      }
      
      console.log("---\n");
    }
  } finally {
    await sequelize.close();
  }
}

// Run the test
testLoginCredentials();
