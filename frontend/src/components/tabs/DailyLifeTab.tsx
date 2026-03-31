import type { Cat, Reminder, GroomingLog, FleaTreatment, FoodLog, LitterBoxLog } from "../../types";
import ReminderList from "../ReminderList";
import GroomingSection from "./GroomingSection";
import FleaSection from "./FleaSection";
import FeedingSection from "./FeedingSection";
import LitterBoxSection from "./LitterBoxSection";

interface DailyLifeTabProps {
  cat: Cat;
  onRemindersUpdated: (reminders: Reminder[]) => void;
  onGroomingUpdated: (logs: GroomingLog[]) => void;
  onFleaUpdated: (treatments: FleaTreatment[]) => void;
  onFoodUpdated: (logs: FoodLog[]) => void;
  onLitterBoxUpdated: (logs: LitterBoxLog[]) => void;
}

export default function DailyLifeTab({
  cat,
  onRemindersUpdated,
  onGroomingUpdated,
  onFleaUpdated,
  onFoodUpdated,
  onLitterBoxUpdated,
}: DailyLifeTabProps) {
  return (
    <div className="space-y-5">
      <GroomingSection
        catId={cat.id}
        logs={cat.grooming_logs || []}
        onLogsUpdated={onGroomingUpdated}
      />
      <FleaSection
        catId={cat.id}
        treatments={cat.flea_treatments || []}
        onTreatmentsUpdated={onFleaUpdated}
      />
      <FeedingSection
        catId={cat.id}
        logs={cat.food_logs || []}
        onLogsUpdated={onFoodUpdated}
      />
      <LitterBoxSection
        catId={cat.id}
        logs={cat.litter_box_logs || []}
        onLogsUpdated={onLitterBoxUpdated}
      />
      <div className="bg-gray-800 rounded-xl p-5">
        <h3 className="font-bold text-lg mb-3 text-white">📋 General Reminders</h3>
        <ReminderList
          catId={cat.id}
          reminders={cat.reminders}
          onRemindersUpdated={onRemindersUpdated}
        />
      </div>
    </div>
  );
}