import React, { useState } from 'react';
import { ApiCredentials, TaskResult, SearchParams } from './types';
import { get_llm_responses } from './services/dataForSeoService';
import { ResultsView } from './components/ResultsView';

function App() {
  // Config State
  const [credentials, setCredentials] = useState<ApiCredentials>({
    login: '',
    pass: ''
  });
  const [showConfig, setShowConfig] = useState(true);

  // Search State
  const [keywordsInput, setKeywordsInput] = useState("");
  const [locationCode, setLocationCode] = useState(2032);
  const [languageCode, setLanguageCode] = useState("es-419");

  // App State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [resultsData, setResultsData] = useState<TaskResult[] | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResultsData(null);

    if (!credentials.login || !credentials.pass) {
      setError("Please configure API credentials first.");
      setShowConfig(true);
      return;
    }

    // Process keywords: split by newline or comma, trim, filter empty
    const keywordsList = keywordsInput
      .split(/[\n,]+/)
      .map(k => k.trim())
      .filter(k => k.length > 0);

    if (keywordsList.length === 0) {
      setError("Please enter at least one keyword.");
      return;
    }

    setIsLoading(true);

    const searchParams: SearchParams = {
      keywords: keywordsList,
      location_code: locationCode,
      language_code: languageCode
    };

    try {
      const { results, errors } = await get_llm_responses(credentials, searchParams);
      
      if (results.length > 0) {
        setResultsData(results);
        
        // If there are partial errors, we can show them as well
        if (errors.length > 0) {
           console.warn("Partial errors:", errors);
        }
      } else {
        // No success at all
        if (errors.length > 0) {
          setError(errors.join(' | '));
        } else {
          setError("No results found and no specific error returned.");
        }
      }

    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCredentialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  // --- Download Handlers ---

  const downloadFile = (content: string, fileName: string, contentType: string) => {
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleDownloadTXT = () => {
    if (!resultsData) return;
    
    let content = "QUERY FAN-OUT EXTRACTOR RESULTS\n=================================\n\n";
    
    resultsData.forEach((item) => {
      content += `KEYWORD: ${item.keyword}\n`;
      content += `---------------------------------\n`;
      content += "FAN OUT QUERIES:\n";
      if (item.fan_out_queries && item.fan_out_queries.length > 0) {
        item.fan_out_queries.forEach(q => content += `- ${q}\n`);
      } else {
        content += "(No fan out queries found)\n";
      }
      content += "\n\n";
    });

    downloadFile(content, "fan_out_results.txt", "text/plain");
  };

  const handleDownloadCSV = () => {
    if (!resultsData) return;

    // Header
    let csvContent = "Keyword,Fan Out Query\n";

    resultsData.forEach((item) => {
      const keyword = `"${item.keyword.replace(/"/g, '""')}"`;
      
      if (item.fan_out_queries && item.fan_out_queries.length > 0) {
        item.fan_out_queries.forEach((query) => {
          const safeQuery = `"${query.replace(/"/g, '""')}"`;
          csvContent += `${keyword},${safeQuery}\n`;
        });
      } else {
        // If no fan outs, still list the keyword
        csvContent += `${keyword},""\n`;
      }
    });

    downloadFile(csvContent, "fan_out_results.csv", "text/csv");
  };

  const inputClassName = "w-full px-4 py-2.5 bg-white text-slate-900 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none shadow-sm transition-all placeholder-slate-400";
  const labelClassName = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 pb-20 font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200 sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Query fan-out <span className="text-indigo-600">Extractor</span></h1>
          </div>
          <button 
            onClick={() => setShowConfig(!showConfig)}
            className={`text-sm font-medium px-3 py-1.5 rounded-md flex items-center gap-2 transition-colors
              ${showConfig ? 'bg-indigo-50 text-indigo-700' : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            API Settings
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* API Credentials Panel */}
        {showConfig && (
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 animate-fade-in-down">
            <h2 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              🔐 API Authorization
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>API Login (Email)</label>
                <input
                  type="text"
                  name="login"
                  value={credentials.login}
                  onChange={handleCredentialChange}
                  placeholder="e.g. your_email@domain.com"
                  className={inputClassName}
                />
              </div>
              <div>
                <label className={labelClassName}>API Password</label>
                <input
                  type="password"
                  name="pass"
                  value={credentials.pass}
                  onChange={handleCredentialChange}
                  placeholder="e.g. 1234abcd..."
                  className={inputClassName}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-between items-center text-sm">
              <a 
                href="https://app.dataforseo.com/api-dashboard" 
                target="_blank" 
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 hover:underline"
              >
                Get your API credentials here &rarr;
              </a>
              <span className="text-slate-500">
                Credentials are stored locally in your browser session.
              </span>
            </div>
          </div>
        )}

        {/* Search Panel */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-lg font-semibold text-slate-800">Batch Search Parameters</h2>
            <a 
              href="https://docs.dataforseo.com/v3/ai_optimization/chat_gpt/llm_responses/models/" 
              target="_blank" 
              rel="noreferrer"
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
              View Documentation
            </a>
          </div>
          
          <form onSubmit={handleSearch} className="space-y-6">
            <div>
              <label className={labelClassName}>Keywords List (Fan-out Cluster)</label>
              <textarea
                name="keyword"
                value={keywordsInput}
                onChange={(e) => setKeywordsInput(e.target.value)}
                placeholder={"Enter keywords separated by new lines or commas, e.g.:\nmarketing agencies\nseo services\nweb design"}
                rows={5}
                className={inputClassName}
              />
              <p className="text-xs text-slate-500 mt-1.5">
                Paste your keywords here. The tool will process them in batch to generate fan-out queries for the cluster.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className={labelClassName}>Location Code</label>
                <div className="relative">
                  <input
                    type="number"
                    value={locationCode}
                    onChange={(e) => setLocationCode(parseInt(e.target.value) || 0)}
                    className={inputClassName}
                  />
                  <div className="absolute right-3 top-3 text-xs text-slate-400 pointer-events-none">
                     (e.g., 2032)
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Common codes: Argentina (2032), USA (2840), Spain (2724).
                </p>
              </div>
              <div>
                <label className={labelClassName}>Language Code</label>
                <div className="relative">
                  <input
                    type="text"
                    value={languageCode}
                    onChange={(e) => setLanguageCode(e.target.value)}
                    className={inputClassName}
                  />
                  <div className="absolute right-3 top-3 text-xs text-slate-400 pointer-events-none">
                     (e.g., es-419)
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5">
                  Format: 'en', 'es', 'es-419', 'fr', etc.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-6 rounded-lg text-white font-semibold shadow-md transition-all flex justify-center items-center gap-2
                  ${isLoading 
                    ? 'bg-indigo-400 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg active:transform active:scale-[0.99]'
                  }`}
              >
                {isLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Processing Batch Request...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    Extract Fan-Outs & Entities
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Status / Errors */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md animate-fade-in shadow-sm">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-700">Error</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Download Actions */}
        {resultsData && (
          <div className="flex flex-col sm:flex-row gap-4 justify-end items-center animate-fade-in">
             <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Export Results:</span>
             <button 
                onClick={handleDownloadTXT}
                className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-lg shadow-sm text-slate-700 hover:bg-slate-50 hover:text-indigo-600 transition-colors font-medium text-sm"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download .TXT
             </button>
             <button 
                onClick={handleDownloadCSV}
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 border border-transparent rounded-lg shadow-sm text-white hover:bg-indigo-700 transition-colors font-medium text-sm"
             >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download .CSV
             </button>
          </div>
        )}

        {/* Results */}
        {resultsData && (
          <ResultsView dataList={resultsData} />
        )}
      </main>
    </div>
  );
}

export default App;