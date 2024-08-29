import actions from "./actions";

const initialState = {
  UserDetails: {},
  isAuthenticated: false,
  allUsersList: [],
  alluserRolesList: [],
  authRoutepath: "/home",
  loader: false,
  socket: "",
  allOnlineUsers: [],
  conversation: null
};

const AuthReducer = (state = initialState, action) => {
  switch (action.type) {
    case actions.SET_CONVERSATION:
      return {
        ...state,
        conversation: action.payload
      };
    case actions.SET_ALL_ONLINE_USERS:
      return {
        ...state,
        allOnlineUsers: action.payload
      };
    case actions.SET_SOCKET:
      return {
        ...state,
        socket: action.payload
      }
    case actions.SET_ALL_USER_ROLES:
      return {
        ...state,
        alluserRolesList: action.payload
      }
    case actions.SET_ALL_USERS:
      return {
        ...state,
        allUsersList: action.payload
      }
    case actions.SET_USER_DETAILS:
      return {
        ...state,
        UserDetails: action.payload
      }
    case actions.SET_AUTH_ROUTE_PATH:
      return {
        ...state,
        authRoutepath: action.payload
      };
    case actions.SET_AUTHETICATRION:
      return {
        ...state,
        isAuthenticated: action.payload
      }
    case actions.RESET:
      localStorage.clear()
      return {
        ...state,
        UserDetails: [],
        isAuthenticated: false,
        allUsersList: [],
        authRoutepath: "/home",
        loader: false,
      }
    default:
      return state;
  }
};

export default AuthReducer;