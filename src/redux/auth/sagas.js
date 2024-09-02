import { takeEvery, call, put, all } from 'redux-saga/effects';
import axios from 'axios';
import actions from './actions';
import { API_URL } from '../../utils/constants';
import setAuthToken from '../../utils/setAuthToken';
import { io } from 'socket.io-client';

const AuthSaga = function* () {
  yield all([
    yield takeEvery(actions.GET_AUTHETICATRION, Aunthentication),
    yield takeEvery(actions.GET_VERIFY_TOCKET, VerifyTocket),
    yield takeEvery(actions.ADD_USERS, addUsers),
    yield takeEvery(actions.GET_ALL_USERS, getAllUsers),
    yield takeEvery(actions.GET_ALL_USER_ROLES, getAllUserRoles),

  ]);
};
const getAllUserRoles = function* () {
  try {
    const result = yield call(() =>
      axios.get(`${API_URL}/api/users/role/list`)
    );
    console.log(result)
    if (result?.data) {
      yield put({ type: actions.SET_ALL_USER_ROLES, payload: result?.data });
    }
  } catch (err) {
    if (err.response && err.response.data) {
      alert(err.response.data.message || 'An error occurred');
    } else {
      alert('Network error or server is down');
    }
  } finally {
    yield put({ type: actions.SET_LOADER, payload: false });
  }
}
const getAllUsers = function* () {
  try {
    const result = yield call(() =>
      axios.get(`${API_URL}/api/users/list`)
    );
    if (result?.data) {
      yield put({ type: actions.SET_ALL_USERS, payload: result?.data });
    }
  } catch (err) {
    if (err.response && err.response.data) {
      alert(err.response.data.message || 'An error occurred');
    } else {
      alert('Network error or server is down');
    }
  } finally {
    yield put({ type: actions.SET_LOADER, payload: false });
  }
}

const addUsers = function* (data) {
  yield put({ type: actions.SET_LOADER, payload: true });
  const { payload, history } = data;
  try {
    const result = yield call(() =>
      axios.post(`${API_URL}/api/users/signup`, payload)
    );
      history.push("/")
  } catch (err) {
    console.log(err)
    if (err.response && err.response.data) {
      alert(err?.response?.data?.message || 'An error occurred');
    } else {
      alert('Network error or server is down');
    }
  } finally {
    yield put({ type: actions.SET_LOADER, payload: false });
  }
}

const VerifyTocket = function* (data) {
  const { payload } = data;
  if (payload) {
    setAuthToken(payload)
    try {
      const result = yield call(() =>
        axios.get(`${API_URL}/api/auth/verifytoken`)
      );
      if (result.data.statusCode === 200) {

        const socket = io(API_URL, {
          auth: {
            token: payload
          }
        });
        yield put({ type: actions.SET_SOCKET, payload: socket });
        yield put({ type: actions.SET_USER_DETAILS, payload: result.data.result });
        yield put({ type: actions.SET_AUTH_ROUTE_PATH, payload: (localStorage.getItem("activePath") && (localStorage.getItem("activePath") !== "/")) ? localStorage.getItem("activePath") : "/home" });
        yield put({ type: actions.SET_AUTHETICATRION, payload: true });
      } else {
        yield put({ type: actions.SET_AUTHETICATRION, payload: false });
        localStorage.removeItem('token');
      }
    } catch (err) {
      console.log(err)
    } finally {
      yield put({ type: actions.SET_LOADER, payload: false });
    }
  }
}
const Aunthentication = function* (data) {
  yield put({ type: actions.SET_LOADER, payload: true });
  const { payload } = data;

  try {
    const result = yield call(() =>
      axios.post(`${API_URL}/api/auth/validate`, payload)
    );

    if (result?.data?.statusCode === 200) {
      localStorage.setItem('token', result.data.token);
      yield put({ type: actions.GET_VERIFY_TOCKET, payload: result.data.token });
      alert(result.data?.message || 'Login successful');
    } else {
      alert(result?.data?.message || 'An error occurred');
    }
  } catch (err) {
    if (err.response && err.response.data) {
      alert(err.response.data.message || 'An error occurred');
    } else {
      alert('Network error or server is down');
    }
  } finally {
    yield put({ type: actions.SET_LOADER, payload: false });
  }
};


export default AuthSaga;
