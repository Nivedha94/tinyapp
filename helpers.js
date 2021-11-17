function generateRandomString() {
  return Math.random().toString(36).slice(6);
}

const updateURL = (shortURL, longURL, database) => {
  urlDatabase[shortURL].longURL = longURL;
};

const emailExists = function (email, database) {
  return Object.values(users).some(element => element.email === email);
};


const getUserByEmail = function(emailLookup, database) {
  return Object.values(database).find(user => user.email === emailLookup).id
  };

const urlsForUser = function (id, database) {
  let matchingKeys = [], userFilteredUrlDatabase = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      matchingKeys.push(url);
    }
  }
  matchingKeys.forEach(key => {
    userFilteredUrlDatabase[key] = urlDatabase[key];
  });
  return userFilteredUrlDatabase;
}

const belongsToUser = function (id, shortURL, database) {
  let usersUrls = urlsForUser(id); let found = false;
  Object.keys(usersUrls).forEach(url => {
    if (url === shortURL) {
      found = true;
    }
  }); return found;
}

module.exports = { 
  generateRandomString,
  updateURL, 
  checkUserEmailExists, 
  getUserByEmail, 
  urlsForUser,
  belongsToUser
};