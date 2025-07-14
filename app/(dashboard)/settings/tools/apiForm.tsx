"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/trpc/react";

const ApiForm = ({ onCancel }: { onCancel: () => void }) => {
  const [isUrlInput, setIsUrlInput] = useState(true);
  const [apiUrl, setApiUrl] = useState("");
  const [apiSchema, setApiSchema] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [apiName, setApiName] = useState("");

  const utils = api.useUtils();
  const importMutation = api.mailbox.tools.import.useMutation({
    onSuccess: () => {
      toast.success("API imported successfully");
      utils.mailbox.tools.list.invalidate();
      onCancel();
    },
    onError: (error) => {
      toast.error("Failed to import API", { description: error.message });
    },
  });

  return (
    <Card>
      <CardContent className="space-y-4 p-6">
        <div className="space-y-2">
          <Label htmlFor="apiName">Name</Label>
          <Input
            id="apiName"
            value={apiName}
            onChange={(e) => setApiName(e.target.value)}
            placeholder="Your App"
            disabled={importMutation.isPending}
          />
        </div>

        <div className="space-y-2">
          {isUrlInput ? (
            <>
              <Label htmlFor="apiUrl">OpenAPI URL</Label>
              <Input
                id="apiUrl"
                type="url"
                value={apiUrl}
                onChange={(e) => setApiUrl(e.target.value)}
                placeholder="https://api.example.com/openapi.json"
                disabled={importMutation.isPending}
              />
              <button
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setIsUrlInput(false)}
                disabled={importMutation.isPending}
              >
                Enter OpenAPI schema instead
              </button>
            </>
          ) : (
            <>
              <Label htmlFor="apiSchema">API Schema</Label>
              <Textarea
                id="apiSchema"
                value={apiSchema}
                onChange={(e) => setApiSchema(e.target.value)}
                placeholder={`{
  "products": {
    "GET": {
      "url": "/products/:id",
      "description": "Retrieve product details"
    }
  }
}`}
                rows={8}
                disabled={importMutation.isPending}
              />
              <button
                className="text-sm text-muted-foreground hover:text-primary"
                onClick={() => setIsUrlInput(true)}
                disabled={importMutation.isPending}
              >
                Enter OpenAPI URL instead
              </button>
            </>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="apiKey">API Token</Label>
          <Input
            id="apiKey"
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            disabled={importMutation.isPending}
          />
          <p className="text-sm text-muted-foreground">
            Will be sent as a Bearer token in the Authorization header
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onCancel} disabled={importMutation.isPending}>
            Cancel
          </Button>
          <Button
            variant="default"
            onClick={() => {
              if (!apiKey) {
                toast.error("API token is required");
                return;
              }
              if (!apiName) {
                toast.error("API name is required");
                return;
              }
              importMutation.mutate({
                url: isUrlInput ? apiUrl : undefined,
                schema: !isUrlInput ? apiSchema : undefined,
                apiKey,
                name: apiName,
              });
            }}
            disabled={importMutation.isPending}
          >
            {importMutation.isPending ? "Importing..." : "Import API"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiForm;
