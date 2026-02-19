import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import RequestList from './components/RequestList';
import RequestDetail from './components/RequestDetail';
import TestConsole from './components/TestConsole';
import Login from './components/Login';
import Button from './components/Button';
import { WebhookEndpoint, WebhookRequest, AuthState } from './types';
import { generateId } from './utils/helpers';

const App = () => {
  const [auth, setAuth] = useState<AuthState>(() => {
    const saved = sessionStorage.getItem('hookmaster_session');
    return saved === 'active' 
      ? { isAuthenticated: true, username: 'kbharathca' }
      : { isAuthenticated: false, username: null };
  });

  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [activeEndpointId, setActiveEndpointId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isTestConsoleOpen, setIsTestConsoleOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Fetch Endpoints from Server
  const fetchEndpoints = async () => {
    try {
      const res = await fetch('/api/endpoints');
      const data = await res.json();
      setEndpoints(data);
      if (data.length > 0 && !activeEndpointId) {
        setActiveEndpointId(data[0].id);
      }
    } catch (err) {
      console.error("Failed to fetch endpoints", err);
    }
  };

  // Fetch Requests for Active Endpoint
  const fetchRequests = async (id: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`);
      const data = await res.json();
      setRequests(data);
    } catch (err) {
      console.error("Failed to fetch requests", err);
    }
  };

  useEffect(() => {
    if (auth.isAuthenticated) {
      fetchEndpoints();
    }
  }, [auth.isAuthenticated]);

  useEffect(() => {
    if (activeEndpointId) {
      fetchRequests(activeEndpointId);
      // Poll for new requests every 3 seconds
      const interval = setInterval(() => fetchRequests(activeEndpointId), 3000);
      return () => clearInterval(interval);
    }
  }, [activeEndpointId]);

  const handleLogin = (user: string, pass: string) => {
    if (user === 'kbharathca' && pass === 'narendrak95') {
      setAuth({ isAuthenticated: true, username: user });
      sessionStorage.setItem('hookmaster_session', 'active');
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    setAuth({ isAuthenticated: false, username: null });
    sessionStorage.removeItem('hookmaster_session');
  };

  const handleCreateEndpoint = async () => {
    const newEndpoint: WebhookEndpoint = {
      id: generateId(),
      name: `Endpoint ${endpoints.length + 1}`,
      createdAt: Date.now(),
      color: 'blue'
    };
    
    await fetch('/api/endpoints', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newEndpoint)
    });
    
    fetchEndpoints();
    setActiveEndpointId(newEndpoint.id);
  };

  const handleDeleteEndpoint = async (id: string) => {
    await fetch(`/api/endpoints/${id}`, { method: 'DELETE' });
    fetchEndpoints();
    if (activeEndpointId === id) setActiveEndpointId(null);
  };

  const handleClearRequests = async () => {
    if (!activeEndpointId) return;
    await fetch(`/api/requests/${activeEndpointId}`, { method: 'DELETE' });
    setRequests([]);
  };

  const handleCopyUrl = () => {
    if (!activeEndpointId) return;
    const url = `${window.location.origin}/hooks/${activeEndpointId}`;
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleSimulateReceive = async (payload: any, typeName: string) => {
    if (!activeEndpointId) return;
    
    // Send to the real webhook endpoint on our server
    await fetch(`/hooks/${activeEndpointId}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'X-Webhook-Event': typeName
      },
      body: JSON.stringify(payload)
    });

    fetchRequests(activeEndpointId);
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const activeRequest = requests.find(r => r.id === activeRequestId) || null;

  return (
    <div className="flex h-screen bg-black text-gray-100 overflow-hidden font-sans selection:bg-red-500/30 selection:text-red-200">
      <Sidebar 
        endpoints={endpoints}
        activeEndpointId={activeEndpointId}
        onSelectEndpoint={setActiveEndpointId}
        onCreateEndpoint={handleCreateEndpoint}
        onDeleteEndpoint={handleDeleteEndpoint}
      />

      <div className="flex-1 flex relative">
        {activeEndpointId ? (
          <RequestList 
            requests={requests}
            activeRequestId={activeRequestId}
            onSelectRequest={setActiveRequestId}
            onClearRequests={handleClearRequests}
          />
        ) : (
          <div className="w-80 bg-surface border-r border-border flex flex-col items-center justify-center text-gray-500 p-8 text-center">
              <div className="mb-4 text-gray-700">
                <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-white font-medium mb-1">No Endpoint Selected</h3>
              <p className="text-xs">Create or select an endpoint from the sidebar to begin inspecting traffic.</p>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
           {activeEndpointId && (
               <div className="h-16 border-b border-border flex items-center px-6 justify-between bg-surface/30 backdrop-blur-lg">
                  <div className="flex items-center space-x-2 overflow-hidden">
                      <div className="flex items-center mr-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Real-time Connection Active</span>
                      </div>
                      <div className={`bg-black/40 px-3 py-1.5 rounded border ${copyFeedback ? 'border-green-500/50' : 'border-white/10'} text-gray-300 font-mono text-xs truncate flex items-center group cursor-pointer hover:border-red-500/50 transition-all duration-300`}
                           onClick={handleCopyUrl}
                           title="Click to copy Webhook URL">
                          <span className="text-gray-500 mr-1">/hooks/</span>
                          <span className="text-white">{activeEndpointId}</span>
                          <div className="ml-2 flex items-center">
                            {copyFeedback ? (
                                <svg className="w-3 h-3 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            ) : (
                                <svg className="w-3 h-3 text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                            )}
                          </div>
                      </div>
                  </div>

                  <div className="flex items-center space-x-3">
                      <Button 
                        size="sm" 
                        variant={isTestConsoleOpen ? 'primary' : 'secondary'}
                        onClick={() => setIsTestConsoleOpen(!isTestConsoleOpen)}
                      >
                         {isTestConsoleOpen ? 'Close Simulator' : 'Simulate Request'}
                      </Button>
                      <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors p-2" title="Logout">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </button>
                  </div>
               </div>
           )}

           <RequestDetail request={activeRequest} />
           
           <TestConsole 
             endpointId={activeEndpointId || ''}
             onSend={handleSimulateReceive}
             isOpen={isTestConsoleOpen && !!activeEndpointId}
             onClose={() => setIsTestConsoleOpen(false)}
           />
        </div>
      </div>
    </div>
  );
};

export default App;