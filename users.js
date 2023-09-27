const trimString = require("./utils");

let users = [];

const findUser = (user) => {
  const userName = trimString(user.name);
  const userRoom = trimString(user.room);

  return users.find(
    (u) => trimString(u.name) === userName && trimString(u.room) === userRoom
  );
};

const addUser = (user) => {
  const isExist = findUser(user);

  !isExist && users.push(user);

  const currentUser = isExist || user;

  return { isExist: !!isExist, user: currentUser };
};

const getRoomUsers = (room) => users.filter((user) => user.room === room);

const removeUser = (user) => {
  const found = findUser(user);

  users = users.filter(
    ({ room, name }) => room === found.room && name !== found.name
  );

  return found;
};

module.exports = { addUser, findUser, getRoomUsers, removeUser };
