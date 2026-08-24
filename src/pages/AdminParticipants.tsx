import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { AdminService, AdminUser, Participant } from '../services';
import { ParticipantDetails } from '../components/admin/ParticipantDetails';
import { Search, Download, ArrowLeft } from 'lucide-react';

export function AdminParticipants() {
  const navigate = useNavigate();
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedParticipant, setSelectedParticipant] = useState<Participant | null>(null);
  const [exportSuccess, setExportSuccess] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [compactView, setCompactView] = useState(() => {
    return localStorage.getItem('walkalong_compact_view') === 'true';
  });
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [bulkMessage, setBulkMessage] = useState('');
  
  useEffect(() => {
    localStorage.setItem('walkalong_compact_view', String(compactView));
  }, [compactView]);


  useEffect(() => {
    const session = AdminService.getSession();
    if (!session) return;
    setUser(session);

    AdminService.getParticipants()
      .then(setParticipants)
      .catch(err => { console.error(err); setError(true); })
      .finally(() => setLoading(false));
  }, [navigate]);

  if (!user) return null;
  
  const handleExportCSV = () => {
    if (filteredParticipants.length === 0) return;
    
    // Get headers dynamically based on data keys + standard ones
    const baseHeaders = ['Registration ID', 'Name', 'Age', 'Gender', 'Phone', 'Email', 'Category', 'T-Shirt Size', 'Status', 'Timestamp'];
    
    // Fallback to extract all unique keys from all filtered records if we want to be thorough, 
    // but baseHeaders covers the prompt's request.
    const csvRows = [];
    csvRows.push(baseHeaders.map(h => `"${h.replace(/"/g, '""')}"`).join(','));
    
    for (const p of filteredParticipants) {
      const row = [
        p.id || '',
        p.institutionId || '',
        p.name || '',
        p.age || '',
        p.gender || '',
        p.phone || '',
        p.email || '',
        p.category || '',
        p.tshirtSize || '',
        p.institutionName || '',
        p.status || '',
        p.timestamp || ''
      ];
      
      csvRows.push(row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','));
    }
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    const dateStr = new Date().toISOString().split('T')[0];
    link.download = `walkalong-participants-${dateStr}.csv`;
    link.click();
    
    URL.revokeObjectURL(url);
    
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const filteredParticipants = participants.filter(p => {
    const searchLower = searchTerm.toLowerCase();
    const searchPhone = searchTerm.replace(/[^0-9]/g, '');
    const pPhone = p.phone ? String(p.phone).replace(/[^0-9]/g, '') : '';
    
    const matchesSearch = !searchTerm ||
      (p.name && p.name.toLowerCase().includes(searchLower)) ||
      (p.email && p.email.toLowerCase().includes(searchLower)) ||
      (p.id && p.id.toLowerCase().includes(searchLower)) ||
      (p.phone && String(p.phone).includes(searchTerm)) ||
      (searchPhone && pPhone && pPhone.includes(searchPhone) && searchPhone.length >= 4) ||
      (searchPhone.length >= 10 && pPhone.slice(-10) === searchPhone.slice(-10));
    
    const matchesCategory = categoryFilter ? p.category === categoryFilter : true;
    const actualStatus = p.status || 'Pending';
    const matchesStatus = statusFilter ? actualStatus === statusFilter : true;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });


  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const newIds = new Set(filteredParticipants.map(p => String(p.id)));
      setSelectedIds(newIds);
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleSelectRow = (id: string, checked: boolean) => {
    const newIds = new Set(selectedIds);
    if (checked) {
      newIds.add(id);
    } else {
      newIds.delete(id);
    }
    setSelectedIds(newIds);
  };

  const handleBulkUpdate = async (status: string) => {
    if (selectedIds.size === 0) return;
    setBulkUpdating(true);
    setBulkMessage('Updating...');
    try {
      const idsArray = Array.from(selectedIds) as string[];
      const res = await AdminService.updateStatuses(idsArray, status);
      if (res.success) {
        const count = res.updated?.length ?? res.updatedCount ?? 0;
        setBulkMessage(`${count} participants updated to ${status.toUpperCase()}.`);
        // update local state
        setParticipants(prev => prev.map(p => {
          if (selectedIds.has(String(p.id))) {
            return { ...p, status };
          }
          return p;
        }));
        setSelectedIds(new Set());
        setTimeout(() => setBulkMessage(''), 5000);
      }
    } catch (err: any) {
      setBulkMessage('Error updating statuses: ' + err.message);
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setParticipants(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
    setSelectedParticipant(null);
  };
  
  const exportCSV = () => {
    if (filteredParticipants.length === 0) return;
    const headers = Object.keys(filteredParticipants[0]).filter(k => k !== 'timestamp');
    const csvRows = [headers.join(',')];
    
    for (const row of filteredParticipants) {
      const values = headers.map(header => {
        const val = row[header] ? String(row[header]).replace(/"/g, '""') : '';
        return `"${val}"`;
      });
      csvRows.push(values.join(','));
    }
    
    const blob = new Blob([csvRows.join('\\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'walkalong_participants.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="max-w-7xl mx-auto w-full px-4 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link to="/admin" className="text-[#6750a4] hover:underline flex items-center text-sm font-medium">
              <ArrowLeft className="w-4 h-4 mr-1" /> Back to Dashboard
            </Link>
          </div>
          <h1 className="text-3xl font-bold text-[#1d1b20] ">Manage Participants</h1>
          <p className="text-[#49454f] ">View and filter all registrations.</p>
        </div>
        <Button onClick={exportCSV} className="flex items-center gap-2">
          <Download className="w-4 h-4" /> Export to CSV
        </Button>
      </div>

      <Card className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#1d1b20]  mb-1">Search</label>
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#49454f] " />
              <input
                type="text"
                placeholder="Name, ID, or Phone..."
                className="w-full pl-10 pr-4 py-2 border border-[#79747e] rounded-xl focus:outline-none focus:border-[#6750a4] focus:ring-1 focus:ring-[#6750a4]"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Select
              label="Filter by Category"
              options={[
                { label: 'All Categories', value: '' },
                { label: 'Participant with Disability', value: 'PWD' },
                { label: 'Yi Member', value: 'YI_MEMBER' },
                { label: 'CII Member', value: 'CII_MEMBER' },
                { label: 'Yi Yuva', value: 'YUVA' },
                { label: 'Yi Thalir', value: 'THALIR' },
                { label: 'General Public', value: 'GENERAL' },
              ]}
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            />
          </div>
          <div>
            <Select
              label="Filter by Status"
              options={[
                { label: 'All Statuses', value: '' },
                { label: 'Confirmed', value: 'Confirmed' },
                { label: 'Pending', value: 'Pending' },
                { label: 'Checked In', value: 'Checked In' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={handleExportCSV} className="w-full gap-2" variant="outline">
              <Download className="w-4 h-4" />
              {exportSuccess ? 'Exported!' : 'Export CSV'}
            </Button>
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4 border-t border-[#e1e2ec] ">
          <div className="flex items-center gap-4 text-sm">
            <span className="font-medium text-[#1d1b20] ">Status Legend:</span>
            <div className="flex gap-3">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Confirmed</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Checked In</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> Pending</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> Cancelled</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-[#49454f]  flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={compactView} 
                onChange={(e) => setCompactView(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#6750a4] focus:ring-[#6750a4]"
              />
              Compact View
            </label>
          </div>
        </div>
        {filteredParticipants.length === 0 && exportSuccess === false && (
          <div className="mt-2 text-sm text-[#49454f] ">No participants available to export.</div>
        )}
      </Card>
      
      {selectedIds.size > 0 && (
        <Card className="mb-6 bg-[#f3edf7]  border-[#eaddff] ">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-sm font-medium text-[#6750a4] ">
              {selectedIds.size} participant{selectedIds.size !== 1 ? 's' : ''} selected
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-[#49454f] ">Bulk action:</span>
              <Button size="sm" variant="outline" onClick={() => handleBulkUpdate('Confirmed')} disabled={bulkUpdating} className="border-green-200 text-green-700 hover:bg-green-50">
                Confirm
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkUpdate('Checked In')} disabled={bulkUpdating} className="border-blue-200 text-blue-700 hover:bg-blue-50">
                Check In
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleBulkUpdate('Pending')} disabled={bulkUpdating} className="border-yellow-200 text-yellow-700 hover:bg-yellow-50">
                Set Pending
              </Button>
              {bulkMessage && <span className="text-sm ml-2 text-[#6750a4] font-medium">{bulkMessage}</span>}
            </div>
          </div>
        </Card>
      )}

      <Card className="p-0 overflow-hidden border-[#cac4d0] ">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#f1f3f4]  border-b border-[#cac4d0] ">
                <th className="px-6 py-4 w-12 text-center">
                  <input 
                    type="checkbox"
                    checked={filteredParticipants.length > 0 && selectedIds.size === filteredParticipants.length}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#6750a4] focus:ring-[#6750a4]"
                  />
                </th>
                <th className={`px-6 font-bold text-[#1d1b20]  text-sm ${compactView ? 'py-2' : 'py-4'}`}>ID</th>
                <th className={`px-6 font-bold text-[#1d1b20]  text-sm ${compactView ? 'py-2' : 'py-4'}`}>Name</th>
                <th className={`px-6 font-bold text-[#1d1b20]  text-sm ${compactView ? 'py-2' : 'py-4'}`}>Category</th>
                <th className={`px-6 font-bold text-[#1d1b20]  text-sm ${compactView ? 'py-2' : 'py-4'}`}>Phone</th>
                <th className={`px-6 font-bold text-[#1d1b20]  text-sm ${compactView ? 'py-2' : 'py-4'}`}>T-Shirt</th>
                <th className={`px-6 font-bold text-[#1d1b20]  text-sm ${compactView ? 'py-2' : 'py-4'}`}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#6750a4]">Loading registrations...</td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-red-500">Unable to connect to the registration system.</td>
                </tr>
              ) : participants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#49454f] ">No registrations found.</td>
                </tr>
              ) : filteredParticipants.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#49454f] ">No participants match your search.</td>
                </tr>
              ) : (
                filteredParticipants.map((p, i) => (
                  <tr key={p.id} className="border-b border-[#e1e2ec]  hover:bg-[#f8f9ff]  transition-colors">
                    <td className="px-6 w-12 text-center" onClick={(e) => e.stopPropagation()}>
                      <input 
                        type="checkbox"
                        checked={selectedIds.has(String(p.id))}
                        onChange={(e) => handleSelectRow(String(p.id), e.target.checked)}
                        className="w-4 h-4 rounded border-gray-300 text-[#6750a4] focus:ring-[#6750a4]"
                      />
                    </td>
                    <td className={`px-6 text-sm font-medium text-[#6750a4] cursor-pointer ${compactView ? 'py-2' : 'py-4'}`} onClick={() => setSelectedParticipant(p)}>{p.id}</td>
                    <td className={`px-6 text-sm text-[#1d1b20]  cursor-pointer ${compactView ? 'py-2' : 'py-4'}`} onClick={() => setSelectedParticipant(p)}>{p.name}</td>
                    <td className={`px-6 text-sm text-[#49454f]  cursor-pointer ${compactView ? 'py-2' : 'py-4'}`} onClick={() => setSelectedParticipant(p)}>{p.category}</td>
                    <td className={`px-6 text-sm text-[#49454f]  cursor-pointer ${compactView ? 'py-2' : 'py-4'}`} onClick={() => setSelectedParticipant(p)}>{p.phone}</td>
                    <td className={`px-6 text-sm text-[#49454f]  cursor-pointer ${compactView ? 'py-2' : 'py-4'}`} onClick={() => setSelectedParticipant(p)}>{p.tshirtSize}</td>
                    <td className={`px-6 text-sm cursor-pointer ${compactView ? 'py-2' : 'py-4'}`} onClick={() => setSelectedParticipant(p)}>
                      <span className={`px-2 py-1 rounded-md font-medium text-xs ${
                        p.status === 'Confirmed' ? 'bg-green-100 text-green-800  ' :
                        p.status === 'Checked In' ? 'bg-blue-100 text-blue-800  ' :
                        p.status === 'Cancelled' ? 'bg-red-100 text-red-800  ' :
                        'bg-yellow-100 text-yellow-800  '
                      }`}>
                        {p.status || 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="p-4 border-t border-[#cac4d0]  bg-[#f8f9ff]  text-sm text-[#49454f]  text-right flex justify-between items-center">
          <div>
            {selectedIds.size > 0 && <span>{selectedIds.size} selected</span>}
          </div>
          <div>
            Showing {filteredParticipants.length} of {participants.length} total participants
          </div>
        </div>
      </Card>
      {selectedParticipant && (
        <ParticipantDetails 
          participant={selectedParticipant} 
          onClose={() => setSelectedParticipant(null)} 
          onUpdate={handleUpdateStatus} 
        />
      )}
    </div>
  );
}
