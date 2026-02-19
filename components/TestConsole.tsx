import React, { useState } from 'react';
import Button from './Button';
import { generateSamplePayload } from '../services/geminiService';

interface TestConsoleProps {
  endpointId: string;
  onSend: (payload: any, type: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const TestConsole: React.FC<TestConsoleProps> = ({ endpointId, onSend, isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'GENERATOR' | 'MANUAL'>('GENERATOR');
  const [manualPayload, setManualPayload] = useState('{\n  "event": "test_ping",\n  "data": "hello world"\n}');
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async (type: 'Stripe' | 'GitHub' | 'Slack' | 'Custom') => {
    setGenerating(true);
    const payload = await generateSamplePayload(type);
    setGenerating(false);
    
    // Auto send for smoother UX, or let user review? Let's send directly for "Magic" feel.
    onSend(payload, `Simulated ${type}`);
  };

  const handleManualSend = () => {
    try {
      const parsed = JSON.parse(manualPayload);
      onSend(parsed, 'Manual Test');
    } catch (e) {
      alert("Invalid JSON");
    }
  };

  if (!isOpen) return null;

  return (
    <div className="absolute inset-y-0 right-0 w-[400px] bg-surfaceHighlight border-l border-border shadow-2xl z-50 transform transition-transform duration-300 flex flex-col">
       <div className="p-4 border-b border-border flex justify-between items-center bg-black/20">
         <h3 className="font-bold text-white flex items-center">
            <svg className="w-5 h-5 mr-2 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Webhook Simulator
         </h3>
         <button onClick={onClose} className="text-gray-500 hover:text-white">
           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
           </svg>
         </button>
       </div>

       <div className="p-2 bg-black/40 grid grid-cols-2 gap-2">
         <button 
            onClick={() => setActiveTab('GENERATOR')} 
            className={`py-2 text-sm rounded ${activeTab === 'GENERATOR' ? 'bg-surface border border-border text-white' : 'text-gray-500 hover:bg-surface/50'}`}
         >
            AI Generator
         </button>
         <button 
            onClick={() => setActiveTab('MANUAL')} 
            className={`py-2 text-sm rounded ${activeTab === 'MANUAL' ? 'bg-surface border border-border text-white' : 'text-gray-500 hover:bg-surface/50'}`}
         >
            Manual JSON
         </button>
       </div>

       <div className="flex-1 overflow-y-auto p-4">
         {activeTab === 'GENERATOR' ? (
           <div className="space-y-4">
             <p className="text-sm text-gray-400">Generate realistic webhook payloads using Gemini AI and fire them at your endpoint instantly.</p>
             
             <div className="grid grid-cols-1 gap-3">
               <button 
                 onClick={() => handleGenerate('Stripe')} 
                 disabled={generating}
                 className="flex items-center p-3 rounded bg-indigo-900/20 border border-indigo-500/30 hover:bg-indigo-900/40 transition-colors group"
               >
                 <div className="w-8 h-8 rounded bg-indigo-500 flex items-center justify-center mr-3 text-white font-bold group-hover:scale-110 transition-transform">S</div>
                 <div className="text-left">
                   <div className="text-sm font-medium text-white">Stripe Event</div>
                   <div className="text-xs text-gray-500">payment_failed, invoice.paid</div>
                 </div>
               </button>

               <button 
                 onClick={() => handleGenerate('GitHub')} 
                 disabled={generating}
                 className="flex items-center p-3 rounded bg-gray-800/20 border border-gray-500/30 hover:bg-gray-800/40 transition-colors group"
               >
                 <div className="w-8 h-8 rounded bg-gray-700 flex items-center justify-center mr-3 text-white font-bold group-hover:scale-110 transition-transform">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
                 </div>
                 <div className="text-left">
                   <div className="text-sm font-medium text-white">GitHub Event</div>
                   <div className="text-xs text-gray-500">push, pull_request, issues</div>
                 </div>
               </button>

               <button 
                 onClick={() => handleGenerate('Slack')} 
                 disabled={generating}
                 className="flex items-center p-3 rounded bg-green-900/20 border border-green-500/30 hover:bg-green-900/40 transition-colors group"
               >
                 <div className="w-8 h-8 rounded bg-green-600 flex items-center justify-center mr-3 text-white font-bold group-hover:scale-110 transition-transform">#</div>
                 <div className="text-left">
                   <div className="text-sm font-medium text-white">Slack Event</div>
                   <div className="text-xs text-gray-500">message, app_mention</div>
                 </div>
               </button>
             </div>
             
             {generating && (
                 <div className="text-center text-xs text-accent animate-pulse mt-4">
                     Generating AI payload...
                 </div>
             )}

           </div>
         ) : (
           <div className="h-full flex flex-col">
             <textarea
               className="flex-1 w-full bg-[#0D0D0D] border border-border rounded p-3 text-xs font-mono text-gray-300 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none resize-none"
               value={manualPayload}
               onChange={(e) => setManualPayload(e.target.value)}
               spellCheck={false}
             />
             <div className="mt-4">
               <Button onClick={handleManualSend} className="w-full">
                 Send Payload
               </Button>
             </div>
           </div>
         )}
       </div>
    </div>
  );
};

export default TestConsole;