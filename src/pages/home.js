import { useDispatch, useSelector } from "react-redux"
import { useEffect } from "react"
import actions from "../redux/auth/actions"
import { Table } from "react-bootstrap"
export default function Home() {
    const { allUsersList, user } = useSelector((state) => state.authReducer)
    const dispatch = useDispatch()

    const logOut = () => {
        localStorage.removeItem("isAuthenticated")
        localStorage.removeItem("userName")
        dispatch({ type: actions.RESET })
    }

    useEffect(() => {
        dispatch({ type: actions.GET_ALL_USERS })
    }, [])
    return (
        <div className="container">
            <div className="d-flex justify-content-between m-5">
                <div className="title">
                    Welcome {user?.name}
                </div>
                <button className="btn btn-danger" onClick={logOut}>LogOut</button>
            </div>
            <Table>
                <thead>
                    <tr>
                        <th>
                            Name
                        </th>
                        <th>
                            Phone Number
                        </th>
                        <th>
                            Email
                        </th>
                        <th>
                            Role
                        </th>
                    </tr>
                </thead>
                <tbody>
                    {allUsersList.map(el =>
                        <tr key={el._id}>
                            <td>
                                {el.name}
                            </td>
                            <td>
                                {el.PhoneNumber}
                            </td>
                            <td>
                                {el.email}
                            </td>
                            <td>
                                {el?.roles[0]?.codeName}
                            </td>
                        </tr>
                    )}

                </tbody>
            </Table>
        </div>
    )
}