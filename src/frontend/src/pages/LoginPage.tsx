import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BookOpen, Loader2 } from "lucide-react";
import { useState } from "react";
import { useInternetIdentity } from "../hooks/useInternetIdentity";

interface Props {
  onLoggedIn: (name: string) => void;
}

export default function LoginPage({ onLoggedIn }: Props) {
  const { login, loginStatus } = useInternetIdentity();
  const [name, setName] = useState("");
  const [step, setStep] = useState<"login" | "name">("login");
  const [error, setError] = useState("");

  const isLoggingIn = loginStatus === "logging-in";

  const handleLogin = async () => {
    setError("");
    try {
      await login();
      setStep("name");
    } catch (_e: unknown) {
      setError("लॉगिन में समस्या हुई। पुनঃ प्रयास करें।");
    }
  };

  const handleNameSubmit = () => {
    if (!name.trim()) {
      setError("कृपया अपना नाम दर्ज करें");
      return;
    }
    localStorage.setItem("surveyor_name", name.trim());
    onLoggedIn(name.trim());
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-primary/10 to-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center space-y-3">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary text-primary-foreground">
            <BookOpen className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-display font-bold text-foreground">
            घरेलू सर्वे
          </h1>
          <p className="text-sm text-muted-foreground">
            विद्यालय बाल सर्वेक्षण प्रणाली
          </p>
        </div>

        <Card className="border-border shadow-md">
          {step === "login" ? (
            <>
              <CardHeader>
                <CardTitle className="text-lg text-center">लॉगिन करें</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground text-center">
                  सर्वे शुरू करने के लिए Internet Identity से लॉगिन करें
                </p>
                {error && (
                  <p
                    className="text-sm text-destructive text-center"
                    data-ocid="login.error_state"
                  >
                    {error}
                  </p>
                )}
                <Button
                  className="w-full h-12 text-base"
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  data-ocid="login.submit_button"
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> लॉगिन हो
                      रहा है...
                    </>
                  ) : (
                    "लॉगिन करें"
                  )}
                </Button>
              </CardContent>
            </>
          ) : (
            <>
              <CardHeader>
                <CardTitle className="text-lg text-center">आपका नाम</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="surveyor-name">सर्वे कर्ता का नाम</Label>
                  <Input
                    id="surveyor-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="अपना पूरा नाम दर्ज करें"
                    className="h-12 text-base"
                    onKeyDown={(e) => e.key === "Enter" && handleNameSubmit()}
                    data-ocid="login.input"
                  />
                </div>
                {error && (
                  <p
                    className="text-sm text-destructive"
                    data-ocid="login.error_state"
                  >
                    {error}
                  </p>
                )}
                <Button
                  className="w-full h-12"
                  onClick={handleNameSubmit}
                  data-ocid="login.submit_button"
                >
                  आगे बढ़ें
                </Button>
              </CardContent>
            </>
          )}
        </Card>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()}. Built with love using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </div>
    </div>
  );
}
