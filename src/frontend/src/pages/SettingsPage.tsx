import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { getSettings, saveSettings } from "../types/survey";

export default function SettingsPage() {
  const [settings, setSettings] = useState(getSettings());

  const handleSave = () => {
    saveSettings(settings);
    toast.success("सेटिंग्स सहेज दी गई हैं");
  };

  return (
    <div className="space-y-4 pb-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            सर्वे सेटिंग्स
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="schoolName">विद्यालय का नाम</Label>
            <Input
              id="schoolName"
              value={settings.schoolName}
              onChange={(e) =>
                setSettings((p) => ({ ...p, schoolName: e.target.value }))
              }
              placeholder="विद्यालय का पूरा नाम दर्ज करें"
              className="h-12 text-base"
              data-ocid="settings.input"
            />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="session">सत्र (Session Year)</Label>
            <Input
              id="session"
              value={settings.session}
              onChange={(e) =>
                setSettings((p) => ({ ...p, session: e.target.value }))
              }
              placeholder="जैसे: 2025-26"
              className="h-12 text-base"
            />
          </div>

          <Button
            className="w-full h-12 text-base"
            onClick={handleSave}
            data-ocid="settings.save_button"
          >
            सेटिंग्स सहेजें
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-muted/40">
        <CardContent className="pt-4">
          <p className="text-sm text-muted-foreground">
            <strong>नोट:</strong> ये सेटिंग्स सभी नई सर्वे प्रविष्टियों में स्वचालित रूप से
            भरी जाएंगी। विद्यालय का नाम और सत्र पहले सेट करें फिर सर्वे शुरू करें।
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
