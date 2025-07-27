import React, { useEffect, useState } from 'react';

export default function BillingHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      setError('');
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('http://localhost:5000/api/premium/history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch history');
        setHistory(data.history || []);
      } catch (err) {
        setError(err.message || 'Failed to fetch history');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <div className="billing-history-page" style={{ padding: '48px 0', minHeight: '80vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: 32 }}>Billing History</h1>
      <div style={{ maxWidth: 700, margin: '0 auto', background: '#fff', borderRadius: 14, boxShadow: '0 2px 16px rgba(60,60,120,0.08)', padding: 32 }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>Loading...</div>
        ) : error ? (
          <div style={{ textAlign: 'center', color: 'red', fontSize: 18 }}>{error}</div>
        ) : history.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888', fontSize: 18 }}>No billing history found.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 17 }}>
            <thead>
              <tr style={{ background: '#f5f7fa' }}>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e3e7fa', textAlign: 'left' }}>Plan</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e3e7fa', textAlign: 'left' }}>Amount</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e3e7fa', textAlign: 'left' }}>Source</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e3e7fa', textAlign: 'left' }}>Start Date</th>
                <th style={{ padding: '12px 8px', borderBottom: '2px solid #e3e7fa', textAlign: 'left' }}>End Date</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                  <td style={{ padding: '10px 8px' }}>{row.plan_type}</td>
                  <td style={{ padding: '10px 8px' }}>{row.amount}</td>
                  <td style={{ padding: '10px 8px' }}>
                    {row.source === 'user' ? 'Purchased by User' : row.source === 'admin' ? 'Granted by Admin' : row.source}
                  </td>
                  <td style={{ padding: '10px 8px' }}>{new Date(row.start_date).toLocaleString()}</td>
                  <td style={{ padding: '10px 8px' }}>{new Date(row.end_date).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 