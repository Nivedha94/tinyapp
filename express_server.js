const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

function generateRandomString() {
  return Math.random().toString(36).slice(6);
}

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

const bodyParser = require("body-parser");
const { url } = require("inspector");
app.use(bodyParser.urlencoded({ extended: true }));

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
  templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
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
  const longURL = req.body.longURL;
  if (longURL) {
    let shortURL;
    //check if long url already exists in database
    if (Object.values(urlDatabase).indexOf(longURL) > -1) {
      //if long url exists return the already existing short url      
      Object.keys(urlDatabase).every((item) => {
        if (urlDatabase[item] === longURL) {
          shortURL = item;
          return false;
        }
        return true;
      });
    } else {
      //generate new short url     
      shortURL = generateRandomString(longURL);
      urlDatabase[shortURL] = longURL;
    }
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(500).send({ message: "invalid long url" });
  }
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});