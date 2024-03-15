const users = []; //we can store the user in the database

//join users to chat
export function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);
  return user;
}

//get current user
export function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

//user leaves chat
export function userLeave(id) {
  const index = users.findIndex((user) => user.id === id);

  // if user is found 
  if (index !== -1) {
    return users.splice(index, 1)[0];
  }
}

//get room users
export function getRoomUsers(room) {
  return users.filter((user) => user.room === room);
}
