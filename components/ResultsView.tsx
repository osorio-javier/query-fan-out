import React, { useState } from 'react';
import { TaskResult } from '../types';

interface ResultsViewProps {
  dataList: TaskResult[];
}

// Sub-component to handle state for each result card
const ResultCard: React.FC<{ data: TaskResult; index: number }> = ({ data, index }) => {
  const [isAnswerOpen, setIsAnswerOpen] = useState(false);

  // Data Extraction
  const fanOutQueries = data.fan_out_queries || [];
  
  let brandEntities = data.brand_entities || [];
  const mainItem = data.items && data.items.length > 0 ? data.items[0] : null;
  const markdownContent = mainItem ? mainItem.markdown : "No text content returned.";

  if (brandEntities.length === 0 && mainItem?.brand_entities) {
    brandEntities = mainItem.brand_entities;
  }

  const searchResults = data.search_results || [];
  const sources = data.sources || [];

  return (
    <div className="border-t-4 border-indigo-500 pt-8">
      <div className="mb-6">
        <span className="text-xs font-bold tracking-wider text-indigo-500 uppercase">Analysis Result</span>
        <h2 className="text-2xl font-bold text-slate-800 mt-1">
          Keyword: <span className="text-indigo-700">"{data.keyword}"</span>
        </h2>
      </div>

      <div className="space-y-8">
        {/* Main Answer Section - Collapsible */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <button 
            onClick={() => setIsAnswerOpen(!isAnswerOpen)}
            className="w-full bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center hover:bg-slate-100 transition-colors focus:outline-none"
          >
             <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
              ChatGPT Answer
              <span className="text-xs font-normal text-slate-500 ml-2">(Click to {isAnswerOpen ? 'hide' : 'view'})</span>
            </h3>
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className={`h-5 w-5 text-slate-400 transform transition-transform duration-200 ${isAnswerOpen ? 'rotate-180' : ''}`} 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          
          {isAnswerOpen && (
            <div className="p-6 border-t border-slate-100 animate-fade-in">
              <div className="prose prose-slate max-w-none text-slate-800 leading-relaxed whitespace-pre-wrap font-medium">
                {markdownContent}
              </div>
            </div>
          )}
        </div>

        {/* Top Row: Fan Out and Entities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Fan Out Queries Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
                Fan Out Queries
              </h3>
              <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {fanOutQueries.length}
              </span>
            </div>
            
            <div className="flex-grow">
              {fanOutQueries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider w-16">#</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Query</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {fanOutQueries.map((query, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-400 font-mono">{idx + 1}</td>
                          <td className="px-6 py-3 text-sm text-slate-700 font-medium">{query}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 italic">No Fan Out Queries returned.</div>
              )}
            </div>
          </div>

          {/* Brand Entities Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                Brand Entities
              </h3>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {brandEntities.length}
              </span>
            </div>

            <div className="flex-grow">
              {brandEntities.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Entity Name</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Category</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-slate-200">
                      {brandEntities.map((entity, idx) => (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="px-6 py-3 whitespace-nowrap text-sm font-semibold text-slate-800">{entity.title}</td>
                          <td className="px-6 py-3 whitespace-nowrap text-sm text-slate-600">
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">{entity.category || 'N/A'}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 italic">No Brand Entities detected.</div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Row: Search Results and ChatGPT Sources */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Search Results Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Web Search Results
              </h3>
              <span className="bg-orange-100 text-orange-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {searchResults.length}
              </span>
            </div>
            
            <div className="flex-grow max-h-[400px] overflow-y-auto">
              {searchResults.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {searchResults.map((result, idx) => (
                    <li key={idx} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="block group">
                        <h4 className="text-sm font-semibold text-indigo-600 group-hover:underline truncate mb-1">
                          {result.title}
                        </h4>
                        <p className="text-xs text-slate-500 mb-2 truncate">{result.url}</p>
                        {result.description && (
                          <p className="text-sm text-slate-700 line-clamp-2">{result.description}</p>
                        )}
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-500 italic">No Web Search Results returned.</div>
              )}
            </div>
          </div>

          {/* ChatGPT Sources Section */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-full">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
              <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                ChatGPT Sources (Citations)
              </h3>
              <span className="bg-teal-100 text-teal-800 text-xs px-2.5 py-0.5 rounded-full font-bold">
                {sources.length}
              </span>
            </div>

            <div className="flex-grow max-h-[400px] overflow-y-auto">
              {sources.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                  {sources.map((source, idx) => (
                    <li key={idx} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                      <a href={source.url} target="_blank" rel="noopener noreferrer" className="block group">
                        <h4 className="text-sm font-semibold text-indigo-600 group-hover:underline truncate mb-1">
                          {source.title || source.source_name || "Untitled Source"}
                        </h4>
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <span>{source.domain}</span>
                          {source.source_name && (
                            <>
                              <span>&bull;</span>
                              <span>{source.source_name}</span>
                            </>
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="p-8 text-center text-slate-500 italic">No Cited Sources returned.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ResultsView: React.FC<ResultsViewProps> = ({ dataList }) => {
  if (!dataList || dataList.length === 0) return null;

  return (
    <div className="space-y-16 animate-fade-in pb-12">
      {dataList.map((data, index) => (
        <ResultCard key={`${data.keyword}-${index}`} data={data} index={index} />
      ))}
    </div>
  );
};