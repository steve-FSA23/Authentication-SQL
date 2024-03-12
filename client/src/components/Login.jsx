const Login = ({ login }) => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    const submit = (ev) => {
        ev.preventDefault();
        login({ username, password });
    };
    return (
        <form onSubmit={submit}>
            <input
                value={username}
                onChange={(ev) => setUsername(ev.target.value)}
                placeholder="username"
            />
            <input
                value={password}
                onChange={(ev) => setPassword(ev.target.value)}
                placeholder="password"
            />
            <button>Login</button>
        </form>
    );
};

export default Login;
