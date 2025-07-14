"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQueryState } from "nuqs";
import { ConfirmationDialog } from "@/components/confirmationDialog";
import LoadingSpinner from "@/components/loadingSpinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import { Mail } from "lucide-react";

const ConnectSupportEmail = () => {
  const router = useRouter();
  const [error] = useQueryState("error");
  const { mutateAsync: deleteSupportEmailMutation } = api.gmailSupportEmail.delete.useMutation();
  const { data: { supportAccount, enabled } = {}, isLoading } = api.gmailSupportEmail.get.useQuery();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Support Email</CardTitle>
          <CardDescription>
            Connect your support email to receive and send emails from your support email address
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>Failed to connect your Gmail account, please try again.</AlertDescription>
            </Alert>
          )}
          
          <div className="flex flex-col items-start gap-4">
            {isLoading ? (
              <div className="flex items-center justify-center w-full py-8">
                <LoadingSpinner size="md" />
              </div>
            ) : !enabled ? (
              <div className="space-y-4">
                <Alert variant="default" className="text-sm">
                  <AlertDescription>
                    Create a Google OAuth app to enable linking your Gmail account.{" "}
                    <Link 
                      className="text-primary hover:underline" 
                      href="https://helper.ai/docs/development#optional-integrations" 
                      target="_blank"
                    >
                      Learn how!
                    </Link>
                  </AlertDescription>
                </Alert>
              </div>
            ) : supportAccount ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{supportAccount.email}</span>
                </div>
                <ConfirmationDialog
                  message="Are you sure you want to disconnect Gmail? You will still have access to all of your emails in Helper, but you will not be able to send/receive new emails until you connect a new Gmail account."
                  onConfirm={async () => {
                    await deleteSupportEmailMutation();
                    router.refresh();
                  }}
                  confirmLabel="Yes, disconnect"
                >
                  <Button variant="destructive_outlined">Disconnect Gmail</Button>
                </ConfirmationDialog>
              </div>
            ) : (
              <Button 
                variant="subtle" 
                onClick={() => (location.href = `/api/connect/google`)}
                className="w-full sm:w-auto"
              >
                <Mail className="mr-2 h-4 w-4" />
                Connect Gmail
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ConnectSupportEmail;
