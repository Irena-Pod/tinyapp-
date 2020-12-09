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

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.post("/login", (req, res) => {
  res.cookie("Username", req.body.Username);
  res.redirect("/urls")
})

app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls")
})

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]]
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  // const user = users["1"]
  // console.log(user)
  const templateVars = users[req.cookies["user_id"]]
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString()
  res.redirect(`/urls/${shortURL}`);
  urlDatabase[shortURL] = req.body.longURL
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  res.render("register")
})

app.post("/register", (req, res) => {
  const randomID = generateRandomString();
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send(`${res.statusCode}: Both email and password must be entered.`);
  } else {
    users[randomID] = {
      id: randomID,
      email: req.body.email,
      password: req.body.password
    }
  }

  res.cookie("user_id", randomID)
  res.redirect("/urls")
})

app.post("/urls/:id", (req, res) => {
  urlDatabase[req.params.id] = req.body.longURL
  res.redirect("/urls")
})

app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL]
  res.redirect("/urls")
})
