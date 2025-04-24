
import React from 'react';
import { Progress } from '@/components/ui/progress';
import { useProgressStore } from '@/store/use-progress-store';

interface ProgressBarProps {
  current: number;
  total: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total }) => {

  const percentage = total > 0 ? Math.round((current / total) * 100) : 0;
  
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-gray-500">
        <span>Progress</span>
        <span>{current} of {total} evaluated ({percentage}%)</span>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default ProgressBar;
