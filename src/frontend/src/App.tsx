import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  BookOpen,
  ClipboardList,
  LogOut,
  Menu,
  Settings,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useInternetIdentity } from "./hooks/useInternetIdentity";
import EntriesList from "./pages/EntriesList";
import LoginPage from "./pages/LoginPage";
import SettingsPage from "./pages/SettingsPage";
import SurveyForm from "./pages/SurveyForm";

const queryClient = new QueryClient();

type Page = "survey" | "entries" | "settings";

function AppContent() {
  const { identity, clear, isInitializing } = useInternetIdentity();
  const [surveyorName, setSurveyorName] = useState("");
  const [page, setPage] = useState<Page>("survey");
  const [menuOpen, setMenuOpen] = useState(false);

  const principal = identity?.getPrincipal().toString() ?? "";
  const isLoggedIn = !!identity && !!surveyorName;

  useEffect(() => {
    if (identity) {
      const stored = localStorage.getItem("surveyor_name");
      if (stored) setSurveyorName(stored);
    }
  }, [identity]);

  const handleLogout = async () => {
    await clear();
    setSurveyorName("");
    localStorage.removeItem("surveyor_name");
    queryClient.clear();
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-primary mx-auto flex items-center justify-center">
            <BookOpen className="w-6 h-6 text-primary-foreground" />
          </div>
          <p className="text-muted-foreground animate-pulse">लोड हो रहा है...</p>
        </div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <LoginPage onLoggedIn={(name) => setSurveyorName(name)} />;
  }

  const navItems: { key: Page; label: string; icon: React.ReactNode }[] = [
    { key: "survey", label: "नया सर्वे", icon: <BookOpen className="w-5 h-5" /> },
    {
      key: "entries",
      label: "प्रविष्टियाँ",
      icon: <ClipboardList className="w-5 h-5" />,
    },
    { key: "settings", label: "सेटिंग्स", icon: <Settings className="w-5 h-5" /> },
  ];

  const pageTitles: Record<Page, string> = {
    survey: "नया सर्वे",
    entries: "सभी प्रविष्टियाँ",
    settings: "सेटिंग्स",
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 bg-primary text-primary-foreground shadow-md no-print">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            <span className="font-display font-semibold text-sm">घरेलू सर्वे</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs opacity-75 max-w-[100px] truncate">
              {surveyorName}
            </span>
            <button
              type="button"
              onClick={() => setMenuOpen(!menuOpen)}
              className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            >
              {menuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="border-t border-white/20 bg-primary">
            <div className="max-w-2xl mx-auto px-2 py-2 space-y-1">
              {navItems.map((item) => (
                <button
                  type="button"
                  key={item.key}
                  onClick={() => {
                    setPage(item.key);
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    page === item.key ? "bg-white/20" : "hover:bg-white/10"
                  }`}
                  data-ocid={
                    item.key === "survey"
                      ? "nav.survey_link"
                      : item.key === "entries"
                        ? "nav.entries_link"
                        : "nav.settings_link"
                  }
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/80 hover:bg-white/10 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                लॉगआउट
              </button>
            </div>
          </div>
        )}
      </header>

      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-border shadow-lg no-print md:hidden">
        <div className="max-w-2xl mx-auto flex">
          {navItems.map((item) => (
            <button
              type="button"
              key={item.key}
              onClick={() => setPage(item.key)}
              className={`flex-1 flex flex-col items-center gap-1 py-2 text-xs transition-colors ${
                page === item.key
                  ? "text-primary font-semibold"
                  : "text-muted-foreground"
              }`}
              data-ocid={
                item.key === "survey"
                  ? "nav.survey_link"
                  : item.key === "entries"
                    ? "nav.entries_link"
                    : "nav.settings_link"
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      <main className="max-w-2xl mx-auto px-4 pt-4 pb-24">
        <h1 className="text-lg font-display font-bold mb-4 no-print">
          {pageTitles[page]}
        </h1>

        {page === "survey" && (
          <SurveyForm
            surveyorName={surveyorName}
            surveyorPrincipal={principal}
          />
        )}
        {page === "entries" && (
          <EntriesList isAdmin={true} surveyorPrincipal={principal} />
        )}
        {page === "settings" && <SettingsPage />}
      </main>

      <footer className="text-center py-3 text-xs text-muted-foreground no-print border-t border-border mt-8">
        © {new Date().getFullYear()}. Built with ❤️ using{" "}
        <a
          href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="underline hover:text-foreground transition-colors"
        >
          caffeine.ai
        </a>
      </footer>

      <Toaster richColors position="top-center" />
    </div>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppContent />
    </QueryClientProvider>
  );
}
