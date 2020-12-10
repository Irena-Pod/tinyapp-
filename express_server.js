const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
app.use(cookieParser());
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
}

//filter URLs by user
function urlsForUser(id) {
  const filteredURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].id === id) {
      filteredURLs[url] = urlDatabase[url]
    }
  }
  return filteredURLs;
}

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", id: "1" },
  "9sm5xK": { longURL: "http://www.google.com", id: "2" },
  "3f3452": { longURL: "http://facebook.com", id: "1" }
};

const users = {
  "1": {
    id: "1",
    email: "jerry.seinfeld@gmail.com",
    password: "the-pick"
  },
  "2": {
    id: "2",
    email: "george.costanza@gmail.com",
    password: "the-hamptons"
  },
  "3": {
    id: "3",
    email: "kramer@gmail.com",
    password: "coffee-table-book"
  }
};
//check if email already exists
function emailExists(email) {
  for (let id in users) {
    if (users[id].email === email) {
      return true;
    }
  }
  return false;
}

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/login", (req, res) => {

  if (!emailExists(req.body.email)) {
    return res.status(403).send(`${res.statusCode}: Email cannot be found.`);
  }

  for (let id in users) {
    if (req.body.email === users[id].email && users[id].password === req.body.password) {
      res.cookie("user_id", users[id].id)
      res.redirect("/urls");
      return;
    }
  }
  return res.status(403).send(`${res.statusCode}: Incorrect password, try again!`);
});

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
});

//show URLs for logged-in users only
app.get("/urls", (req, res) => {
  let templateVars = {}
  if (!req.cookies["user_id"]) {
    templateVars = {
      user: null,
      urls: null
    }
  } else {
    templateVars = {
      urls: urlsForUser(req.cookies["user_id"]),
      user: users[req.cookies["user_id"]]
    }
  }
  res.render("urls_index", templateVars);
});

//
app.get("/urls/new", (req, res) => {
  if (!req.cookies["user_id"]) {
    res.redirect("/login")
    return;
  }

  const templateVars = {
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {}
  if (!req.cookies["user_id"]) {
    templateVars = {
      user: null,
      shortURL: null
    }
  } else {
    const userURLs = urlsForUser(req.cookies["user_id"]);
    if (userURLs[req.params.shortURL]) {
      templateVars = {
        shortURL: req.params.shortURL,
        longURL: urlDatabase[req.params.shortURL],
        user: users[req.cookies["user_id"]]
      };
    } else {
      templateVars = {
        user: users[req.cookies["user_id"]],
        shortURL: null
      }
    }
  }
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  res.redirect(`/urls/${shortURL}`);
  urlDatabase[shortURL] = { longURL: req.body.longURL, id: req.cookies["user_id"] }
});

app.get("/u/:shortURL", (req, res) => {
  const urlObject = urlDatabase[req.params.shortURL]
  res.redirect(urlObject.longURL);
});

app.get("/register", (req, res) => {
  const templateVars = {
    user: null
  }
  res.render("register", templateVars)
});

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send(`${res.statusCode}: Both email and password must be entered.`);
  }

  if (emailExists(req.body.email)) {
    return res.status(400).send(`${res.statusCode}: Email already exists.`);
  }
  // create user
  users[randomID] = {
    id: randomID,
    email: req.body.email,
    password: req.body.password
  };
  res.cookie("user_id", randomID)
  res.redirect("/urls")
});

app.get("/login", (req, res) => {
  const templateVars = {
    user: null
  }
  res.render("login", templateVars)
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
});

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
});
