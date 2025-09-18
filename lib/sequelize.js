const { Sequelize, DataTypes } = require("sequelize");

// Load our custom pg wrapper
const pgWrapper = require("./pg-wrapper");
const vercelDb = require("./vercel-db");

// Create Sequelize instance lazily at runtime to ensure env is available
let sequelize;
let isInitialized = false;
let modelsDefined = false;

const ensureSequelize = () => {
  if (sequelize) return;

  const isVercelProduction =
    process.env.VERCEL === "1" || process.env.NODE_ENV === "production";

  if (isVercelProduction) {
    console.log(
      "🚀 Running in Vercel production environment, using optimized configuration"
    );
    sequelize = vercelDb.createVercelSequelize(process.env.DATABASE_URL);
    return;
  }

  console.log("🏠 Running in local/development environment");

  if (!process.env.DATABASE_URL || process.env.DATABASE_URL.trim() === "") {
    throw new Error(
      "DATABASE_URL is required and must be provided via environment variable. No fallback is allowed."
    );
  }

  let isRenderDatabase = process.env.DATABASE_URL.includes("render.com");
  try {
    const url = new URL(process.env.DATABASE_URL);
    console.log(
      `🔌 Using Postgres database host: ${url.hostname}, db: ${url.pathname.replace('/', '')}`
    );
    // Force SSL when not connecting to localhost
    if (url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
      isRenderDatabase = true;
    }
  } catch (_) {
    console.log("🔌 Using Postgres database (could not parse URL)");
  }

  if (!pgWrapper.isAvailable()) {
    throw new Error(
      "PostgreSQL driver (pg) is required but not available. Please ensure pg package is installed."
    );
  }
  console.log("✅ pg package is available and ready to use");

  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: "postgres",
    dialectOptions: isRenderDatabase
      ? {
          ssl: {
            require: true,
            rejectUnauthorized: false,
          },
          keepAlive: true,
        }
      : {},
    logging: process.env.NODE_ENV === "development" ? console.log : false,
    underscored: true,
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    retry: { max: 3, timeout: 10000 },
  });
};

// Define models only after sequelize is ready
let Submission;
let NotificationLog;
let Admin;

const defineModels = () => {
  if (modelsDefined) return;

  Submission = sequelize.define(
  "Submission",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    tracking_code: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false,
    },
    nama: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nik: {
      type: DataTypes.STRING(16),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true,
      },
    },
    no_wa: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    jenis_layanan: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM("PENGAJUAN_BARU", "DIPROSES", "SELESAI", "DITOLAK"),
      defaultValue: "PENGAJUAN_BARU",
      allowNull: false,
    },
  },
  {
    tableName: "submissions",
    timestamps: true, // Enable automatic timestamp columns
    createdAt: "created_at", // Map to database column name
    updatedAt: "updated_at", // Map to database column name
  }
  );

  NotificationLog = sequelize.define(
  "NotificationLog",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    submission_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "submissions",
        key: "id",
      },
    },
    channel: {
      type: DataTypes.ENUM("WHATSAPP", "EMAIL"),
      allowNull: false,
    },
    send_status: {
      type: DataTypes.ENUM("SUCCESS", "FAILED"),
      allowNull: false,
    },
    payload: {
      type: DataTypes.JSON,
      allowNull: false,
    },
  },
  {
    tableName: "notification_logs",
    timestamps: true, // Re-enabled for automatic timestamp columns
    createdAt: "created_at", // Map to database column name
    updatedAt: false, // Only track creation time
  }
  );

  Admin = sequelize.define(
  "Admin",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
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
  },
  {
    tableName: "admins",
    timestamps: true,
    createdAt: "created_at",
    updatedAt: "updated_at",
  }
  );

  // Define relationships
  Submission.hasMany(NotificationLog, { foreignKey: "submission_id" });
  NotificationLog.belongsTo(Submission, { foreignKey: "submission_id" });

  modelsDefined = true;
};

// Initialize database with retry logic (authenticate + single sync without alter)
const initializeDatabase = async (retries = 3) => {
  try {
    ensureSequelize();
    defineModels();
    console.log("Attempting to connect to database...");
    await sequelize.authenticate();
    console.log("Database connection established successfully.");

    if (!isInitialized) {
      // Only sync once per process, and do not ALTER automatically to avoid loops
      if (process.env.NODE_ENV === "development" || process.env.VERCEL !== "1") {
        console.log("Synchronizing database models (no alter)...");
        await sequelize.sync();
        console.log("Database models synchronized.");
      } else {
        console.log(
          "Production environment detected, skipping database sync to prevent schema conflicts."
        );
      }
      isInitialized = true;
    }
  } catch (error) {
    console.error("Unable to connect to the database:", error);

    if (retries > 0) {
      console.log(`Retrying connection... (${retries} attempts left)`);
      await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait 2 seconds
      return initializeDatabase(retries - 1);
    }

    console.error("Max retries reached. Exiting...");
    process.exit(1);
  }
};

module.exports = {
  get sequelize() {
    return sequelize;
  },
  get Submission() {
    return Submission;
  },
  get NotificationLog() {
    return NotificationLog;
  },
  get Admin() {
    return Admin;
  },
  getSequelize: () => sequelize,
  getSubmissionModel: () => Submission,
  getNotificationLogModel: () => NotificationLog,
  getAdminModel: () => Admin,
  initializeDatabase,
};
