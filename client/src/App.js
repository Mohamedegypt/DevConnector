import React, { Component } from 'react';
import { BrowserRouter as Router, Route , Switch} from 'react-router-dom';
import setAuthToken from './utils/setAuthToken';
import jwtDecode from 'jwt-decode';
import { setCurrentUser } from './actions/authAction';
import { Provider } from 'react-redux';
import store from './store';

import PrivatRoute from './components/common/PrivatRoute'

import { logoutUser } from './actions/authAction';
import { clearCurrentProfile } from './actions/profileAction';

import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import Landing from './components/layout/Landing';
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import DashBoard from './components/dashboard/Dashboard';
import CreateProfile from './components/createProfile/CreateProfile';
import EditProfile from './components/edit-profile/EditProfile';
import AddExperience from './components/add-credentials/AddExperience';
import AddEducation from './components/add-credentials/AddEducation';
import Profiles from './components/profiles/Profiles';
import Profile from './components/profile/Profile';
import Posts from './components/posts/Posts';
import Post from './components/post/Post';
import NotFound from './components/not-found/NotFound';

import './App.css';

if(localStorage.jwtToken) {
  // set auth token header
  setAuthToken(localStorage.jwtToken);
  //decoded token anf get the current user and export
  const decoded = jwtDecode(localStorage.jwtToken);
  //set user is a auhenticated
  store.dispatch(setCurrentUser(decoded));
  // Check for expire token
  const currentTime = Date.now() / 1000;
  if(decoded.exp < currentTime) {
    // logout User 
    store.dispatch(logoutUser());
    //clear the current profile 
     store.dispatch(clearCurrentProfile());
  // redirect to login page
    window.location.href = '/login'
  }
}


class App extends Component {
  render() {
    return (
      <Provider store={store}>
        <Router>
          <div className="App">
            <Navbar />

            
            <div className="container">
             <Switch>
             <Route exact path="/" component={Landing} />
              <Route exact path="/register" component={Register} />
              <Route exact path="/login" component={Login} />
              <Route exact path="/profiles" component={Profiles} />
              <Route exact path="/profile/:handle" component={Profile} />

            
              <PrivatRoute exact path="/dashboard" component={DashBoard} />
             
             
              <PrivatRoute exact path="/create-profile" component={CreateProfile} />
             
             
              <PrivatRoute 
                 exact
                 path="/edit-profile" 
                 component={EditProfile}
                />
             
             
              <PrivatRoute 
                 exact
                 path="/add-experience" 
                 component={AddExperience}
                />
             
             
              <PrivatRoute 
                 exact
                 path="/add-education" 
                 component={AddEducation}
                />
             
             
              <PrivatRoute 
                 exact
                 path="/feed" 
                 component={Posts}
                />
             

            
                <PrivatRoute exact path="/post/:id" component={Post} />
              
               <Route  component={NotFound} />
            </Switch>
            </div>
            <Footer />
          </div>
        </Router>
      </Provider>
    );
  }
}

export default App;
