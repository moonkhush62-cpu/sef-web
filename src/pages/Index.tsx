import { useState } from "react";
import { Shield, Globe, AlertTriangle, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import UrlInput from "@/components/UrlInput";
import ScanResult from "@/components/ScanResult";
import { analyzeUrl, type ScanResultData } from "@/lib/phishingAnalyzer";

const Index = () => {
  const [result, setResult] = useState<ScanResultData | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = async (url: string) => {
    setIsScanning(true);
    setResult(null);
    try {
      const scanResult = await analyzeUrl(url);
      setResult(scanResult);
    } catch (err) {
      console.error("Scan failed:", err);
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-background bg-grid-pattern">
      <Header />

      <main className="flex-1">
        <div className="container mx-auto max-w-2xl px-4 py-10">
          {/* Hero */}
          <div className="mb-8 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Detect <span className="text-gradient-primary">Phishing URLs</span> Instantly
            </h2>
            <p className="mt-3 text-sm text-muted-foreground max-w-lg mx-auto">
              Paste any URL below to analyze it for phishing indicators. PhishGuard checks URL length, HTTPS status, suspicious characters, and domain age to assess risk.
            </p>
          </div>

          {/* Feature pills */}
          <div className="mb-8 flex flex-wrap justify-center gap-3">
            {[
              { icon: Shield, label: "HTTPS Verification" },
              { icon: Globe, label: "URL Length Analysis" },
              { icon: AlertTriangle, label: "Suspicious Chars" },
              { icon: Clock, label: "Domain Age Check" },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 rounded-full border border-border bg-secondary/50 px-3 py-1.5 text-xs text-muted-foreground">
                <Icon className="h-3 w-3 text-primary" />
                {label}
              </div>
            ))}
          </div>

          {/* URL Input */}
          <UrlInput onScan={handleScan} isScanning={isScanning} />

          {/* Scanning animation */}
          {isScanning && (
            <div className="mt-8 flex flex-col items-center gap-3">
              <div className="h-16 w-16 rounded-full border-2 border-primary/30 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin" />
              </div>
              <p className="text-sm text-muted-foreground animate-pulse-glow">Analyzing URL & checking domain age…</p>
            </div>
          )}

          {/* Results */}
          {result && !isScanning && (
            <div className="mt-8">
              <ScanResult result={result} />
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Index;
