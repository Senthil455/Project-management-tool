import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getErrorMessage } from '../api/client.js';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(getErrorMessage(err, 'Registration failed'));
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
        <h1 className="auth-headline">Create your free account.</h1>
        <p className="auth-subline">
          Bring your team together with boards, sprints, and workflows that scale with your
          projects.
        </p>
        <div className="auth-feature-list">
          <div className="auth-feature">
            <span className="auth-feature-badge">✓</span>
            Kanban boards &amp; backlogs
          </div>
          <div className="auth-feature">
            <span className="auth-feature-badge">✓</span>
            Issues, epics, stories &amp; bugs
          </div>
          <div className="auth-feature">
            <span className="auth-feature-badge">✓</span>
            Comments, activity &amp; collaboration
          </div>
        </div>
      </div>
      <div className="auth-main">
        <form className="auth-card" onSubmit={handleSubmit}>
          <h2>Sign up</h2>
          <p className="auth-card-sub">Start managing your projects in minutes.</p>
          {error && <div className="alert alert-error">{error}</div>}
          <label className="form-label">Full name</label>
          <input
            type="text"
            className="input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
            autoFocus
          />
          <label className="form-label">Email</label>
          <input
            type="email"
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />
          <label className="form-label">Password</label>
          <input
            type="password"
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            required
          />
          <label className="form-label">Confirm password</label>
          <input
            type="password"
            className="input"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="Repeat your password"
            required
          />
          <button className="btn btn-primary btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </button>
          <p className="auth-switch">
            Already have an account? <Link to="/login">Log in</Link>
          </p>
        </form>
