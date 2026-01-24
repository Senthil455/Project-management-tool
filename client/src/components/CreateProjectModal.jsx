import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/client.js';
import { getErrorMessage } from '../api/client.js';
import Modal from './Modal.jsx';
import { Icon } from './Icons.jsx';

export default function CreateProjectModal({ onClose, onCreated }) {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const deriveKey = (n) =>
    n
      .split(/\s+/)
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 10);

  const handleChange = (e) => {
    setName(e.target.value);
    if (!['Backspace', 'Delete'].includes(e.nativeEvent.inputType)) {
      setKey(deriveKey(e.target.value));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/projects', { name, key, description });
      if (onCreated) onCreated(res.data.project);
    } catch (err) {
      setError(getErrorMessage(err, 'Could not create project'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal title="Create project" onClose={onClose} width={520}>
      <form onSubmit={handleSubmit} className="form">
        {error && <div className="alert alert-error">{error}</div>}
        <label className="form-label">Project name *</label>
        <input
          className="input"
          value={name}
          onChange={handleChange}
          placeholder="e.g. Website Redesign"
          required
          autoFocus
        />
        <label className="form-label">Project key *</label>
        <input
          className="input"
          value={key}
          onChange={(e) => setKey(e.target.value.toUpperCase())}
          placeholder="WEB"
          maxLength={10}
          required
          pattern="[A-Za-z0-9]{2,10}"
          title="2-10 letters or numbers"
        />
        <p className="form-hint">
          Unique key used in issue keys (e.g. issues will be WEB-1, WEB-2...)
        </p>
        <label className="form-label">Description</label>
        <textarea
          className="textarea"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project about?"
        />
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create project'}
          </button>
        </div>
      </form>
    </Modal>
  );
}