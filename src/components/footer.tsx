import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="w-full bg-background border-t sticky bottom-0">
      <div className="container mx-auto py-3 px-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <a href="/admin/docs" className="hover:text-primary transition-colors">Docs</a>
            <a href="/admin/support" className="hover:text-primary transition-colors">Support</a>
            <span>Version 1.0.0</span>
          </div>
          <p className="flex items-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Admin Panel <Heart className="w-3 h-3 mx-1 text-red-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
