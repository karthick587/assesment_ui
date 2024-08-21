import React from "react";
import { Route, Redirect } from "react-router-dom";
import { useSelector } from "react-redux";
const PublicRoute = ({ component: Component, ...rest }) => {
  const { isAuthenticated } = useSelector((state) => state.authReducer);
  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          <Redirect to="/home" />
        ) : (
          <Component {...props} />
        )
      }
    />
  );
};

export default PublicRoute; 
