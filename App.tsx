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
  const [auth, setAuth] = useState<AuthState>({ isAuthenticated: false, username: null });
  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([]);
  const [requests, setRequests] = useState<WebhookRequest[]>([]);
  const [activeEndpointId, setActiveEndpointId] = useState<string | null>(null);
  const [activeRequestId, setActiveRequestId] = useState<string | null>(null);
  const [isTestConsoleOpen, setIsTestConsoleOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Auth Initialization
  useEffect(() => {
    const savedSession = sessionStorage.getItem('hookmaster_session');
    if (savedSession === 'active') {
      setAuth({ isAuthenticated: true, username: 'kbharathca' });
    }
  }, []);

  // Data Initialization
  useEffect(() => {
    if (!auth.isAuthenticated) return;

    const savedEndpoints = localStorage.getItem('hookmaster_endpoints');
    if (savedEndpoints) {
      const parsed = JSON.parse(savedEndpoints);
      setEndpoints(parsed);
      if (parsed.length > 0) {
        setActiveEndpointId(parsed[0].id);
      }
    } else {
      const defaultEndpoint = {
        id: generateId(),
        name: 'Main Server Hook',
        createdAt: Date.now(),
        color: 'red'
      };
      setEndpoints([defaultEndpoint]);
      setActiveEndpointId(defaultEndpoint.id);
      localStorage.setItem('hookmaster_endpoints', JSON.stringify([defaultEndpoint]));
    }

    const savedRequests = localStorage.getItem('hookmaster_requests');
    if (savedRequests) {
      try {
        setRequests(JSON.parse(savedRequests));
      } catch (e) {
        console.error("Failed to parse saved requests", e);
      }
    }
  }, [auth.isAuthenticated]);

  // Sync to Storage
  useEffect(() => {
    if (auth.isAuthenticated && endpoints.length > 0) {
      localStorage.setItem('hookmaster_endpoints', JSON.stringify(endpoints));
    }
  }, [endpoints, auth.isAuthenticated]);

  useEffect(() => {
    if (auth.isAuthenticated) {
      const prunedRequests = requests.slice(0, 100);
      localStorage.setItem('hookmaster_requests', JSON.stringify(prunedRequests));
    }
  }, [requests, auth.isAuthenticated]);

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

  const handleCreateEndpoint = () => {
    const newEndpoint: WebhookEndpoint = {
      id: generateId(),
      name: `Endpoint ${endpoints.length + 1}`,
      createdAt: Date.now(),
      color: 'blue'
    };
    setEndpoints([...endpoints, newEndpoint]);
    setActiveEndpointId(newEndpoint.id);
  };

  const handleDeleteEndpoint = (id: string) => {
    const newEndpoints = endpoints.filter(e => e.id !== id);
    setEndpoints(newEndpoints);
    setRequests(requests.filter(r => r.endpointId !== id));
    if (activeEndpointId === id) {
      setActiveEndpointId(newEndpoints[0]?.id || null);
    }
  };

  const handleCopyUrl = () => {
    if (!activeEndpointId) return;
    const url = `https://hookmaster.app/hooks/${activeEndpointId}`;
    navigator.clipboard.writeText(url);
    setCopyFeedback(true);
    setTimeout(() => setCopyFeedback(false), 2000);
  };

  const handleSimulateReceive = (payload: any, typeName: string) => {
    if (!activeEndpointId) return;

    const newRequest: WebhookRequest = {
      id: generateId(),
      endpointId: activeEndpointId,
      method: 'POST',
      timestamp: Date.now(),
      headers: [
        { key: 'Content-Type', value: 'application/json' },
        { key: 'User-Agent', value: 'HookMaster-Simulator/1.0' },
        { key: 'X-Webhook-Event', value: typeName },
        { key: 'X-Request-ID', value: `req_${Math.random().toString(36).substr(2, 9)}` }
      ],
      query: {},
      body: payload,
      size: JSON.stringify(payload).length,
      contentType: 'application/json'
    };

    setRequests(prev => [newRequest, ...prev]);
    setActiveRequestId(newRequest.id);
  };

  if (!auth.isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  const filteredRequests = requests.filter(r => r.endpointId === activeEndpointId);
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
            requests={filteredRequests}
            activeRequestId={activeRequestId}
            onSelectRequest={setActiveRequestId}
            onClearRequests={() => setRequests(prev => prev.filter(r => r.endpointId !== activeEndpointId))}
          />
        ) : (
          <div className="w-80 bg-surface border-r border-border flex items-center justify-center text-gray-500">
              Select an endpoint
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 bg-background relative z-0">
           {activeEndpointId && (
               <div className="h-16 border-b border-border flex items-center px-6 justify-between bg-surface/30 backdrop-blur-lg">
                  <div className="flex items-center space-x-2 overflow-hidden">
                      <div className="flex items-center mr-4">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div>
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Server Sync Active</span>
                      </div>
                      <div className={`bg-black/40 px-3 py-1.5 rounded border ${copyFeedback ? 'border-green-500/50' : 'border-white/10'} text-gray-300 font-mono text-xs truncate flex items-center group cursor-pointer hover:border-red-500/50 transition-all duration-300`}
                           onClick={handleCopyUrl}>
                          <span className="text-gray-500 mr-1">https://hookmaster.app/hooks/</span>
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
                      <button onClick={handleLogout} className="text-gray-500 hover:text-white transition-colors" title="Logout">
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