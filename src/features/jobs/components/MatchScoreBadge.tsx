import React from 'react';
import { Target } from 'lucide-react';

interface MatchScoreBadgeProps {
  score: number;
  isLoading?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  onClick?: (e: React.MouseEvent) => void;
}

export const MatchScoreBadge: React.FC<MatchScoreBadgeProps> = ({ 
  score, 
  isLoading,
  size = 'md',
  showLabel = true,
  onClick
}) => {
  if (isLoading) {
    return (
      <div className={`inline-flex items-center rounded-lg border border-white/5 bg-white/5 animate-pulse ${size === 'sm' ? 'px-2 py-0.5' : 'px-3 py-1'}`}>
        <div className="w-3 h-3 bg-white/20 rounded-full mr-2"></div>
        <div className="w-8 h-3 bg-white/10 rounded"></div>
      </div>
    );
  }
  // Determine color based on score
  const getColor = () => {
    if (score >= 80) return 'text-green-400 border-green-500/30 bg-green-500/10';
    if (score >= 50) return 'text-yellow-400 border-yellow-500/30 bg-yellow-500/10';
    if (score > 0) return 'text-[#FC6100] border-[#FC6100]/30 bg-[#FC6100]/10';
    return 'text-gray-500 border-white/10 bg-white/5';
  };

  const sizeClasses = {
    sm: 'px-1.5 py-0.5 text-[9px] gap-1',
    md: 'px-2.5 py-1 text-[11px] gap-1.5',
    lg: 'px-4 py-2 text-sm gap-2'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-5 h-5'
  };

  return (
    <div 
      onClick={onClick}
      className={`inline-flex items-center font-bold uppercase tracking-wider rounded-lg border transition-all ${getColor()} ${sizeClasses[size]} ${onClick ? 'cursor-pointer hover:scale-105 active:scale-95' : ''}`}
    >
      <Target className={iconSizes[size]} />
      {showLabel && <span>Match</span>}
      <span className="text-white">{score}%</span>
    </div>
  );
};
