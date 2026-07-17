import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { instituteTiers, featureCategoryLabels, FeatureCategory } from "@/data/mockData";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const InstituteTiers = () => {
  const navigate = useNavigate();

  // Get all unique feature IDs across all tiers
  const allFeatureIds = Array.from(
    new Set(instituteTiers.flatMap((tier) => tier.features.map((f) => f.id)))
  );

  // Group features by category
  const featuresByCategory = allFeatureIds.reduce((acc, featureId) => {
    const feature = instituteTiers[0].features.find((f) => f.id === featureId);
    if (feature) {
      const category = feature.category;
      if (!acc[category]) acc[category] = [];
      acc[category].push(featureId);
    }
    return acc;
  }, {} as Record<FeatureCategory, string[]>);

  const getFeatureValue = (tierId: string, featureId: string) => {
    const tier = instituteTiers.find((t) => t.id === tierId);
    const feature = tier?.features.find((f) => f.id === featureId);
    
    if (!feature || !feature.included) {
      return { included: false, value: null };
    }
    
    return { included: true, value: feature.value };
  };

  const renderFeatureCell = (tierId: string, featureId: string) => {
    const { included, value } = getFeatureValue(tierId, featureId);
    
    if (!included) {
      return <X className="w-5 h-5 text-destructive/70 mx-auto" />;
    }
    
    if (value) {
      return <span className="text-sm font-medium text-foreground">{value}</span>;
    }
    
    return <Check className="w-5 h-5 text-success mx-auto" />;
  };

  const getFeatureName = (featureId: string) => {
    const feature = instituteTiers[0].features.find((f) => f.id === featureId);
    return feature?.name || featureId;
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in">
      <PageHeader
        title="Tier Management"
        description="Configure subscription tiers and features"
        breadcrumbs={[
          { label: "Dashboard", href: "/superadmin/dashboard" },
          { label: "Institutes", href: "/superadmin/institutes" },
          { label: "Tiers" },
        ]}
        actions={<Button className="gradient-button">Create New Tier</Button>}
      />

      {/* Tier Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {instituteTiers.map((tier, index) => (
          <div
            key={tier.id}
            className={cn(
              "relative bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-soft border-2 transition-all hover-lift",
              index === 1 ? "border-primary md:scale-105" : "border-border/50"
            )}
          >
            {index === 1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 sm:px-4 py-1 gradient-button rounded-full text-[10px] sm:text-xs font-semibold whitespace-nowrap">
                Most Popular
              </div>
            )}
            <div className={cn("w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-4", `bg-${tier.color}/10`)}>
              <span className={cn("text-xl sm:text-2xl font-bold", `text-${tier.color}`)}>{tier.name[0]}</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold">{tier.name}</h3>
            <div className="mt-1.5 sm:mt-2">
              <span className="text-2xl sm:text-3xl font-bold gradient-text">₹{tier.price.toLocaleString()}</span>
              <span className="text-xs sm:text-sm text-muted-foreground">/{tier.billingCycle}</span>
            </div>
            <div className="mt-3 sm:mt-4 text-xs sm:text-sm text-muted-foreground">
              <p>Up to {tier.maxStudents === -1 ? "Unlimited" : tier.maxStudents.toLocaleString()} students</p>
              <p>Up to {tier.maxTeachers === -1 ? "Unlimited" : tier.maxTeachers} teachers</p>
            </div>
            <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2">
              {tier.features.slice(0, 5).map((feature) => (
                <div key={feature.id} className="flex items-center gap-2 sm:gap-3">
                  {feature.included ? (
                    <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-success flex-shrink-0" />
                  ) : (
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground flex-shrink-0" />
                  )}
                  <span className={cn("text-xs sm:text-sm", feature.included ? "text-foreground" : "text-muted-foreground")}>
                    {feature.name}
                    {feature.value && feature.included && <span className="text-muted-foreground ml-1">({feature.value})</span>}
                  </span>
                </div>
              ))}
              <p className="text-[10px] sm:text-xs text-muted-foreground mt-2">+ {tier.features.length - 5} more features</p>
            </div>
            <Button 
              variant={index === 1 ? "default" : "outline"} 
              className={cn("w-full mt-4 sm:mt-6 group text-sm", index === 1 && "gradient-button")}
              onClick={() => navigate(`/superadmin/institutes/tiers/edit/${tier.id}`)}
            >
              Edit Tier
              <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 ml-1.5 sm:ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        ))}
      </div>

      {/* Feature Comparison Table */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <div className="p-4 md:p-6 border-b border-border/50">
          <h2 className="text-lg md:text-xl font-bold">Feature Comparison</h2>
          <p className="text-sm text-muted-foreground mt-1">Compare all features across tiers</p>
        </div>
        
        <div className="overflow-x-auto">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-muted/30">
                <TableHead className="w-[200px] md:w-[280px] font-semibold">Feature</TableHead>
                {instituteTiers.map((tier) => (
                  <TableHead key={tier.id} className="text-center font-semibold min-w-[140px]">
                    <div className="flex flex-col items-center gap-1">
                      <span className={cn("text-base", `text-${tier.color}`)}>{tier.name}</span>
                      <span className="text-xs text-muted-foreground font-normal">
                        ₹{tier.price.toLocaleString()}/{tier.billingCycle}
                      </span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Limits Section */}
              <TableRow className="bg-muted/20">
                <TableCell colSpan={4} className="font-semibold text-foreground py-3">
                  📊 User Limits
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Maximum Students</TableCell>
                {instituteTiers.map((tier) => (
                  <TableCell key={tier.id} className="text-center font-medium">
                    {tier.maxStudents === -1 ? "Unlimited" : tier.maxStudents.toLocaleString()}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="text-muted-foreground">Maximum Teachers</TableCell>
                {instituteTiers.map((tier) => (
                  <TableCell key={tier.id} className="text-center font-medium">
                    {tier.maxTeachers === -1 ? "Unlimited" : tier.maxTeachers}
                  </TableCell>
                ))}
              </TableRow>

              {/* Feature Categories */}
              {(Object.keys(featuresByCategory) as FeatureCategory[]).map((category) => (
                <>
                  <TableRow key={category} className="bg-muted/20">
                    <TableCell colSpan={4} className="font-semibold text-foreground py-3">
                      {category === "content" && "📚"} 
                      {category === "questions" && "❓"} 
                      {category === "exams" && "📝"} 
                      {category === "analytics" && "📈"} 
                      {category === "customization" && "🎨"} 
                      {category === "support" && "🎧"} 
                      {" "}{featureCategoryLabels[category]}
                    </TableCell>
                  </TableRow>
                  {featuresByCategory[category].map((featureId) => (
                    <TableRow key={featureId}>
                      <TableCell className="text-muted-foreground">{getFeatureName(featureId)}</TableCell>
                      {instituteTiers.map((tier) => (
                        <TableCell key={tier.id} className="text-center">
                          {renderFeatureCell(tier.id, featureId)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default InstituteTiers;
