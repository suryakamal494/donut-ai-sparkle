import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Institute } from "@/data/mockData";

interface InstituteEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  institute: Institute;
}

export const InstituteEditDialog = ({ open, onOpenChange, institute }: InstituteEditDialogProps) => {
  const [formData, setFormData] = useState({
    name: "",
    code: "",
    adminName: "",
    adminEmail: "",
    status: "" as Institute["status"],
    plan: "" as Institute["plan"],
  });

  useEffect(() => {
    if (institute) {
      setFormData({
        name: institute.name,
        code: institute.code,
        adminName: institute.adminName,
        adminEmail: institute.adminEmail,
        status: institute.status,
        plan: institute.plan,
      });
    }
  }, [institute]);

  const handleSave = () => {
    if (!formData.name || !formData.code) {
      toast.error("Please fill in required fields");
      return;
    }
    
    toast.success("Institute updated successfully");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Institute</DialogTitle>
          <DialogDescription>
            Update institute details. Changes will be saved immediately.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Institute Name *</Label>
              <Input 
                value={formData.name} 
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Institute Code *</Label>
              <Input 
                value={formData.code} 
                onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value }))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Admin Name</Label>
              <Input 
                value={formData.adminName} 
                onChange={(e) => setFormData(prev => ({ ...prev, adminName: e.target.value }))} 
              />
            </div>
            <div className="space-y-2">
              <Label>Admin Email</Label>
              <Input 
                type="email"
                value={formData.adminEmail} 
                onChange={(e) => setFormData(prev => ({ ...prev, adminEmail: e.target.value }))} 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: Institute["status"]) => setFormData(prev => ({ ...prev, status: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Plan</Label>
              <Select value={formData.plan} onValueChange={(v: Institute["plan"]) => setFormData(prev => ({ ...prev, plan: v }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="basic">Basic</SelectItem>
                  <SelectItem value="pro">Pro</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
