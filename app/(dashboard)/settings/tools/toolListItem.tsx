"use client";

import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { api } from "@/trpc/react";
import type { ToolFormatted } from "@/types/tools";

const ToolListItem = ({ tool }: { tool: ToolFormatted }) => {
  const [editingTool, setEditingTool] = useState<ToolFormatted | null>(null);
  const utils = api.useUtils();

  const updateToolMutation = api.mailbox.tools.update.useMutation({
    onMutate: ({ toolId, settings }) => {
      utils.mailbox.tools.list.setData(undefined, (currentApis = []) =>
        currentApis.map((api) => ({
          ...api,
          tools: api.tools.map((t) => (t.id === toolId ? { ...t, ...settings } : t)),
        }))
      );
    },
    onSuccess: () => {
      toast.success("Tool settings updated successfully");
    },
    onError: (error) => {
      toast.error("Failed to update tool settings", { description: error.message });
    },
  });

  if (editingTool) {
    return (
      <Card className="my-4">
        <CardContent className="space-y-6 p-6">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Name</Label>
              <p className="text-sm">{editingTool.name}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Description</Label>
              <p className="text-sm">{editingTool.description}</p>
            </div>

            <div className="space-y-2">
              <Label className="text-sm font-medium">Endpoint</Label>
              <div className="flex items-center gap-2">
                <Badge variant="default">{editingTool.requestMethod}</Badge>
                <code className="flex-1 p-2 bg-muted rounded-md text-sm break-all">
                  {editingTool.url}
                </code>
              </div>
            </div>

            {editingTool.parameters && editingTool.parameters.length > 0 && (
              <div className="space-y-2">
                <Label className="text-sm font-medium">Parameters</Label>
                <div className="space-y-2">
                  {editingTool.parameters.map((param) => (
                    <div key={param.name} className="flex items-center gap-2 text-sm">
                      <code className="font-mono">{param.name}</code>
                      <Badge variant="gray">{param.type}</Badge>
                      {param.required && <Badge variant="default">Required</Badge>}
                      {param.description && (
                        <span className="text-muted-foreground">{param.description}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Enable Tool</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow this tool to be used in the mailbox
                  </p>
                </div>
                <Switch
                  checked={editingTool.enabled}
                  onCheckedChange={(checked) =>
                    setEditingTool((tool) => (tool ? { ...tool, enabled: checked } : tool))
                  }
                  disabled={updateToolMutation.isPending}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Available in Chat</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow customers to use this tool in chat conversations
                  </p>
                </div>
                <Switch
                  checked={editingTool.availableInChat}
                  onCheckedChange={(checked) =>
                    setEditingTool((tool) => (tool ? { ...tool, availableInChat: checked } : tool))
                  }
                  disabled={updateToolMutation.isPending || !editingTool.enabled}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Available in Anonymous Chats</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow usage when customer email is not verified
                  </p>
                </div>
                <Switch
                  checked={editingTool.availableInAnonymousChat}
                  onCheckedChange={(checked) =>
                    setEditingTool((tool) => (tool ? { ...tool, availableInAnonymousChat: checked } : tool))
                  }
                  disabled={
                    updateToolMutation.isPending || !editingTool.enabled || !editingTool.availableInChat
                  }
                />
              </div>

              {editingTool.availableInChat && (editingTool.parameters?.length ?? 0) > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Customer Email Parameter</Label>
                  <Select
                    value={editingTool.customerEmailParameter || ""}
                    onValueChange={(value) =>
                      setEditingTool((tool) => (tool ? { ...tool, customerEmailParameter: value } : tool))
                    }
                    disabled={!editingTool.availableInChat}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select parameter" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="(none)">(none)</SelectItem>
                      {editingTool.parameters?.filter((param) => param.type === "string")
                        .map((param) => (
                          <SelectItem key={param.name} value={param.name}>
                            {param.name}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    This parameter will be automatically set to the customer's email in chat.
                    For security, set this for any tools accessing customer data.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" onClick={() => setEditingTool(null)}>
              Cancel
            </Button>
            <Button
              onClick={async () => {
                await updateToolMutation.mutateAsync({
                  toolId: editingTool.id,
                  settings: {
                    enabled: editingTool.enabled,
                    availableInChat: editingTool.availableInChat,
                    availableInAnonymousChat: editingTool.availableInAnonymousChat,
                    customerEmailParameter: editingTool.customerEmailParameter,
                  },
                });
                setEditingTool(null);
              }}
              disabled={updateToolMutation.isPending}
            >
              {updateToolMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex items-center gap-4 py-4">
      <Switch
        checked={tool.enabled}
        onCheckedChange={(enabled) =>
          updateToolMutation.mutate({
            toolId: tool.id,
            settings: {
              enabled,
              availableInChat: tool.availableInChat,
              availableInAnonymousChat: tool.availableInAnonymousChat,
              customerEmailParameter: tool.customerEmailParameter,
            },
          })
        }
        disabled={updateToolMutation.isPending}
      />
      <button
        className="flex-1 min-w-0 flex items-center gap-4 hover:bg-muted/50 rounded-lg p-2 transition-colors"
        onClick={() => setEditingTool({ ...tool })}
      >
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium truncate">{tool.name}</p>
          <p className="text-xs text-muted-foreground truncate">/{tool.path}</p>
        </div>
        <Badge variant="gray">{tool.requestMethod}</Badge>
        <Settings className="h-4 w-4 text-muted-foreground" />
      </button>
    </div>
  );
};

export default ToolListItem;
