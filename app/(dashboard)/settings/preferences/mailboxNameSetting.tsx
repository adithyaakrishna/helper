"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useSavingIndicator } from "@/components/hooks/useSavingIndicator";
import { SavingIndicator } from "@/components/savingIndicator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "@/components/useDebouncedCallback";
import { useOnChange } from "@/components/useOnChange";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";

const MailboxNameSetting = ({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) => {
  const [name, setName] = useState(mailbox.name);
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

  const save = useDebouncedCallback(() => {
    savingIndicator.setState("saving");
    update({ name });
  }, 500);

  useOnChange(() => {
    save();
  }, [name]);

  return (
    <Card>
      <CardHeader className="relative">
        <div className="absolute right-6 top-6">
          <SavingIndicator state={savingIndicator.state} />
        </div>
        <CardTitle>Mailbox Name</CardTitle>
        <CardDescription>Change the display name of your mailbox</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="max-w-sm">
          <Input 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
            placeholder="Enter mailbox name"
            className="h-10"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default MailboxNameSetting;
