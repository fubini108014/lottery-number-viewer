import React, { useState } from 'react';
import { motion } from 'motion/react';
import { LotteryDraw } from '../types';
import { Calendar, Hash, Trophy, Info } from 'lucide-react';
import { ZoneTable } from './ZoneTable';

interface LotteryTableProps {
  data: LotteryDraw[];
  year: string | null;
  showZoneTable: boolean;
  onToggleZoneTable: () => void;
}

export const LotteryTable: React.FC<LotteryTableProps> = ({ data, year, showZoneTable, onToggleZoneTable }) => {
  const [initialZoneTab, setInitialZoneTab] = useState<string>('A組');

  if (data.length === 0) return null;

  const handleOpenZoneTable = (tab: string) => {
    if (showZoneTable && initialZoneTab === tab) {
      onToggleZoneTable(); // Close if clicking the same active tab
    } else {
      setInitialZoneTab(tab);
      if (!showZoneTable) {
        onToggleZoneTable();
      }
    }
  };

  const handleZoneTabChange = (tab: string) => {
    setInitialZoneTab(tab);
  };

  const formatDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    
    const weekdayStr = date.toLocaleDateString('zh-TW', { weekday: 'short' }).replace('週', '');
    
    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3">
        <span className="font-mono text-zinc-700 font-medium">{dateStr}</span>
        <span className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-600 border border-zinc-200 w-fit min-w-[24px] text-center">
          {weekdayStr}
        </span>
      </div>
    );
  };

  const formatNumbers = (numbers: number[]) => {
    return (
      <div className="flex flex-wrap items-center gap-2">
        {numbers.map((num, idx) => (
          <div key={idx} className="relative group">
            <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-white border border-zinc-200 shadow-sm group-hover:border-violet-300 group-hover:shadow-md group-hover:shadow-violet-100 transition-all duration-200">
              <span className="font-mono font-bold text-lg text-zinc-800 group-hover:text-violet-600 transition-colors">
                {num}
              </span>
            </div>
            {idx < numbers.length - 1 && (
               <span className="absolute -right-2 top-1/2 -translate-y-1/2 text-zinc-300 pointer-events-none opacity-0 sm:opacity-100">,</span>
            )}
          </div>
        ))}
      </div>
    );
  };

  const calculateGroup = (numbers: number[], zones: [Set<number>, Set<number>, Set<number>]): { result: string, pattern: string } => {
    let counts = [0, 0, 0];

    for (const num of numbers) {
      if (zones[0].has(num)) counts[0]++;
      else if (zones[1].has(num)) counts[1]++;
      else if (zones[2].has(num)) counts[2]++;
    }

    const pattern = counts.join('-');
    let result = '';

    if (['1-2-2', '2-1-2', '2-2-1'].includes(pattern)) {
      result = '大';
    } else if (['1-1-3', '1-3-1', '3-1-1'].includes(pattern)) {
      result = '小';
    }
    return { result, pattern };
  };

  const groupAZones: [Set<number>, Set<number>, Set<number>] = [
    new Set([2, 4, 5, 6, 7, 11, 12, 14, 15, 16]),
    new Set([22, 24, 25, 26, 27, 33, 35, 36, 38, 39]),
    new Set([1, 3, 8, 9, 10, 13, 17, 18, 19, 20, 21, 23, 28, 29, 30, 31, 32, 34, 37])
  ];

  const groupBZones: [Set<number>, Set<number>, Set<number>] = [
    new Set([3, 5, 6, 8, 9, 21, 22, 23, 25, 28]),
    new Set([12, 13, 15, 16, 17, 30, 32, 33, 35, 39]),
    new Set([1, 2, 4, 7, 10, 11, 14, 18, 19, 20, 24, 26, 27, 29, 31, 34, 36, 37, 38])
  ];

  const groupCZones: [Set<number>, Set<number>, Set<number>] = [
    new Set([20, 21, 22, 23, 24, 25, 26, 27, 28, 29]),
    new Set([1, 4, 5, 8, 9, 11, 14, 15, 18, 19, 31, 34, 35, 38, 39]),
    new Set([2, 3, 6, 7, 10, 12, 13, 16, 17, 30, 32, 33, 36, 37])
  ];


  return (
    <div className="relative w-full h-full flex overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="h-full flex flex-col min-w-0 w-full"
      >
        <div className="flex-1 bg-white rounded-3xl shadow-xl shadow-zinc-200/50 border border-white/50 overflow-hidden backdrop-blur-sm flex flex-col min-h-0">
          <div className="flex-1 overflow-auto relative scrollbar-thin scrollbar-thumb-zinc-300 scrollbar-track-transparent">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="bg-zinc-900 border-b border-zinc-700 sticky top-0 z-20 shadow-md">
                  <th className="py-5 px-6 text-xs font-bold text-zinc-100 uppercase tracking-widest w-[140px]">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5 text-violet-400" />
                      開獎日期
                    </div>
                  </th>
                  <th className="py-5 px-6 text-xs font-bold text-zinc-100 uppercase tracking-widest">
                    <div className="flex items-center gap-2">
                      <Hash className="w-3.5 h-3.5 text-violet-400" />
                      中獎號碼
                    </div>
                  </th>
                  <th className="py-5 px-6 text-xs font-bold text-zinc-100 uppercase tracking-widest w-[100px] text-center">
                    <div className="flex items-center justify-center gap-1">
                      A組
                      <button 
                        onClick={() => handleOpenZoneTable('A組')}
                        className={`p-1 rounded-full transition-colors ${showZoneTable && initialZoneTab === 'A組' ? 'bg-violet-500 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-violet-400'}`}
                        title={showZoneTable ? "隱藏分組對照表" : "查看分組對照表"}
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                  <th className="py-5 px-6 text-xs font-bold text-zinc-100 uppercase tracking-widest w-[100px] text-center">
                    <div className="flex items-center justify-center gap-1">
                      B組
                      <button 
                        onClick={() => handleOpenZoneTable('B組')}
                        className={`p-1 rounded-full transition-colors ${showZoneTable && initialZoneTab === 'B組' ? 'bg-violet-500 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-violet-400'}`}
                        title={showZoneTable ? "隱藏分組對照表" : "查看分組對照表"}
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                  <th className="py-5 px-6 text-xs font-bold text-zinc-100 uppercase tracking-widest w-[100px] text-center">
                    <div className="flex items-center justify-center gap-1">
                      C組
                      <button 
                        onClick={() => handleOpenZoneTable('C組')}
                        className={`p-1 rounded-full transition-colors ${showZoneTable && initialZoneTab === 'C組' ? 'bg-violet-500 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-violet-400'}`}
                        title={showZoneTable ? "隱藏分組對照表" : "查看分組對照表"}
                      >
                        <Info className="w-3 h-3" />
                      </button>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {data.map((row, index) => {
                  const groupA = calculateGroup(row.numbers, groupAZones);
                  const groupB = calculateGroup(row.numbers, groupBZones);
                  const groupC = calculateGroup(row.numbers, groupCZones);
                  return (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="group hover:bg-violet-50/30 transition-colors"
                    >
                      <td className="py-4 px-6 text-sm">
                        {formatDate(row.date)}
                      </td>
                      <td className="py-4 px-6">
                        {formatNumbers(row.numbers)}
                      </td>
                      <td className="py-4 px-6 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {groupA.result ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm ${
                              groupA.result === '大' 
                                ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                                : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                            }`}>
                              {groupA.result}
                            </span>
                          ) : (
                            <div className="w-8 h-8" /> 
                          )}
                          <span className="text-[10px] font-mono text-zinc-400 font-medium">
                            {groupA.pattern}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {groupB.result ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm ${
                              groupB.result === '大' 
                                ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                                : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                            }`}>
                              {groupB.result}
                            </span>
                          ) : (
                            <div className="w-8 h-8" /> 
                          )}
                          <span className="text-[10px] font-mono text-zinc-400 font-medium">
                            {groupB.pattern}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center align-middle">
                        <div className="flex flex-col items-center justify-center gap-1">
                          {groupC.result ? (
                            <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold shadow-sm ${
                              groupC.result === '大' 
                                ? 'bg-rose-100 text-rose-600 border border-rose-200' 
                                : 'bg-emerald-100 text-emerald-600 border border-emerald-200'
                            }`}>
                              {groupC.result}
                            </span>
                          ) : (
                            <div className="w-8 h-8" /> 
                          )}
                          <span className="text-[10px] font-mono text-zinc-400 font-medium">
                            {groupC.pattern}
                          </span>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <ZoneTable 
        isOpen={showZoneTable} 
        onClose={onToggleZoneTable}
        groupAZones={groupAZones}
        groupBZones={groupBZones}
        groupCZones={groupCZones}
        initialTab={initialZoneTab}
        onTabChange={handleZoneTabChange}
      />
    </div>
  );
};
