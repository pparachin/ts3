require("dotenv").config();
const express = require('express');
const path = require("path");
const cors = require("cors");
const {log} = require("mercedlogger");
const morgan = require("morgan");
const UserRouter = require("./controllers/UserController");
const AdministrationRouter = require("./controllers/AdministrationController");
const {createContext, isLoggedIn} = require("./controllers/middleware");
const cookieParser = require("cookie-parser");
const HomeRouter = require("./controllers/HomeController");
const ClientsRouter = require("./controllers/Clients");

const { PORT = 3000 } = process.env;
const app = express();

app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(morgan("tiny"));
app.use(express.json());
app.use(createContext);

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use('/administration', AdministrationRouter);
app.use('/user', UserRouter);
app.use('/', HomeRouter);
app.use('/clients', ClientsRouter);
/*



*/

app.listen(PORT, () => log.green("SERVER STATUS", `Listening on port ${PORT}`));

