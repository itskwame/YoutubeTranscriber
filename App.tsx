
import React, { useState, useCallback } from 'react';
import { VideoResult } from './types';
import { fetchVideoData } from './services/geminiService';
import { VideoCard } from './components/VideoCard';

const App: React.FC = () => {
  const [urlInput, setUrlInput] = useState('');
  const [results, setResults] = useState<VideoResult[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const processLinks = async () => {
    const urls = urlInput
      .split(/[\n,]/)
      .map(url => url.trim())
      .filter(url => {
        try {
          const u = new URL(url);
          return u.hostname.includes('youtube.com') || u.hostname.includes('youtu.be');
        } catch {
          return false;
        }
      });

    if (urls.length === 0) {
      alert('Please enter at least one valid YouTube link.');
      return;
    }

    setIsProcessing(true);
    
    // Create placeholders for each URL
    const newResults: VideoResult[] = urls.map(url => ({
      url,
      title: '',
      transcription: '',
      status: 'pending'
    }));
    
    setResults(prev => [...newResults, ...prev]);
    setUrlInput('');

    // Process one by one (or in batches if preferred, but sequential is safer for token limits)
    for (const video of newResults) {
      updateVideoStatus(video.url, 'processing');
      
      try {
        const { data, sources } = await fetchVideoData(video.url);
        
        setResults(current => current.map(v => 
          v.url === video.url && v.status === 'processing'
            ? { 
                ...v, 
                title: data.title, 
                transcription: data.fullTranscription, 
                sources,
                status: 'completed' as const 
              }
            : v
        ));
      } catch (err: any) {
        setResults(current => current.map(v => 
          v.url === video.url && v.status === 'processing'
            ? { ...v, status: 'error' as const, error: err.message || 'Failed to fetch transcript.' }
            : v
        ));
      }
    }

    setIsProcessing(false);
  };

  const updateVideoStatus = (url: string, status: VideoResult['status']) => {
    setResults(current => current.map(v => 
      (v.url === url && v.status === 'pending') ? { ...v, status } : v
    ));
  };

  const clearHistory = () => {
    if (confirm('Clear all processed results?')) {
      setResults([]);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 md:py-12">
      <header className="mb-10 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-red-600 text-white rounded-2xl shadow-lg mb-4">
          <i className="fa-solid fa-scroll text-3xl"></i>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">TubeScribe</h1>
        <p className="mt-2 text-lg text-gray-600">YouTube Video Transcription Assistant</p>
      </header>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-8">
        <label htmlFor="links" className="block text-sm font-bold text-gray-700 uppercase tracking-wider mb-2">
          YouTube Links
        </label>
        <textarea
          id="links"
          rows={4}
          className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition-all resize-none text-sm font-mono"
          placeholder="Paste one or more YouTube links here (separated by comma or new line)..."
          value={urlInput}
          onChange={(e) => setUrlInput(e.target.value)}
          disabled={isProcessing}
        />
        <div className="mt-4 flex flex-col sm:flex-row gap-3">
          <button
            onClick={processLinks}
            disabled={isProcessing || !urlInput.trim()}
            className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <i className="fa-solid fa-spinner animate-spin"></i>
                Processing...
              </>
            ) : (
              <>
                <i className="fa-solid fa-wand-magic-sparkles"></i>
                Get Transcriptions
              </>
            )}
          </button>
          {results.length > 0 && (
            <button
              onClick={clearHistory}
              disabled={isProcessing}
              className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-all"
            >
              Clear Results
            </button>
          )}
        </div>
      </div>

      <div className="space-y-6">
        {results.length > 0 ? (
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-gray-900">Recent Transcripts</h2>
            <span className="text-sm text-gray-500">{results.length} video{results.length !== 1 ? 's' : ''}</span>
          </div>
        ) : (
          <div className="text-center py-20 border-2 border-dashed border-gray-200 rounded-2xl">
            <i className="fa-solid fa-link text-4xl text-gray-300 mb-4 block"></i>
            <p className="text-gray-500">No videos processed yet. Paste a link above to begin.</p>
          </div>
        )}

        {results.map((video, idx) => (
          <VideoCard key={`${video.url}-${idx}`} video={video} />
        ))}
      </div>

      <footer className="mt-16 pt-8 border-t border-gray-200 text-center text-gray-400 text-xs">
        <p>© 2024 TubeScribe Powered by Gemini 3.0 Pro. Full transcriptions are retrieved via advanced AI reasoning.</p>
      </footer>

      <style>{`
        @keyframes shimmer {
          0% { opacity: 0.5; }
          50% { opacity: 1; }
          100% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default App;
