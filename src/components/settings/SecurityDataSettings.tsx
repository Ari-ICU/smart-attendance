import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Button } from "../ui/button";
import { Shield, Database } from "lucide-react";

export function SecurityDataSettings({ localSettings, setLocalSettings }: any) {
    const handleToggle = () => setLocalSettings((prev: any) => ({ ...prev, dataBackup: !prev.dataBackup }));

    return (
        <Card className="p-6">
            <h3 className="text-lg mb-4 flex items-center gap-2"><Shield className="w-5 h-5" /> Security & Data</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Automatic Backup</Label>
                        <p className="text-sm text-muted-foreground">Backup data automatically every day</p>
                    </div>
                    <Switch checked={localSettings.dataBackup} onCheckedChange={handleToggle} />
                </div>
                <Separator />
                <Button variant="outline" className="w-full">
                    <Database className="w-4 h-4 mr-2" /> Export All Data
                </Button>
            </div>
        </Card>
    );
}
