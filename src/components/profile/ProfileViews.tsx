'use client';

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Mail, Lock } from "lucide-react";
import { useAuthContext } from "@/context/AuthContext";

export default function Profile() {
    const { user, isLoading } = useAuthContext();

    if (isLoading) return <div>Loading profile...</div>;

    const profile = user || { name: "Unknown User", email: "No email", image: null };


    console.log("user data :", user)
    return (
        <Card className="shadow-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg font-semibold">
                    <User className="w-5 h-5 text-primary" />
                    Account Information
                </CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                {/* Profile Image Section */}
                <div className="flex flex-col sm:flex-row items-start gap-6">
                    <div className="relative w-32 h-32 flex-shrink-0">
                        {profile.image ? (
                            <img
                                src={profile.image}
                                alt="Profile"
                                className="w-32 h-32 rounded-full object-cover border border-gray-300 shadow-sm"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-gray-100 border flex items-center justify-center">
                                <User className="w-10 h-10 text-gray-400" />
                            </div>
                        )}
                    </div>

                    <div className="flex-1">
                        <Label className="block mb-2 font-medium">
                            Profile Picture
                        </Label>
                        <p className="text-sm text-gray-500">
                            {profile.image ? "Profile image uploaded." : "No profile image set."}
                        </p>
                    </div>
                </div>

                {/* Full Name */}
                <div className="space-y-1">
                    <Label>Full Name</Label>
                    <div className="flex items-center border rounded-md px-2 bg-gray-50 py-2">
                        <User className="text-gray-400 w-4 h-4 mr-2" />
                        <span className="text-gray-900 font-medium">{profile.name}</span>
                    </div>
                </div>

                {/* Email Address */}
                <div className="space-y-1">
                    <Label>Email Address</Label>
                    <div className="flex items-center border rounded-md px-2 bg-gray-50 py-2">
                        <Mail className="text-gray-400 w-4 h-4 mr-2" />
                        <span className="text-gray-900 font-medium">{profile.email}</span>
                    </div>
                </div>

                {/* Password (hidden view) */}
                <div className="space-y-1">
                    <Label>Password</Label>
                    <div className="flex items-center border rounded-md px-2 bg-gray-50 py-2">
                        <Lock className="text-gray-400 w-4 h-4 mr-2" />
                        <span className="text-gray-900 font-medium">••••••••</span>
                    </div>
                </div>

                {/* Edit button */}
                <div className="flex justify-end">
                    <Button variant="outline" className="w-full sm:w-auto">
                        Edit Profile
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
