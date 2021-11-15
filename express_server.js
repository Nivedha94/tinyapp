const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 8080; 
app.use(cookieParser());

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

function generateRandomString() {
  return Math.random().toString(36).slice(6);
}

const userExists = function(email) {
  for (const user in users) {
    if(users[user].email === email) {
      return true;
    }
    return false;
  }
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "new@user.com",
    password: "hello-enemy-safe"
  }
}

app.get("/", (req, res) => {
  res.send("Hello!");
});

//Check for additional endpoint
app.get("/urls.json", (req, res) => {
  res.send(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});


app.get("/urls/new", (req, res) => {
  templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL) {
    //get the long url for the short url s
    const longURL = urlDataba[shortURL];
    if (longURL) {
      res.redirect(longURL);
    } else {
      res
        .status(404)
        .send({ message: "long url not found for the given short url" });
    }
  }
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  if (shortURL && urlDatabase[shortURL]) {
    delete urlDatabase[shortURL];
    res.redirect("/urls");
  } else {
    res.status(404).send({ message: "short url not found" });
  }
});


app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

app.get('/register', (req, res) => {
  templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('register.ejs', templateVars);
});

app.post("/register", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!userEmail || !userPassword) {
    res.send(400, "Please include both a valid email and password");
  };

  if (userExists(userEmail)) {
    res.send(400, "An account already exists for this email address");
  };

  const newUserID = generateRandomString();
  users[newUserID] = {
    id: newUserID,
    email: userEmail,
    password: userPassword
  };
    res.cookie('user_id', newUserID);
    res.redirect("/urls");
});

app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render('login.ejs', templateVars);
});


app.post("/login", (req, res) => {
  const userEmail = req.body.email;
  const userPassword = req.body.password;

  if (!emailExists(email)) {
    res.send(403, "There is no account associated with this email address");
  } else {
    const userID = emailExists(email);
    if (users[userID].password !== password) {
      res.send(403, "The password you entered does not match the one associated with the provided email address");
    } else {
      res.cookie('user_id', userID);
      res.redirect("/urls");
    }
  }
});
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});