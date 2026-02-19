import React, { useState } from 'react';
import { WebhookRequest, ViewMode } from '../types';
import Button from './Button';
import { analyzePayload } from '../services/geminiService';

interface RequestDetailProps {
  request: WebhookRequest | null;
}

const JsonTree = ({ data, level = 0 }: { data: any; level?: number }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  if (data === null) return <span className="text-gray-500">null</span>;
  if (data === undefined) return <span className="text-gray-600">undefined</span>;
  
  if (typeof data !== 'object') {
    const color = typeof data === 'string' ? 'text-green-400' : typeof data === 'number' ? 'text-blue-400' : 'text-purple-400';
    return <span className={`${color} break-words`}>{JSON.stringify(data)}</span>;
  }

  const isArray = Array.isArray(data);
  const keys = Object.keys(data);
  const isEmpty = keys.length === 0;

  if (isEmpty) return <span className="text-gray-500">{isArray ? '[]' : '{}'}</span>;

  return (
    <div className="font-mono text-sm leading-6">
      <span 
        className="cursor-pointer hover:text-white select-none inline-flex items-center"
        onClick={(e) => { e.stopPropagation(); setCollapsed(!collapsed); }}
      >
        <span className="text-gray-500 w-4 inline-block transform transition-transform text-xs" style={{ transform: collapsed ? 'rotate(-90deg)' : 'rotate(0deg)' }}>▼</span>
        <span className="text-yellow-500">{isArray ? '[' : '{'}</span>
        {collapsed && <span className="text-gray-500 mx-1">...</span>}
        {collapsed && <span className="text-yellow-500">{isArray ? ']' : '}'}</span>}
        {!collapsed && <span className="text-gray-600 text-xs ml-2">{keys.length} items</span>}
      </span>
      
      {!collapsed && (
        <div className="pl-6 border-l border-gray-800 ml-2">
          {keys.map((key, index) => (
            <div key={key} className="flex">
              {!isArray && <span className="text-red-400 mr-2">"{key}":</span>}
              <JsonTree data={data[key]} level={level + 1} />
              {index < keys.length - 1 && <span className="text-gray-500">,</span>}
            </div>
          ))}
        </div>
      )}
      {!collapsed && <span className="text-yellow-500 ml-2">{isArray ? ']' : '}'}</span>}
    </div>
  );
};

const RequestDetail: React.FC<RequestDetailProps> = ({ request }) => {
  const [viewMode, setViewMode] = useState<ViewMode>('PRETTY');
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Reset analysis when request changes
  React.useEffect(() => {
    setAnalysis(null);
  }, [request?.id]);

  const handleAnalyze = async () => {
    if (!request) return;
    setIsAnalyzing(true);
    const result = await analyzePayload(request);
    setAnalysis(result);
    setIsAnalyzing(false);
  };

  if (!request) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-black/50 text-gray-500 p-8">
        <div className="w-24 h-24 bg-gray-800/50 rounded-full flex items-center justify-center mb-6">
           <svg className="w-10 h-10 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
           </svg>
        </div>
        <h3 className="text-xl font-medium text-gray-300">Select a request</h3>
        <p className="max-w-md text-center mt-2 text-sm">
          Click on a request from the list to view its details, headers, and payload analysis.
        </p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-background relative">
        {/* Background ambient light */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-900/10 blur-[100px] pointer-events-none rounded-full" />

      {/* Header */}
      <div className="px-6 py-4 border-b border-border bg-surface/50 backdrop-blur flex justify-between items-start z-10">
        <div>
          <div className="flex items-center space-x-3 mb-1">
            <span className="bg-red-500/10 text-red-500 px-2 py-1 rounded text-xs font-bold border border-red-500/20">
              {request.method}
            </span>
            <h2 className="text-lg font-mono text-white truncate max-w-md">/{request.endpointId}</h2>
          </div>
          <div className="text-xs text-gray-500 flex items-center space-x-4">
             <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {new Date(request.timestamp).toLocaleString()}
             </span>
             <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
                {request.contentType}
             </span>
          </div>
        </div>
        <div className="flex space-x-2">
           <Button 
             size="sm" 
             variant="ghost" 
             onClick={handleAnalyze} 
             loading={isAnalyzing}
             className="bg-purple-900/20 text-purple-300 hover:bg-purple-900/40 border-purple-500/30"
             icon={
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
             }
           >
             AI Analyze
           </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border bg-black/20">
        <button 
          onClick={() => setViewMode('PRETTY')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'PRETTY' ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Body (Tree)
        </button>
        <button 
          onClick={() => setViewMode('RAW')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'RAW' ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Body (Raw)
        </button>
        <button 
          onClick={() => setViewMode('HEADERS')}
          className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${viewMode === 'HEADERS' ? 'border-red-500 text-white' : 'border-transparent text-gray-500 hover:text-gray-300'}`}
        >
          Headers ({request.headers.length})
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-0 relative">
        {analysis && (
          <div className="m-4 p-4 rounded-lg bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 animate-enter">
            <h4 className="text-purple-300 font-bold mb-2 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Gemini Analysis
            </h4>
            <div className="prose prose-sm prose-invert text-gray-300 whitespace-pre-line leading-relaxed">
              {analysis}
            </div>
            <button 
                onClick={() => setAnalysis(null)}
                className="absolute top-2 right-2 text-gray-500 hover:text-white"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
          </div>
        )}

        <div className="p-4">
          {viewMode === 'PRETTY' && (
            <div className="bg-[#0D0D0D] p-4 rounded-lg border border-border overflow-x-auto min-h-[300px]">
               <JsonTree data={request.body} />
            </div>
          )}

          {viewMode === 'RAW' && (
            <pre className="bg-[#0D0D0D] p-4 rounded-lg border border-border overflow-x-auto text-xs font-mono text-gray-300 min-h-[300px]">
              {JSON.stringify(request.body, null, 2)}
            </pre>
          )}

          {viewMode === 'HEADERS' && (
            <div className="grid grid-cols-1 gap-px bg-border rounded-lg overflow-hidden border border-border">
              {request.headers.map((h, i) => (
                <div key={i} className="flex bg-[#0D0D0D] p-3">
                  <span className="w-1/3 text-gray-500 font-mono text-xs">{h.key}</span>
                  <span className="w-2/3 text-gray-300 font-mono text-xs break-all">{h.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;