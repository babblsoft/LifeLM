import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { FileText, Download, Search, MoreVertical, Trash2 } from 'lucide-react';
import { format } from 'date-fns';

export const NoteBMPage = () => {
  const { documents, deleteDocument } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DIARY' | 'EXPORT'>('ALL');
  
  // Sort and Filter
  const filteredDocs = documents
    .filter(doc => {
        const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase());
        if (filterType === 'ALL') return matchesSearch;
        if (filterType === 'DIARY') return matchesSearch && doc.type === 'DIARY_EXPORT';
        if (filterType === 'EXPORT') return matchesSearch && doc.type !== 'DIARY_EXPORT';
        return matchesSearch;
    })
    .sort((a, b) => new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime());

  const handleDownload = (content: string, title: string) => {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title}.txt`;
      a.click();
      window.URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full overflow-y-auto bg-cream pt-12 pb-24 px-6">
      <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">NoteBM</h1>
      <p className="text-gray-400 text-xs uppercase tracking-widest mb-8">Secure Document Vault</p>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-3 mb-8 focus-within:ring-2 focus-within:ring-terra/20 transition-all">
        <Search size={20} className="text-gray-300" />
        <input 
            type="text" 
            placeholder="Search documents..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent border-none text-sm outline-none placeholder-gray-300 text-charcoal" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Special Folders */}
        <div className="col-span-2 grid grid-cols-2 gap-4 mb-4">
             <button 
                onClick={() => setFilterType(filterType === 'DIARY' ? 'ALL' : 'DIARY')}
                className={`text-left p-5 rounded-2xl shadow-lg relative overflow-hidden transition-transform active:scale-95 ${filterType === 'DIARY' ? 'ring-2 ring-terra ring-offset-2' : ''} bg-gradient-to-br from-terra to-red-400 text-white`}
             >
                <FileText size={24} className="mb-2" />
                <h3 className="font-bold font-serif text-lg">Diaries</h3>
                <p className="text-xs opacity-80 mt-1">Auto-Generated</p>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/20 rounded-full blur-xl"></div>
             </button>
             <button 
                onClick={() => setFilterType(filterType === 'EXPORT' ? 'ALL' : 'EXPORT')}
                className={`text-left p-5 rounded-2xl shadow-lg relative overflow-hidden transition-transform active:scale-95 ${filterType === 'EXPORT' ? 'ring-2 ring-terra ring-offset-2' : ''} bg-charcoal text-white`}
             >
                <FileText size={24} className="mb-2" />
                <h3 className="font-bold font-serif text-lg">Exports</h3>
                <p className="text-xs opacity-80 mt-1">PDF & Raw</p>
                <div className="absolute -bottom-4 -right-4 w-16 h-16 bg-white/10 rounded-full blur-xl"></div>
             </button>
        </div>

        {/* Document List */}
        {filteredDocs.length > 0 ? filteredDocs.map(doc => (
            <div key={doc.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all group relative">
                <div className="flex justify-between items-start mb-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-terra transition-colors">
                        <FileText size={16} />
                    </div>
                    {/* Delete Action */}
                    <button 
                        onClick={(e) => { e.stopPropagation(); deleteDocument(doc.id); }}
                        className="text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                        title="Delete"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                <h4 className="font-bold text-charcoal text-sm mb-1 truncate">{doc.title}</h4>
                <p className="text-[10px] text-gray-400 mb-3">
                    {format(new Date(doc.lastUpdated), 'MMM d, yyyy')}
                </p>
                
                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button 
                        onClick={() => handleDownload(doc.content, doc.title)}
                        className="text-terra bg-terra/10 p-1.5 rounded-full hover:bg-terra hover:text-white transition-colors"
                        title="Download"
                     >
                        <Download size={12} />
                     </button>
                </div>
            </div>
        )) : (
            <div className="col-span-2 text-center py-12 text-gray-400">
                <p>No documents found.</p>
                <p className="text-xs mt-2">Ask BasePulse to create one for you.</p>
            </div>
        )}
      </div>
    </div>
  );
};