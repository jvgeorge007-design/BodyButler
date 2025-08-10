import { Footprints } from "lucide-react";

interface WellnessCardProps {}

export default function WellnessCard({}: WellnessCardProps) {
  // Step tracking data - using goal-aware NEAT steps system from Peak Score
  const stepData = {
    target: 8500, // Personalized based on user profile and goals
    current: 6200, // Current steps for the day
  };

  const stepsRemaining = Math.max(0, stepData.target - stepData.current);
  const formatSteps = (steps: number) => {
    if (steps >= 1000) {
      return `${(steps / 1000).toFixed(1)}k`;
    }
    return steps.toLocaleString();
  };

  return (
    <div className="bg-transparent relative">
      <div className="py-2 relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
          <Footprints className="w-10 h-10 text-green-400" />
        </div>
        <div className="flex justify-center items-center pr-4">
          <div className="text-center ml-14">
            <div className="text-lg font-bold text-white">
              {formatSteps(stepsRemaining)}
            </div>
            <div className="text-sm text-white/70">steps left</div>
          </div>
        </div>
      </div>
    </div>
  );
}