import { Card } from "../ui/card";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Calendar } from "../ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function SystemInformation({ systemInfo, setSystemInfo }: any) {
    const [date, setDate] = useState(new Date(systemInfo.lastUpdated));

    return (
        <Card className="p-6">
            <h3 className="text-lg mb-4">System Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                    <p className="text-muted-foreground mb-1">Version</p>
                    <Input
                        value={systemInfo.version}
                        onChange={(e) => setSystemInfo((p: any) => ({ ...p, version: e.target.value }))}
                    />
                </div>
                <div>
                    <p className="text-muted-foreground mb-1">Last Updated</p>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start text-left">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(date, "PPP")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => {
                                    if (d) {
                                        setDate(d);
                                        setSystemInfo((p: any) => ({ ...p, lastUpdated: format(d, "yyyy-MM-dd") }));
                                    }
                                }}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
                <div>
                    <p className="text-muted-foreground mb-1">Database Status</p>
                    <Input
                        value={systemInfo.databaseStatus}
                        onChange={(e) => setSystemInfo((p: any) => ({ ...p, databaseStatus: e.target.value }))}
                        className={cn(
                            "text-sm",
                            systemInfo.databaseStatus === "Connected"
                                ? "text-green-600 dark:text-green-400"
                                : "text-red-600"
                        )}
                    />
                </div>
            </div>
        </Card>
    );
}
