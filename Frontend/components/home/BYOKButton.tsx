"use client";

import { useState, useEffect } from "react";
import { Key, Check, X, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function BYOKButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [apiKey, setApiKey] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [hasStoredKey, setHasStoredKey] = useState(false);

    // Check if key exists on mount
    useEffect(() => {
        const storedKey = localStorage.getItem("replicate_api_key");
        setHasStoredKey(!!storedKey);
    }, []);

    const handleVerify = () => {
        if (!apiKey.trim()) return;

        setIsVerifying(true);
        // Simulate verification
        setTimeout(() => {
            setIsVerifying(false);
            setIsVerified(true);
            localStorage.setItem("replicate_api_key", apiKey);
            setHasStoredKey(true);
            setTimeout(() => setIsOpen(false), 1000);
        }, 1500);
    };

    const handleRemoveKey = () => {
        localStorage.removeItem("replicate_api_key");
        setHasStoredKey(false);
        setApiKey("");
        setIsVerified(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-300 backdrop-blur-sm ${hasStoredKey
                            ? "border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-green-400"
                            : "border-slate-700 hover:border-primary/50 hover:text-primary text-slate-300 bg-slate-900/40"
                        }`}
                >
                    {hasStoredKey ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                        <Key className="w-3 h-3 text-xs" />
                    )}
                    <span className="hidden sm:inline">{hasStoredKey ? "Key Added" : "BYOK"}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Bring Your Own Key</DialogTitle>
                    <DialogDescription>
                        Enter your Replicate API key to use your own billing. We won't charge you for generations.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    {hasStoredKey ? (
                        <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                            <div className="flex items-center gap-2 mb-2">
                                <CheckCircle2 className="w-5 h-5 text-green-500" />
                                <p className="font-medium text-green-500">API Key Active</p>
                            </div>
                            <p className="text-sm text-text-muted">
                                Your Replicate API key is currently being used for all generations.
                            </p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={handleRemoveKey}
                                className="mt-3 border-red-500/20 text-red-500 hover:bg-red-500/10"
                            >
                                <X className="w-4 h-4 mr-2" />
                                Remove Key
                            </Button>
                        </div>
                    ) : (
                        <div className="grid gap-2">
                            <Label htmlFor="api-key">Replicate API Key</Label>
                            <Input
                                id="api-key"
                                placeholder="r8_..."
                                value={apiKey}
                                onChange={(e) => setApiKey(e.target.value)}
                                type="password"
                            />
                            <p className="text-xs text-text-muted">
                                Your key is stored locally in your browser and never sent to our servers.
                            </p>
                        </div>
                    )}
                </div>
                {!hasStoredKey && (
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleVerify} disabled={!apiKey.trim() || isVerifying || isVerified}>
                            {isVerifying ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Verifying...
                                </>
                            ) : isVerified ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Verified
                                </>
                            ) : (
                                "Save Key"
                            )}
                        </Button>
                    </DialogFooter>
                )}
            </DialogContent>
        </Dialog>
    );
}
