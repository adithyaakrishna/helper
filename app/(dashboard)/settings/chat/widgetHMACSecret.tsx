import { Card, CardContent } from "@/components/ui/card";
import { SecretInput } from "@/components/secretInput";

const WidgetHMACSecret = ({ hmacSecret }: { hmacSecret: string }) => {
  return (
    <Card className="bg-muted/50">
      <CardContent className="p-4">
        <SecretInput 
          value={hmacSecret} 
          ariaLabel="HMAC Secret" 
          className="font-mono text-sm"
        />
      </CardContent>
    </Card>
  );
};

export default WidgetHMACSecret;
