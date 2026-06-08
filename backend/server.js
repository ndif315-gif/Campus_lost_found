require("dotenv").config();

const express = require("express");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");

const db = require("./config/db");

const authRoutes = require("./routes/authRoutes");
const lostRoutes = require("./routes/lostRoutes");
const foundRoutes = require("./routes/foundRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const matchRoutes = require("./routes/matchRoutes");

const app = express();

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: false, // For serving images to frontend
}));
app.use(morgan("dev"));
app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads) - support both local and production paths
const uploadsDir = process.env.UPLOAD_DIR || path.join(__dirname, "uploads");
app.use("/uploads", express.static(uploadsDir));

app.get("/", (req, res) => {
    res.json({
        message: "Campus Lost & Found API Running",
        status: "success",
        timestamp: new Date()
    });
});

/*
    DATABASE TEST ROUTE
*/
app.get(
    "/api/test-db",
    async (req, res) => {

        try {

            const [rows] =
                await db.execute(
                    "SELECT NOW() AS currentTime"
                );

            res.json({
                success: true,
                database: "Connected",
                time:
                    rows[0].currentTime
            });

        } catch (error) {

            res.status(500).json({
                success: false,
                error:
                    error.message
            });

        }

    }
);

/*
    API ROUTES
*/

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/lost",
    lostRoutes
);

app.use(
    "/api/found",
    foundRoutes
);

app.use(
    "/api/notifications",
    notificationRoutes
);

app.use(
    "/api/match",
    matchRoutes
);

/*
    SERVER START
*/
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the existing server or set a different PORT environment variable.`);
    } else {
        console.error('Server error:', error);
    }
    process.exit(1);
});
