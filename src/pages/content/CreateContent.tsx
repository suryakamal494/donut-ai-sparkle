import { useNavigate } from "react-router-dom";
import { Upload, Video, FileText, FileCode, Link as LinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PageHeader } from "@/components/ui/page-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SourceTypeSelector, VisibilitySelector } from "@/components/parameters";
import { ContentSourceType } from "@/components/parameters/SourceTypeSelector";
import { getActiveCurriculums, getPublishedCourses, getCourseOwnedChapters } from "@/data/masterData";
import { classes, subjects } from "@/data/mockData";
import { getChaptersByClassAndSubject, getTopicsByChapter } from "@/data/cbseMasterData";

const contentTypes = [
  { id: "video", label: "Video", icon: Video, accept: ".mp4,.webm,.mov", description: "MP4, WebM, MOV" },
  { id: "document", label: "Document", icon: FileText, accept: ".pdf,.ppt,.pptx,.doc,.docx", description: "PDF, PPT, DOC" },
  { id: "html", label: "HTML", icon: FileCode, accept: ".html,.htm", description: "HTML, HTM" },
  { id: "iframe", label: "External URL", icon: LinkIcon, accept: "", description: "YouTube, Vimeo, etc." },
];

const CreateContent = () => {
  const [selectedType, setSelectedType] = useState("video");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Source & Visibility state
  const [sourceType, setSourceType] = useState<ContentSourceType>('curriculum');
  const [selectedCurriculumId, setSelectedCurriculumId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedClassId, setSelectedClassId] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedChapterId, setSelectedChapterId] = useState("");
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [visibleInCurriculum, setVisibleInCurriculum] = useState(true);
  const [visibleInCourses, setVisibleInCourses] = useState<string[]>([]);

  const activeCurriculums = getActiveCurriculums();
  const publishedCourses = getPublishedCourses();

  // Get chapters based on source type
  const availableChapters = sourceType === 'curriculum' && selectedClassId && selectedSubjectId
    ? getChaptersByClassAndSubject(selectedClassId, selectedSubjectId)
    : sourceType === 'course' && selectedCourseId
      ? getCourseOwnedChapters(selectedCourseId)
      : [];

  // Get topics based on selected chapter
  const availableTopics = selectedChapterId ? getTopicsByChapter(selectedChapterId) : [];

  const handleSubmit = () => {
    toast({ title: "Content Created!", description: "Content has been added to the library." });
    navigate("/superadmin/content");
  };

  const handleSourceTypeChange = (type: ContentSourceType) => {
    setSourceType(type);
    setSelectedCurriculumId("");
    setSelectedCourseId("");
    setSelectedClassId("");
    setSelectedSubjectId("");
    setSelectedChapterId("");
    setSelectedTopicId("");
  };

  const selectedTypeData = contentTypes.find(t => t.id === selectedType);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Create Content"
        description="Add new learning content to the library"
        breadcrumbs={[
          { label: "Dashboard", href: "/superadmin/dashboard" },
          { label: "Content", href: "/superadmin/content" },
          { label: "Create" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          {/* Content Type Selection */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Content Type</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {contentTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={cn(
                    "p-3 sm:p-4 rounded-xl border flex flex-col items-center gap-1.5 sm:gap-2 transition-all",
                    selectedType === type.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                  )}
                >
                  <type.icon className={cn("w-5 h-5 sm:w-6 sm:h-6", selectedType === type.id ? "text-primary" : "text-muted-foreground")} />
                  <span className="text-xs sm:text-sm font-medium">{type.label}</span>
                  <span className="text-[10px] sm:text-xs text-muted-foreground text-center">{type.description}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Area */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
              {selectedType === "iframe" ? "Enter URL" : "Upload File"}
            </h3>
            {selectedType === "iframe" ? (
              <div className="space-y-2">
                <Label className="text-sm">External URL</Label>
                <Input placeholder="https://www.youtube.com/embed/..." className="h-9 text-sm" />
                <p className="text-[10px] sm:text-xs text-muted-foreground">
                  Paste an embed URL from YouTube, Vimeo, Google Slides, or any other service
                </p>
              </div>
            ) : (
              <div className="border-2 border-dashed border-border rounded-xl p-6 sm:p-12 text-center hover:border-primary/50 transition-colors cursor-pointer">
                <Upload className="w-10 h-10 sm:w-16 sm:h-16 mx-auto text-muted-foreground mb-3 sm:mb-4" />
                <p className="font-medium text-sm sm:text-lg">Drag & drop your file here</p>
                <p className="text-xs sm:text-sm text-muted-foreground mt-1">or click to browse</p>
                <Button variant="outline" size="sm" className="mt-3 sm:mt-4 text-xs sm:text-sm">Select File</Button>
                <p className="text-[10px] sm:text-xs text-muted-foreground mt-3 sm:mt-4">
                  Supported formats: {selectedTypeData?.accept || "Any"}
                </p>
              </div>
            )}
          </div>

          {/* Content Details */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Content Details</h3>
            <div className="space-y-3 sm:space-y-4">
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Title *</Label>
                <Input placeholder="Enter content title" className="h-9 text-sm" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Description</Label>
                <Textarea placeholder="Describe what this content covers..." className="min-h-20 sm:min-h-24 text-sm" />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label className="text-sm">Learning Objectives</Label>
                <Textarea placeholder="What will students learn from this content?" className="min-h-16 sm:min-h-20 text-sm" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 sm:space-y-6">
          {/* Source Type & Classification */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Classification</h3>
            <div className="space-y-3 sm:space-y-4">
              <SourceTypeSelector 
                value={sourceType} 
                onChange={handleSourceTypeChange} 
              />

              {sourceType === 'curriculum' ? (
                <>
                  <div className="space-y-2">
                    <Label>Curriculum *</Label>
                    <Select value={selectedCurriculumId} onValueChange={setSelectedCurriculumId}>
                      <SelectTrigger><SelectValue placeholder="Select curriculum" /></SelectTrigger>
                      <SelectContent>
                        {activeCurriculums.map((curr) => (
                          <SelectItem key={curr.id} value={curr.id}>{curr.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Class *</Label>
                    <Select value={selectedClassId} onValueChange={(v) => { setSelectedClassId(v); setSelectedSubjectId(""); setSelectedChapterId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select class" /></SelectTrigger>
                      <SelectContent>
                        {classes.map((cls) => (
                          <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Subject *</Label>
                    <Select value={selectedSubjectId} onValueChange={(v) => { setSelectedSubjectId(v); setSelectedChapterId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                      <SelectContent>
                        {subjects.map((sub) => (
                          <SelectItem key={sub.id} value={sub.id}>{sub.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chapter *</Label>
                    <Select value={selectedChapterId} onValueChange={(v) => { setSelectedChapterId(v); setSelectedTopicId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                      <SelectContent>
                        {availableChapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Course *</Label>
                    <Select value={selectedCourseId} onValueChange={(v) => { setSelectedCourseId(v); setSelectedChapterId(""); setSelectedTopicId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select course" /></SelectTrigger>
                      <SelectContent>
                        {publishedCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>{course.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Chapter *</Label>
                    <Select value={selectedChapterId} onValueChange={(v) => { setSelectedChapterId(v); setSelectedTopicId(""); }}>
                      <SelectTrigger><SelectValue placeholder="Select chapter" /></SelectTrigger>
                      <SelectContent>
                        {availableChapters.map((ch) => (
                          <SelectItem key={ch.id} value={ch.id}>{ch.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}

              {selectedChapterId && (
                <div className="space-y-2">
                  <Label>Topic *</Label>
                  <Select value={selectedTopicId} onValueChange={setSelectedTopicId}>
                    <SelectTrigger><SelectValue placeholder="Select topic" /></SelectTrigger>
                    <SelectContent>
                      {availableTopics.map((topic) => (
                        <SelectItem key={topic.id} value={topic.id}>{topic.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {/* Visibility */}
          <div className="bg-card rounded-2xl p-4 sm:p-6 shadow-soft border border-border/50">
            <VisibilitySelector
              visibleInCurriculum={visibleInCurriculum}
              visibleInCourses={visibleInCourses}
              onCurriculumChange={setVisibleInCurriculum}
              onCoursesChange={setVisibleInCourses}
            />
          </div>

          <Button className="w-full gradient-button text-sm" onClick={handleSubmit}>
            Save Content
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateContent;
