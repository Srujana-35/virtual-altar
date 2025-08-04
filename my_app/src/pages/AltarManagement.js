import React, { useEffect, useState } from 'react'
import config from '../config/config';
import WallPreview from '../components/WallPreview';

export default function AltarManagement() {
  const [usersAltars, setUsersAltars] = useState([]);
 // const [selectedAltar, setSelectedAltar] = useState(null);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [previewWall, setPreviewWall] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  useEffect(() => {
    const fetchAltars = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${config.apiBaseUrl}/admin/users-altars`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to fetch altars');
        setUsersAltars(data.users);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchAltars();
  }, []);

  // Filter users by search query (username or email)
  const filteredUsersAltars = usersAltars.filter((user) => {
    const query = search.toLowerCase();
    return (
      user.username.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query)
    );
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div style={{ color: 'red' }}>Error: {error}</div>;

  return (
    <div style={{ background: '#f9f9ff', borderRadius: 12, padding: 24, boxShadow: '0 2px 8px rgba(60,60,120,0.07)' }}>
      <h2>Altar Management</h2>
      <div style={{ marginBottom: 18, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Search by username or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc', width: 220 }}
        />
      </div>
      {loading ? (
        <div>Loading altars...</div>
      ) : filteredUsersAltars.length === 0 ? (
        <div>No altars found.</div>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', borderRadius: 8, overflow: 'hidden' }}>
          <thead>
            <tr style={{ background: '#e3e9f3' }}>
              <th style={{ padding: 10, textAlign: 'left' }}>Username</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Email</th>
              <th style={{ padding: 10, textAlign: 'left' }}>Altars (Previews)</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsersAltars.map(user => (
              <tr key={user.user_id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                <td style={{ padding: 10 }}>{user.username}</td>
                <td style={{ padding: 10 }}>{user.email}</td>
                <td style={{ padding: 10 }}>
                  {user.altars.length === 0 ? (
                    <span style={{ color: '#888' }}>No altars</span>
                  ) : (
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                      {user.altars.map(altar => {
                        // Use wallpaper or first image as preview
                        let previewImg = null;
                        if (altar.wall_data.wallpaper) previewImg = altar.wall_data.wallpaper;
                        else if (altar.wall_data.images && altar.wall_data.images.length > 0) previewImg = altar.wall_data.images[0].src;
                        return (
                          <button
                            key={altar.id}
                            style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                            title={altar.name}
                            onClick={() => { setPreviewWall(altar.wall_data); setPreviewTitle(`${user.username} - ${altar.name}`); }}
                          >
                            {previewImg ? (
                              <img
                                src={previewImg.startsWith('http') || previewImg.startsWith('/') || previewImg.startsWith('data:') ? previewImg : previewImg}
                                alt={altar.name}
                                style={{ width: 80, height: 60, objectFit: 'cover', border: '2px solid #1976d2', borderRadius: 6 }}
                              />
                            ) : (
                              <div style={{ width: 80, height: 60, background: '#eee', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', borderRadius: 6 }}>
                                No Preview
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {/* Modal for previewing altar */}
      {previewWall && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
          background: 'rgba(0,0,0,0.4)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}
          onClick={() => setPreviewWall(null)}
        >
          <div style={{ background: '#fff', padding: 24, borderRadius: 10, maxWidth: '90vw', maxHeight: '90vh', overflow: 'auto', position: 'relative' }} onClick={e => e.stopPropagation()}>
            <button style={{ position: 'absolute', top: 10, right: 10, fontSize: 24, background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => setPreviewWall(null)}>&times;</button>
            <h3 style={{ textAlign: 'center', marginBottom: 16 }}>{previewTitle}</h3>
            <WallPreview wallData={previewWall} style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto' }} />
          </div>
        </div>
      )}
    </div>
  );
}