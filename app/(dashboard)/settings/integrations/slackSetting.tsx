"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";
import { toast } from "sonner";
import SlackSvg from "@/app/(dashboard)/icons/slack.svg";
import { ConfirmationDialog } from "@/components/confirmationDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useRunOnce } from "@/components/useRunOnce";
import useShowToastForSlackConnectStatus from "@/components/useShowToastForSlackConnectStatus";
import { captureExceptionAndLog } from "@/lib/shared/sentry";
import { RouterOutputs } from "@/trpc";
import { api } from "@/trpc/react";

export const SlackChannels = ({
  id,
  selectedChannelId,
  onChange,
}: {
  id: string;
  selectedChannelId?: string;
  mailbox: RouterOutputs["mailbox"]["get"];
  onChange: (channelId: string | null) => void;
}) => {
  const utils = api.useUtils();
  const [alertChannelName, setAlertChannelName] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [channels, setChannels] = useState<{ id: string; name: string }[]>([]);

  useRunOnce(() => {
    const fetchChannels = async () => {
      try {
        setChannels(await utils.client.mailbox.slack.channels.query());
      } catch (e) {
        captureExceptionAndLog(e);
        toast.error("Error fetching available channels");
      }
    };

    fetchChannels();
  });

  useEffect(() => {
    const channel = channels.find(({ id }) => id === selectedChannelId);
    if (channel) {
      setAlertChannelName(`#${channel.name}`);
    }
  }, [channels, selectedChannelId]);

  const setAlertChannel = (name: string) => {
    setAlertChannelName(name);

    if (name === "" || name === "#") {
      setIsValid(true);
      onChange(null);
      return;
    }

    const channel = channels.find((channel) => channel.name === name.replace("#", ""));

    if (channel?.id) {
      setIsValid(true);
      onChange(channel.id);
    } else {
      setIsValid(false);
    }
  };

  const datalistId = `slackChannels-${id}`;

  return (
    <>
      <Input
        id={id}
        name="channel"
        list={datalistId}
        disabled={!channels.length}
        placeholder={channels.length ? "" : "Loading channels..."}
        value={alertChannelName}
        onChange={(e) => setAlertChannel(e.target.value)}
        onFocus={() => {
          if (alertChannelName === "") {
            setAlertChannelName("#");
          }
        }}
        onBlur={() => {
          if (alertChannelName === "#") {
            setAlertChannelName("");
          }
          if (!isValid) {
            toast.error("Channel not found");
          }
        }}
      />
      <datalist id={datalistId}>
        {channels.map((channel) => (
          <option key={channel.id} value={`#${channel.name}`} />
        ))}
      </datalist>
    </>
  );
};

const SlackSetting = ({ mailbox }: { mailbox: RouterOutputs["mailbox"]["get"] }) => {
  const { mutateAsync: disconnectSlack } = api.mailbox.slack.disconnect.useMutation();
  const [isSlackConnected, setSlackConnected] = useState(mailbox.slackConnected);
  const channelUID = useId();
  const utils = api.useUtils();
  const { mutate: update } = api.mailbox.update.useMutation({
    onSuccess: () => utils.mailbox.get.invalidate(),
    onError: (error) => toast.error("Error updating Slack settings", { description: error.message }),
  });
  useShowToastForSlackConnectStatus();

  const onDisconnectSlack = async () => {
    try {
      await disconnectSlack();
      setSlackConnected(false);
      toast.success("Slack app uninstalled from your workspace");
    } catch (e) {
      captureExceptionAndLog(e);
      toast.error("Error disconnecting Slack");
    }
  };

  const connectUrl = mailbox.slackConnectUrl;
  if (!connectUrl) return null;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Slack Integration</CardTitle>
          <CardDescription>Notify your team and respond without leaving Slack</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isSlackConnected ? (
            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor={channelUID} className="text-sm font-medium">Alert Channel</Label>
                  <div className="mt-2">
                    <SlackChannels
                      id={channelUID}
                      selectedChannelId={mailbox.slackAlertChannel ?? undefined}
                      mailbox={mailbox}
                      onChange={(slackAlertChannel) => update({ slackAlertChannel })}
                    />
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Daily reports and notifications will be sent to this channel
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="space-y-1">
                    <Label htmlFor="ticket-response-alerts-toggle" className="text-sm font-medium">
                      Ticket Response Time Alerts
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Notifications about tickets waiting over 24 hours without a response
                    </p>
                  </div>
                  <Switch
                    id="ticket-response-alerts-toggle"
                    checked={!mailbox.preferences?.disableTicketResponseTimeAlerts}
                    onCheckedChange={(checked) =>
                      update({
                        preferences: { disableTicketResponseTimeAlerts: !checked },
                      })
                    }
                  />
                </div>
              </div>

              <ConfirmationDialog
                message="Are you sure you want to disconnect Slack?"
                onConfirm={onDisconnectSlack}
                confirmLabel="Yes, disconnect"
              >
                <Button variant="destructive_outlined">Disconnect from Slack</Button>
              </ConfirmationDialog>
            </div>
          ) : (
            <Button asChild variant="subtle" className="w-full sm:w-auto">
              <Link href={connectUrl}>
                <SlackSvg className="mr-2 h-4 w-4" />
                Add to Slack
              </Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SlackSetting;