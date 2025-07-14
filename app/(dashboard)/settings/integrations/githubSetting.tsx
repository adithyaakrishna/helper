"use client";

import { useRouter } from "next/navigation";
import { parseAsStringEnum, useQueryState } from "nuqs";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import GitHubSvg from "@/app/(dashboard)/icons/github.svg";
import { ConfirmationDialog } from "@/components/confirmationDialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRunOnce } from "@/components/useRunOnce";
import { captureExceptionAndLog } from "@/lib/shared/sentry";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";

const GitHubRepositories = ({
  id,
  selectedRepoFullName,
  mailbox,
}: {
  id: string;
  selectedRepoFullName?: string;
  mailbox: RouterOutputs["mailbox"]["get"];
}) => {
  const utils = api.useUtils();
  const [repositories, setRepositories] = useState<{ id: number; name: string; fullName: string; owner: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { mutate: update } = api.mailbox.update.useMutation({
    onSuccess: () => utils.mailbox.get.invalidate(),
    onError: (error) => toast.error("Error updating GitHub settings", { description: error.message }),
  });

  useRunOnce(() => {
    const fetchRepositories = async () => {
      try {
        setIsLoading(true);
        setRepositories(await utils.client.mailbox.github.repositories.query());
      } catch (e) {
        captureExceptionAndLog(e);
        toast.error("Error fetching available repositories");
      } finally {
        setIsLoading(false);
      }
    };

    if (mailbox.githubConnected) fetchRepositories();
    else setIsLoading(false);
  });

  const handleRepoChange = (fullName: string) => {
    const [repoOwner, repoName] = fullName.split("/");
    update({ githubRepoOwner: repoOwner, githubRepoName: repoName });
  };

  return (
    <Select disabled={isLoading || !repositories.length} value={selectedRepoFullName} onValueChange={handleRepoChange}>
      <SelectTrigger id={id} className="w-full">
        <SelectValue placeholder={isLoading ? "Loading repositories..." : "Select a repository"} />
      </SelectTrigger>
      <SelectContent>
        {repositories.map((repo) => (
          <SelectItem key={repo.id} value={repo.fullName}>
            {repo.fullName}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
};

const GitHubSetting = ({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) => {
  const router = useRouter();
  const { mutateAsync: disconnectGitHub } = api.mailbox.github.disconnect.useMutation();
  const [isGitHubConnected, setGitHubConnected] = useState(mailbox.githubConnected);
  const repoUID = useId();
  const [githubConnectResult, setGithubConnectResult] = useQueryState(
    "githubConnectResult",
    parseAsStringEnum(["success", "error"] as const),
  );

  useEffect(() => {
    if (githubConnectResult === "success") {
      toast.success("GitHub connected successfully");
      setGithubConnectResult(null);
    } else if (githubConnectResult === "error") {
      toast.error("Failed to connect GitHub");
      setGithubConnectResult(null);
    }
  }, [githubConnectResult, router, setGithubConnectResult]);

  const onDisconnectGitHub = async () => {
    try {
      await disconnectGitHub();
      setGitHubConnected(false);
      toast.success("GitHub disconnected successfully");
    } catch (e) {
      captureExceptionAndLog(e);
      toast.error("Error disconnecting GitHub");
    }
  };

  const selectedRepoFullName = mailbox.githubRepoOwner && mailbox.githubRepoName
    ? `${mailbox.githubRepoOwner}/${mailbox.githubRepoName}`
    : undefined;

  const connectUrl = mailbox.githubConnectUrl;
  if (!connectUrl) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>GitHub Integration</CardTitle>
          <CardDescription>Create and track GitHub issues from conversations</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isGitHubConnected ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={repoUID} className="text-sm font-medium">Repository</Label>
                  <div className="mt-2">
                    <GitHubRepositories id={repoUID} selectedRepoFullName={selectedRepoFullName} mailbox={mailbox} />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Select a single repository where issues will be created. Only one repository can be linked per mailbox.
                  </p>
                </div>

                {selectedRepoFullName && (
                  <div className="space-y-2 rounded-md bg-muted/50 p-4">
                    <p className="text-sm">
                      <span className="font-medium">Important:</span> Make sure issues are enabled in your repository settings.
                    </p>
                    <a
                      href={`https://github.com/${selectedRepoFullName}/settings`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline inline-flex items-center"
                    >
                      Check repository settings →
                    </a>
                  </div>
                )}
              </div>

              <ConfirmationDialog
                message="Are you sure you want to disconnect GitHub? This will remove the repository link and disable GitHub issue creation."
                onConfirm={onDisconnectGitHub}
                confirmLabel="Yes, disconnect"
              >
                <Button variant="destructive_outlined">Disconnect from GitHub</Button>
              </ConfirmationDialog>
            </div>
          ) : (
            <Button onClick={() => router.push(connectUrl)} variant="subtle" className="w-full sm:w-auto">
              <GitHubSvg className="mr-2 h-4 w-4" />
              Connect to GitHub
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GitHubSetting;
