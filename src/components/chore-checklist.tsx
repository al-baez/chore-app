"use client"

import { useState, useEffect } from "react";
import { Chore, Partner } from "@/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { getLogsByDate } from "@/lib/data";
import { format } from "date-fns";

interface ChoreChecklistProps {
  title: string;
  partner: Partner;
  chores: Chore[];
  date: string;
  onChoreCompleted: (choreId: string, partner: Partner) => void;
}

export default function ChoreChecklist({ 
  title, 
  partner, 
  chores, 
  date, 
  onChoreCompleted 
}: ChoreChecklistProps) {
  const [completedChores, setCompletedChores] = useState<Record<string, boolean>>({});
  const [pendingChores, setPendingChores] = useState<Record<string, boolean>>({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Format the date for display
  const displayDate = format(new Date(date), "EEEE, MMMM d, yyyy");
  
  // Check for already completed chores
  useEffect(() => {
    const logs = getLogsByDate(date);
    const completed = logs
      .filter(log => log.partner === partner)
      .reduce((acc, log) => {
        acc[log.choreId] = true;
        return acc;
      }, {} as Record<string, boolean>);
    
    setCompletedChores(completed);
    // Reset pending chores when date changes
    setPendingChores({});
  }, [partner, date]);
  
  const handleCheckboxChange = (choreId: string, checked: boolean) => {
    // Don't mark as completed immediately, just mark as pending
    setPendingChores(prev => ({ 
      ...prev, 
      [choreId]: checked 
    }));
  };
  
  const handleSaveChores = () => {
    // Save all pending checked chores
    Object.entries(pendingChores).forEach(([choreId, isChecked]) => {
      if (isChecked && !completedChores[choreId]) {
        onChoreCompleted(choreId, partner);
      }
    });
    
    // Update completed chores with the ones we just saved
    setCompletedChores(prev => ({
      ...prev,
      ...Object.entries(pendingChores)
        .filter(([, isChecked]) => isChecked)
        .reduce((acc, [id]) => {
          acc[id] = true;
          return acc;
        }, {} as Record<string, boolean>)
    }));
    
    // Clear pending chores
    setPendingChores({});
    
    // Show success message
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };
  
  // Check if there are any pending chores to save
  const hasPendingChanges = Object.entries(pendingChores).some(
    ([choreId, isChecked]) => isChecked && !completedChores[choreId]
  );
  
  // Group chores by category and separate positive and negative
  const positiveChores = chores.filter(chore => !chore.isNegative);
  const negativeChores = chores.filter(chore => chore.isNegative);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{displayDate}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="font-medium mb-3">Positive Chores</h3>
          <div className="space-y-2">
            {positiveChores.map((chore) => (
              <div key={chore.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${partner}-${chore.id}`} 
                  checked={!!completedChores[chore.id] || !!pendingChores[chore.id]}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange(chore.id, checked as boolean)
                  }
                  disabled={!!completedChores[chore.id]}
                />
                <Label 
                  htmlFor={`${partner}-${chore.id}`}
                  className="flex justify-between w-full cursor-pointer"
                >
                  <span>{chore.name}</span>
                  <span className="text-muted-foreground">+{chore.points}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="font-medium mb-3">Negative Actions</h3>
          <div className="space-y-2">
            {negativeChores.map((chore) => (
              <div key={chore.id} className="flex items-center space-x-2">
                <Checkbox 
                  id={`${partner}-${chore.id}`}
                  checked={!!completedChores[chore.id] || !!pendingChores[chore.id]}
                  onCheckedChange={(checked) => 
                    handleCheckboxChange(chore.id, checked as boolean)
                  }
                  disabled={!!completedChores[chore.id]}
                />
                <Label 
                  htmlFor={`${partner}-${chore.id}`}
                  className="flex justify-between w-full cursor-pointer"
                >
                  <span>{chore.name}</span>
                  <span className="text-destructive">-{chore.points}</span>
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <div className="pt-4">
          <Button 
            onClick={handleSaveChores} 
            disabled={!hasPendingChanges}
            className="w-full"
          >
            Save Daily Chores
          </Button>
          
          {saveSuccess && (
            <p className="text-center text-green-600 mt-2 text-sm">
              Chores saved successfully!
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 