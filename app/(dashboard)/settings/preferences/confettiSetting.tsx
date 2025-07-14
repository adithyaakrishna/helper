"use client";

import { useState } from "react";
import { toast } from "sonner";
import { triggerConfetti } from "@/components/confetti";
import { useSavingIndicator } from "@/components/hooks/useSavingIndicator";
import { SavingIndicator } from "@/components/savingIndicator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";

const ConfettiSetting = ({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) => {
  const [confettiEnabled, setConfettiEnabled] = useState(mailbox.preferences?.confetti ?? false);
  const savingIndicator = useSavingIndicator();
  const utils = api.useUtils();
  
  const { mutate: update } = api.mailbox.update.useMutation({
    onSuccess: () => {
      utils.mailbox.get.invalidate();
      savingIndicator.setState("saved");
    },
    onError: (error) => {
      savingIndicator.setState("error");
      toast.error("Error updating preferences", { description: error.message });
    },
  });

  const handleSwitchChange = (checked: boolean) => {
    setConfettiEnabled(checked);
    savingIndicator.setState("saving");
    update({ preferences: { confetti: checked } });
  };

  return (
    <Card>
      <CardHeader className="relative">
        <div className="absolute right-6 top-6">
          <SavingIndicator state={savingIndicator.state} />
        </div>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Celebration Effects</CardTitle>
            <CardDescription>Show confetti animation when closing a ticket</CardDescription>
          </div>
          <Switch checked={confettiEnabled} onCheckedChange={handleSwitchChange} />
        </div>
      </CardHeader>
      {confettiEnabled && (
        <CardContent>
          <Button 
            variant="outlined" 
            onClick={() => triggerConfetti()}
            className="w-full sm:w-auto"
          >
            Test Celebration Effect
          </Button>
        </CardContent>
      )}
    </Card>
  );
};

export default ConfettiSetting;
