"use client"

import { useState, useEffect } from "react";
import { Chore } from "@/types";

// Automatically detect which data service to use
const useSupabase = !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

// Dynamic imports based on environment
const dataService = useSupabase 
  ? import("@/lib/supabase-data")
  : import("@/lib/data");

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Edit, Plus } from "lucide-react";

interface ChoreManagerProps {
  onChoresUpdated: () => void;
}

export default function ChoreManager({ onChoresUpdated }: ChoreManagerProps) {
  const [chores, setChores] = useState<Chore[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingChore, setEditingChore] = useState<Chore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    category: "Kitchen",
    points: 1,
    isNegative: false,
  });
  
  // Load chores
  useEffect(() => {
    loadChores();
  }, []);

  const loadChores = async () => {
    try {
      const service = await dataService;
      const choresList = await service.getAllChores();
      setChores(choresList);
    } catch (error) {
      console.error('Error loading chores:', error);
    }
  };
  
  const handleOpenDialog = (chore?: Chore) => {
    if (chore) {
      setEditingChore(chore);
      setForm({
        name: chore.name,
        category: chore.category,
        points: chore.points,
        isNegative: chore.isNegative,
      });
    } else {
      setEditingChore(null);
      setForm({
        name: "",
        category: "Kitchen",
        points: 1,
        isNegative: false,
      });
    }
    setOpenDialog(true);
  };
  
  const handleCloseDialog = () => {
    setOpenDialog(false);
  };
  
  const handleSaveChore = async () => {
    if (form.name.trim() === "") return;
    
    setIsLoading(true);
    try {
      const service = await dataService;
      
      if (editingChore) {
        await service.updateChore(editingChore.id, {
          name: form.name,
          category: form.category,
          points: form.points,
          isNegative: form.isNegative,
        });
      } else {
        await service.addChore({
          name: form.name,
          category: form.category,
          points: form.points,
          isNegative: form.isNegative,
        });
      }
      
      await loadChores();
      onChoresUpdated();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving chore:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteChore = async (id: string) => {
    if (confirm("Are you sure you want to delete this chore?")) {
      try {
        const service = await dataService;
        await service.deleteChore(id);
        await loadChores();
        onChoresUpdated();
      } catch (error) {
        console.error('Error deleting chore:', error);
      }
    }
  };
  
  // Group chores by category
  const choresByCategory = chores.reduce((acc, chore) => {
    if (!acc[chore.category]) {
      acc[chore.category] = [];
    }
    acc[chore.category].push(chore);
    return acc;
  }, {} as Record<string, Chore[]>);
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Manage Chores</h2>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Add New Chore
        </Button>
      </div>
      
      {Object.entries(choresByCategory).map(([category, categoryChores]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {categoryChores.map((chore) => (
                <div 
                  key={chore.id} 
                  className="flex items-center justify-between p-2 border rounded-md"
                >
                  <div className="flex items-center gap-2">
                    <span className={chore.isNegative ? "text-destructive" : ""}>
                      {chore.name}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      {chore.isNegative ? "-" : "+"}{chore.points} points
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => handleOpenDialog(chore)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => handleDeleteChore(chore.id)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
      
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingChore ? "Edit Chore" : "Add New Chore"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chore-name">Name</Label>
              <Input 
                id="chore-name" 
                value={form.name} 
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chore-category">Category</Label>
              <Select 
                value={form.category} 
                onValueChange={(value) => setForm({ ...form, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Kitchen">Kitchen</SelectItem>
                  <SelectItem value="Cleaning">Cleaning</SelectItem>
                  <SelectItem value="Errands">Errands</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="chore-points">Points</Label>
              <Input 
                id="chore-points" 
                type="number" 
                min="1"
                value={form.points} 
                onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="chore-negative" 
                checked={form.isNegative}
                onCheckedChange={(checked) => 
                  setForm({ ...form, isNegative: !!checked })
                }
              />
              <Label htmlFor="chore-negative">
                Negative action (subtract points)
              </Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>Cancel</Button>
            <Button onClick={handleSaveChore} disabled={isLoading}>
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 