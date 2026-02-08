import { useState } from "react";
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from "../contexts/AuthContext";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      navigate("/");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Invalid email or password",
      );
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-600">
      <div className="bg-gray-700 p-8 rounded-lg shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Sign In</h2>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-violet-500"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-violet-600 text-white py-2 rounded hover:bg-violet-700"
          >
            Sign In
          </button>
          <p className="mt-4 text-center text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-500 hover:underline">
              Sign up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
