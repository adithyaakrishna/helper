"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSavingIndicator } from "@/components/hooks/useSavingIndicator";
import { SavingIndicator } from "@/components/savingIndicator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useDebouncedCallback } from "@/components/useDebouncedCallback";
import { useOnChange } from "@/components/useOnChange";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";
import { Clock } from "lucide-react";

export default function AutoCloseSetting({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) {
  const [isEnabled, setIsEnabled] = useState(mailbox.autoCloseEnabled);
  const [daysOfInactivity, setDaysOfInactivity] = useState(mailbox.autoCloseDaysOfInactivity?.toString() ?? "30");
  const savingIndicator = useSavingIndicator();
  const utils = api.useUtils();

  const { mutate: update } = api.mailbox.update.useMutation({
    onSuccess: () => {
      utils.mailbox.get.invalidate();
      savingIndicator.setState("saved");
    },
    onError: (error) => {
      savingIndicator.setState("error");
      toast.error("Error updating auto-close settings", { description: error.message });
    },
  });

  const save = useDebouncedCallback(() => {
    savingIndicator.setState("saving");
    update({
      autoCloseEnabled: isEnabled,
      autoCloseDaysOfInactivity: Number(daysOfInactivity),
    });
  }, 500);

  useOnChange(() => save(), [isEnabled, daysOfInactivity]);

  const { mutate: runAutoClose, isPending: isAutoClosePending } = api.mailbox.autoClose.useMutation({
    onSuccess: () => {
      toast.success("Auto-close triggered", {
        description: "The auto-close job has been triggered successfully.",
      });
    },
    onError: (error) => {
      toast.error("Error", { description: error.message });
    },
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="relative">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Auto-close Inactive Tickets</CardTitle>
              <CardDescription>
                Automatically close tickets that have been inactive for a specified period
              </CardDescription>
            </div>
            <div className="flex items-center gap-4">
              <SavingIndicator state={savingIndicator.state} />
              <Switch checked={isEnabled} onCheckedChange={setIsEnabled} />
            </div>
          </div>
        </CardHeader>
        {isEnabled && (
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="days-of-inactivity" className="text-sm font-medium">
                  Inactivity Period
                </Label>
                <p className="mt-1 text-sm text-muted-foreground">
                  Tickets with no activity for this duration will be automatically closed
                </p>
                <div className="mt-2 flex items-center gap-2 max-w-[180px]">
                  <div className="relative flex-1">
                    <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="days-of-inactivity"
                      type="number"
                      min="1"
                      value={daysOfInactivity}
                      onChange={(e) => setDaysOfInactivity(e.target.value)}
                      className="pl-9"
                    />
                  </div>
                  <span className="text-sm text-muted-foreground whitespace-nowrap">
                    {daysOfInactivity === "1" ? "day" : "days"}
                  </span>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  variant="outlined"
                  onClick={() => runAutoClose()}
                  disabled={!isEnabled || isAutoClosePending}
                  className="w-full sm:w-auto"
                >
                  {isAutoClosePending ? "Running..." : "Run auto-close now"}
                </Button>
                <p className="mt-2 text-sm text-muted-foreground">
                  Manually trigger the auto-close process for all inactive tickets
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
