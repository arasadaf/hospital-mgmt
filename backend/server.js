import exp from "express";
import mongoose from "mongoose";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";

// ROUTES
import { adminRoute } from "./APIs/AdminAPI.js";
import { doctorRoute } from "./APIs/DoctorAPI.js";
import { patientRoute } from "./APIs/PatientAPI.js";
import { commonRouter } from "./APIs/CommonAPI.js";

// IMPORTANT:
// Make sure this filename EXACTLY matches
// your actual file inside APIs folder
import { prescriptionRoute } from "./APIs/PrescriptionAPI.js";
import { startReminderScheduler } from "./services/reminderScheduler.js";

config();

const app = exp();


// MIDDLEWARE
const envOrigins = [];
if (process.env.CORS_ORIGIN) {
  envOrigins.push(...process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim()));
}
if (process.env.FRONTEND_URL) {
  envOrigins.push(process.env.FRONTEND_URL.trim());
}

const allowedOrigins = envOrigins.length
  ? envOrigins
  : [
      "http://localhost:5173",
      "http://localhost:5174",
      "https://hospital-management-gyg8sxoz7-akhilas-projects-29fa9b92.vercel.app",
      "https://hospital-management-f7nxsynzb-akhilas-projects-29fa9b92.vercel.app",
    ];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "Origin", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.set("trust proxy", 1);
app.use(cors(corsOptions));

app.use(exp.json());

app.use(cookieParser());


// STATIC FILES
app.use(
  "/uploads",
  exp.static(
    path.join(path.resolve(), "uploads")
  )
);


// TEST ROUTE
app.get("/", (req, res) => {
  res.json({
    message: "Server running",
  });
});


// ROUTES
app.use(
  "/common-api",
  commonRouter
);

app.use(
  "/admin-api",
  adminRoute
);

app.use(
  "/doctor-api",
  doctorRoute
);

app.use(
  "/patient-api",
  patientRoute
);

app.use(
  "/prescription-api",
  prescriptionRoute
);


// DATABASE CONNECTION
const connectDB = async () => {
  try {
    const dbUrl = process.env.DB_URL || process.env.MONGO_URI;

    if (!dbUrl) {
      console.error("❌ ERROR: No database URL found in environment variables.");
      console.error("Available environment variable keys:", Object.keys(process.env).join(", "));
      console.error("Please ensure DB_URL is set in your Render environment variables.");
      process.exit(1);
    }

    await mongoose.connect(dbUrl);

    console.log(
      "DB connection successful"
    );

    app.listen(
      process.env.PORT || 4000,
      () => {
        console.log(
          `Server started on port ${
            process.env.PORT || 4000
          }`
        );
        // Start background appointment reminder scheduler
        startReminderScheduler();
      }
    );

  } catch (err) {

    console.log(
      "DB connection error:",
      err
    );

  }
};

connectDB();


// INVALID ROUTE HANDLER
app.use((req, res) => {
  res.status(404).json({
    message: `${req.url} is invalid path`,
  });
});


// GLOBAL ERROR HANDLER
app.use(
  (err, req, res, next) => {

    console.log("Error:", err);

    // Validation Error
    if (
      err.name ===
      "ValidationError"
    ) {
      return res.status(400).json({
        message:
          "Validation error",
        error: err.message,
      });
    }

    // Invalid Mongo ID
    if (
      err.name === "CastError"
    ) {
      return res.status(400).json({
        message: "Invalid ID",
        error: err.message,
      });
    }

    // Duplicate Key Error
    const errCode =
      err.code ??
      err.cause?.code ??
      err.errorResponse?.code;

    const keyValue =
      err.keyValue ??
      err.cause?.keyValue ??
      err.errorResponse?.keyValue;

    if (errCode === 11000) {

      const field =
        Object.keys(keyValue)[0];

      const value =
        keyValue[field];

      return res.status(409).json({
        message:
          "Duplicate value",

        error: `${field} "${value}" already exists`,
      });

    }

    // Custom Error
    if (err.status) {
      return res.status(
        err.status
      ).json({
        message: err.message,
      });
    }

    // Server Error
    res.status(500).json({
      message:
        "Server side error",
    });

  }
);