import React, { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { AdminService, DashboardStats, AdminUser } from '../services';
import { Users, FileSpreadsheet, Activity, LogOut, CheckCircle, Settings, X, Download } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { theme } = useTheme();
  const [user, setUser] = useState<AdminUser | null>(null);
  
                const [isExportingCSV, setIsExportingCSV] = useState(false);

    const handleExportParticipantsCSV = async () => {
    setIsExportingCSV(true);
    try {
      const participants = await AdminService.getParticipants();
      if (!participants || participants.length === 0) {
        alert('No participants found.');
        setIsExportingCSV(false);
        return;
      }
      
      const headersSet = new Set<string>();
      participants.forEach(p => {
        Object.keys(p).forEach(k => headersSet.add(k));
      });
      
      const headers = Array.from(headersSet);
      
      let csvContent = headers.join(',') + '\n';
      
      participants.forEach(p => {
        const row = headers.map(header => {
          let val = (p as any)[header];
          if (val === null || val === undefined) val = '';
          val = String(val).replace(/"/g, '""');
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
            val = `"${val}"`;
          }
          return val;
        });
        csvContent += row.join(',') + '\n';
      });
      
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', 'WalkAlong_2026_Participants.csv');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      console.error(e);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setIsExportingCSV(false);
    }
  };

  const handleExportSummary = () => {
    if (!stats) return;
    
    let content = `WalkAlong 2026 Registration Summary\nGenerated: ${new Date().toLocaleString()}\n\n`;
    content += `Total Registrations: ${stats.totalRegistrations}\n`;
    content += `Total Participants: ${stats.totalParticipants}\n\n`;
    content += `Individual Registrations: ${stats.individualRegistrations}\n`;
    content += `Confirmed: ${stats.confirmedRegistrations}\n`;
    content += `Pending: ${stats.pendingValidation}\n\n`;
    
    content += `Individual Categories:\n`;
    Object.entries(stats.individualCategories || {}).forEach(([cat, count]) => {
      content += `- ${cat}: ${count}\n`;
    });
    
    content += `\nInstitution Categories:\n`;
    Object.entries(stats.institutionCategories || {}).forEach(([cat, count]) => {
      content += `- ${cat}: ${count}\n`;
    });
    
    content += `\nRegistration Trends:\n`;
    (stats.trends || []).forEach(trend => {
      content += `- ${trend.date}: ${trend.participants} participants (${trend.individual} individual, ${trend.institution} institution)\n`;
    });
    
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `walkalong-registration-summary-${dateStr}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  
  useEffect(() => {
    const session = AdminService.getSession();
    if (!session) {
      navigate('/');
      return;
    }
    setUser(session);

    AdminService.getDashboardStats()
      .then(setStats)
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [navigate]);

  const handleLogout = () => {
    AdminService.logout();
    navigate('/admin/login');
  };

  if (!user) return null;

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-[#1d1b20] dark:text-white">Admin Dashboard</h1>
          <p className="text-[#49454f] dark:text-gray-300">Welcome back, {user.name} ({user.role})</p>
        </div>
        <div className="flex gap-4 flex-wrap justify-end">
                    <Button variant="outline" size="sm" onClick={handleExportParticipantsCSV} disabled={isExportingCSV} className="dark:text-green-300 dark:border-green-800">
            <FileSpreadsheet className="w-4 h-4 mr-2" /> {isExportingCSV ? 'Preparing CSV...' : 'Download CSV'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportSummary} disabled={!stats} className="dark:text-blue-300 dark:border-blue-800">
            <Download className="w-4 h-4 mr-2" /> Export Summary
          </Button>
          <Link to="/admin/scanner">
            <Button variant="primary" size="sm" className="bg-[#6750a4]">Scanner</Button>
          </Link>
          <Link to="/admin/participants">
            <Button variant="outline" size="sm">Manage Participants</Button>
          </Link>
                    <Button variant="outline" size="sm" onClick={handleLogout} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>


      
      {loading ? (
        <div className="text-center py-20 text-[#6750a4]">Loading dashboard statistics...</div>
      ) : stats ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4 mb-8">
          <Card className="flex items-center gap-4 p-4 focus-within:ring-2 focus-within:ring-[#6750a4]" tabIndex={0} aria-label="Metric card">
            <div className="w-10 h-10 rounded-full bg-[#f3edf7] dark:bg-purple-900/30 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#6750a4]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#49454f] dark:text-gray-300">Registrations</p>
              <p className="text-xl font-bold text-[#1d1b20] dark:text-white">{stats.totalRegistrations}</p>
            </div>
          </Card>
          
          <Card className="flex items-center gap-4 p-4 focus-within:ring-2 focus-within:ring-[#6750a4]" tabIndex={0} aria-label="Metric card">
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#49454f] dark:text-gray-300">Participants</p>
              <p className="text-xl font-bold text-[#1d1b20] dark:text-white">{stats.totalParticipants}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4 focus-within:ring-2 focus-within:ring-[#6750a4]" tabIndex={0} aria-label="Metric card">
            <div className="w-10 h-10 rounded-full bg-[#eaddff] dark:bg-purple-900/40 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5 text-[#21005d]" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#49454f] dark:text-gray-300">Individuals</p>
              <p className="text-xl font-bold text-[#1d1b20] dark:text-white">{stats.individualRegistrations}</p>
            </div>
          </Card>
          
          <Card className="flex items-center gap-4 p-4 focus-within:ring-2 focus-within:ring-[#6750a4]" tabIndex={0} aria-label="Metric card">
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <FileSpreadsheet className="w-5 h-5 text-blue-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#49454f] dark:text-gray-300">Institutions</p>
              <p className="text-xl font-bold text-[#1d1b20] dark:text-white">{stats.institutionRegistrations}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4 focus-within:ring-2 focus-within:ring-[#6750a4]" tabIndex={0} aria-label="Metric card">
            <div className="w-10 h-10 rounded-full bg-green-50 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <CheckCircle className="w-5 h-5 text-green-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#49454f] dark:text-gray-300">Confirmed</p>
              <p className="text-xl font-bold text-[#1d1b20] dark:text-white">{stats.confirmedRegistrations}</p>
            </div>
          </Card>

          <Card className="flex items-center gap-4 p-4 focus-within:ring-2 focus-within:ring-[#6750a4]" tabIndex={0} aria-label="Metric card">
            <div className="w-10 h-10 rounded-full bg-yellow-50 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
              <Activity className="w-5 h-5 text-yellow-700" />
            </div>
            <div>
              <p className="text-xs font-medium text-[#49454f] dark:text-gray-300">Pending</p>
              <p className="text-xl font-bold text-[#1d1b20] dark:text-white">{stats.pendingValidation}</p>
            </div>
          </Card>
        </div>
      ) : (
        <Card className="text-center py-10">
          <p className="text-red-500">Unable to connect to the registration system.</p>
        </Card>
      )}
      
      
      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <Card className="lg:col-span-2">
            <div className="sr-only">
              Registration trend: {stats.totalRegistrations} total registrations. The highest activity was on {stats.trends?.[stats.trends.length - 1]?.date || 'a recent date'}.
            </div>
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-4">Registration Trends (Daily)</h3>
            {stats.trends && stats.trends.length > 0 ? (
              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.trends} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke={theme === 'dark' ? '#374151' : '#e1e2ec'} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fill: theme === 'dark' ? '#d1d5db' : '#49454f' }} 
                      tickFormatter={(val) => {
                        if (val === 'Unknown') return 'Unknown';
                        const d = new Date(val);
                        return d.toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
                      }}
                      className="dark:text-gray-300"
                    />
                    <YAxis tick={{ fill: theme === 'dark' ? '#d1d5db' : '#49454f' }} allowDecimals={false} className="dark:text-gray-300" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#374151' : '#cac4d0'}`, color: theme === 'dark' ? '#f3f4f6' : '#1d1b20' }}
                      labelFormatter={(val) => {
                        if (val === 'Unknown') return 'Unknown Date';
                        return new Date(val).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
                      }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '10px' }} />
                    <Bar dataKey="individual" name="Individual Registrations" fill="#6750a4" radius={[4, 4, 0, 0]} />
                                      </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-[#49454f] dark:text-gray-400">
                No registration activity yet.
              </div>
            )}
          </Card>
          
          <Card>
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-4">Registration Breakdown</h3>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Individual', value: stats.individualRegistrations },
                      { name: 'Institution', value: stats.institutionRegistrations }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    <Cell key="cell-0" fill="#6750a4" />
                    <Cell key="cell-1" fill="#b3261e" />
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: theme === 'dark' ? '#1e1e1e' : 'white', borderRadius: '8px', border: `1px solid ${theme === 'dark' ? '#374151' : '#cac4d0'}`, color: theme === 'dark' ? '#f3f4f6' : '#1d1b20' }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      )}

      {stats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card>
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-4">Individual Categories</h3>
            <div className="space-y-3">
              {stats.individualCategories ? Object.entries(stats.individualCategories).map(([cat, count]) => (
                <div key={`ind-${cat}`} className="flex justify-between items-center">
                  <span className="text-[#49454f] dark:text-gray-300">{cat}</span>
                  <span className="font-medium text-[#1d1b20] dark:text-white">{count}</span>
                </div>
              )) : Object.entries(stats.byCategory).map(([cat, count]) => (
                <div key={cat} className="flex justify-between items-center">
                  <span className="text-[#49454f] dark:text-gray-300">{cat}</span>
                  <span className="font-medium text-[#1d1b20] dark:text-white">{count}</span>
                </div>
              ))}
            </div>
          </Card>
          
          <Card>
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-4">Institution Categories</h3>
            <div className="space-y-3">
              {stats.institutionCategories ? Object.entries(stats.institutionCategories).map(([cat, count]) => (
                <div key={`inst-${cat}`} className="flex justify-between items-center">
                  <span className="text-[#49454f] dark:text-gray-300">{cat}</span>
                  <span className="font-medium text-[#1d1b20] dark:text-white">{count}</span>
                </div>
              )) : (
                <div className="text-[#49454f] dark:text-gray-300">No institution data</div>
              )}
            </div>
          </Card>

          <Card className="lg:col-span-2">
            <h3 className="text-lg font-bold text-[#1d1b20] dark:text-white mb-4">Registrations by T-Shirt Size</h3>
            <div className="space-y-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.byTshirtSize).map(([size, count]) => (
                <div key={size} className="flex justify-between items-center bg-[#f8f9ff] dark:bg-gray-800/50 p-3 rounded-lg border border-[#e1e2ec] dark:border-gray-700">
                  <span className="text-[#49454f] dark:text-gray-300 font-medium">{size}</span>
                  <span className="font-bold text-[#1d1b20] dark:text-white text-lg">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
