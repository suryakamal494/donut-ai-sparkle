import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Building2, User, CreditCard, Check, BookOpen, Globe, Phone, Calendar, ArrowLeft, Layers, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { curriculums, courses } from "@/data/masterData";
import { mockInstitutes } from "@/data/mockData";

const steps = [
  { id: 1, title: "Institute Details", icon: Building2 },
  { id: 2, title: "Admin Setup", icon: User },
  { id: 3, title: "Plan Selection", icon: CreditCard },
  { id: 4, title: "Curriculum & Courses", icon: BookOpen },
];

const plans = [
  { id: "basic", name: "Basic", price: "₹9,999/mo", students: 500, teachers: 25, color: "donut-teal" },
  { id: "pro", name: "Pro", price: "₹24,999/mo", students: 2000, teachers: 100, color: "donut-orange" },
  { id: "enterprise", name: "Enterprise", price: "₹49,999/mo", students: "Unlimited", teachers: "Unlimited", color: "donut-coral" },
];

const states = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Delhi", 
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram",
  "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
  "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const boardAffiliations = [
  { id: "cbse", name: "CBSE" },
  { id: "icse", name: "ICSE" },
  { id: "state", name: "State Board" },
  { id: "ib", name: "IB" },
  { id: "igcse", name: "IGCSE" },
  { id: "other", name: "Other" },
];

const academicYearStarts = [
  { id: "april", name: "April" },
  { id: "june", name: "June" },
  { id: "july", name: "July" },
];

