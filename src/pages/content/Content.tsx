import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { Plus, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { mockContent } from "@/data/mockData";
import {
  ContentCard,
  ContentListItem,
  ContentPreviewDialog,
  ContentEditDialog,
  ContentFilters,
  ContentPagination,
  ContentItem,
  ContentType,
} from "@/components/content";

const ITEMS_PER_PAGE = 15;

const Content = () => {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<ContentType | "all">("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  
  // Dialog states
  const [previewContent, setPreviewContent] = useState<ContentItem | null>(null);
  const [editContent, setEditContent] = useState<ContentItem | null>(null);
  const [contentList, setContentList] = useState<ContentItem[]>(mockContent as ContentItem[]);

  // Filter content
  const filteredContent = useMemo(() => {
    return contentList.filter(content => {
      const matchesSearch = searchQuery === "" || 
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        content.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = typeFilter === "all" || content.type === typeFilter;
      const matchesSubject = subjectFilter === "all" || content.subjectId === subjectFilter;
      const matchesClass = classFilter === "all" || content.classId === classFilter;
      const matchesStatus = statusFilter === "all" || content.status === statusFilter;
      
      return matchesSearch && matchesType && matchesSubject && matchesClass && matchesStatus;
    });
  }, [contentList, searchQuery, typeFilter, subjectFilter, classFilter, statusFilter]);

  // Pagination
  const totalPages = Math.ceil(filteredContent.length / ITEMS_PER_PAGE);
  const paginatedContent = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredContent.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredContent, currentPage]);

  // Reset to page 1 when filters change
  const handleFilterChange = (setter: (value: any) => void, value: any) => {
    setter(value);
    setCurrentPage(1);
  };

  const handlePreview = useCallback((content: ContentItem) => setPreviewContent(content), []);
  const handleEdit = useCallback((content: ContentItem) => setEditContent(content), []);
  const handleDelete = useCallback((content: ContentItem) => {
    setContentList(prev => prev.filter(c => c.id !== content.id));
  }, []);
  const handleSave = useCallback((updatedContent: ContentItem) => {
    setContentList(prev => prev.map(c => c.id === updatedContent.id ? updatedContent : c));
  }, []);

  return (
    <div className="space-y-6 animate-fade-in">
      <PageHeader
        title="Content Library"
        description="Manage all learning content - videos, documents, presentations, and interactive simulations"
        breadcrumbs={[{ label: "Dashboard", href: "/superadmin/dashboard" }, { label: "Content" }]}
        actions={
          <div className="flex gap-2 sm:gap-3">
            <Link to="/superadmin/content/create">
              <Button variant="outline" size="sm" className="gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
                <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Create Content</span>
                <span className="sm:hidden">Create</span>
              </Button>
            </Link>
            <Link to="/superadmin/content/ai-generate">
              <Button size="sm" className="gradient-button gap-1.5 sm:gap-2 text-xs sm:text-sm h-8 sm:h-9">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">AI Content Generator</span>
                <span className="sm:hidden">AI</span>
              </Button>
            </Link>
          </div>
        }
      />

      <ContentFilters
        searchQuery={searchQuery}
        onSearchChange={(v) => handleFilterChange(setSearchQuery, v)}
        typeFilter={typeFilter}
        onTypeChange={(v) => handleFilterChange(setTypeFilter, v)}
        subjectFilter={subjectFilter}
        onSubjectChange={(v) => handleFilterChange(setSubjectFilter, v)}
        classFilter={classFilter}
        onClassChange={(v) => handleFilterChange(setClassFilter, v)}
        statusFilter={statusFilter}
        onStatusChange={(v) => handleFilterChange(setStatusFilter, v)}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
      />

      {filteredContent.length === 0 ? (
        <div className="bg-card rounded-2xl p-12 text-center shadow-soft border border-border/50">
          <p className="text-muted-foreground">No content found matching your filters.</p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {paginatedContent.map((content) => (
            <ContentCard
              key={content.id}
              content={content}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl shadow-soft border border-border/50 divide-y divide-border">
          {paginatedContent.map((content) => (
            <ContentListItem
              key={content.id}
              content={content}
              onPreview={handlePreview}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      <ContentPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={filteredContent.length}
        itemsPerPage={ITEMS_PER_PAGE}
        onPageChange={setCurrentPage}
      />

      <ContentPreviewDialog
        content={previewContent}
        open={!!previewContent}
        onOpenChange={(open) => !open && setPreviewContent(null)}
        onEdit={(content) => {
          setPreviewContent(null);
          setEditContent(content);
        }}
      />

      <ContentEditDialog
        content={editContent}
        open={!!editContent}
        onOpenChange={(open) => !open && setEditContent(null)}
        onSave={handleSave}
      />
    </div>
  );
};

export default Content;
