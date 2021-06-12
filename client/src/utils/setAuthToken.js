import axios from 'axios';

/**
 * Function that takes in a token
 * if the token is there - add it to the header
 * if not - then delete it from the headers
 */

const setAuthToken = token => {
  //  Check if there is a token in the localstorage
  if (token) {
    axios.defaults.headers.common['x-auth-token'] = token;
  } else {
    delete axios.defaults.headers.common['x-auth-token'];
  }
};

export default setAuthToken;