const EditInstitute = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);

  const institute = mockInstitutes.find(i => i.id === id);

  const [formData, setFormData] = useState({
    name: "", 
    code: "", 
    address: "", 
    city: "", 
    state: "",
    contactPerson: "",
    contactDesignation: "",
    phone: "",
    website: "",
    boardAffiliation: "",
    udiseCode: "",
    academicYearStart: "april",
    adminName: "", 
    adminEmail: "", 
    adminMobile: "", 
    plan: "pro",
    status: "active",
    assignedCurriculums: [] as string[],
    assignedCourses: [] as string[],
  });

  // Pre-populate with institute data
  useEffect(() => {
    if (institute) {
      setFormData({
        name: institute.name || "",
        code: institute.code || "",
        address: "",
        city: "",
        state: "",
        contactPerson: "",
        contactDesignation: "",
        phone: "",
        website: "",
        boardAffiliation: "",
        udiseCode: "",
        academicYearStart: "april",
        adminName: institute.adminName || "",
        adminEmail: institute.adminEmail || "",
        adminMobile: "",
        plan: institute.plan || "pro",
        status: institute.status || "active",
        assignedCurriculums: ["cbse"], // Mock data
        assignedCourses: ["jee-mains", "neet"], // Mock data
      });
    }
  }, [institute]);

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

  const updateFormData = (field: string, value: string | string[]) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCurriculum = (curriculumId: string) => {
    const current = formData.assignedCurriculums;
    if (current.includes(curriculumId)) {
      updateFormData("assignedCurriculums", current.filter(c => c !== curriculumId));
    } else {
      updateFormData("assignedCurriculums", [...current, curriculumId]);
    }
  };

  const toggleCourse = (courseId: string) => {
    const current = formData.assignedCourses;
    if (current.includes(courseId)) {
      updateFormData("assignedCourses", current.filter(c => c !== courseId));
    } else {
      updateFormData("assignedCourses", [...current, courseId]);
    }
  };

  const handleSave = () => {
    toast({ title: "Institute Updated!", description: `${formData.name} has been successfully updated.` });
    navigate(`/superadmin/institutes/${id}`);
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return formData.name && formData.code;
      case 2:
        return formData.adminName && formData.adminEmail;
      case 3:
        return formData.plan;
      case 4:
        return true;
      default:
        return true;
    }
  };

  // Mock custom courses for this institute
  const customCourses: { id: string; name: string }[] = [];

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title={`Edit: ${institute.name}`}
        description="Update institute details, admin, plan, and curriculum assignments"
        breadcrumbs={[
          { label: "Dashboard", href: "/superadmin/dashboard" },
          { label: "Institutes", href: "/superadmin/institutes" },
          { label: institute.name, href: `/superadmin/institutes/${id}` },
          { label: "Edit" },
        ]}
        actions={
          <Button variant="outline" size="sm" onClick={() => navigate(`/superadmin/institutes/${id}`)}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        }
      />

      {/* Stepper */}
      <div className="bg-card rounded-2xl p-4 md:p-6 shadow-soft border border-border/50">
        <div className="flex items-center justify-between">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center flex-1">
              <div 
                className="flex flex-col sm:flex-row items-center gap-1 sm:gap-2 md:gap-3 cursor-pointer"
                onClick={() => setCurrentStep(step.id)}
              >
                <div className={cn(
                  "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-all shrink-0",
                  currentStep >= step.id ? "gradient-button" : "bg-muted text-muted-foreground"
                )}>
                  {currentStep > step.id ? <Check className="w-4 h-4" /> : <step.icon className="w-4 h-4" />}
                </div>
                <div className="text-center sm:text-left">
                  <p className={cn(
                    "text-[10px] sm:text-xs md:text-sm font-medium",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground",
                    "hidden sm:block"
                  )}>
                    {step.title}
                  </p>
                  <p className={cn(
                    "text-[10px] font-medium sm:hidden",
                    currentStep >= step.id ? "text-foreground" : "text-muted-foreground"
                  )}>
                    Step {step.id}
                  </p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <div className={cn("flex-1 h-0.5 mx-1 sm:mx-2 md:mx-4", currentStep > step.id ? "bg-primary" : "bg-muted")} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form */}
      <div className="bg-card rounded-2xl p-4 md:p-6 shadow-soft border border-border/50">
        {/* Step 1: Institute Details */}
        {currentStep === 1 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Institute Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Institute Name *</Label>
                <Input placeholder="Enter institute name" value={formData.name} onChange={(e) => updateFormData("name", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Institute Code *</Label>
                <Input placeholder="e.g., DPS001" value={formData.code} onChange={(e) => updateFormData("code", e.target.value)} />
              </div>
              
              <div className="space-y-2">
                <Label>Contact Person</Label>
                <Input placeholder="Full name" value={formData.contactPerson} onChange={(e) => updateFormData("contactPerson", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Designation</Label>
                <Input placeholder="e.g., Principal, Manager" value={formData.contactDesignation} onChange={(e) => updateFormData("contactDesignation", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Phone className="w-3.5 h-3.5" /> Phone Number</Label>
                <Input placeholder="Landline or mobile" value={formData.phone} onChange={(e) => updateFormData("phone", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Globe className="w-3.5 h-3.5" /> Website</Label>
                <Input placeholder="https://www.example.edu" value={formData.website} onChange={(e) => updateFormData("website", e.target.value)} />
              </div>

              <div className="md:col-span-2 space-y-2">
                <Label>Address</Label>
                <Input placeholder="Full address" value={formData.address} onChange={(e) => updateFormData("address", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>City</Label>
                <Input placeholder="City" value={formData.city} onChange={(e) => updateFormData("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>State</Label>
                <Select value={formData.state || undefined} onValueChange={(v) => updateFormData("state", v)}>
                  <SelectTrigger><SelectValue placeholder="Select state" /></SelectTrigger>
                  <SelectContent>
                    {states.map(state => (
                      <SelectItem key={state} value={state.toLowerCase().replace(/\s+/g, '-')}>{state}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Board Affiliation</Label>
                <Select value={formData.boardAffiliation || undefined} onValueChange={(v) => updateFormData("boardAffiliation", v)}>
                  <SelectTrigger><SelectValue placeholder="Select board" /></SelectTrigger>
                  <SelectContent>
                    {boardAffiliations.map(board => (
                      <SelectItem key={board.id} value={board.id}>{board.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>UDISE Code</Label>
                <Input placeholder="11-digit UDISE code" value={formData.udiseCode} onChange={(e) => updateFormData("udiseCode", e.target.value)} />
              </div>

              <div className="space-y-2">
                <Label className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" /> Academic Year Starts</Label>
                <Select value={formData.academicYearStart} onValueChange={(v) => updateFormData("academicYearStart", v)}>
                  <SelectTrigger><SelectValue placeholder="Select month" /></SelectTrigger>
                  <SelectContent>
                    {academicYearStarts.map(month => (
                      <SelectItem key={month.id} value={month.id}>{month.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(v) => updateFormData("status", v)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Admin Setup */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Admin Setup</h3>
            <p className="text-sm text-muted-foreground">Update the primary administrator account for this institute.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              <div className="space-y-2">
                <Label>Admin Name *</Label>
                <Input placeholder="Full name" value={formData.adminName} onChange={(e) => updateFormData("adminName", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Email *</Label>
                <Input type="email" placeholder="admin@institute.com" value={formData.adminEmail} onChange={(e) => updateFormData("adminEmail", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Mobile</Label>
                <Input placeholder="10-digit mobile" value={formData.adminMobile} onChange={(e) => updateFormData("adminMobile", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {/* Step 3: Plan Selection */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Select Plan</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => updateFormData("plan", plan.id)}
                  className={cn(
                    "p-4 md:p-6 rounded-2xl border-2 cursor-pointer transition-all hover-lift",
                    formData.plan === plan.id ? "border-primary bg-primary/5" : "border-border"
                  )}
                >
                  <div className={cn("w-10 h-10 md:w-12 md:h-12 rounded-xl flex items-center justify-center mb-4", `bg-${plan.color}/10`)}>
                    <CreditCard className={cn("w-5 h-5 md:w-6 md:h-6", `text-${plan.color}`)} />
                  </div>
                  <h4 className="text-lg md:text-xl font-bold">{plan.name}</h4>
                  <p className="text-xl md:text-2xl font-bold gradient-text mt-2">{plan.price}</p>
                  <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                    <p>Up to {plan.students} students</p>
                    <p>Up to {plan.teachers} teachers</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Curriculum & Courses */}
        {currentStep === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold">Assign Curriculums & Courses</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Manage the curriculums and courses this institute has access to.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Curriculums */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Curriculums
                </h4>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {curriculums.filter(c => c.isActive).map((curriculum) => (
                    <div
                      key={curriculum.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.assignedCurriculums.includes(curriculum.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleCurriculum(curriculum.id)}
                    >
                      <Checkbox 
                        checked={formData.assignedCurriculums.includes(curriculum.id)}
                        onCheckedChange={() => toggleCurriculum(curriculum.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{curriculum.name}</p>
                        <p className="text-xs text-muted-foreground">{curriculum.description}</p>
                      </div>
                      <Badge variant="outline">{curriculum.code}</Badge>
                    </div>
                  ))}
                </div>
              </div>

              {/* Courses */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  Competitive Courses
                </h4>
                <div className="space-y-2 max-h-[250px] overflow-y-auto pr-2">
                  {courses.filter(c => c.isActive && c.status === "published").map((course) => (
                    <div
                      key={course.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        formData.assignedCourses.includes(course.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => toggleCourse(course.id)}
                    >
                      <Checkbox 
                        checked={formData.assignedCourses.includes(course.id)}
                        onCheckedChange={() => toggleCourse(course.id)}
                      />
                      <div className="flex-1">
                        <p className="font-medium">{course.name}</p>
                        <p className="text-xs text-muted-foreground">{course.description}</p>
                      </div>
                      <Badge variant="secondary" className="capitalize">{course.courseType}</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Custom Courses Section */}
            <div className="border-t border-border pt-6 mt-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-medium flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary" />
                    Custom Courses for This Institute
                  </h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Create courses tailored specifically for this institute's needs.
                  </p>
                </div>
              </div>

              {customCourses.length === 0 ? (
                <div className="p-6 border border-dashed border-border rounded-xl text-center">
                  <Layers className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-4">No custom courses created yet</p>
                  <Button onClick={() => navigate(`/superadmin/institutes/${id}/custom-course`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Custom Course
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {customCourses.map(course => (
                    <div key={course.id} className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                      <span className="font-medium">{course.name}</span>
                      <Badge>Custom</Badge>
                    </div>
                  ))}
                  <Button variant="outline" className="w-full mt-2" onClick={() => navigate(`/superadmin/institutes/${id}/custom-course`)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create Another Custom Course
                  </Button>
                </div>
              )}
            </div>

            {/* Summary */}
            {(formData.assignedCurriculums.length > 0 || formData.assignedCourses.length > 0) && (
              <div className="p-4 rounded-lg bg-muted/50 space-y-2">
                <p className="text-sm font-medium">Selected:</p>
                <div className="flex flex-wrap gap-2">
                  {formData.assignedCurriculums.map(id => {
                    const curr = curriculums.find(c => c.id === id);
                    return curr && <Badge key={id} variant="outline">{curr.code}</Badge>;
                  })}
                  {formData.assignedCourses.map(id => {
                    const course = courses.find(c => c.id === id);
                    return course && <Badge key={id} variant="secondary">{course.name}</Badge>;
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Navigation */}
        <div className="flex justify-between mt-8 pt-6 border-t border-border">
          <Button variant="outline" onClick={() => currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate(`/superadmin/institutes/${id}`)}>
            {currentStep === 1 ? "Cancel" : "Previous"}
          </Button>
          {currentStep < 4 ? (
            <Button onClick={() => setCurrentStep(currentStep + 1)} disabled={!canProceed()}>
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSave} className="gradient-button">
              Save Changes
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditInstitute;
