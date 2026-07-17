import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { 
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { 
  ArrowLeft, 
  Plus, 
  Save, 
  Send, 
  Search,
  BookOpen,
  Layers,
  CheckSquare,
  XSquare,
  Building2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/ui/page-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

import { 
  courses, 
  curriculums, 
  getActiveCurriculums
} from "@/data/masterData";
import { 
  allCBSEChapters, 
  getChaptersByClassAndSubject 
} from "@/data/cbseMasterData";
import { classes, subjects, mockInstitutes } from "@/data/mockData";
import { Course } from "@/types/masterData";
import { SortableChapterItem } from "@/components/parameters/SortableChapterItem";

interface CourseChapterEntry {
  id: string;
  chapterId: string;
  name: string;
  subjectId: string;
  sourceLabel: string;
  isCourseOwned: boolean;
  order: number;
}

const InstituteCustomCourse = () => {
  const { id: instituteId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  const institute = mockInstitutes.find(i => i.id === instituteId);
  
  // Course creation/editing state
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false);
  const [showCreateChapterDialog, setShowCreateChapterDialog] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  
  // Source panel filters
  const [sourceCurriculumId, setSourceCurriculumId] = useState<string>("cbse");
  const [sourceClassId, setSourceClassId] = useState<string>("");
  const [sourceSubjectId, setSourceSubjectId] = useState<string>("");
  const [sourceSearchQuery, setSourceSearchQuery] = useState("");
  
  // Selected chapters for adding
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  
  // Course content state
  const [courseContent, setCourseContent] = useState<Record<string, CourseChapterEntry[]>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // New course form
  const [newCourse, setNewCourse] = useState({
    name: "",
    code: "",
    description: "",
    courseType: "competitive" as Course["courseType"],
    allowedCurriculums: ["cbse"] as string[],
    allowedClasses: [] as string[],
  });
  
  // New chapter form
  const [newChapter, setNewChapter] = useState({
    name: "",
    subjectId: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Custom courses for this institute (mock - would come from DB)
  const instituteCustomCourses = useMemo(() => {
    // In real app, filter courses by instituteId
    return courses.filter(c => c.isActive).slice(0, 2); // Mock: show first 2 courses as examples
  }, [instituteId]);

  // Available chapters from curriculum
  const availableChapters = useMemo(() => {
    if (!sourceClassId || !sourceSubjectId) return [];
    
    let chapters = getChaptersByClassAndSubject(sourceClassId, sourceSubjectId);
    
    if (sourceSearchQuery) {
      const query = sourceSearchQuery.toLowerCase();
      chapters = chapters.filter(ch => 
        ch.name.toLowerCase().includes(query)
      );
    }
    
    return chapters;
  }, [sourceClassId, sourceSubjectId, sourceSearchQuery]);

  const currentCourseChapters = courseContent[selectedCourseId] || [];

  // Group by subject
  const courseContentBySubject = useMemo(() => {
    const grouped: Record<string, CourseChapterEntry[]> = {};
    currentCourseChapters.forEach(ch => {
      if (!grouped[ch.subjectId]) {
        grouped[ch.subjectId] = [];
      }
      grouped[ch.subjectId].push(ch);
    });
    Object.keys(grouped).forEach(key => {
      grouped[key].sort((a, b) => a.order - b.order);
    });
    return grouped;
  }, [currentCourseChapters]);

  const handleChapterToggle = (chapterId: string) => {
    const newSet = new Set(selectedChapterIds);
    if (newSet.has(chapterId)) {
      newSet.delete(chapterId);
    } else {
      newSet.add(chapterId);
    }
    setSelectedChapterIds(newSet);
  };

  const handleAddSelectedChapters = () => {
    if (selectedChapterIds.size === 0 || !selectedCourseId) {
      toast.error("No chapters selected");
      return;
    }
    
    const existingIds = new Set(currentCourseChapters.map(ch => ch.chapterId));
    const chaptersToAdd: CourseChapterEntry[] = [];
    
    selectedChapterIds.forEach(chapterId => {
      if (existingIds.has(chapterId)) return;
      
      const chapter = availableChapters.find(ch => ch.id === chapterId);
      if (chapter) {
        const classInfo = classes.find(c => c.id === chapter.classId);
        chaptersToAdd.push({
          id: `added-${chapterId}-${Date.now()}`,
          chapterId: chapter.id,
          name: chapter.name,
          subjectId: chapter.subjectId,
          sourceLabel: `CBSE ${classInfo?.name || ""}`,
          isCourseOwned: false,
          order: currentCourseChapters.length + chaptersToAdd.length + 1,
        });
      }
    });
    
    if (chaptersToAdd.length > 0) {
      setCourseContent(prev => ({
        ...prev,
        [selectedCourseId]: [...(prev[selectedCourseId] || []), ...chaptersToAdd],
      }));
      setIsDirty(true);
      toast.success(`Added ${chaptersToAdd.length} chapter(s)`);
    }
    
    setSelectedChapterIds(new Set());
  };

  const handleDeleteChapter = (entryId: string) => {
    if (!selectedCourseId) return;
    
    setCourseContent(prev => ({
      ...prev,
      [selectedCourseId]: prev[selectedCourseId].filter(ch => ch.id !== entryId),
    }));
    setIsDirty(true);
    toast.success("Chapter removed");
  };

  const handleDragEnd = (event: DragEndEvent, subjectId: string) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const subjectChapters = courseContentBySubject[subjectId] || [];
      const oldIndex = subjectChapters.findIndex(ch => ch.id === active.id);
      const newIndex = subjectChapters.findIndex(ch => ch.id === over.id);
      
      const reordered = arrayMove(subjectChapters, oldIndex, newIndex);
      const updatedSubjectChapters = reordered.map((ch, idx) => ({
        ...ch,
        order: idx + 1,
      }));
      
      const otherChapters = currentCourseChapters.filter(ch => ch.subjectId !== subjectId);
      setCourseContent(prev => ({
        ...prev,
        [selectedCourseId]: [...otherChapters, ...updatedSubjectChapters],
      }));
      setIsDirty(true);
    }
  };

  const handleCreateCourse = () => {
    if (!newCourse.name || !newCourse.code) {
      toast.error("Please fill in required fields");
      return;
    }
    
    toast.success(`Custom course "${newCourse.name}" created for ${institute?.name || "Institute"}`);
    setShowCreateCourseDialog(false);
    setNewCourse({ name: "", code: "", description: "", courseType: "competitive", allowedCurriculums: ["cbse"], allowedClasses: [] });
  };

  const handleCreateChapter = () => {
    if (!newChapter.name || !newChapter.subjectId || !selectedCourseId) {
      toast.error("Please fill in required fields");
      return;
    }
    
    const newEntry: CourseChapterEntry = {
      id: `owned-${Date.now()}`,
      chapterId: `owned-${Date.now()}`,
      name: newChapter.name,
      subjectId: newChapter.subjectId,
      sourceLabel: "Course-Owned",
      isCourseOwned: true,
      order: currentCourseChapters.length + 1,
    };
    
    setCourseContent(prev => ({
      ...prev,
      [selectedCourseId]: [...(prev[selectedCourseId] || []), newEntry],
    }));
    setIsDirty(true);
    
    toast.success(`Course-only chapter "${newChapter.name}" created`);
    setShowCreateChapterDialog(false);
    setNewChapter({ name: "", subjectId: "" });
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || "Unknown";
  };

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

  return (
    <div className="space-y-4 animate-fade-in h-full">
      <PageHeader
        title={`Custom Course Builder`}
        description={`Create custom courses for ${institute.name}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/superadmin/dashboard" },
          { label: "Institutes", href: "/superadmin/institutes" },
          { label: institute.name, href: `/superadmin/institutes/${instituteId}` },
          { label: "Custom Course" }
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate(`/superadmin/institutes/${instituteId}`)}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            {selectedCourseId && (
              <Button size="sm" disabled={!isDirty}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            )}
          </div>
        }
      />

      {/* Course Selector */}
      <div className="bg-card rounded-xl p-4 border border-border/50 shadow-soft">
        <div className="flex items-center gap-4 flex-wrap">
          <Label className="text-sm font-medium">Custom Course:</Label>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-[280px]">
              <SelectValue placeholder="Select or create a course" />
            </SelectTrigger>
            <SelectContent>
              {instituteCustomCourses.map((course) => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setShowCreateCourseDialog(true)}
          >
            <Plus className="w-4 h-4" />
            New Custom Course
          </Button>
          
          <Badge variant="outline" className="ml-auto">
            <Building2 className="w-3 h-3 mr-1" />
            {institute.name}
          </Badge>
        </div>
      </div>

      {/* Main Workspace */}
      {selectedCourseId ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-[calc(100vh-320px)] min-h-[500px]">
          {/* Left Panel: Source */}
          <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/50 space-y-3">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-primary" />
                <h3 className="font-semibold">Source: Curriculum Tree</h3>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <Select value={sourceCurriculumId} onValueChange={setSourceCurriculumId}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Curriculum" />
                  </SelectTrigger>
                  <SelectContent>
                    {getActiveCurriculums().map((curr) => (
                      <SelectItem key={curr.id} value={curr.id}>{curr.code}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sourceClassId} onValueChange={(v) => { setSourceClassId(v); setSourceSubjectId(""); setSelectedChapterIds(new Set()); }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Select value={sourceSubjectId} onValueChange={(v) => { setSourceSubjectId(v); setSelectedChapterIds(new Set()); }}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    {subjects.map((sub) => (
                      <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search chapters..."
                  value={sourceSearchQuery}
                  onChange={(e) => setSourceSearchQuery(e.target.value)}
                  className="pl-9 h-9"
                />
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {availableChapters.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <BookOpen className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    {sourceClassId && sourceSubjectId ? "No chapters found" : "Select Class and Subject to browse chapters"}
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  {availableChapters.map((chapter) => (
                    <div
                      key={chapter.id}
                      className={cn(
                        "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                        selectedChapterIds.has(chapter.id) 
                          ? "border-primary bg-primary/5" 
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => handleChapterToggle(chapter.id)}
                    >
                      <Checkbox 
                        checked={selectedChapterIds.has(chapter.id)}
                        onCheckedChange={() => handleChapterToggle(chapter.id)}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{chapter.name}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>

            {selectedChapterIds.size > 0 && (
              <div className="p-3 border-t border-border/50 bg-muted/30">
                <Button className="w-full gap-2" onClick={handleAddSelectedChapters}>
                  <Plus className="w-4 h-4" />
                  Add {selectedChapterIds.size} Chapter(s) to Course
                </Button>
              </div>
            )}
          </div>

          {/* Right Panel: Course Content */}
          <div className="bg-card rounded-xl border border-border/50 shadow-soft overflow-hidden flex flex-col">
            <div className="p-4 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-primary" />
                  <h3 className="font-semibold">Course Content</h3>
                  <Badge variant="secondary">{currentCourseChapters.length} chapters</Badge>
                </div>
                <Button 
                  size="sm" 
                  variant="outline" 
                  className="gap-2"
                  onClick={() => setShowCreateChapterDialog(true)}
                >
                  <Plus className="w-4 h-4" />
                  Course-Only Chapter
                </Button>
              </div>
            </div>

            <ScrollArea className="flex-1 p-4">
              {Object.keys(courseContentBySubject).length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-8">
                  <Layers className="w-10 h-10 text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    No chapters added yet. Select from the source panel.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {Object.entries(courseContentBySubject).map(([subjectId, chapters]) => (
                    <div key={subjectId} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                        {getSubjectName(subjectId)}
                        <Badge variant="outline" className="text-xs">{chapters.length}</Badge>
                      </h4>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(e) => handleDragEnd(e, subjectId)}
                      >
                        <SortableContext
                          items={chapters.map(ch => ch.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          <div className="space-y-1">
                            {chapters.map((chapter) => (
                              <SortableChapterItem
                                key={chapter.id}
                                id={chapter.id}
                                name={chapter.name}
                                sourceLabel={chapter.sourceLabel}
                                isCourseOwned={chapter.isCourseOwned}
                                onDelete={() => handleDeleteChapter(chapter.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border/50 shadow-soft p-12 text-center">
          <Layers className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Select or Create a Custom Course</h3>
          <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
            Choose an existing custom course to edit, or create a new one specifically for {institute.name}.
          </p>
          <Button onClick={() => setShowCreateCourseDialog(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Create New Custom Course
          </Button>
        </div>
      )}

      {/* Create Course Dialog */}
      <Dialog open={showCreateCourseDialog} onOpenChange={setShowCreateCourseDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create Custom Course</DialogTitle>
            <DialogDescription>
              This course will be exclusive to {institute.name}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course Name *</Label>
                <Input 
                  placeholder="e.g., Foundation Physics"
                  value={newCourse.name}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Course Code *</Label>
                <Input 
                  placeholder="e.g., FND-PHY"
                  value={newCourse.code}
                  onChange={(e) => setNewCourse(prev => ({ ...prev, code: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                placeholder="Describe this course..."
                value={newCourse.description}
                onChange={(e) => setNewCourse(prev => ({ ...prev, description: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Course Type</Label>
              <Select 
                value={newCourse.courseType} 
                onValueChange={(v: Course["courseType"]) => setNewCourse(prev => ({ ...prev, courseType: v }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="competitive">Competitive</SelectItem>
                  <SelectItem value="board">Board</SelectItem>
                  <SelectItem value="foundation">Foundation</SelectItem>
                  <SelectItem value="olympiad">Olympiad</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateCourseDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCourse}>Create Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Chapter Dialog */}
      <Dialog open={showCreateChapterDialog} onOpenChange={setShowCreateChapterDialog}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Create Course-Only Chapter</DialogTitle>
            <DialogDescription>
              This chapter will be exclusive to this course.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Chapter Name *</Label>
              <Input 
                placeholder="e.g., Advanced Problem Solving"
                value={newChapter.name}
                onChange={(e) => setNewChapter(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Subject *</Label>
              <Select 
                value={newChapter.subjectId} 
                onValueChange={(v) => setNewChapter(prev => ({ ...prev, subjectId: v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select subject" />
                </SelectTrigger>
                <SelectContent>
                  {subjects.map(sub => (
                    <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateChapterDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateChapter}>Create Chapter</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default InstituteCustomCourse;
