import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../api/client.js';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Login failed'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-sidebar">
        <div className="auth-logo">
          <div className="auth-logo-mark">J</div>
          <span>Jira Clone</span>
        </div>
        <h1 className="auth-headline">Plan, track, and deliver great work — together.</h1>
        <p className="auth-subline">
          The #1 software development tool used by agile teams. Boards, backlogs, issues and
          workflows for teams of every size.
        </p>
        <div className="auth-quote">
          <p>"Our team ships faster with a single source of truth for every project."</p>
          <span>— Product Team, Demo Inc.</span>
        </div>
      </div>
      <div className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Log in to your account</h2>
          <p className="auth-card-sub">Welcome back! Please enter your details.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <label className="form-label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
            autoFocus
          />
          <label className="form-label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </button>
          <p className="auth-switch">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
          <div className="auth-demo">
            <strong>Demo accounts</strong>
            <p>john@demo.com · sarah@demo.com · mike@demo.com · anna@demo.com</p>
            <p>Password: <code>password123</code></p>
          </div>
        </form>
      </div>
    </div>
  );
}