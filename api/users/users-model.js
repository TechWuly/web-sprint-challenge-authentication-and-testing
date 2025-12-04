// Simple in-memory database for users
const users = [];
let currentId = 1;

async function add(user) {
  const newUser = {
    id: currentId++,
    username: user.username,
    password: user.password
  };
  users.push(newUser);
  return newUser;
}

function findBy(filter) {
  return Promise.resolve(
    users.find(u => {
      for (const key in filter) {
        if (u[key] !== filter[key]) return false;
      }
      return true;
    })
  );
}

// For testing - reset the database
function _reset() {
  users.length = 0;
  currentId = 1;
}

module.exports = {
  add,
  findBy,
  _reset
};