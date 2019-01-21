import axios from 'axios';
import setAuthToken from '../utils/setAuthToken';
import { GET_ERRORS, SET_CURRENT_USER } from './types';
import jwtDecode from 'jwt-decode';

// REGISTER
export const registeruser = (userDate, history) => dispatch => {
	
    axios
      .post('/api/users/register', userDate)
      .then(res => history.push('/login'))
      .catch(err => 
      	dispatch({
          type: GET_ERRORS,
          payload: err.response.data
      }));
           
}


// Login - Get user Token
export const  loginUser = userDate => dispatch => {
	axios.post('/api/users/login', userDate)
	     .then(res => {
     // save to localstorage
     const { token } = res.data;
     //set to locltorage
     localStorage.setItem('jwtToken', token);
     // set token to header
     setAuthToken(token);
     // decode token to get user data
     const decoded = jwtDecode(token);
     // set current user
     dispatch(setCurrentUser(decoded));
	     })
	     .catch(err => 
	     	dispatch({
	     		type: GET_ERRORS,
	     		payload: err.response.data
	     	})
	     );
}

export const setCurrentUser = decoded => {
	return {
		type: SET_CURRENT_USER,
		payload: decoded
	}
}

export const logoutUser = () => dispatch => {
  // Remove token from localStorage
  localStorage.removeItem('jwtToken');
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to {} which will set isAuthenticated to false
  dispatch(setCurrentUser({}));
};