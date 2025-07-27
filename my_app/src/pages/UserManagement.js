import React, { useEffect, useState, useRef } from 'react';

function PasswordDialog({ open, onClose, onConfirm, loading, error }) {
  const [password, setPassword] = useState('');
  useEffect(() => { if (!open) setPassword(''); }, [open]);
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.25)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fff', borderRadius: 10, padding: 28, minWidth: 320, boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
        <h3>Admin Password Required</h3>
        <p style={{ color: '#555', marginBottom: 16 }}>Please enter your password to confirm this action.</p>
        <input
          type="password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Admin password"
          style={{ width: '100%', padding: 10, borderRadius: 6, border: '1.5px solid #ccc', marginBottom: 12 }}
          autoFocus
        />
        {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
          <button onClick={() => onConfirm(password)} disabled={loading || !password} style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}>{loading ? 'Verifying...' : 'Confirm'}</button>
        </div>
      </div>
    </div>
  );
}

function AddUserDialog({ open, onClose, onUserAdded }) {
  const [form, setForm] = useState({ username: '', email: '', password: '', role: 'user', otp: '' });
  const [step, setStep] = useState(1); // 1: enter info, 2: enter OTP
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  // Add timer state for OTP expiration
  const [timer, setTimer] = useState(120); // 2 minutes
  const timerRef = useRef();

  useEffect(() => {
    if (!open) {
      setForm({ username: '', email: '', password: '', role: 'user', otp: '' });
      setStep(1);
      setSendingOtp(false);
      setVerifying(false);
      setError('');
      setTimer(120);
      clearInterval(timerRef.current);
    }
  }, [open]);

  // Start timer when step changes to 2 (OTP step)
  useEffect(() => {
    if (step === 2) {
      setTimer(120);
      clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    } else {
      clearInterval(timerRef.current);
    }
    return () => clearInterval(timerRef.current);
  }, [step]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSendOtp = async () => {
    setSendingOtp(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setStep(2);
    } catch (err) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleCreateUser = async () => {
    setVerifying(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          otp: form.otp,
          username: form.username,
          password: form.password
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create user');
      onUserAdded();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to create user');
    } finally {
      setVerifying(false);
    }
  };

  if (!open) return null;
  return (
    <div className="add-user-modal-backdrop">
      <div className="add-user-modal-box">
        <div className="add-user-modal-title">Add New User</div>
        <div className="add-user-modal-fields">
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            placeholder="Username"
            className="add-user-modal-input"
            disabled={step === 2}
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Email"
            className="add-user-modal-input"
            disabled={step === 2}
          />
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Password"
            className="add-user-modal-input"
            disabled={step === 2}
          />
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="add-user-modal-select"
            disabled={step === 2}
          >
            <option value="user">user</option>
            <option value="admin">admin</option>
          </select>
          {step === 1 && (
            <button
              className="add-user-modal-btn otp"
              onClick={handleSendOtp}
              disabled={sendingOtp || !form.email || !form.username || !form.password}
            >
              {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>
          )}
          {step === 2 && (
            <>
              <input
                type="text"
                name="otp"
                value={form.otp}
                onChange={handleChange}
                placeholder="Enter OTP"
                className="add-user-modal-input"
                disabled={timer === 0}
              />
              <div className={`otp-modal-timer${timer === 0 ? ' expired' : ''}`}
                   style={{ marginBottom: 8 }}>
                {timer > 0 ? `OTP expires in ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2, '0')}` : 'OTP expired'}
              </div>
              <button
                className="add-user-modal-btn"
                onClick={handleCreateUser}
                disabled={verifying || !form.otp || timer === 0}
              >
                {verifying ? 'Creating User...' : 'Create User'}
              </button>
            </>
          )}
          {error && <div className="add-user-modal-error">{error}</div>}
        </div>
        <div className="add-user-modal-actions">
          <button onClick={onClose} className="add-user-modal-btn cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
}

function OtpModal({ open, email, loading, sendError, onRetry, onClose, onVerified }) {
  const [otp, setOtp] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');
  const [timer, setTimer] = useState(120); // 2 minutes
  const timerRef = useRef();

  useEffect(() => {
    if (open) {
      setOtp('');
      setError('');
      setTimer(120);
      timerRef.current = setInterval(() => {
        setTimer(t => {
          if (t <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return t - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [open]);

  const handleVerify = async () => {
    setVerifying(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/auth/verify-otp-edit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      onVerified();
    } catch (err) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setVerifying(false);
    }
  };

  if (!open) return null;
  return (
    <div className="add-user-modal-backdrop">
      <div className="add-user-modal-box">
        <div className="add-user-modal-title">Verify OTP</div>
        <div className="add-user-modal-fields">
          <div style={{ fontSize: '1.08rem', marginBottom: 10 }}>An OTP will be sent to <b>{email}</b>.</div>
          {loading ? (
            <div style={{ margin: '18px 0', textAlign: 'center' }}>
              <span>Sending OTP...</span>
            </div>
          ) : sendError ? (
            <div style={{ margin: '18px 0', textAlign: 'center', color: 'red' }}>
              <div>{sendError}</div>
              <button className="add-user-modal-btn otp" onClick={onRetry} style={{ marginTop: 8 }}>Retry</button>
            </div>
          ) : (
            <>
              <input
                type="text"
                value={otp}
                onChange={e => setOtp(e.target.value)}
                placeholder="Enter OTP"
                className="add-user-modal-input"
                maxLength={6}
              />
              <div className={`otp-modal-timer${timer === 0 ? ' expired' : ''}`}>
                {timer > 0 ? `OTP expires in ${Math.floor(timer/60)}:${(timer%60).toString().padStart(2, '0')}` : 'OTP expired'}
              </div>
              {error && <div className="add-user-modal-error">{error}</div>}
            </>
          )}
        </div>
        <div className="add-user-modal-actions">
          <button
            className="add-user-modal-btn otp"
            onClick={handleVerify}
            disabled={loading || verifying || !otp || timer === 0}
          >
            {verifying ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            className="add-user-modal-btn cancel"
            onClick={onClose}
            disabled={loading || verifying}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editUserId, setEditUserId] = useState(null);
  const [editForm, setEditForm] = useState({ username: '', email: '', role: 'user' });
  const [passwordDialog, setPasswordDialog] = useState({ open: false, action: null, user: null });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [otpError, setOtpError] = useState('');
  const [originalEmail, setOriginalEmail] = useState('');
  const [showEditOtpModal, setShowEditOtpModal] = useState(false);
  const [editOtpEmail, setEditOtpEmail] = useState('');
  const [editOtpVerified, setEditOtpVerified] = useState(false);
  // New states for OTP modal loading/error
  const [editOtpLoading, setEditOtpLoading] = useState(false);
  const [editOtpSendError, setEditOtpSendError] = useState('');

  // Move fetchUsers here so it's defined before AddUserDialog usage
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('http://localhost:5000/api/admin/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err) {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleDelete = (userId) => {
    setPasswordDialog({ open: true, action: 'delete', user: userId });
  };

  const handleEdit = (user) => {
    setEditUserId(user.id);
    setEditForm({ username: user.username, email: user.email, role: user.role });
    setOriginalEmail(user.email);
    setPasswordDialog({ open: true, action: 'edit', user: user.id });
    setOtpError('');
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(f => ({ ...f, [name]: value }));
    if (name === 'email' && value !== originalEmail) {
      setOtpError('');
    }
  };

  const handleEditSave = async (userId) => {
    // If email changed and not verified, open OTP modal immediately and send OTP in background
    if (editForm.email !== originalEmail && !editOtpVerified) {
      setOtpError('');
      setShowEditOtpModal(true);
      setEditOtpEmail(editForm.email);
      setEditOtpLoading(true);
      setEditOtpSendError('');
      // Send OTP in background
      try {
        const res = await fetch('http://localhost:5000/api/auth/request-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: editForm.email })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
        setEditOtpLoading(false);
        setEditOtpSendError('');
      } catch (err) {
        setEditOtpLoading(false);
        setEditOtpSendError(err.message || 'Failed to send OTP');
      }
      return;
    }
    // Save directly if username/role changed or OTP verified
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setUsers(users => users.map(u => u.id === userId ? { ...u, ...editForm } : u));
        setEditUserId(null);
        setEditOtpVerified(false);
      } else {
        alert('Failed to update user.');
      }
    } catch (err) {
      alert('Error updating user: ' + err.message);
    }
  };

  const handleEditCancel = () => {
    setEditUserId(null);
  };

  const handlePasswordDialogClose = () => {
    setPasswordDialog({ open: false, action: null, user: null });
    setPasswordError('');
    setPasswordLoading(false);
  };

  const handlePasswordDialogConfirm = async (password) => {
    setPasswordLoading(true);
    setPasswordError('');
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      const res = await fetch('http://localhost:5000/api/admin/reauth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userInfo.email, password })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setPasswordError(data.error || 'Password incorrect');
        setPasswordLoading(false);
        return;
      }
      // Password correct, proceed
      setPasswordDialog({ open: false, action: null, user: null });
      setPasswordLoading(false);
      setPasswordError('');
      if (passwordDialog.action === 'delete') {
        await doDelete(passwordDialog.user);
      } else if (passwordDialog.action === 'edit') {
        // Just allow editing, don't auto-save
      }
    } catch (err) {
      setPasswordError('Error verifying password');
      setPasswordLoading(false);
    }
  };

  // Move actual delete logic to a separate function
  const doDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`http://localhost:5000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setUsers(users => users.filter(u => u.id !== userId));
      } else {
        alert('Failed to delete user.');
      }
    } catch (err) {
      alert('Error deleting user: ' + err.message);
    }
  };

  const filteredUsers = users.filter(
    u =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ background: '#f9f9ff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(60,60,120,0.07)' }}>
      <PasswordDialog
        open={passwordDialog.open}
        onClose={handlePasswordDialogClose}
        onConfirm={handlePasswordDialogConfirm}
        loading={passwordLoading}
        error={passwordError}
      />
      <OtpModal
        open={showEditOtpModal}
        email={editOtpEmail}
        loading={editOtpLoading}
        sendError={editOtpSendError}
        onRetry={async () => {
          setEditOtpLoading(true);
          setEditOtpSendError('');
          try {
            const res = await fetch('http://localhost:5000/api/auth/request-otp', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: editOtpEmail })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
            setEditOtpLoading(false);
            setEditOtpSendError('');
          } catch (err) {
            setEditOtpLoading(false);
            setEditOtpSendError(err.message || 'Failed to send OTP');
          }
        }}
        onClose={() => setShowEditOtpModal(false)}
        onVerified={() => {
          setShowEditOtpModal(false);
          setEditOtpVerified(true);
        }}
      />
      <AddUserDialog open={addUserOpen} onClose={() => setAddUserOpen(false)} onUserAdded={fetchUsers} />
      <h2>User Management</h2>
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 220 }}
        />
        <button
          style={{ background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '8px 18px', fontWeight: 600, cursor: 'pointer' }}
          onClick={() => setAddUserOpen(true)}
        >
          + Add User
        </button>
      </div>
      {loading ? (
        <div>Loading users...</div>
      ) : filteredUsers.length === 0 ? (
        <div>No users found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e3e9f3' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Username</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Role</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                {editUserId === user.id ? (
                  <>
                    <td style={{ padding: 10 }}>
                      <input
                        type="text"
                        name="username"
                        value={editForm.username}
                        onChange={handleEditChange}
                        style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '90%' }}
                      />
                    </td>
                    <td style={{ padding: 10 }}>
                      <input
                        type="email"
                        name="email"
                        value={editForm.email}
                        onChange={handleEditChange}
                        style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '90%' }}
                      />
                      {editForm.email !== originalEmail && editOtpVerified && (
                        <span style={{ marginLeft: 8, color: 'green', fontWeight: 600 }}>OTP Verified</span>
                      )}
                      {otpError && <div className="add-user-modal-error">{otpError}</div>}
                    </td>
                    <td style={{ padding: 10 }}>
                      <select
                        name="role"
                        value={editForm.role}
                        onChange={handleEditChange}
                        style={{ padding: 6, borderRadius: 4, border: '1px solid #ccc', width: '90%' }}
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td style={{ padding: 10 }}>
                      <button style={{ marginRight: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }} onClick={() => handleEditSave(user.id)}>Save</button>
                      <button style={{ background: '#888', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }} onClick={handleEditCancel}>Cancel</button>
                    </td>
                  </>
                ) : (
                  <>
                    <td style={{ padding: 10 }}>{user.username}</td>
                    <td style={{ padding: 10 }}>{user.email}</td>
                    <td style={{ padding: 10 }}>{user.role}</td>
                    <td style={{ padding: 10 }}>
                      <button style={{ marginRight: 8, background: '#1976d2', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }} onClick={() => handleEdit(user)}>Edit</button>
                      <button style={{ background: '#e53935', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', cursor: 'pointer' }} onClick={() => handleDelete(user.id)}>Delete</button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
} 