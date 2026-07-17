import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
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
  sortableKeyboardCoordinates,
} from "@dnd-kit/sortable";
import { toast } from "sonner";
import { 
  courses, 
  curriculums, 
  courseChapterMappings,
  getCourseOwnedChapters
} from "@/data/masterData";
import { 
  allCBSEChapters, 
  getChaptersByClassAndSubject 
} from "@/data/cbseMasterData";
import { classes, subjects } from "@/data/mockData";
import { Course } from "@/types/masterData";

export interface CourseChapterEntry {
  id: string;
  chapterId: string;
  name: string;
  subjectId: string;
  sourceLabel: string;
  isCourseOwned: boolean;
  order: number;
}

export interface NewCourseForm {
  name: string;
  code: string;
  description: string;
  courseType: Course["courseType"];
  allowedCurriculums: string[];
  allowedClasses: string[];
}

export interface NewChapterForm {
  name: string;
  subjectId: string;
}

export interface NewTopicForm {
  name: string;
  subjectId: string;
  chapterId: string;
}

export function useCourseBuilder() {
  const [searchParams] = useSearchParams();
  
  // Course selection - initialize from URL if present
  const [selectedCourseId, setSelectedCourseId] = useState<string>(() => {
    const courseFromUrl = searchParams.get('course');
    if (courseFromUrl && courses.find(c => c.id === courseFromUrl)) {
      return courseFromUrl;
    }
    return "";
  });
  const [showCreateCourseDialog, setShowCreateCourseDialog] = useState(false);
  const [showCreateChapterDialog, setShowCreateChapterDialog] = useState(false);
  const [showCreateTopicDialog, setShowCreateTopicDialog] = useState(false);
  
  // Source panel filters
  const [sourceCurriculumId, setSourceCurriculumId] = useState<string>("cbse");
  const [sourceClassId, setSourceClassId] = useState<string>("");
  const [sourceSubjectId, setSourceSubjectId] = useState<string>("");
  const [sourceSearchQuery, setSourceSearchQuery] = useState("");
  
  // Selected chapters for adding
  const [selectedChapterIds, setSelectedChapterIds] = useState<Set<string>>(new Set());
  
  // Course content state - persisted chapters
  const [courseContent, setCourseContent] = useState<Record<string, CourseChapterEntry[]>>({});
  const [isDirty, setIsDirty] = useState(false);
  
  // New course form
  const [newCourse, setNewCourse] = useState<NewCourseForm>({
    name: "",
    code: "",
    description: "",
    courseType: "competitive",
    allowedCurriculums: ["cbse"],
    allowedClasses: [],
  });
  
  // New chapter form
  const [newChapter, setNewChapter] = useState<NewChapterForm>({
    name: "",
    subjectId: "",
  });
  
  // New topic form
  const [newTopic, setNewTopic] = useState<NewTopicForm>({
    name: "",
    subjectId: "",
    chapterId: "",
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const selectedCourse = courses.find(c => c.id === selectedCourseId);
  
  // Get available chapters from curriculum tree
  const availableChapters = useMemo(() => {
    if (!sourceClassId || !sourceSubjectId) return [];
    
    let chapters = getChaptersByClassAndSubject(sourceClassId, sourceSubjectId);
    
    if (sourceSearchQuery) {
      const query = sourceSearchQuery.toLowerCase();
      chapters = chapters.filter(ch => 
        ch.name.toLowerCase().includes(query) ||
        ch.nameHindi?.toLowerCase().includes(query)
      );
    }
    
    return chapters;
  }, [sourceClassId, sourceSubjectId, sourceSearchQuery]);

  // Get course-owned chapters for selected course
  const ownedChapters = useMemo(() => {
    if (!selectedCourseId) return [];
    return getCourseOwnedChapters(selectedCourseId);
  }, [selectedCourseId]);

  // Get mapped chapters for display (from initial data)
  const initialMappedChapters = useMemo(() => {
    if (!selectedCourseId) return [];
    
    const mappings = courseChapterMappings.filter(m => m.courseId === selectedCourseId);
    return mappings.map(m => {
      const chapter = allCBSEChapters.find(ch => ch.id === m.chapterId);
      const curriculum = curriculums.find(c => c.id === m.sourceCurriculumId);
      const classInfo = classes.find(c => c.id === chapter?.classId);
      return {
        id: m.id,
        chapterId: m.chapterId,
        name: chapter?.name || "",
        subjectId: chapter?.subjectId || "",
        sourceLabel: `${curriculum?.code || ""} ${classInfo?.name || ""}`,
        isCourseOwned: false,
        order: m.order,
      };
    }).filter(m => m.name);
  }, [selectedCourseId]);

  // Initialize course content when course changes
  useMemo(() => {
    if (selectedCourseId && !courseContent[selectedCourseId]) {
      const mapped = initialMappedChapters;
      const owned = ownedChapters.map((ch, idx) => ({
        id: ch.id,
        chapterId: ch.id,
        name: ch.name,
        subjectId: ch.subjectId,
        sourceLabel: "Course-Owned",
        isCourseOwned: true,
        order: mapped.length + idx + 1,
      }));
      setCourseContent(prev => ({
        ...prev,
        [selectedCourseId]: [...mapped, ...owned],
      }));
    }
  }, [selectedCourseId, initialMappedChapters, ownedChapters]);

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
    // Sort each group by order
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

  const handleSelectAll = () => {
    const allIds = new Set(availableChapters.map(ch => ch.id));
    setSelectedChapterIds(allIds);
  };

  const handleClearSelection = () => {
    setSelectedChapterIds(new Set());
  };

  const handleAddSelectedChapters = () => {
    if (selectedChapterIds.size === 0 || !selectedCourseId) {
      toast.error("No chapters selected");
      return;
    }
    
    const existingIds = new Set(currentCourseChapters.map(ch => ch.chapterId));
    const chaptersToAdd: CourseChapterEntry[] = [];
    let duplicateCount = 0;
    
    selectedChapterIds.forEach(chapterId => {
      if (existingIds.has(chapterId)) {
        duplicateCount++;
        return;
      }
      
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
      toast.success(`Added ${chaptersToAdd.length} chapter(s) to course`);
    }
    
    if (duplicateCount > 0) {
      toast.info(`${duplicateCount} chapter(s) already in course`);
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
    toast.success("Chapter removed from course");
  };

  const handleDragEnd = (event: DragEndEvent, subjectId: string) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const subjectChapters = courseContentBySubject[subjectId] || [];
      const oldIndex = subjectChapters.findIndex(ch => ch.id === active.id);
      const newIndex = subjectChapters.findIndex(ch => ch.id === over.id);
      
      const reordered = arrayMove(subjectChapters, oldIndex, newIndex);
      
      // Update orders
      const updatedSubjectChapters = reordered.map((ch, idx) => ({
        ...ch,
        order: idx + 1,
      }));
      
      // Merge back into full list
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
    
    toast.success(`Course "${newCourse.name}" created`);
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

  const handleCreateTopic = () => {
    if (!newTopic.name || !newTopic.chapterId || !selectedCourseId) {
      toast.error("Please fill in required fields");
      return;
    }
    
    // In production, this would add a topic to the course-owned chapter
    // For now, just show success message
    toast.success(`Course-only topic "${newTopic.name}" created`);
    setShowCreateTopicDialog(false);
    setNewTopic({ name: "", subjectId: "", chapterId: "" });
  };

  const handleSaveDraft = () => {
    setIsDirty(false);
    toast.success("Course saved as draft");
  };

  const handlePublish = () => {
    setIsDirty(false);
    toast.success("Course published successfully");
  };

  const getSubjectName = (subjectId: string) => {
    return subjects.find(s => s.id === subjectId)?.name || "Unknown";
  };

  const toggleCurriculumSelection = (currId: string) => {
    setNewCourse(prev => ({
      ...prev,
      allowedCurriculums: prev.allowedCurriculums.includes(currId)
        ? prev.allowedCurriculums.filter(c => c !== currId)
        : [...prev.allowedCurriculums, currId]
    }));
  };

  const toggleClassSelection = (classId: string) => {
    setNewCourse(prev => ({
      ...prev,
      allowedClasses: prev.allowedClasses.includes(classId)
        ? prev.allowedClasses.filter(c => c !== classId)
        : [...prev.allowedClasses, classId]
    }));
  };

  const handleSourceClassChange = (classId: string) => {
    setSourceClassId(classId);
    setSourceSubjectId("");
    setSelectedChapterIds(new Set());
  };

  const handleSourceSubjectChange = (subjectId: string) => {
    setSourceSubjectId(subjectId);
    setSelectedChapterIds(new Set());
  };

  return {
    // State
    selectedCourseId,
    setSelectedCourseId,
    selectedCourse,
    showCreateCourseDialog,
    setShowCreateCourseDialog,
    showCreateChapterDialog,
    setShowCreateChapterDialog,
    showCreateTopicDialog,
    setShowCreateTopicDialog,
    sourceCurriculumId,
    setSourceCurriculumId,
    sourceClassId,
    sourceSubjectId,
    sourceSearchQuery,
    setSourceSearchQuery,
    selectedChapterIds,
    isDirty,
    newCourse,
    setNewCourse,
    newChapter,
    setNewChapter,
    newTopic,
    setNewTopic,
    sensors,
    availableChapters,
    currentCourseChapters,
    courseContentBySubject,
    
    // Handlers
    handleSourceClassChange,
    handleSourceSubjectChange,
    handleChapterToggle,
    handleSelectAll,
    handleClearSelection,
    handleAddSelectedChapters,
    handleDeleteChapter,
    handleDragEnd,
    handleCreateCourse,
    handleCreateChapter,
    handleCreateTopic,
    handleSaveDraft,
    handlePublish,
    getSubjectName,
    toggleCurriculumSelection,
    toggleClassSelection,
  };
}
