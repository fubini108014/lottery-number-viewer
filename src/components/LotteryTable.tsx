import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { LotteryDraw } from '../types';
import { Calendar, Hash, Info } from 'lucide-react';
import { ZoneTable } from './ZoneTable';
import { db, User } from '../firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

interface LotteryTableProps {
  data: LotteryDraw[];
  year: string | null;
  showZoneTable: boolean;
  onToggleZoneTable: () => void;
  user: User | null;
}

const GROUPS_CONFIG = [
  { id: 'A組', name: 'A組', zones: [
    new Set([2, 4, 5, 6, 7, 11, 12, 14, 15, 16]),
    new Set([22, 24, 25, 26, 27, 33, 35, 36, 38, 39]),
    new Set([1, 3, 8, 9, 10, 13, 17, 18, 19, 20, 21, 23, 28, 29, 30, 31, 32, 34, 37])
  ] as [Set<number>, Set<number>, Set<number>] },
  { id: 'B組', name: 'B組', zones: [
    new Set([3, 5, 6, 8, 9, 21, 22, 23, 25, 28]),
    new Set([12, 13, 15, 16, 17, 30, 32, 33, 35, 39]),
    new Set([1, 2, 4, 7, 10, 11, 14, 18, 19, 20, 24, 26, 27, 29, 31, 34, 36, 37, 38])
  ] as [Set<number>, Set<number>, Set<number>] },
  { id: 'C組', name: 'C組', zones: [
    new Set([20, 21, 22, 23, 24, 25, 26, 27, 28, 29]),
    new Set([1, 4, 5, 8, 9, 11, 14, 15, 18, 19, 31, 34, 35, 38, 39]),
    new Set([2, 3, 6, 7, 10, 12, 13, 16, 17, 30, 32, 33, 36, 37])
  ] as [Set<number>, Set<number>, Set<number>] },
  { id: '新A', name: '新A', zones: [
    new Set([1, 5, 7, 8, 9, 10, 34, 37, 38, 39]),
    new Set([21, 22, 23, 24, 25, 26, 27, 28, 29, 30]),
    new Set([2, 3, 4, 6, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 31, 32, 33, 35, 36])
  ] as [Set<number>, Set<number>, Set<number>] },
  { id: '新B', name: '新B', zones: [
    new Set([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]),
    new Set([30, 31, 32, 33, 34, 35, 36, 37, 38, 39]),
    new Set([11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29])
  ] as [Set<number>, Set<number>, Set<number>] },
];

const calculateGroup = (numbers: number[], zones: [Set<number>, Set<number>, Set<number>]): { result: string, pattern: string } => {
  let counts = [0, 0, 0];
  for (const num of numbers) {
    if (zones[0].has(num)) counts[0]++;
    else if (zones[1].has(num)) counts[1]++;
    else if (zones[2].has(num)) counts[2]++;
  }
  const pattern = counts.join('-');
  let result = '';
  if (['1-2-2', '2-1-2', '2-2-1'].includes(pattern)) result = '大';
  else if (['1-1-3', '1-3-1', '3-1-1'].includes(pattern)) result = '小';
  return { result, pattern };
};

const GroupResultCell: React.FC<{ 
  result: string, 
  pattern: string, 
  value: string, 
  onChange: (val: string) => void 
}> = ({ result, pattern, value, onChange }) => (
  <td className="py-1.5 px-4 text-center align-middle border-x border-zinc-50/50">
    <div className="flex flex-row items-center justify-center gap-2">
      <span className={`text-[11px] font-mono whitespace-nowrap font-bold min-w-[38px] ${result === '大'?'px-1 py-0 rounded bg-rose-200 text-rose-800 border border-rose-300':result === '小'?'px-1 py-0 rounded bg-emerald-200 text-emerald-800 border border-emerald-300':'text-zinc-500'}`}>
        {pattern}
      </span>
      <input
        type="text"
        inputMode="numeric"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="w-10 h-6 text-center text-[12px] font-bold border border-zinc-200 rounded-md bg-zinc-50/50 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:bg-white transition-all font-mono placeholder:text-zinc-300"
        placeholder="-"
      />
    </div>
  </td>
);

