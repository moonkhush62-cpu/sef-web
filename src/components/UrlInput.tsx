import { useState } from "react";
import { Search, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface UrlInputProps {
  onScan: (url: string) => void;
  isScanning: boolean;
}

const DEMO_URLS = [
  "https://www.google.com",
  "http://signin.eby.de.zukruygxctzmmqi.civpro.co.za/login?user=admin@bank.com",
  "http://192.168.1.1/phishing--page/steal?redirect=http://evil.com",
];

const UrlInput = ({ onScan, isScanning }: UrlInputProps) => {
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = url.trim();
    if (!trimmed) {
      setError("Please enter a URL to scan.");
      return;
    }
    // Basic URL-ish validation
    if (!/^https?:\/\/.+/i.test(trimmed) && !trimmed.includes(".")) {
      setError("Please enter a valid URL (e.g., https://example.com).");
      return;
    }
    setError("");
    // Prepend http:// if no protocol
    const finalUrl = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    onScan(finalUrl);
  };

  const handleDemo = (demoUrl: string) => {
    setUrl(demoUrl);
    setError("");
    onScan(demoUrl);
  };

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Enter a URL to scan (e.g., https://example.com)"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setError(""); }}
            className="pl-10 bg-secondary/50 border-border focus:border-primary focus:ring-primary/30 h-12 text-sm font-mono"
          />
        </div>
        <Button type="submit" disabled={isScanning} size="lg" className="h-12 px-6 font-semibold">
          {isScanning ? "Scanning…" : "Scan URL"}
        </Button>
      </form>

      {error && <p className="text-xs text-danger">{error}</p>}

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <Zap className="h-3 w-3" /> Try a demo:
        </span>
        {DEMO_URLS.map((demoUrl, i) => (
          <button
            key={i}
            onClick={() => handleDemo(demoUrl)}
            className="text-xs font-mono text-primary/80 hover:text-primary bg-primary/5 hover:bg-primary/10 px-2 py-1 rounded border border-primary/20 transition-colors truncate max-w-[200px]"
          >
            {demoUrl.length > 35 ? demoUrl.slice(0, 35) + "…" : demoUrl}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UrlInput;
