/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios.post(
      'http://localhost:7700/api/v1/users/login',
      {
        email: email,
        password: password,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully');
      window.setTimeout(() => {
        location.assign('/');
      }, 500);
    }
  } catch (error) {
    if (error.response && error.response.data) {
      showAlert('error', error.response.data.message);
    } else {
      showAlert('error', 'An error occurred during login.');
    }
  }
};

export const logout = async () => {
  try {
    const res = await axios.get('http://localhost:7700/api/v1/users/logout');
    if (res.data.status === 'success') {
      window.location.reload(); // corrected the reload method
    }
  } catch (error) {
    showAlert('error', 'Error logging out! Try again later.');
  }
};

if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}
