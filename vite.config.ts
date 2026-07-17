import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@tanstack/react-query",
      "framer-motion",
      "date-fns",
      "clsx",
      "class-variance-authority",
      "lucide-react",
      "katex",
    ],
    // Heavy libs used only on specific pages — keep out of the eager pre-bundle
    exclude: ["fabric", "html2canvas", "jspdf"],
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "radix-vendor": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-popover",
            "@radix-ui/react-select",
            "@radix-ui/react-tabs",
            "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-accordion",
            "@radix-ui/react-navigation-menu",
          ],
          "motion-vendor": ["framer-motion"],
          "dnd-vendor": [
            "@dnd-kit/core",
            "@dnd-kit/sortable",
            "@dnd-kit/modifiers",
            "@dnd-kit/utilities",
          ],
          "export-vendor": ["html2canvas", "jspdf"],
          "canvas-vendor": ["fabric"],
          "math-vendor": ["katex"],
          "query-vendor": ["@tanstack/react-query", "@tanstack/react-virtual"],
        },
      },
    },
  },
}));
