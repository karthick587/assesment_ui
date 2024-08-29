import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { BrowserRouter as Router, Switch } from "react-router-dom";
import Login from './pages/login';
import SignUp from './pages/signUp';
import Home from './pages/home';
import PublicRoute from './routes/PublicRoute';
import PrivateRoute from './routes/PrivateRoute';
import { Provider } from 'react-redux';
import { store } from "./redux/store"
import authActions from './redux/auth/actions';
import 'bootstrap/dist/css/bootstrap.min.css';
function App() {

  if (localStorage.getItem('token')) {
    store.dispatch({
      type: authActions.GET_VERIFY_TOCKET,
      payload: localStorage.getItem('token')
    });
  }
  window.addEventListener('beforeunload', () => { localStorage.setItem("activePath", window.location.pathname) })
  return (
    <Provider store={store}>
      <Router>
        <Switch >
          <PublicRoute exact path="/" component={Login} />
          <PublicRoute exact path="/sign-up" component={SignUp} />
          <PrivateRoute exact path="/home" component={Home} />
          {/*report */}
        </Switch>
      </Router>
    </Provider>
  );
}

export default App;
