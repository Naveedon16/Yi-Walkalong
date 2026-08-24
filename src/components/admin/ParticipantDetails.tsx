import React, { useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { AdminService, Participant } from '../../services';

interface ParticipantDetailsProps {
  participant: Participant;
  onClose: () => void;
  onUpdate: (id: string, newStatus: string) => void;
}

export function ParticipantDetails({ participant, onClose, onUpdate }: ParticipantDetailsProps) {
  const [status, setStatus] = useState(participant.status || 'Pending');
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async () => {
    setUpdating(true);
    setError(null);
    try {
      await AdminService.updateStatus(participant.id, status);
      onUpdate(participant.id, status);
    } catch (err: any) {
      setError(err.message || 'Unable to update registration status. Please try again.');
    } finally {
      setUpdating(false);
    }
  };

  const formatKey = (key: string) => {
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="participant-modal-title">
      <div className="bg-white  rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden" tabIndex={-1}>
        <div className="flex justify-between items-center p-6 border-b border-[#cac4d0] ">
          <h2 id="participant-modal-title" className="text-2xl font-bold text-[#1d1b20] ">Participant Details</h2>
          <button onClick={onClose} autoFocus aria-label="Close participant details" className="p-2 hover:bg-[#f3edf7]  rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#6750a4]">
            <X className="w-6 h-6 text-[#49454f] " />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {Object.entries(participant).map(([key, value]) => {
              if (!value || key === 'timestamp') return null;
              return (
                <div key={key} className="flex flex-col">
                  <span className="text-sm font-medium text-[#49454f]  ">{formatKey(key)}</span>
                  <span className="text-base text-[#1d1b20] ">{String(value)}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="p-6 border-t border-[#cac4d0]  bg-[#f8f9ff] ">
          <h3 className="text-lg font-bold text-[#1d1b20]  mb-4">Manage Status</h3>
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <div className="flex-1 w-full">
              <Select
                label="Status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                options={[
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Confirmed', value: 'Confirmed' },
                  { label: 'Cancelled', value: 'Cancelled' },
                  { label: 'Checked In', value: 'Checked In' }
                ]}
              />
            </div>
            <Button 
              onClick={handleUpdate} 
              disabled={updating || status === participant.status}
              className="w-full sm:w-auto"
            >
              {updating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Updating...
                </>
              ) : 'Update Status'}
            </Button>
          </div>
          {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
        </div>
      </div>
    </div>
  );
}
