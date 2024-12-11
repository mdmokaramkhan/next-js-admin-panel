import { CalendarDateRangePicker } from "@/components/date-range-picker";
import { Button } from "@/components/ui/button";

export default function Overview() {
  return (
    <div className="space-y-2 h-full p-4 md:px-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">
          Hi, Welcome back 👋
        </h2>
        <div className="hidden items-center space-x-2 md:flex">
          <CalendarDateRangePicker />
          <Button>Download</Button>
        </div>
      </div>
    </div>
  );
}
