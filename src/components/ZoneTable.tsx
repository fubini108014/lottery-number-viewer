import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ZoneInfo {
  name: string;
  zones: [Set<number>, Set<number>, Set<number>];
}

interface ZoneTableProps {
  isOpen: boolean;
  onClose: () => void;
  groupAZones: [Set<number>, Set<number>, Set<number>];
  groupBZones: [Set<number>, Set<number>, Set<number>];
  groupCZones: [Set<number>, Set<number>, Set<number>];
  groupNewAZones: [Set<number>, Set<number>, Set<number>];
  groupNewBZones: [Set<number>, Set<number>, Set<number>];
  initialTab?: string;
  onTabChange?: (tab: string) => void;
}

export const ZoneTable: React.FC<ZoneTableProps> = ({ 
  isOpen, 
  onClose, 
  groupAZones, 
  groupBZones, 
  groupCZones,
  groupNewAZones,
  groupNewBZones,
  initialTab = 'A組',
  onTabChange
}) => {
  const [activeTab, setActiveTab] = useState<string>(initialTab);

  // Update active tab when initialTab changes or when opening
  React.useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    onTabChange?.(tab);
  };

  const groups: ZoneInfo[] = [
    { name: 'A組', zones: groupAZones },
    { name: 'B組', zones: groupBZones },
    { name: 'C組', zones: groupCZones },
    { name: '新A', zones: groupNewAZones },
    { name: '新B', zones: groupNewBZones },
  ];

  const activeGroup = groups.find(g => g.name === activeTab) || groups[0];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="fixed left-0 right-0 bottom-0 z-50 bg-white shadow-[0_-8px_30px_rgba(0,0,0,0.12)] border-t border-zinc-100 flex flex-col rounded-t-3xl"
        >
          <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50/50 rounded-t-3xl">
            <h2 className="text-lg font-bold text-zinc-900">分組對照表</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-100 rounded-full transition-colors text-zinc-400 hover:text-zinc-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 flex flex-col gap-4">
            {/* Tabs */}
            <div className="flex p-1 bg-zinc-100 rounded-xl">
              {groups.map((group) => (
                <button
                  key={group.name}
                  onClick={() => handleTabChange(group.name)}
                  className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${
                    activeTab === group.name
                      ? 'bg-zinc-800 text-white shadow-md'
                      : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-200/50'
                  }`}
                >
                  {group.name}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="grid grid-cols-3 gap-3">
              {activeGroup.zones.map((zone, idx) => (
                <div key={idx} className="bg-zinc-50 rounded-xl p-3 border border-zinc-100">
                  <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2 justify-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-300"></span>
                    第 {idx + 1} 區
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-left">
                    {Array.from(zone).sort((a, b) => a - b).map((num) => (
                      <span 
                        key={num}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-white border border-zinc-200 text-sm font-mono font-medium text-zinc-600 shadow-sm hover:border-violet-300 hover:text-violet-600 transition-colors cursor-default"
                      >
                        {num}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};


