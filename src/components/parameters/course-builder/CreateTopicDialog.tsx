import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { subjects } from "@/data/mockData";
import { CourseChapterEntry } from "@/hooks/useCourseBuilder";

interface CreateTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  courseChapters: CourseChapterEntry[];
  newTopic: { name: string; subjectId: string; chapterId: string };
  setNewTopic: (topic: { name: string; subjectId: string; chapterId: string }) => void;
  onCreateTopic: () => void;
}

export const CreateTopicDialog = ({
  open,
  onOpenChange,
  courseChapters,
  newTopic,
  setNewTopic,
  onCreateTopic,
}: CreateTopicDialogProps) => {
  // Get unique subjects from course chapters
  const courseSubjects = [...new Set(courseChapters.map(ch => ch.subjectId))];
  
  // Filter chapters by selected subject and only course-owned
  const filteredChapters = courseChapters.filter(
    ch => ch.subjectId === newTopic.subjectId && ch.isCourseOwned
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Course-Only Topic</DialogTitle>
          <DialogDescription>
            Add a topic to a course-owned chapter. Select a subject and chapter first.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Subject *</Label>
            <Select 
              value={newTopic.subjectId} 
              onValueChange={(v) => setNewTopic({ ...newTopic, subjectId: v, chapterId: "" })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select subject" />
              </SelectTrigger>
              <SelectContent>
                {courseSubjects.map((subId) => {
                  const subject = subjects.find(s => s.id === subId);
                  return (
                    <SelectItem key={subId} value={subId}>
                      {subject?.name || subId}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Chapter * (Course-Owned Only)</Label>
            <Select 
              value={newTopic.chapterId} 
              onValueChange={(v) => setNewTopic({ ...newTopic, chapterId: v })}
              disabled={!newTopic.subjectId || filteredChapters.length === 0}
            >
              <SelectTrigger>
                <SelectValue placeholder={
                  !newTopic.subjectId 
                    ? "Select subject first" 
                    : filteredChapters.length === 0 
                      ? "No course-owned chapters" 
                      : "Select chapter"
                } />
              </SelectTrigger>
              <SelectContent>
                {filteredChapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.chapterId}>
                    {ch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {newTopic.subjectId && filteredChapters.length === 0 && (
              <p className="text-xs text-muted-foreground">
                Create a course-only chapter first before adding topics.
              </p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label>Topic Name *</Label>
            <Input
              placeholder="Enter topic name"
              value={newTopic.name}
              onChange={(e) => setNewTopic({ ...newTopic, name: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              You can paste multiple topics separated by new lines for bulk add.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={onCreateTopic}
            disabled={!newTopic.name.trim() || !newTopic.chapterId}
            className="gradient-button"
          >
            Create Topic
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
