const db = require("./config/db");

async function testConnection() {
    try {
        console.log("Testing database connection...");
        const [rows] = await db.execute("SELECT NOW() AS currentTime");
        console.log("Database connected successfully.");
        console.log("Current database time:", rows[0].currentTime);
    } catch (error) {
        console.error("Database connection failed:", error.message);
        process.exit(1);
    } finally {
        try {
            await db.close();
            console.log("Database connection closed.");
        } catch (closeError) {
            console.warn("Failed to close database connection:", closeError.message);
        }
    }
}

testConnection();
