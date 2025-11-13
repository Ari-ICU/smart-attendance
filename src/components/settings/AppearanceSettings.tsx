import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Sun, Moon } from "lucide-react";

export function AppearanceSettings({ theme, toggleTheme }: any) {
    return (
        <Card className="p-6">
            <h3 className="text-lg mb-4 flex items-center gap-2">
                {theme === "light" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />} Appearance
            </h3>
            <div className="flex items-center justify-between">
                <div>
                    <Label>Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle between light and dark theme</p>
                </div>
                <Switch checked={theme === "dark"} onCheckedChange={toggleTheme} />
            </div>
        </Card>
    );
}
