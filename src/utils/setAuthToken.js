import axios from "axios";

const setAuthToken = (token) => {
  if (token) {
    // Apply to every request
    axios.defaults.headers.common["authorization"] = token;
  } else {
    // Delete auth Header
    delete axios.defaults.headers.common["authorization"];
  }
};
export default setAuthToken;