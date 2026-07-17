import { memo } from "react";
import { Shield, Crown, BookOpen, FileText, Building2, Edit, Trash2, Users, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SuperAdminRole } from "./types";
import { classes, subjects } from "@/data/mockData";

interface RoleCardProps {
  role: SuperAdminRole;
  onEdit: (role: SuperAdminRole) => void;
  onDelete: (role: SuperAdminRole) => void;
}

const RoleCard = memo(function RoleCard({ role, onEdit, onDelete }: RoleCardProps) {
  const { permissions } = role;
  
  // Get icon based on role type
  const getIcon = () => {
    if (role.isSystem) return <Crown className="w-6 h-6 text-amber-500" />;
    if (permissions.contentLibrary.view || permissions.questionBank.view) return <BookOpen className="w-6 h-6 text-primary" />;
    if (permissions.exams.view) return <FileText className="w-6 h-6 text-primary" />;
    if (permissions.institutes.view) return <Building2 className="w-6 h-6 text-primary" />;
    return <Shield className="w-6 h-6 text-primary" />;
  };

  // Get permission summary
  const getPermissionSummary = () => {
    const modules: string[] = [];
    if (permissions.institutes.view) modules.push("Institutes");
    if (permissions.questionBank.view) modules.push("Question Bank");
    if (permissions.exams.view) modules.push("Exams");
    if (permissions.contentLibrary.view) modules.push("Content Library");
    if (permissions.masterData.view) modules.push("Master Data");
    if (permissions.users.view) modules.push("Users");
    if (permissions.rolesAccess.view) modules.push("Roles");
    
    if (role.isSystem) return "Full system access";
    if (modules.length === 0) return "Dashboard only";
    if (modules.length <= 2) return modules.join(" + ");
    return `${modules.slice(0, 2).join(", ")} +${modules.length - 2} more`;
  };

  // Get scope summary
  const getScopeSummary = () => {
    if (role.isSystem) return null;
    
    const qb = permissions.questionBank;
    if (!qb.view) return null;
    
    const scopeParts: string[] = [];
    
    if (!qb.scope.allSubjects && qb.scope.subjectIds.length > 0) {
      const subjectNames = qb.scope.subjectIds
        .map(id => subjects.find(s => s.id === id)?.name)
        .filter(Boolean)
        .slice(0, 2);
      if (subjectNames.length > 0) {
        scopeParts.push(subjectNames.join(", ") + (qb.scope.subjectIds.length > 2 ? ` +${qb.scope.subjectIds.length - 2}` : ""));
      }
    }
    
    if (!qb.scope.allClasses && qb.scope.classIds.length > 0) {
      const classNames = qb.scope.classIds
        .map(id => classes.find(c => c.id === id)?.name)
        .filter(Boolean)
        .slice(0, 2);
      if (classNames.length > 0) {
        scopeParts.push(classNames.join(", ") + (qb.scope.classIds.length > 2 ? ` +${qb.scope.classIds.length - 2}` : ""));
      }
    }
    
    return scopeParts.length > 0 ? scopeParts : null;
  };

  const scopeSummary = getScopeSummary();

  return (
    <div className="bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 shadow-soft border border-border/50 hover-lift transition-all">
      <div className="flex items-start justify-between mb-2 sm:mb-3">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-primary/10 flex items-center justify-center">
          {getIcon()}
        </div>
        <div className="flex gap-0.5 sm:gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 sm:h-9 sm:w-9" onClick={() => onEdit(role)}>
            <Edit className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          </Button>
          {role.isSystem ? (
            <Button variant="ghost" size="icon" disabled className="opacity-50 h-8 w-8 sm:h-9 sm:w-9">
              <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          ) : (
            <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive h-8 w-8 sm:h-9 sm:w-9" onClick={() => onDelete(role)}>
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </Button>
          )}
        </div>
      </div>
      
      <h3 className="font-semibold text-base sm:text-lg">{role.name}</h3>
      <p className="text-xs sm:text-sm text-muted-foreground mt-1 line-clamp-1">{role.description}</p>
      
      <p className="text-xs sm:text-sm text-primary/80 mt-2 font-medium">{getPermissionSummary()}</p>
      
      {scopeSummary && (
        <div className="mt-2 flex flex-wrap gap-1">
          {scopeSummary.map((scope, idx) => (
            <Badge key={idx} variant="secondary" className="text-[10px] sm:text-xs">
              {scope}
            </Badge>
          ))}
        </div>
      )}
      
      <div className="mt-3 sm:mt-4 pt-2.5 sm:pt-3 border-t border-border/50 flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-muted-foreground">
        <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
        <span>{role.memberCount} member{role.memberCount !== 1 ? "s" : ""}</span>
      </div>
    </div>
  );
});

export default RoleCard;
