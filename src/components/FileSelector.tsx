import React from 'react';
import { ChevronDown, Calendar } from 'lucide-react';
import { motion } from 'motion/react';

interface FileSelectorProps {
  files: Array<{ name: string; year: string | null }>;
  selectedFile: string | null;
  onSelect: (filename: string) => void;
}

export const FileSelector: React.FC<FileSelectorProps> = ({ files, selectedFile, onSelect }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="w-full max-w-sm relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-violet-500 to-fuchsia-500 rounded-2xl blur opacity-20 group-hover:opacity-30 transition-opacity duration-300" />
      <div className="relative bg-white rounded-2xl shadow-xl shadow-black/5 ring-1 ring-black/5 overflow-hidden">
        <div className="flex items-center px-4 py-2 border-b border-zinc-100 bg-zinc-50/50">
          <Calendar className="w-4 h-4 text-violet-500 mr-2" />
          <label htmlFor="file-select" className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
            選擇年份
          </label>
        </div>
        <div className="relative">
          <select
            id="file-select"
            value={selectedFile || ''}
            onChange={(e) => onSelect(e.target.value)}
            className="block w-full pl-4 pr-10 py-2 text-base text-zinc-800 bg-transparent focus:outline-none focus:bg-zinc-50 cursor-pointer appearance-none font-medium"
          >
            {files.map((file) => (
              <option key={file.name} value={file.name}>
                {file.year ? `${file.year} 年度` : file.name}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
            <ChevronDown className="h-5 w-5 text-zinc-400 group-hover:text-violet-500 transition-colors" />
          </div>
        </div>
      </div>
    </motion.div>
  );
};
