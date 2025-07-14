"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";
import CopyToClipboard from "react-copy-to-clipboard";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const CopyButton = ({ code }: { code: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <CopyToClipboard text={code} onCopy={handleCopy}>
            <Button
              size="sm"
              variant="ghost"
              className="absolute right-2 top-2 h-8 w-8 p-0 hover:bg-muted"
            >
              {copied ? (
                <Check className="size-4 text-success" />
              ) : (
                <Copy className="size-4 text-muted-foreground" />
              )}
            </Button>
          </CopyToClipboard>
        </TooltipTrigger>
        <TooltipContent>
          {copied ? "Copied!" : "Copy code"}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default CopyButton;
