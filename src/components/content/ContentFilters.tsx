import { Search, Filter, Grid, List } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ContentType } from "./ContentTypeIcon";
import { classes, subjects } from "@/data/mockData";

interface ContentFiltersProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  typeFilter: ContentType | "all";
  onTypeChange: (value: ContentType | "all") => void;
  subjectFilter: string;
  onSubjectChange: (value: string) => void;
  classFilter: string;
  onClassChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
}

const contentTypes: { value: ContentType | "all"; label: string }[] = [
  { value: "all", label: "All Types" },
  { value: "video", label: "Video" },
  { value: "pdf", label: "PDF" },
  { value: "ppt", label: "Presentation" },
  { value: "iframe", label: "Interactive" },
  { value: "animation", label: "Animation" },
  { value: "image", label: "Image" },
  { value: "audio", label: "Audio" },
  { value: "scorm", label: "SCORM" },
];

const statusOptions = [
  { value: "all", label: "All Status" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "archived", label: "Archived" },
];

export const ContentFilters = ({
  searchQuery,
  onSearchChange,
  typeFilter,
  onTypeChange,
  subjectFilter,
  onSubjectChange,
  classFilter,
  onClassChange,
  statusFilter,
  onStatusChange,
  viewMode,
  onViewModeChange,
}: ContentFiltersProps) => {
  return (
    <div className="bg-card rounded-2xl p-4 shadow-soft border border-border/50">
      <div className="flex flex-col lg:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            placeholder="Search content by title, description..." 
            value={searchQuery} 
            onChange={(e) => onSearchChange(e.target.value)} 
            className="pl-10" 
          />
        </div>
        
        {/* Filters Row */}
        <div className="flex flex-wrap gap-3">
          {/* Type Filter */}
          <Select value={typeFilter} onValueChange={(v) => onTypeChange(v as ContentType | "all")}>
            <SelectTrigger className="w-36">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {contentTypes.map(type => (
                <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Subject Filter */}
          <Select value={subjectFilter} onValueChange={onSubjectChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Subject" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Subjects</SelectItem>
              {subjects.map(subject => (
                <SelectItem key={subject.id} value={subject.id}>{subject.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Class Filter */}
          <Select value={classFilter} onValueChange={onClassChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Class" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              <SelectItem value="all">All Classes</SelectItem>
              {classes.map(cls => (
                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {statusOptions.map(status => (
                <SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* View Mode Toggle */}
          <div className="flex border border-border rounded-lg">
            <Button 
              variant={viewMode === "grid" ? "secondary" : "ghost"} 
              size="icon" 
              onClick={() => onViewModeChange("grid")}
              className="rounded-r-none"
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button 
              variant={viewMode === "list" ? "secondary" : "ghost"} 
              size="icon" 
              onClick={() => onViewModeChange("list")}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
