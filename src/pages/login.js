import React from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import actions from "../redux/auth/actions";
import { useHistory } from "react-router-dom";

export default function Login() {
    const dispatch = useDispatch();
    const { register, handleSubmit, formState: { errors } } = useForm();
    const history = useHistory();

    const onSubmit = (data) => {
        dispatch({ type: actions.GET_AUTHETICATRION, payload: data });
    };

    return (
        <div className="d-flex justify-content-center align-items-center min-vh-100">
            <div className="card shadow-lg p-4" style={{ maxWidth: '400px', width: '100%' }}>
                <h2 className="text-center mb-4">Sign In</h2>
                <form onSubmit={handleSubmit(onSubmit)}>
                    <div className="mb-3">
                        <label htmlFor="PhoneNumber" className="form-label">Phone Number</label>
                        <input
                            id="PhoneNumber"
                            className={`form-control ${errors.PhoneNumber ? 'is-invalid' : ''}`}
                            type="text"
                            {...register("PhoneNumber", { required: "Phone Number is required" })}
                        />
                        {errors.PhoneNumber && <div className="invalid-feedback">{errors.PhoneNumber.message}</div>}
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            id="password"
                            className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                            type="password"
                            {...register("password", { required: "Password is required" })}
                        />
                        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    </div>
                    <div className="d-grid gap-2">
                        <button type="submit" className="btn btn-primary">Sign In</button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => history.push("/sign-up")}
                        >
                            Sign Up
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
