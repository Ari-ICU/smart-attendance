import { Card } from "../ui/card";
import { Label } from "../ui/label";
import { Switch } from "../ui/switch";
import { Separator } from "../ui/separator";
import { Camera } from "lucide-react";

export function CameraSettings({ localSettings, setLocalSettings }: any) {
    const handleToggle = (key: string) => setLocalSettings((prev: any) => ({ ...prev, [key]: !prev[key] }));

    return (
        <Card className="p-6">
            <h3 className="text-lg mb-4 flex items-center gap-2"><Camera className="w-5 h-5" /> Camera Settings</h3>
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Auto Capture</Label>
                        <p className="text-sm text-muted-foreground">Automatically capture when face detected</p>
                    </div>
                    <Switch checked={localSettings.autoCapture} onCheckedChange={() => handleToggle('autoCapture')} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                    <div>
                        <Label>Face Detection</Label>
                        <p className="text-sm text-muted-foreground">Enable real-time face detection</p>
                    </div>
                    <Switch checked={localSettings.faceDetection} onCheckedChange={() => handleToggle('faceDetection')} />
                </div>
            </div>
        </Card>
    );
}
