import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { MessageSquare, AlertTriangle, User, FileText } from 'lucide-react';

interface CommunityReportFormProps {
  onReportSubmitted?: () => void;
}

const CommunityReportForm: React.FC<CommunityReportFormProps> = ({ onReportSubmitted }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    severity: '',
    reportedBy: '',
    notes: ''
  });
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.severity || !formData.reportedBy) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('cummunity_reports')
        .insert({
          report_description: formData.description,
          severity: formData.severity,
          reported_by: formData.reportedBy,
          notes: formData.notes
        });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for your report. It has been recorded successfully.",
      });

      setFormData({ description: '', severity: '', reportedBy: '', notes: '' });
      onReportSubmitted?.();
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Submission Failed",
        description: "Unable to submit report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-card-foreground">
          <MessageSquare className="h-5 w-5 text-primary" />
          Community Water Quality Report
        </CardTitle>
        <CardDescription>
          Report water quality issues or concerns in your community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="description" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Description *
            </Label>
            <Textarea
              id="description"
              placeholder="Describe the water quality issue..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-20"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity" className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Severity Level *
            </Label>
            <Select
              value={formData.severity}
              onValueChange={(value) => setFormData({ ...formData, severity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select severity level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low - Minor concern</SelectItem>
                <SelectItem value="medium">Medium - Noticeable issue</SelectItem>
                <SelectItem value="high">High - Urgent attention needed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reportedBy" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Your Name *
            </Label>
            <Input
              id="reportedBy"
              placeholder="Enter your full name"
              value={formData.reportedBy}
              onChange={(e) => setFormData({ ...formData, reportedBy: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              placeholder="Any additional information or observations..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default CommunityReportForm;