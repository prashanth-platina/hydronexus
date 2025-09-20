import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ManualDataEntry from "@/components/ManualDataEntry";
import CommunityReportForm from "@/components/CommunityReportForm";
import { TestTube, MessageSquare } from 'lucide-react';

const DataEntry = () => {
  const handleDataSubmitted = () => {
    // Trigger refresh or navigation
    console.log('Data submitted successfully');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground mb-2">Data Entry Portal</h1>
          <p className="text-muted-foreground">
            Record water quality readings and community reports
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ManualDataEntry onDataSubmitted={handleDataSubmitted} />
          <CommunityReportForm onReportSubmitted={handleDataSubmitted} />
        </div>
      </div>
    </div>
  );
};

export default DataEntry;