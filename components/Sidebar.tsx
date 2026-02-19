import React from 'react';
import { WebhookEndpoint } from '../types';
import Button from './Button';

interface SidebarProps {
  endpoints: WebhookEndpoint[];
  activeEndpointId: string | null;
  onSelectEndpoint: (id: string) => void;
  onCreateEndpoint: () => void;
  onDeleteEndpoint: (id: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  endpoints,
  activeEndpointId,
  onSelectEndpoint,
  onCreateEndpoint,
  onDeleteEndpoint,
}) => {
  return (
    <div className="w-full md:w-64 h-full bg-black/40 border-r border-border backdrop-blur-xl flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-red-600 to-blue-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <h1 className="text-lg font-bold tracking-tight text-white">
            Hook<span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 to-blue-500">Master</span>
          </h1>
        </div>
        
        <Button onClick={onCreateEndpoint} className="w-full" icon={
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        }>
          New Endpoint
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {endpoints.length === 0 && (
          <div className="text-center py-8 text-gray-500 text-sm">
            No endpoints created.
            <br />
            Click above to start.
          </div>
        )}
        {endpoints.map((endpoint) => (
          <div
            key={endpoint.id}
            className={`group relative flex flex-col p-3 rounded-lg cursor-pointer transition-all duration-200 border ${
              activeEndpointId === endpoint.id
                ? 'bg-white/5 border-red-500/50 shadow-md shadow-red-900/10'
                : 'bg-transparent border-transparent hover:bg-white/5 hover:border-white/5'
            }`}
            onClick={() => onSelectEndpoint(endpoint.id)}
          >
            <div className="flex justify-between items-start mb-1">
              <span className={`text-sm font-medium ${activeEndpointId === endpoint.id ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'}`}>
                {endpoint.name}
              </span>
              <button
                className="opacity-0 group-hover:opacity-100 text-gray-500 hover:text-red-400 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteEndpoint(endpoint.id);
                }}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
            <div className="flex items-center space-x-2 text-xs text-gray-600">
               <div className={`w-2 h-2 rounded-full ${activeEndpointId === endpoint.id ? 'bg-green-500 animate-pulse' : 'bg-gray-600'}`}></div>
               <span className="truncate font-mono opacity-60">/{endpoint.id.substring(0, 8)}...</span>
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-border text-xs text-gray-600 text-center">
        v2.5.0 • Client-side Mode
      </div>
    </div>
  );
};

export default Sidebar;