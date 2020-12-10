// Lookup user by email 
const getUserbyEmail = function (email, users) {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
  return null;
}

// Generate random string
function generateRandomString() {
  return Math.random().toString(36).substring(2, 8)
}

// Filter URLs by user
function urlsForUser(id, urlDatabase) {
  const filteredURLs = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].id === id) {
      filteredURLs[url] = urlDatabase[url]
    }
  }
  return filteredURLs;
}

module.exports = { getUserbyEmail, generateRandomString, urlsForUser }