import React, { useEffect, useState } from 'react'
import config from '../config/config';
;

const PLAN_OPTIONS = [
  { value: 'monthly', label: 'Monthly' },
  { value: '6months', label: '6 Months' },
  { value: 'annual', label: 'Annual' },
];

export default function PremiumManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editId, setEditId] = useState(null);
  const [editPlan, setEditPlan] = useState('monthly');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiBaseUrl}/admin/premium-users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to fetch users');
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch users');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleEdit = (user) => {
    setEditId(user.id);
    setEditPlan(user.premiumPlan || 'monthly');
  };

  const handleCancel = () => {
    setEditId(null);
  };

  const handleSave = async (user) => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${config.apiBaseUrl}/admin/give-premium`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ user_id: user.id, plan_type: editPlan })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update premium');
      setEditId(null);
      fetchUsers();
    } catch (err) {
      alert(err.message || 'Failed to update premium');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ background: '#f9f9ff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(60,60,120,0.07)' }}>
      <h2>Premium Status Management</h2>
      {loading ? (
        <div>Loading premium users...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : users.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden', marginTop: 24 }}>
          <thead>
            <tr style={{ background: '#e3e9f3' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>ID</th>
              <th style={{ padding: 10, textAlign: 'left' }}>User ID</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Plan Type</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Start Date</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Expiry Date</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: 10 }}>{user.id}</td>
                <td style={{ padding: 10 }}>{user.id}</td>
                <td style={{ padding: 10 }}>{user.email}</td>
                <td style={{ padding: 10 }}>
                  {editId === user.id ? (
                    <select value={editPlan} onChange={e => setEditPlan(e.target.value)} style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc' }}>
                      {PLAN_OPTIONS.map(opt => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  ) : (
                    user.premiumPlan || '-'
                  )}
                </td>
                <td style={{ padding: 10 }}>{user.premiumPlan && user.premiumExpiry ? new Date(new Date(user.premiumExpiry).setMonth(new Date(user.premiumExpiry).getMonth() - (user.premiumPlan === '6months' ? 6 : user.premiumPlan === 'annual' ? 12 : 1))).toLocaleString() : '-'}</td>
                <td style={{ padding: 10 }}>{user.premiumExpiry ? new Date(user.premiumExpiry).toLocaleString() : '-'}</td>
                <td style={{ padding: 10 }}>
                  {editId === user.id ? (
                    <>
                      <button style={{ marginRight: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }} onClick={() => handleSave(user)} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                      <button style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }} onClick={handleCancel} disabled={saving}>Cancel</button>
                    </>
                  ) : (
                    <button style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }} onClick={() => handleEdit(user)}>Edit</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 