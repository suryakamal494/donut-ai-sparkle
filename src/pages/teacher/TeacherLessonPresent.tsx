import { useNavigate, useParams } from "react-router-dom";
import { useMemo } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PresentationMode } from "@/components/teacher/lesson-workspace";
import { resolveLessonForTeacher } from "@/data/teacher/lessonPackages";

const TeacherLessonPresent = () => {
  const navigate = useNavigate();
  const { packageId, lpId } = useParams<{ packageId: string; lpId: string }>();

  const resolved = useMemo(
    () =>
      packageId && lpId ? resolveLessonForTeacher(packageId, lpId) : null,
    [packageId, lpId],
  );

  const close = () => navigate(`/teacher/lesson-plans`);

  if (!resolved || resolved.blocks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <header className="h-14 flex items-center gap-3 px-4 border-b bg-background">
          <Button variant="ghost" size="icon" onClick={close}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-sm font-semibold">Nothing to present</h1>
        </header>
        <div className="flex-1 flex items-center justify-center px-6">
          <p className="text-sm text-muted-foreground text-center">
            This lesson plan has no content blocks yet. Add content first, then
            present it.
          </p>
        </div>
      </div>
    );
  }

  return (
    <PresentationMode
      open
      onClose={close}
      blocks={resolved.blocks}
      lessonTitle={resolved.title}
    />
  );
};

export default TeacherLessonPresent;