import { Button } from "@/components/ui/Button";
import { Switch } from "@/components/ui/Switch";
import { Label } from "@/components/ui/Label";
import { Bell, Lock, Eye, Moon } from "lucide-react";

export default function SettingsPage() {
    return (
        <div className="max-w-4xl space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-bold text-brand-navy">Settings</h1>
                <p className="text-gray-500 mt-2">Customize your portal experience and preferences.</p>
            </div>

            <div className="grid gap-6">

                {/* Notifications */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                            <Bell className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-brand-navy">Notifications</h2>
                            <p className="text-sm text-gray-500">Manage how you receive updates.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Email Notifications</Label>
                                <p className="text-sm text-gray-500">Receive emails about case updates.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                        <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                            <div className="space-y-0.5">
                                <Label className="text-base">Document Alerts</Label>
                                <p className="text-sm text-gray-500">Get notified when new documents are uploaded.</p>
                            </div>
                            <Switch defaultChecked />
                        </div>
                    </div>
                </div>

                {/* Security / Privacy */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-green-100 p-2 rounded-lg text-green-600">
                            <Lock className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-brand-navy">Privacy & Security</h2>
                            <p className="text-sm text-gray-500">Manage account security settings.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                                <Label className="text-base">Two-Factor Authentication</Label>
                                <p className="text-sm text-gray-500">Add an extra layer of security to your account.</p>
                            </div>
                            <Button variant="outline" size="sm">Enable 2FA</Button>
                        </div>
                    </div>
                </div>

                {/* Appearance */}
                <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="bg-purple-100 p-2 rounded-lg text-purple-600">
                            <Moon className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-lg font-bold text-brand-navy">Appearance</h2>
                            <p className="text-sm text-gray-500">Customize the look and feel.</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <Label className="text-base">Dark Mode</Label>
                            <p className="text-sm text-gray-500">Switch between light and dark themes.</p>
                        </div>
                        <Switch disabled />
                    </div>
                </div>

            </div>
        </div>
    );
}
