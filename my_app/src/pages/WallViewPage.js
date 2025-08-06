import React, { useEffect, useState } from 'react'
import config from '../config/config';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import WallPreview from '../components/WallPreview';
import './pages.css';

function WallViewPage() {
  const { id } = useParams(); // id can be wallId (public) or share_token (private)
  const location = useLocation();
  const navigate = useNavigate();
  const [wall, setWall] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [permission, setPermission] = useState('view');

  useEffect(() => {
    async function fetchWall() {
      setLoading(true);
      setError('');
      setWall(null);
      
      console.log('🔍 WallViewPage: Starting fetchWall');
      console.log('🔍 WallViewPage: id =', id);
      console.log('🔍 WallViewPage: location.pathname =', location.pathname);
      
      // Determine if this is a private or public view based on the route
      if (location.pathname.startsWith('/wall/view/')) {
        console.log('🔍 WallViewPage: Private share detected');
        // Private share: requires JWT
        const token = localStorage.getItem('token');
        if (!token) {
          // Save intended URL for redirect after login
          localStorage.setItem('redirectAfterLogin', window.location.pathname);
          navigate('/login');
          return;
        }
        try {
          const res = await fetch(`${config.apiBaseUrl}/wall/view/${id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (res.status === 401) {
            // Token invalid/expired, force re-login
            localStorage.removeItem('token');
            localStorage.setItem('redirectAfterLogin', window.location.pathname);
            navigate('/login');
            return;
          }
          const data = await res.json();
          if (res.ok && data.wall) {
            setWall(data.wall);
            setPermission(data.permission || 'view');
          } else {
            setError(data.error || 'Access denied or altar not found.');
          }
        } catch (err) {
          setError('Network error.');
        } finally {
          setLoading(false);
        }
      } else {
        console.log('🔍 WallViewPage: Public view detected');
        console.log('🔍 WallViewPage: API URL =', `${config.apiBaseUrl}/wall/public/${id}`);
        // Public view
        try {
          const res = await fetch(`${config.apiBaseUrl}/wall/public/${id}`);
          console.log('🔍 WallViewPage: API response status =', res.status);
          const data = await res.json();
          console.log('🔍 WallViewPage: API response data =', data);
          if (res.ok && data.wall) {
            setWall(data.wall);
           
          } else {
            setError(data.error || 'Wall not found.');
          }
        } catch (err) {
          console.error('🔍 WallViewPage: API error =', err);
          setError('Network error.');
        } finally {
          setLoading(false);
        }
      }
    }
    fetchWall();
  }, [id, location.pathname, navigate]);

  useEffect(() => {
    if (wall && permission === 'edit') {
      // Save altar data for editing
      localStorage.setItem('restoreWallData', JSON.stringify(wall.wallData));
      localStorage.setItem('restoreWallId', wall.id);
      // Redirect to WallPage editor
      navigate('/wall');
    }
  }, [wall, permission, navigate]);

  if (loading) return <div className="wallview-center-page">Loading...</div>;
  if (error) return <div className="wallview-center-page" style={{ color: 'red' }}>{error}</div>;
  if (!wall) return <div className="wallview-center-page">Wall not found.</div>;

  return (
    <div className="wallview-center-page">
      <div className="wallview-content">
        <h2 className="wallview-title">{wall.name || 'Untitled Wall'}</h2>
        <WallPreview wallData={wall.wallData} permission={permission} />
        {permission === 'edit' && wall && (
          <button
            className="edit-altar-btn"
            onClick={() => {
              localStorage.setItem('restoreWallData', JSON.stringify(wall.wallData));
              localStorage.setItem('restoreWallId', wall.id);
              navigate('/wall');
            }}
            style={{ marginTop: 24 }}
          >
            Edit this altar
          </button>
        )}
      </div>
    </div>
  );
}
export default WallViewPage; 