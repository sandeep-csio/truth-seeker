
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useEvaluation } from '@/context/EvaluationContext';
import { exportToExcel } from '@/utils/fileUtils';
import { Download } from 'lucide-react';

const ResultsExport: React.FC<{ onReset: () => void }> = ({ onReset }) => {
  const { currentProject, progress, getAllItems } = useEvaluation();
  
  if (!currentProject) {
    return null;
  }
  
  const handleExport = () => {
    const items = getAllItems();
    exportToExcel(items, currentProject.name);
  };
  
  const totalItems = currentProject.items.length;
  const completedItems = currentProject.completed;
  const lastUpdated = new Date(currentProject.lastUpdated).toLocaleString();
  
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-center text-xl text-app-blue">
          Project Summary: {currentProject.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Evaluation Progress</span>
            <span>{completedItems} of {totalItems} items ({progress}%)</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
        
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Project Name</p>
            <p className="font-medium">{currentProject.name}</p>
          </div>
          <div>
            <p className="text-gray-500">Last Updated</p>
            <p className="font-medium">{lastUpdated}</p>
          </div>
          <div>
            <p className="text-gray-500">Total Items</p>
            <p className="font-medium">{totalItems}</p>
          </div>
          <div>
            <p className="text-gray-500">Completed</p>
            <p className="font-medium">{completedItems}</p>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          className="w-full flex items-center justify-center space-x-2 bg-app-blue hover:bg-blue-700"
          onClick={handleExport}
        >
          <Download className="h-4 w-4" />
          <span>Export Results to Excel</span>
        </Button>
        
        <Button 
          variant="outline" 
          className="w-full"
          onClick={onReset}
        >
          Start New Project
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ResultsExport;
