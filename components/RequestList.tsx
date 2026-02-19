import React from 'react';
import { WebhookRequest } from '../types';
import { formatRelativeTime, getStatusColor } from '../utils/helpers';

interface RequestListProps {
  requests: WebhookRequest[];
  activeRequestId: string | null;
  onSelectRequest: (id: string) => void;
  onClearRequests: () => void;
}

const RequestList: React.FC<RequestListProps> = ({
  requests,
  activeRequestId,
  onSelectRequest,
  onClearRequests
}) => {
  return (
    <div className="flex flex-col h-full border-r border-border bg-surface w-full md:w-80 lg:w-96">
      <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-surfaceHighlight/50 backdrop-blur-md sticky top-0 z-10">
        <h2 className="font-semibold text-gray-200">Requests</h2>
        <div className="flex items-center space-x-2">
           <span className="text-xs bg-gray-800 px-2 py-1 rounded text-gray-400">{requests.length}</span>
           <button 
             onClick={onClearRequests}
             className="p-1.5 text-gray-500 hover:text-white hover:bg-white/10 rounded-md transition-colors"
             title="Clear All"
           >
             <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
             </svg>
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {requests.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-6 text-center text-gray-500 opacity-60">
            <svg className="w-12 h-12 mb-3 text-gray-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <p className="text-sm">Waiting for requests...</p>
            <p className="text-xs mt-2">Use the Test Console to simulate traffic.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {requests.map((req) => (
              <div
                key={req.id}
                onClick={() => onSelectRequest(req.id)}
                className={`group p-4 cursor-pointer transition-colors hover:bg-white/5 animate-enter ${
                  activeRequestId === req.id ? 'bg-white/5 border-l-2 border-l-red-500' : 'border-l-2 border-l-transparent'
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border border-white/10 ${getStatusColor(req.method)} bg-white/5`}>
                    {req.method}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">
                    {formatRelativeTime(req.timestamp)}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-300 font-mono truncate">
                  {req.headers.find(h => h.key.toLowerCase() === 'event-type')?.value || 
                   req.body?.type || 
                   'Webhook Event'}
                </div>
                <div className="mt-1 flex justify-between items-center">
                    <span className="text-xs text-gray-600 truncate max-w-[150px]">
                        {req.id}
                    </span>
                    <span className="text-xs text-gray-600">
                        {(req.size / 1024).toFixed(2)} KB
                    </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default RequestList;