export const LotteryTable: React.FC<LotteryTableProps> = ({ data, year, showZoneTable, onToggleZoneTable, user }) => {
  const [initialZoneTab, setInitialZoneTab] = useState<string>('A組');
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});

  // 從 Firestore 即時獲取資料
  useEffect(() => {
    if (!user || !db) return;

    const docRef = doc(db, 'userNotes', user.uid);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserNotes(docSnap.data() as Record<string, string>);
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleNoteChange = async (dateKey: string, groupId: string, val: string) => {
    if (!user || !db) return;

    // 先更新本地 UI (樂觀更新)
    const noteKey = `${dateKey}-${groupId}`;
    const newNotes = { ...userNotes, [noteKey]: val };
    setUserNotes(newNotes);

    // 儲存到雲端
    try {
      const docRef = doc(db, 'userNotes', user.uid);
      await setDoc(docRef, newNotes, { merge: true });
    } catch (error) {
      console.error("Firestore Save Error:", error);
    }
  };

  const zoneTableProps = useMemo(() => ({
    groupAZones: GROUPS_CONFIG[0].zones,
    groupBZones: GROUPS_CONFIG[1].zones,
    groupCZones: GROUPS_CONFIG[2].zones,
    groupNewAZones: GROUPS_CONFIG[3].zones,
    groupNewBZones: GROUPS_CONFIG[4].zones,
  }), []);

  if (data.length === 0) return null;

  const handleOpenZoneTable = (tab: string) => {
    if (showZoneTable && initialZoneTab === tab) {
      onToggleZoneTable(); 
    } else {
      setInitialZoneTab(tab);
      if (!showZoneTable) onToggleZoneTable();
    }
  };

  const formatDate = (date: Date) => {
    const dateStr = date.toLocaleDateString('zh-TW', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const day = date.getDay();
    const weekdayStr = date.toLocaleDateString('zh-TW', { weekday: 'short' }).replace('週', '');
    const weekdayStyles = 
      day === 0 ? 'bg-rose-100 text-rose-600 border-rose-200' :
      day === 6 ? 'bg-indigo-100 text-indigo-600 border-indigo-200' :
      'bg-zinc-100 text-zinc-600 border-zinc-200';

    return (
      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
        <span className="font-mono text-zinc-700 font-medium text-sm hidden sm:inline">{dateStr}</span>
        <span className="font-mono text-zinc-700 font-medium text-sm inline sm:hidden">{dateStr.slice(2)}</span>
        <span className={`text-[12px] font-bold px-1.5 py-0 rounded border w-fit min-w-[20px] text-center ${weekdayStyles}`}>
          {weekdayStr}
        </span>
      </div>
    );
  };

  const formatNumbers = (numbers: number[], date: Date) => {
    const day = date.getDay();
    const isSunday = day === 0;
    const isSaturday = day === 6;

    const ballStyles = 
      isSunday ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-rose-100 group-hover:border-rose-400 group-hover:shadow-rose-200' :
      isSaturday ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-indigo-100 group-hover:border-indigo-400 group-hover:shadow-indigo-200' :
      'bg-white border-zinc-200 text-zinc-800 shadow-zinc-100 group-hover:border-violet-300 group-hover:shadow-violet-100';

    const textStyles = 
      isSunday ? 'text-rose-700 group-hover:text-rose-800' :
      isSaturday ? 'text-indigo-700 group-hover:text-indigo-800' :
      'text-zinc-800 group-hover:text-violet-600';

    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {numbers.map((num, idx) => (
          <div key={idx} className="relative group">
            <div className={`w-7 h-7 flex items-center justify-center rounded-lg border shadow-sm transition-all duration-200 ${ballStyles}`}>
              <span className={`font-mono font-bold text-base transition-colors ${textStyles}`}>
                {num}
              </span>
            </div>
          </div>
        ))}
      </div>
    );
  };

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
                  <th className="py-2 px-4 text-[10px] font-bold text-zinc-100 uppercase tracking-widest w-[120px] whitespace-nowrap">
                    <div className="flex items-center gap-2"><Calendar className="w-3 h-3 text-violet-400" />開獎日期</div>
                  </th>
                  <th className="py-2 px-4 text-[10px] font-bold text-zinc-100 uppercase tracking-widest whitespace-nowrap">
                    <div className="flex items-center gap-2"><Hash className="w-3 h-3 text-violet-400" />中獎號碼</div>
                  </th>
                  {GROUPS_CONFIG.map(group => (
                    <th key={group.id} className="py-2 px-4 text-[10px] font-bold text-zinc-100 uppercase tracking-widest w-[130px] text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        {group.name}
                        <button 
                          onClick={() => handleOpenZoneTable(group.id)}
                          className={`p-0.5 rounded-full transition-colors ${showZoneTable && initialZoneTab === group.id ? 'bg-violet-500 text-white' : 'hover:bg-zinc-800 text-zinc-400 hover:text-violet-400'}`}
                        >
                          <Info className="w-2.5 h-2.5" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-50">
                {data.map((row, index) => (
                  <motion.tr
                    key={index}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.005 }}
                    className="group hover:bg-violet-50/30 transition-colors"
                  >
                    <td className="py-1.5 px-4 text-sm">{formatDate(row.date)}</td>
                    <td className="py-1.5 px-4">{formatNumbers(row.numbers, row.date)}</td>
                    {GROUPS_CONFIG.map(group => {
                      const { result, pattern } = calculateGroup(row.numbers, group.zones);
                      const dateKey = row.date.toISOString();
                      const noteKey = `${dateKey}-${group.id}`;
                      return (
                        <GroupResultCell 
                          key={group.id} 
                          result={result} 
                          pattern={pattern} 
                          value={userNotes[noteKey] || ''}
                          onChange={(val) => handleNoteChange(dateKey, group.id, val)}
                        />
                      );
                    })}
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </motion.div>

      <ZoneTable 
        isOpen={showZoneTable} 
        onClose={onToggleZoneTable}
        {...zoneTableProps}
        initialTab={initialZoneTab}
        onTabChange={setInitialZoneTab}
      />
    </div>
  );
};
