require("dotenv").config();
const bodyParser = require("body-parser");
const cors = require("cors");
const express = require("express");
const cookieParser = require("cookie-parser");

require("./mongo");

process.on('uncaughtException', err => {
    console.log('UNCAUGHT EXCEPTION! 💥 Shutting down... npm install ?');
    console.log(err.name, err.message);
    process.exit(1);
  });
const { PORT, APP_URL } = require("./config.js");

const app = express();

const origin = [APP_URL, "https://join.le-stud.com"];

app.use(cors({ credentials: true, origin }));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(__dirname + "/../public"));

app.use("/user", require("./controllers/user"));
app.use("/project", require("./controllers/project"));
app.use("/activity", require("./controllers/activity"));
app.use("/analyze",require("./controllers/analyze"))
const d = new Date();

app.get("/", async (req, res) => {
  res.status(200).send("API LOCAL TIME :  " + d.toLocaleString());
});

require("./passport")(app);

app.listen(PORT, () => console.log("Listening on port " + PORT));

process.on('unhandledRejection', err => {
    console.log('UNHANDLED REJECTION! 💥 Shutting down... npm install ?');
    console.log(err.name, err.message);
    server.close(() => {
      process.exit(1);
    });
  });