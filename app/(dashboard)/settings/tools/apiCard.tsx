"use client";

import { Check, RefreshCw, Trash } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { ConfirmationDialog } from "@/components/confirmationDialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";
import ToolListItem from "./toolListItem";

const ApiCard = ({ api: apiData }: { api: RouterOutputs["mailbox"]["tools"]["list"][number] }) => {
  const utils = api.useUtils();
  const [isRefreshed, setIsRefreshed] = useState(false);
  const [isSchemaPopoverOpen, setIsSchemaPopoverOpen] = useState(false);
  const [schema, setSchema] = useState("");

  const { mutate: refreshApi, isPending: isRefreshing } = api.mailbox.tools.refreshApi.useMutation({
    onSuccess: () => {
      setIsRefreshed(true);
      setTimeout(() => setIsRefreshed(false), 3000);
      utils.mailbox.tools.list.invalidate();
      setIsSchemaPopoverOpen(false);
      setSchema("");
      toast.success("API refreshed successfully");
    },
    onError: (error) => {
      toast.error("Failed to refresh API", { description: error.message });
    },
  });

  const { mutate: deleteApi, isPending: isDeleting } = api.mailbox.tools.deleteApi.useMutation({
    onSuccess: () => {
      utils.mailbox.tools.list.invalidate();
      toast.success("API deleted successfully");
    },
    onError: (error) => {
      toast.error("Failed to delete API", { description: error.message });
    },
  });

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-xl">{apiData.name}</CardTitle>
          <p className="text-sm text-muted-foreground">{apiData.baseUrl ?? "OpenAPI schema"}</p>
        </div>
        <div className="flex items-center gap-2">
          {!apiData.baseUrl ? (
            <Popover open={isSchemaPopoverOpen} onOpenChange={setIsSchemaPopoverOpen}>
              <PopoverTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  disabled={isRefreshing}
                  className="flex items-center gap-2"
                >
                  {isRefreshed ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                  )}
                  {isRefreshed ? "Updated" : "Update Schema"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[400px] p-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Update OpenAPI Schema</Label>
                    <Textarea
                      value={schema}
                      onChange={(e) => setSchema(e.target.value)}
                      placeholder={`{
  "products": {
    "GET": {
      "url": "/products/:id",
      "description": "Retrieve product details"
    }
  }
}`}
                      rows={8}
                      disabled={isRefreshing}
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={() => refreshApi({ apiId: apiData.id, schema })}
                      disabled={isRefreshing}
                    >
                      {isRefreshing ? "Updating..." : "Update Schema"}
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refreshApi({ apiId: apiData.id })}
              disabled={isRefreshing}
              className="flex items-center gap-2"
            >
              {isRefreshed ? (
                <Check className="h-4 w-4" />
              ) : (
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              )}
              {isRefreshed ? "Updated" : "Update"}
            </Button>
          )}
          
          <ConfirmationDialog
            message="Are you sure you want to delete this API? This action cannot be undone."
            onConfirm={() => deleteApi({ apiId: apiData.id })}
            confirmLabel="Yes, delete"
          >
            <Button
              variant="ghost"
              size="sm"
              disabled={isDeleting}
              className="text-muted-foreground hover:text-destructive"
            >
              <Trash className="h-4 w-4" />
              <span className="sr-only">Delete API</span>
            </Button>
          </ConfirmationDialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="divide-y divide-border">
          {apiData.tools.map((tool) => (
            <ToolListItem key={tool.id} tool={tool} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ApiCard;
