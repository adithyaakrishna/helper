import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RouterOutputs } from "@/trpc";
import ConfettiSetting from "./confettiSetting";
import MailboxNameSetting from "./mailboxNameSetting";

const PreferencesSetting = ({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) => {
  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Preferences</CardTitle>
          <CardDescription>Customize your mailbox settings and experience</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {mailbox ? (
            <>
              <MailboxNameSetting mailbox={mailbox} />
              <ConfettiSetting mailbox={mailbox} />
            </>
          ) : (
            <>
              <Skeleton className="h-[120px] w-full rounded-xl" />
              <Skeleton className="h-[120px] w-full rounded-xl" />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PreferencesSetting;
