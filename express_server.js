const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const morgan = require("morgan");
const bcrypt = require("bcrypt");
const { assert } = require('chai');
const app = express();
const PORT = 8080; 
app.use(cookieParser());

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ["key1", "key2"]
}));
app.use(morgan("dev"));

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID"},
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID"},
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const { generateRandomString, updateURL, emailExists, urlsForUser, belongsToUser, getUserByEmail} = require("./helpers");

//Home page, doesnt show anything!
app.get("/", (req, res) => {
  res.redirect("/urls");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Index page, shows listing of URLs
app.get("/urls", (req, res) => {
  let user = users[req.session.user_id];
  if (!req.session.user_id) {
    res.redirect("/login");
    return;
  }
  let filteredUrlDatabase = urlsForUser(user.id, urlDatabase);
  let templateVars = { urls: filteredUrlDatabase, user };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  let user = users[req.session.user_id];
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: user.id };
  console.log(urlDatabase);
  res.redirect(`/urls/${shortURL}`);
});

//Registration page
app.get('/register', (req, res) => {
  let user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
    return;
  }
  let templateVars = { user };
  res.render('register.ejs', templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    res.send(400, "Please include both a valid email and password");
  };

  if (emailExists(req.body.email, users)) {
    res.send(400, "An account already exists for this email address");
  };

  const newUserID = generateRandomString();
  let hashedPassword = bcrypt.hashSync(req.body.password, 10);
  users[userID] = { id: userID, email: req.body.email, password: hashedPassword };
  (console.log("current url database: \n", users))
  req.session.user_id = userID;
  res.redirect("/urls");
});

//Login page
app.get("/login", (req, res) => {
  let user = users[req.session.user_id];
  if (user) {
    res.redirect("/urls");
    return;
  }
  let templateVars = { user };
  res.render("login", templateVars);
});

app.post("/login", (req, res) => {
  let userEmail = req.body.email;
  let userPassword = req.body.password;
  if (!emailExists(userEmail, users)) {
    res.status(403).send("This email cannot be found.");
    return;
  } else {
    console.log("the users database: ", users);
    let user_id = getUserByEmail(userEmail, users);
    console.log("the user_id gettind checked: ", user_id)
    if (bcrypt.compareSync(passwordInput, users[user_id].password)) {
      req.session.user_id = user_id;
      res.redirect("/urls");
    } else {
      res.status(403).send("Password does not match");
      return;
    }
  }
});

//Shows New URL page
app.get("/urls/new", (req, res) => {
  let user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
    return;
  }
  let templateVars = { user };
  if (!req.cookies["user_id"]) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//Logout
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});

//Shows individual URL page
app.get("/urls/:shortURL", (req, res) => {
  let user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
    return;
  }
  if (!belongsToUser(user.id, shortURL, urlDatabase)) {
    res.status(401).send("You're not authorised to access this tinyURL.");
    return;
  }
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[shortURL].longURL, user };
  res.render("urls_show", templateVars);
});

//updates long URL in database

app.post("/urls/:shortURL", (req, res) => { 
  let user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
    return;
  }
  let shortURL = req.params.shortURL;
  let longURL = req.body.longURL;
  updateURL(shortURL, longURL, urlDatabase);
  res.redirect("/urls");
});

//Re-directs to Long URL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL) {
    //get the long url for the short url s
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL) {
      res.redirect(longURL);
    } else {
      res
        .status(404)
        .send({ message: "long url not found for the given short url" });
    }
  }
});

//Deletes URL from DB
app.post("/urls/:shortURL/delete", (req, res) => {
  let user = users[req.session.user_id];
  if (!user) {
    res.redirect("/login");
    return;
  }
  let shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});