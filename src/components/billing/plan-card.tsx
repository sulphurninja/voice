import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface PlanCardProps {
  id: string;
  name: string;
  price: number | null;
  minutes: number | string;
  agents: number | string;
  extraMinuteRate: number | null;
  features: string[];
  isCurrent: boolean;
  isPopular?: boolean;
  onSelectPlan: (planId: string) => void;
}

export function PlanCard({
  id,
  name,
  price,
  minutes,
  agents,
  extraMinuteRate,
  features,
  isCurrent,
  isPopular = false,
  onSelectPlan
}: PlanCardProps) {
  const isEnterprise = id === 'enterprise';

  return (
    <div
      className={cn(
        "border rounded-lg p-5 transition-colors relative",
        isCurrent
          ? "border-primary bg-primary/5"
          : "hover:border-primary/50"
      )}
    >
      {isPopular && (
        <div className="absolute -top-3 right-4 px-3 py-1 bg-primary text-primary-foreground text-xs rounded-full">
          Popular
        </div>
      )}

      <div className="mb-4">
        <h3 className="font-medium text-lg">{name}</h3>
        <p className="text-xl font-bold mt-2">
          {!isEnterprise
            ? `₹${price}/mo`
            : "Custom"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          Billed monthly
        </p>
      </div>

      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center py-2 border-b border-dashed">
          <span className="text-sm">Minutes</span>
          <span className="font-medium">{minutes}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed">
          <span className="text-sm">Agents</span>
          <span className="font-medium">{agents}</span>
        </div>
        <div className="flex justify-between items-center py-2 border-b border-dashed">
          <span className="text-sm">Extra Rate</span>
          <span className="font-medium">
            {extraMinuteRate ? `₹${(extraMinuteRate / 100).toFixed(2)}/min` : "N/A"}
          </span>
        </div>
      </div>

      <div className="space-y-2 mb-6">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <CheckCircle className="h-4 w-4 text-primary mr-2 mt-0.5 flex-shrink-0" />
            <span className="text-sm">{feature}</span>
          </div>
        ))}
      </div>

      <Button
        variant={isCurrent ? "secondary" : "default"}
        className="w-full"
        disabled={isCurrent}
        onClick={() => onSelectPlan(id)}
      >
        {isCurrent
          ? "Current Plan"
          : isEnterprise
          ? "Contact Sales"
          : "Select Plan"}
      </Button>
    </div>
  );
}
