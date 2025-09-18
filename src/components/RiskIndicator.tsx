import React from 'react';
import { AlertTriangle, CheckCircle, XCircle, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

interface RiskIndicatorProps {
  level: string;
  confidence: number;
  title?: string;
}

const RiskIndicator: React.FC<RiskIndicatorProps> = ({ 
  level, 
  confidence, 
  title = "Health Risk Assessment" 
}) => {
  const getRiskData = (riskLevel: string) => {
    switch (riskLevel.toLowerCase()) {
      case 'low':
        return {
          icon: <CheckCircle className="h-5 w-5 text-green-600" />,
          color: 'bg-green-50 border-green-200 text-green-800',
          bgColor: 'bg-green-500/10',
          textColor: 'text-green-700',
          description: 'Water quality is within safe parameters',
          progressColor: 'bg-green-500'
        };
      case 'medium':
        return {
          icon: <AlertTriangle className="h-5 w-5 text-yellow-600" />,
          color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          bgColor: 'bg-yellow-500/10',
          textColor: 'text-yellow-700',
          description: 'Some parameters require monitoring',
          progressColor: 'bg-yellow-500'
        };
      case 'high':
        return {
          icon: <XCircle className="h-5 w-5 text-red-600" />,
          color: 'bg-red-50 border-red-200 text-red-800',
          bgColor: 'bg-red-500/10',
          textColor: 'text-red-700',
          description: 'Immediate attention required',
          progressColor: 'bg-red-500'
        };
      default:
        return {
          icon: <Info className="h-5 w-5 text-gray-600" />,
          color: 'bg-gray-50 border-gray-200 text-gray-800',
          bgColor: 'bg-gray-500/10',
          textColor: 'text-gray-700',
          description: 'Assessment pending',
          progressColor: 'bg-gray-500'
        };
    }
  };

  const riskData = getRiskData(level);

  return (
    <div className={`p-4 rounded-lg border ${riskData.bgColor}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          {riskData.icon}
          <h4 className="font-semibold text-sm">{title}</h4>
        </div>
        <Badge className={riskData.color}>
          {level.toUpperCase()}
        </Badge>
      </div>
      
      <p className={`text-sm mb-3 ${riskData.textColor}`}>
        {riskData.description}
      </p>
      
      <div className="space-y-2">
        <div className="flex justify-between text-xs">
          <span className="text-muted-foreground">Confidence Level</span>
          <span className={`font-medium ${riskData.textColor}`}>{confidence}%</span>
        </div>
        <Progress 
          value={confidence} 
          className="h-2"
        />
      </div>
      
      <div className="mt-3 text-xs text-muted-foreground">
        <p>Last updated: {new Date().toLocaleTimeString()}</p>
      </div>
    </div>
  );
};

export default RiskIndicator;