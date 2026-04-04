import { useEffect, useState, FormEvent } from 'react';

interface User {
  id: number;
  email: string;
  role: string;
  created_at: string;
}

function authHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  };
}

export default function UserManager() {
  const [users, setUsers] = useState<User[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'superadmin'>('admin');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const load = () =>
    fetch('/api/users', { headers: authHeaders() })
      .then(r => r.json())
      .then(setUsers)
      .catch(console.error);

  useEffect(() => { load(); }, []);

  const createUser = async (e: FormEvent) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const res = await fetch('/api/users', {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ email: newEmail, password: newPassword, role: newRole }),
    });
    if (res.ok) {
      setSuccess('User created.');
      setNewEmail(''); setNewPassword('');
      load();
    } else {
      const data = await res.json();
      setError(data.error ?? 'Error');
    }
  };

  const deleteUser = async (id: number) => {
    if (!confirm('Delete this user?')) return;
    await fetch(`/api/users/${id}`, { method: 'DELETE', headers: authHeaders() });
    load();
  };

  return (
    <div>
      <h3 className="admin-section-title">Users</h3>
      <table className="admin-table" style={{ marginBottom: '2rem' }}>
        <thead>
          <tr><th>Email</th><th>Role</th><th>Created</th><th></th></tr>
        </thead>
        <tbody>
          {users.map(u => (
            <tr key={u.id}>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{new Date(u.created_at).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-sm btn-danger" onClick={() => deleteUser(u.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 className="admin-section-title">Create user</h3>
      {error   && <p className="form-msg error" style={{ marginBottom: '1rem' }}>{error}</p>}
      {success && <p className="form-msg success" style={{ marginBottom: '1rem' }}>{success}</p>}
      <form onSubmit={createUser} style={{ maxWidth: '400px' }}>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Password (min 8 chars)</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required minLength={8} />
        </div>
        <div className="form-group">
          <label>Role</label>
          <select value={newRole} onChange={e => setNewRole(e.target.value as 'admin' | 'superadmin')}
            style={{ width: '100%', padding: '0.65rem 0.9rem', border: '1px solid var(--color-border)', borderRadius: 'var(--radius)', fontSize: '1rem', background: 'var(--color-bg)' }}>
            <option value="admin">admin</option>
            <option value="superadmin">superadmin</option>
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-sm">Create</button>
      </form>
    </div>
  );
}
