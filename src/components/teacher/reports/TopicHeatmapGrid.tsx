import { BarChart3 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { getTopicColor, NEUTRAL_TOPIC_COLORS } from "@/lib/reportColors";
import { motion } from "framer-motion";
import { InfoTooltip } from "@/components/timetable/InfoTooltip";
import type { ChapterTopicAnalysis } from "@/data/teacher/reportsData";

interface TopicHeatmapGridProps {
  topics: ChapterTopicAnalysis[];
}

export const TopicHeatmapGrid = ({ topics }: TopicHeatmapGridProps) => (
  <Card className="card-premium">
    <CardHeader className="pb-2">
      <CardTitle className="text-base font-semibold flex items-center gap-2">
        <BarChart3 className="w-4 h-4 text-primary" />
        Topic Heatmap
        <InfoTooltip content="Each percentage shows the average success rate — the % of students who answered questions on this topic correctly across all exams." />
      </CardTitle>
    </CardHeader>
    <CardContent>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
        {topics.map((topic, i) => {
          const notAttempted = topic.avgSuccessRate === null;
          const colors = notAttempted ? NEUTRAL_TOPIC_COLORS : getTopicColor(topic.status);

          return (
            <motion.div
              key={topic.topicId}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15, delay: i * 0.02 }}
              className={cn("rounded-lg border p-2.5 flex flex-col items-center text-center gap-1", colors.light, colors.border.replace('border-l-', 'border-'))}
            >
              <p className={cn("text-[11px] font-semibold leading-tight", colors.text)}>{topic.topicName}</p>
              <p className={cn("text-base font-bold", colors.text)}>{notAttempted ? "—" : `${topic.avgSuccessRate}%`}</p>
              <p className="text-[10px] text-muted-foreground">
                {notAttempted ? "Not attempted" : `${topic.questionsAsked} Qs · ${topic.examsAppeared} exam${topic.examsAppeared > 1 ? "s" : ""}`}
              </p>
              {!notAttempted && topic.lowData && (
                <p className="text-[9px] text-amber-600 dark:text-amber-400 font-medium">low data</p>
              )}
            </motion.div>
          );
        })}
      </div>
    </CardContent>
  </Card>
);
