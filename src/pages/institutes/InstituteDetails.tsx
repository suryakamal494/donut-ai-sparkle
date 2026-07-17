import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  ArrowLeft, 
  Building2, 
  Users, 
  GraduationCap, 
  BookOpen, 
  Edit, 
  Plus,
  Calendar,
  CreditCard,
  Activity,
  Layers
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { StatusBadge } from "@/components/ui/status-badge";
import { PlanBadge } from "@/components/ui/plan-badge";
import { StatsCard } from "@/components/ui/stats-card";
import { mockInstitutes } from "@/data/mockData";
import { curriculums, courses } from "@/data/masterData";
import { InstituteEditDialog } from "@/components/institutes/InstituteEditDialog";
import { AssignCurriculumCourseDialog } from "@/components/institutes/AssignCurriculumCourseDialog";
import { cn } from "@/lib/utils";

const InstituteDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);

  const institute = mockInstitutes.find(i => i.id === id);

  if (!institute) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] space-y-4">
        <Building2 className="w-16 h-16 text-muted-foreground" />
        <h2 className="text-xl font-semibold">Institute Not Found</h2>
        <Button onClick={() => navigate("/superadmin/institutes")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Institutes
        </Button>
      </div>
    );
  }

  // Mock assigned data - in real app this would come from the database
  const assignedCurriculums = ["cbse"]; 
  const assignedCourses = ["jee-mains", "neet"];
  const customCourses: string[] = [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={institute.name}
        description={`Institute Code: ${institute.code}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/superadmin/dashboard" },
          { label: "Institutes", href: "/superadmin/institutes" },
          { label: institute.name },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate("/superadmin/institutes")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate(`/superadmin/institutes/${id}/edit`)}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </div>
        }
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatsCard
          title="Students"
          value={institute.students.toLocaleString()}
          icon={GraduationCap}
        />
        <StatsCard
          title="Teachers"
          value={institute.teachers}
          icon={Users}
        />
        <StatsCard
          title="Curriculums"
          value={assignedCurriculums.length}
          icon={BookOpen}
        />
        <StatsCard
          title="Courses"
          value={assignedCourses.length + customCourses.length}
          icon={Layers}
        />
      </div>

      {/* Main Content */}
      <div className="bg-card rounded-2xl shadow-soft border border-border/50 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="border-b border-border/50 px-2 sm:px-4 overflow-x-auto">
            <TabsList className="bg-transparent h-11 sm:h-12 p-0 gap-0 w-max">
              <TabsTrigger 
                value="overview" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 sm:h-12 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                Overview
              </TabsTrigger>
              <TabsTrigger 
                value="curriculum" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 sm:h-12 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                Curriculums & Courses
              </TabsTrigger>
              <TabsTrigger 
                value="custom" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 sm:h-12 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                Custom Courses
              </TabsTrigger>
              <TabsTrigger 
                value="activity" 
                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-11 sm:h-12 px-2 sm:px-4 text-xs sm:text-sm whitespace-nowrap"
              >
                Activity Log
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Overview Tab */}
          <TabsContent value="overview" className="p-4 md:p-6 space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  Institute Information
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Status</span>
                    <StatusBadge status={institute.status} />
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Plan</span>
                    <PlanBadge plan={institute.plan} />
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{new Date(institute.createdAt).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Expires</span>
                    <span className="font-medium">{new Date(institute.expiresAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Admin Info */}
              <div className="space-y-4">
                <h3 className="font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  Admin Details
                </h3>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Name</span>
                    <span className="font-medium">{institute.adminName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-border/50">
                    <span className="text-muted-foreground">Email</span>
                    <span className="font-medium">{institute.adminEmail}</span>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Curriculums & Courses Tab */}
          <TabsContent value="curriculum" className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Assigned Curriculums & Courses</h3>
              <Button size="sm" onClick={() => setShowAssignDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Assign
              </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Assigned Curriculums */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <BookOpen className="w-4 h-4" />
                  Curriculums ({assignedCurriculums.length})
                </h4>
                <div className="space-y-2">
                  {assignedCurriculums.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No curriculums assigned</p>
                  ) : (
                    assignedCurriculums.map(currId => {
                      const curr = curriculums.find(c => c.id === currId);
                      return curr && (
                        <div key={currId} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                          <div>
                            <p className="font-medium">{curr.name}</p>
                            <p className="text-xs text-muted-foreground">{curr.description}</p>
                          </div>
                          <Badge>{curr.code}</Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Assigned Courses */}
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Layers className="w-4 h-4" />
                  Courses ({assignedCourses.length})
                </h4>
                <div className="space-y-2">
                  {assignedCourses.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">No courses assigned</p>
                  ) : (
                    assignedCourses.map(courseId => {
                      const course = courses.find(c => c.id === courseId);
                      return course && (
                        <div key={courseId} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                          <div>
                            <p className="font-medium">{course.name}</p>
                            <p className="text-xs text-muted-foreground">{course.description}</p>
                          </div>
                          <Badge variant="secondary" className="capitalize">{course.courseType}</Badge>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Custom Courses Tab */}
          <TabsContent value="custom" className="p-4 md:p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Custom Courses</h3>
                <p className="text-sm text-muted-foreground">Courses created specifically for this institute</p>
              </div>
              <Link to={`/superadmin/institutes/${id}/custom-course`}>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Custom Course
                </Button>
              </Link>
            </div>

            {customCourses.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Layers className="w-12 h-12 text-muted-foreground mb-4" />
                <h4 className="font-medium mb-2">No Custom Courses Yet</h4>
                <p className="text-sm text-muted-foreground mb-4 max-w-md">
                  Create custom courses tailored to this institute's specific needs. These courses will only be available to this institute.
                </p>
                <Link to={`/superadmin/institutes/${id}/custom-course`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Custom Course
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Custom course cards would go here */}
              </div>
            )}
          </TabsContent>

          {/* Activity Log Tab */}
          <TabsContent value="activity" className="p-4 md:p-6">
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Activity className="w-12 h-12 text-muted-foreground mb-4" />
              <h4 className="font-medium mb-2">Activity Log Coming Soon</h4>
              <p className="text-sm text-muted-foreground max-w-md">
                Track all actions and changes made to this institute, including user additions, course assignments, and more.
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Dialogs */}
      <InstituteEditDialog 
        open={showEditDialog} 
        onOpenChange={setShowEditDialog}
        institute={institute}
      />
      <AssignCurriculumCourseDialog
        open={showAssignDialog}
        onOpenChange={setShowAssignDialog}
        instituteId={institute.id}
        currentCurriculums={assignedCurriculums}
        currentCourses={assignedCourses}
      />
    </div>
  );
};

export default InstituteDetails;
