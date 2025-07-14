"use client";

import { PlusCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api } from "@/trpc/react";
import ApiCard from "./apiCard";
import ApiForm from "./apiForm";
import { ToolsListSkeleton } from "./toolListSkeleton";

const ToolSetting = () => {
  const [showApiForm, setShowApiForm] = useState(false);
  const {
    data: apis = [],
    isLoading,
    isFetching,
    error,
  } = api.mailbox.tools.list.useQuery();

  useEffect(() => {
    if (error) {
      toast.error("Error fetching APIs", {
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  }, [error]);

  return (
    <div className="space-y-6 mt-4">
      <Card>
        <CardHeader>
          <CardTitle>Tools</CardTitle>
          <CardDescription>
            Connect your API using an OpenAPI spec to let Helper take actions in your app when drafting replies
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!showApiForm && (
            <Button variant="subtle" onClick={() => setShowApiForm(true)} className="w-full sm:w-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Connect API
            </Button>
          )}

          {showApiForm && <ApiForm onCancel={() => setShowApiForm(false)} />}

          <div className="space-y-4">
            {isLoading || (isFetching && apis.length === 0) ? (
              <ToolsListSkeleton count={1} />
            ) : (
              apis.map((api) => <ApiCard key={api.id} api={api} />)
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ToolSetting;
