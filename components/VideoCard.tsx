
import React, { useState } from 'react';
import { VideoResult } from '../types';

interface VideoCardProps {
  video: VideoResult;
}

export const VideoCard: React.FC<VideoCardProps> = ({ video }) => {
  const [expanded, setExpanded] = useState(false);
  const [showDownloadMenu, setShowDownloadMenu] = useState(false);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const sanitizeFilename = (name: string) => {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase().substring(0, 50);
  };

  const downloadFile = (format: 'txt' | 'doc') => {
    const content = `Title: ${video.title}\nURL: ${video.url}\n\nFull Transcription:\n\n${video.transcription}`;
    const filename = `${sanitizeFilename(video.title || 'transcription')}.${format}`;
    const mimeType = format === 'txt' ? 'text/plain' : 'application/msword';
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowDownloadMenu(false);
  };

  return (
    <div className={`bg-white rounded-xl shadow-sm border ${video.status === 'error' ? 'border-red-200' : 'border-gray-200'} overflow-hidden transition-all duration-300`}>
      <div className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate">
              {video.status === 'processing' ? (
                <span className="flex items-center gap-2">
                  <i className="fa-solid fa-circle-notch animate-spin text-blue-500"></i>
                  Processing Video...
                </span>
              ) : video.title || 'Unknown Title'}
            </h3>
            <a 
              href={video.url} 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-sm text-blue-600 hover:underline flex items-center gap-1 truncate"
            >
              <i className="fa-brands fa-youtube"></i>
              {video.url}
            </a>
          </div>
          
          <div className="flex items-center gap-2">
            {video.status === 'completed' && (
              <div className="flex items-center gap-2 relative">
                <button 
                  onClick={() => copyToClipboard(`Title: ${video.title}\nURL: ${video.url}\n\nTranscript:\n${video.transcription}`)}
                  className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium transition-colors"
                  title="Copy to clipboard"
                >
                  <i className="fa-regular fa-copy mr-1"></i> Copy
                </button>
                
                <div className="relative">
                  <button 
                    onClick={() => setShowDownloadMenu(!showDownloadMenu)}
                    className="px-3 py-1.5 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 text-sm font-medium transition-colors flex items-center gap-1"
                  >
                    <i className="fa-solid fa-download"></i> Download
                    <i className={`fa-solid fa-chevron-down text-[10px] transition-transform ${showDownloadMenu ? 'rotate-180' : ''}`}></i>
                  </button>

                  {showDownloadMenu && (
                    <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-xl shadow-xl z-20 overflow-hidden">
                      <button 
                        onClick={() => downloadFile('txt')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                      >
                        <i className="fa-regular fa-file-lines text-blue-500"></i> Text (.txt)
                      </button>
                      <button 
                        onClick={() => downloadFile('doc')}
                        className="w-full px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-100 flex items-center gap-2"
                      >
                        <i className="fa-regular fa-file-word text-blue-700"></i> Word (.doc)
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
            <span className={`px-2 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${
              video.status === 'completed' ? 'bg-green-100 text-green-700' :
              video.status === 'processing' ? 'bg-blue-100 text-blue-700' :
              video.status === 'error' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
            }`}>
              {video.status}
            </span>
          </div>
        </div>

        {video.status === 'error' && (
          <div className="bg-red-50 border border-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">
            <i className="fa-solid fa-triangle-exclamation mr-2"></i>
            {video.error}
          </div>
        )}

        {video.status === 'completed' && (
          <div>
            <div className="relative">
              <div className={`text-gray-700 text-sm leading-relaxed whitespace-pre-wrap ${!expanded ? 'max-h-32 overflow-hidden' : ''}`}>
                {video.transcription}
              </div>
              {!expanded && (
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white to-transparent"></div>
              )}
            </div>
            
            <button 
              onClick={() => setExpanded(!expanded)}
              className="mt-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              {expanded ? 'Show Less' : 'Read Full Transcription'}
            </button>

            {video.sources && video.sources.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Sources Grounded</p>
                <div className="flex flex-wrap gap-2">
                  {video.sources.map((source, idx) => (
                    <a 
                      key={idx} 
                      href={source.uri} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-2 py-1 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded text-xs text-gray-600 truncate max-w-[200px]"
                    >
                      <i className="fa-solid fa-link mr-1 opacity-70"></i>
                      {source.title}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {video.status === 'processing' && (
          <div className="w-full bg-gray-100 rounded-full h-1.5 mt-4">
            <div className="bg-blue-500 h-1.5 rounded-full animate-[shimmer_2s_infinite] transition-all duration-1000" style={{ width: '60%' }}></div>
          </div>
        )}
      </div>
    </div>
  );
};
