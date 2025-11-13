import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Bell } from "lucide-react";

export function NotificationSettings({ localSettings, setLocalSettings }: any) {
    const handleToggle = () => setLocalSettings((prev: any) => ({ ...prev, notifications: !prev.notifications }));

    return (
        <Card className="p-6">
            <h3 className="text-lg mb-4 flex items-center gap-2"><Bell className="w-5 h-5" /> Notifications</h3>
            <div className="flex items-center justify-between">
                <div>
                    <Label>Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive alerts for attendance events</p>
                </div>
                <Switch checked={localSettings.notifications} onCheckedChange={handleToggle} />
            </div>
        </Card>
    );
}
