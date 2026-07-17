import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Save, Library, HelpCircle, ClipboardList, BarChart3, Palette, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PageHeader } from "@/components/ui/page-header";
import { 
  instituteTiers, 
  masterFeatureList, 
  featureCategoryLabels, 
  TierFeature, 
  FeatureCategory,
  FeatureType 
} from "@/data/mockData";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";

const categoryIcons: Record<FeatureCategory, React.ReactNode> = {
  content: <Library className="w-5 h-5" />,
  questions: <HelpCircle className="w-5 h-5" />,
  exams: <ClipboardList className="w-5 h-5" />,
  analytics: <BarChart3 className="w-5 h-5" />,
  customization: <Palette className="w-5 h-5" />,
  support: <Headphones className="w-5 h-5" />,
};

const EditTier = () => {
  const { tierId } = useParams();
  const navigate = useNavigate();
  
  const originalTier = instituteTiers.find((t) => t.id === tierId);
  
  const [tierData, setTierData] = useState({
    name: "",
    price: 0,
    billingCycle: "monthly" as "monthly" | "yearly",
    maxStudents: 0,
    maxTeachers: 0,
    unlimitedStudents: false,
    unlimitedTeachers: false,
    features: [] as TierFeature[],
  });

  const [addFeatureOpen, setAddFeatureOpen] = useState(false);
  const [newFeature, setNewFeature] = useState({
    category: "content" as FeatureCategory,
    id: "",
    name: "",
    type: "boolean" as FeatureType,
    value: "",
  });

  useEffect(() => {
    if (originalTier) {
      setTierData({
        name: originalTier.name,
        price: originalTier.price,
        billingCycle: originalTier.billingCycle,
        maxStudents: originalTier.maxStudents === -1 ? 0 : originalTier.maxStudents,
        maxTeachers: originalTier.maxTeachers === -1 ? 0 : originalTier.maxTeachers,
        unlimitedStudents: originalTier.maxStudents === -1,
        unlimitedTeachers: originalTier.maxTeachers === -1,
        features: [...originalTier.features],
      });
    }
  }, [originalTier]);

  if (!originalTier) {
    return (
      <div className="flex items-center justify-center h-96">
        <p className="text-muted-foreground">Tier not found</p>
      </div>
    );
  }

  const featuresByCategory = tierData.features.reduce((acc, feature) => {
    if (!acc[feature.category]) acc[feature.category] = [];
    acc[feature.category].push(feature);
    return acc;
  }, {} as Record<FeatureCategory, TierFeature[]>);

  const handleFeatureToggle = (featureId: string, checked: boolean) => {
    setTierData((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === featureId ? { ...f, included: checked } : f
      ),
    }));
  };

  const handleFeatureValueChange = (featureId: string, value: string) => {
    setTierData((prev) => ({
      ...prev,
      features: prev.features.map((f) =>
        f.id === featureId ? { ...f, value } : f
      ),
    }));
  };

  const handleRemoveFeature = (featureId: string) => {
    setTierData((prev) => ({
      ...prev,
      features: prev.features.filter((f) => f.id !== featureId),
    }));
    toast.success("Feature removed");
  };

  const handleAddFeature = () => {
    if (!newFeature.name) {
      toast.error("Please enter a feature name");
      return;
    }

    const feature: TierFeature = {
      id: newFeature.id || newFeature.name.toLowerCase().replace(/\s+/g, "_"),
      name: newFeature.name,
      category: newFeature.category,
      type: newFeature.type,
      included: true,
      value: newFeature.type !== "boolean" ? newFeature.value : undefined,
    };

    setTierData((prev) => ({
      ...prev,
      features: [...prev.features, feature],
    }));

    setNewFeature({
      category: "content",
      id: "",
      name: "",
      type: "boolean",
      value: "",
    });
    setAddFeatureOpen(false);
    toast.success("Feature added");
  };

  const handleSelectExistingFeature = (featureId: string) => {
    const masterFeature = masterFeatureList.find((f) => f.id === featureId);
    if (masterFeature) {
      setNewFeature({
        category: masterFeature.category,
        id: masterFeature.id,
        name: masterFeature.name,
        type: masterFeature.type,
        value: "",
      });
    }
  };

  const availableFeatures = masterFeatureList.filter(
    (mf) => !tierData.features.some((tf) => tf.id === mf.id)
  );

  const handleSave = () => {
    toast.success(`${tierData.name} tier updated successfully`);
    navigate("/superadmin/institutes/tiers");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Edit ${originalTier.name} Tier`}
        description="Configure tier settings, limits, and features"
        breadcrumbs={[
          { label: "Dashboard", href: "/superadmin/dashboard" },
          { label: "Institutes", href: "/superadmin/institutes" },
          { label: "Tiers", href: "/superadmin/institutes/tiers" },
          { label: `Edit ${originalTier.name}` },
        ]}
        actions={
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate("/superadmin/institutes/tiers")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button className="gradient-button" onClick={handleSave}>
              <Save className="w-4 h-4 mr-2" />
              Save Changes
            </Button>
          </div>
        }
      />

      {/* Basic Information */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label htmlFor="tierName">Tier Name</Label>
            <Input
              id="tierName"
              value={tierData.name}
              onChange={(e) => setTierData((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="price">Price (₹)</Label>
            <Input
              id="price"
              type="number"
              value={tierData.price}
              onChange={(e) => setTierData((prev) => ({ ...prev, price: Number(e.target.value) }))}
              className="bg-background"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="billingCycle">Billing Cycle</Label>
            <Select
              value={tierData.billingCycle}
              onValueChange={(value: "monthly" | "yearly") =>
                setTierData((prev) => ({ ...prev, billingCycle: value }))
              }
            >
              <SelectTrigger className="bg-background">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="yearly">Yearly</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* User Limits */}
      <div className="bg-card rounded-2xl p-6 shadow-soft border border-border/50">
        <h3 className="text-lg font-semibold mb-4">User Limits</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maxStudents">Maximum Students</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="unlimitedStudents"
                  checked={tierData.unlimitedStudents}
                  onCheckedChange={(checked) =>
                    setTierData((prev) => ({ ...prev, unlimitedStudents: !!checked }))
                  }
                />
                <Label htmlFor="unlimitedStudents" className="text-sm text-muted-foreground">
                  Unlimited
                </Label>
              </div>
            </div>
            <Input
              id="maxStudents"
              type="number"
              value={tierData.maxStudents}
              onChange={(e) => setTierData((prev) => ({ ...prev, maxStudents: Number(e.target.value) }))}
              disabled={tierData.unlimitedStudents}
              className="bg-background"
            />
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="maxTeachers">Maximum Teachers</Label>
              <div className="flex items-center gap-2">
                <Checkbox
                  id="unlimitedTeachers"
                  checked={tierData.unlimitedTeachers}
                  onCheckedChange={(checked) =>
                    setTierData((prev) => ({ ...prev, unlimitedTeachers: !!checked }))
                  }
                />
                <Label htmlFor="unlimitedTeachers" className="text-sm text-muted-foreground">
                  Unlimited
                </Label>
              </div>
            </div>
            <Input
              id="maxTeachers"
              type="number"
              value={tierData.maxTeachers}
              onChange={(e) => setTierData((prev) => ({ ...prev, maxTeachers: Number(e.target.value) }))}
              disabled={tierData.unlimitedTeachers}
              className="bg-background"
            />
          </div>
        </div>
      </div>

      {/* Features by Category */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <div className="p-6 border-b border-border/50 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Features by Category</h3>
            <p className="text-sm text-muted-foreground mt-1">Enable or disable features and set their values</p>
          </div>
          <Dialog open={addFeatureOpen} onOpenChange={setAddFeatureOpen}>
            <DialogTrigger asChild>
              <Button className="gradient-button">
                <Plus className="w-4 h-4 mr-2" />
                Add Feature
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Feature to {tierData.name} Tier</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                {availableFeatures.length > 0 && (
                  <div className="space-y-2">
                    <Label>Select Existing Feature</Label>
                    <Select onValueChange={handleSelectExistingFeature}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose from master list" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableFeatures.map((feature) => (
                          <SelectItem key={feature.id} value={feature.id}>
                            {feature.name} ({featureCategoryLabels[feature.category]})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-muted-foreground">Or create a new custom feature below</p>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={newFeature.category}
                    onValueChange={(value: FeatureCategory) =>
                      setNewFeature((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(featureCategoryLabels) as FeatureCategory[]).map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {featureCategoryLabels[cat]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Feature Name</Label>
                  <Input
                    value={newFeature.name}
                    onChange={(e) => setNewFeature((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Video Streaming"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Feature Type</Label>
                  <Select
                    value={newFeature.type}
                    onValueChange={(value: FeatureType) =>
                      setNewFeature((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="boolean">Boolean (Yes/No)</SelectItem>
                      <SelectItem value="limit">With Limit (e.g., 500 items)</SelectItem>
                      <SelectItem value="value">With Value (e.g., Priority, Advanced)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {newFeature.type !== "boolean" && (
                  <div className="space-y-2">
                    <Label>Value / Limit</Label>
                    <Input
                      value={newFeature.value}
                      onChange={(e) => setNewFeature((prev) => ({ ...prev, value: e.target.value }))}
                      placeholder={newFeature.type === "limit" ? "e.g., 100/month" : "e.g., Advanced"}
                    />
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" className="flex-1" onClick={() => setAddFeatureOpen(false)}>
                    Cancel
                  </Button>
                  <Button className="flex-1 gradient-button" onClick={handleAddFeature}>
                    Add Feature
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        <div className="divide-y divide-border/50">
          {(Object.keys(featureCategoryLabels) as FeatureCategory[]).map((category) => {
            const categoryFeatures = featuresByCategory[category] || [];
            if (categoryFeatures.length === 0) return null;

            return (
              <div key={category} className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-primary/10 text-primary")}>
                    {categoryIcons[category]}
                  </div>
                  <div>
                    <h4 className="font-semibold">{featureCategoryLabels[category]}</h4>
                    <p className="text-xs text-muted-foreground">{categoryFeatures.length} features</p>
                  </div>
                </div>

                <div className="space-y-3">
                  {categoryFeatures.map((feature) => (
                    <div
                      key={feature.id}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border transition-all",
                        feature.included
                          ? "bg-success/5 border-success/20"
                          : "bg-muted/30 border-border/50"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <Switch
                          checked={feature.included}
                          onCheckedChange={(checked) => handleFeatureToggle(feature.id, checked)}
                        />
                        <div>
                          <p className={cn("font-medium", !feature.included && "text-muted-foreground")}>
                            {feature.name}
                          </p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {feature.type === "boolean" ? "Yes/No" : feature.type === "limit" ? "With Limit" : "With Value"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        {feature.type !== "boolean" && feature.included && (
                          <Input
                            value={feature.value || ""}
                            onChange={(e) => handleFeatureValueChange(feature.id, e.target.value)}
                            placeholder="Set value"
                            className="w-32 h-9 text-sm bg-background"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => handleRemoveFeature(feature.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="flex justify-end gap-3 pt-4">
        <Button variant="outline" onClick={() => navigate("/superadmin/institutes/tiers")}>
          Cancel
        </Button>
        <Button className="gradient-button" onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>
    </div>
  );
};

export default EditTier;
