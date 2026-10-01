// Local development server. On Vercel, api/index.js serves the same app instead.
import app from "./app.js";

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("API running at http://localhost:" + PORT + "/api"));
