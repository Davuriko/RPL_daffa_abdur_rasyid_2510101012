import { ApiClient, TokenKey } from "./api.js";

const UserKey = "kampusbite_user";

let currentUser = readStoredUser();
const listeners = new Set();

function readStoredUser() {
  try {
    const raw = localStorage.getItem(UserKey);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function persist(token, user) {
  currentUser = user;
  if (token) localStorage.setItem(TokenKey, token);
  if (user) localStorage.setItem(UserKey, JSON.stringify(user));
  notify();
}

function notify() {
  listeners.forEach((listener) => listener(currentUser));
}

export const Auth = {
  get User() {
    return currentUser;
  },
  get Role() {
    return currentUser ? currentUser.Role : null;
  },
  get IsAuthenticated() {
    return Boolean(localStorage.getItem(TokenKey));
  },

  async Login(email, password) {
    const result = await ApiClient.Login({ Email: email, Password: password });
    persist(result.Token, result.User);
    return result.User;
  },

  async Register(name, email, password, role) {
    const result = await ApiClient.Register({
      Name: name,
      Email: email,
      Password: password,
      Role: role,
    });
    persist(result.Token, result.User);
    return result.User;
  },

  Logout() {
    currentUser = null;
    localStorage.removeItem(TokenKey);
    localStorage.removeItem(UserKey);
    notify();
  },

  Subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};
