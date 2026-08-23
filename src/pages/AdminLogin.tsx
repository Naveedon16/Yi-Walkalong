import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AdminService } from '../services';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const session = AdminService.getSession();
    if (session) {
      if (session.role === 'VOLUNTEER') {
        navigate('/volunteer');
      } else {
        navigate('/admin');
      }
    }
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      const user = await AdminService.login(email.trim());
      if (user.role === 'VOLUNTEER') {
        navigate('/volunteer');
      } else {
        navigate('/admin');
      }
    } catch (err: any) {
      console.error('ADMIN LOGIN ERROR:', err);
      if (err.code === 'NETWORK_ERROR' || err.code === 'HTTP_ERROR') {
        setError('Unable to connect to the admin service. Please check your connection.');
      } else if (err.code === 'AUTH_ERROR' || err.message.includes('Invalid')) {
        setError('Invalid admin credentials.');
      } else {
        setError(err.message || 'An unexpected error occurred during login.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 w-full">
      <Card>
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-[#1d1b20] dark:text-white">Admin Login</h1>
          <p className="text-[#49454f] dark:text-gray-300 mt-2">Sign in to manage WalkAlong registrations.</p>
        </div>
        
        <form onSubmit={handleLogin} className="space-y-6">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={error}
          />
          
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </Button>
        </form>
      </Card>
    </div>
  );
}
