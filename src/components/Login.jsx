import { useRef, useState } from "react";
import { useUser } from "../contexts/UserProvider";
import { Navigate } from "react-router-dom";

export default function Login() {
  const [controlState, setControlState] = useState({
    isLoggingIn: false,
    isLoginError: false,
  });

  const emailRef = useRef();
  const passRef = useRef();
  const { user, login } = useUser();

  async function onLogin() {
    setControlState((prev) => ({ ...prev, isLoggingIn: true, isLoginError: false }));

    const email = emailRef.current.value;
    const pass = passRef.current.value;

    const result = await login(email, pass);

    setControlState({
      isLoggingIn: false,
      isLoginError: !result,
    });
  }

  if (user.isLoggedIn) {
    return <Navigate to="/books" replace />;
  }

  return (
    <div>
      <h2>Library Login</h2>
      <table>
        <tbody>
          <tr>
            <th>Email</th>
            <td>
              <input type="text" name="email" id="email" ref={emailRef} />
            </td>
          </tr>
          <tr>
            <th>Password</th>
            <td>
              <input type="password" name="password" id="password" ref={passRef} />
            </td>
          </tr>
        </tbody>
      </table>
      <button onClick={onLogin} disabled={controlState.isLoggingIn}>
        {controlState.isLoggingIn ? "Logging in..." : "Login"}
      </button>
      {controlState.isLoginError && <div>Login incorrect</div>}
      <div style={{ marginTop: 16 }}>
        Test Users: admin@test.com/admin123, user@test.com/user123
      </div>
    </div>
  );
}
