// Content Library Picker Data
// Extracted from ContentLibraryPicker.tsx for better tree-shaking and maintainability

import { Video, FileText, Presentation, Play, Image as ImageIcon } from "lucide-react";

export interface ContentItem {
  id: string;
  title: string;
  type: 'video' | 'pdf' | 'ppt' | 'animation' | 'image';
  subject: string;
  chapter?: string;
  description?: string;
  duration?: string;
  thumbnail?: string;
  previewUrl?: string;
}

export const contentTypeConfig: Record<ContentItem['type'], { icon: typeof Video; color: string; bgColor: string }> = {
  video: { icon: Video, color: "text-red-600", bgColor: "bg-red-50" },
  pdf: { icon: FileText, color: "text-blue-600", bgColor: "bg-blue-50" },
  ppt: { icon: Presentation, color: "text-orange-600", bgColor: "bg-orange-50" },
  animation: { icon: Play, color: "text-green-600", bgColor: "bg-green-50" },
  image: { icon: ImageIcon, color: "text-purple-600", bgColor: "bg-purple-50" },
};

export const mockContentLibrary: ContentItem[] = [
  {
    id: "content-1",
    title: "Newton's Laws of Motion - Video Lecture",
    type: "video",
    subject: "Physics",
    chapter: "Laws of Motion",
    description: "Comprehensive video explaining all three laws with animations",
    duration: "12 mins",
  },
  {
    id: "content-2",
    title: "NCERT Physics - Laws of Motion Chapter",
    type: "pdf",
    subject: "Physics",
    chapter: "Laws of Motion",
    description: "Complete chapter PDF from NCERT Class 11 Physics",
  },
  {
    id: "content-3",
    title: "Forces & Motion - PhET Simulation",
    type: "animation",
    subject: "Physics",
    chapter: "Laws of Motion",
    description: "Interactive simulation for exploring forces and motion",
  },
  {
    id: "content-4",
    title: "Electromagnetic Induction - Slides",
    type: "ppt",
    subject: "Physics",
    chapter: "Electromagnetic Induction",
    description: "Complete presentation on EM Induction",
  },
  {
    id: "content-5",
    title: "Periodic Table - Interactive Chart",
    type: "image",
    subject: "Chemistry",
    chapter: "Periodic Classification",
    description: "High-resolution periodic table with electron configurations",
  },
  {
    id: "content-6",
    title: "Chemical Bonding - Video Lecture",
    type: "video",
    subject: "Chemistry",
    chapter: "Chemical Bonding",
    description: "Explains ionic, covalent, and metallic bonding",
    duration: "18 mins",
  },
  {
    id: "content-7",
    title: "Quadratic Equations - Practice Set",
    type: "pdf",
    subject: "Mathematics",
    chapter: "Quadratic Equations",
    description: "50 practice problems with solutions",
  },
  {
    id: "content-8",
    title: "Trigonometry - Concept Video",
    type: "video",
    subject: "Mathematics",
    chapter: "Trigonometry",
    description: "Introduction to trigonometric ratios and identities",
    duration: "15 mins",
  },
  // Additional content for pagination testing
  {
    id: "content-9",
    title: "Thermodynamics - First Law Explained",
    type: "video",
    subject: "Physics",
    chapter: "Thermodynamics",
    description: "Detailed explanation of the first law of thermodynamics",
    duration: "20 mins",
  },
  {
    id: "content-10",
    title: "Organic Chemistry Basics",
    type: "ppt",
    subject: "Chemistry",
    chapter: "Organic Chemistry",
    description: "Introduction to organic compounds and nomenclature",
  },
  {
    id: "content-11",
    title: "Integration by Parts",
    type: "pdf",
    subject: "Mathematics",
    chapter: "Calculus",
    description: "Step-by-step guide to integration by parts technique",
  },
  {
    id: "content-12",
    title: "Wave Mechanics Simulation",
    type: "animation",
    subject: "Physics",
    chapter: "Waves",
    description: "Interactive wave superposition and interference demo",
  },
  {
    id: "content-13",
    title: "Atomic Structure Diagrams",
    type: "image",
    subject: "Chemistry",
    chapter: "Atomic Structure",
    description: "Visual representations of atomic orbitals and electron configurations",
  },
  {
    id: "content-14",
    title: "Electrostatics - Coulomb's Law",
    type: "video",
    subject: "Physics",
    chapter: "Electrostatics",
    description: "Understanding electric forces and Coulomb's law applications",
    duration: "14 mins",
  },
  {
    id: "content-15",
    title: "Matrices Operations",
    type: "ppt",
    subject: "Mathematics",
    chapter: "Linear Algebra",
    description: "Matrix addition, multiplication, and inverse operations",
  },
  {
    id: "content-16",
    title: "Acids and Bases - pH Scale",
    type: "animation",
    subject: "Chemistry",
    chapter: "Acids and Bases",
    description: "Interactive pH scale demonstration with real-world examples",
  },
  {
    id: "content-17",
    title: "Projectile Motion Analysis",
    type: "pdf",
    subject: "Physics",
    chapter: "Kinematics",
    description: "Comprehensive notes on projectile motion with solved problems",
  },
  {
    id: "content-18",
    title: "Probability Distributions",
    type: "video",
    subject: "Mathematics",
    chapter: "Probability",
    description: "Understanding normal, binomial, and Poisson distributions",
    duration: "22 mins",
  },
];

// Pagination constants
export const ITEMS_PER_PAGE = 8;
