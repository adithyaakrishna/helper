"use client";

import { ExternalLink, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { MetadataEndpoint } from "@/app/types/global";
import { ConfirmationDialog } from "@/components/confirmationDialog";
import { getMarketingSiteUrl } from "@/components/constants";
import { SecretInput } from "@/components/secretInput";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureExceptionAndLog } from "@/lib/shared/sentry";
import { api } from "@/trpc/react";

type MetadataEndpointSettingProps = {
  metadataEndpoint: MetadataEndpoint | null;
};

const MetadataEndpointSetting = ({ metadataEndpoint }: MetadataEndpointSettingProps) => {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [newUrl, setNewUrl] = useState(metadataEndpoint?.url || "");
  const [isLoading, setIsLoading] = useState(false);
  const [testRequestStatus, setTestRequestStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const { mutateAsync: createEndpoint } = api.mailbox.metadataEndpoint.create.useMutation();
  const { mutateAsync: deleteEndpoint } = api.mailbox.metadataEndpoint.delete.useMutation();
  const { refetch: testEndpoint } = api.mailbox.metadataEndpoint.test.useQuery(undefined, { enabled: false });

  const handleAddEndpoint = async () => {
    if (!newUrl || (inputRef.current && !inputRef.current.checkValidity())) {
      inputRef.current?.reportValidity();
      return;
    }

    setIsLoading(true);
    try {
      const result = await createEndpoint({ url: newUrl });
      if (result?.error) {
        toast.error(result.error);
        return;
      }
      router.refresh();
      toast.success("Metadata endpoint added successfully");
    } catch (e) {
      captureExceptionAndLog(e);
      toast.error("Failed to add metadata endpoint");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRequest = async () => {
    setTestRequestStatus("loading");
    try {
      const { data: result } = await testEndpoint();
      if (result?.error) {
        toast.error(result.error);
        setTestRequestStatus("error");
        return;
      }
      toast.success("Test request succeeded");
      setTestRequestStatus("success");
    } catch (e) {
      captureExceptionAndLog(e);
      toast.error("Test request failed");
      setTestRequestStatus("error");
    } finally {
      setTimeout(() => setTestRequestStatus("idle"), 3000);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardTitle>Metadata Endpoint</CardTitle>
              <CardDescription>
                Add an endpoint for Helper to fetch customer value and metadata when an email is received
              </CardDescription>
            </div>
            <a
              href={`${getMarketingSiteUrl()}/docs/tools/05-metadata-endpoint`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              Documentation
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="endpoint-url">Endpoint URL</Label>
              <div className="mt-2">
                <Input
                  id="endpoint-url"
                  ref={inputRef}
                  placeholder="https://api.example.com/metadata"
                  type="url"
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddEndpoint()}
                  disabled={!!metadataEndpoint?.url || isLoading}
                />
              </div>
              {metadataEndpoint?.url && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleTestRequest}
                  disabled={testRequestStatus !== "idle"}
                  className="mt-2"
                >
                  {testRequestStatus === "idle" && "Test endpoint"}
                  {testRequestStatus === "loading" && "Testing..."}
                  {testRequestStatus === "success" && "Test successful"}
                  {testRequestStatus === "error" && "Test failed"}
                </Button>
              )}
            </div>

            {metadataEndpoint?.url && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="hmac-secret">HMAC Secret</Label>
                  <div className="mt-2">
                    <SecretInput value={metadataEndpoint.hmacSecret} ariaLabel="HMAC Secret" />
                  </div>
                </div>

                <ConfirmationDialog
                  message="Are you sure you want to remove this metadata endpoint?"
                  onConfirm={async () => {
                    setIsLoading(true);
                    try {
                      const result = await deleteEndpoint();
                      if (result?.error) {
                        toast.error(result.error);
                        return;
                      }
                      setNewUrl("");
                      router.refresh();
                      toast.success("Metadata endpoint removed successfully");
                    } catch (e) {
                      captureExceptionAndLog(e);
                      toast.error("Failed to remove metadata endpoint");
                    } finally {
                      setIsLoading(false);
                    }
                  }}
                  confirmLabel="Yes, remove"
                >
                  <Button variant="destructive_outlined" disabled={isLoading}>
                    Remove endpoint
                  </Button>
                </ConfirmationDialog>
              </div>
            )}

            {!metadataEndpoint?.url && (
              <Button
                variant="subtle"
                onClick={handleAddEndpoint}
                disabled={!newUrl || isLoading}
                className="w-full sm:w-auto"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                {isLoading ? "Adding endpoint..." : "Add endpoint"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MetadataEndpointSetting;
