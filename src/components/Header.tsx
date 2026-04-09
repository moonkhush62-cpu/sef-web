import { Shield } from "lucide-react";

const Header = () => {
  return (
    <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
      <div className="container mx-auto flex items-center gap-3 px-4 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 glow-primary">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gradient-primary">PhishGuard</h1>
          <p className="text-xs text-muted-foreground">URL Phishing Detection Tool</p>
        </div>
      </div>
    </header>
  );
};

export default Header;
