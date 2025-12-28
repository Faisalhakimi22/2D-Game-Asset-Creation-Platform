"use client";

import { useState, useEffect } from "react";
import { Key, Check, X, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
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

const GEMINI_KEY_STORAGE = "gemini_api_key";
const REPLICATE_KEY_STORAGE = "replicate_api_key";

type KeyProvider = "gemini" | "replicate";

export function BYOKButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedProvider, setSelectedProvider] = useState<KeyProvider>("gemini");
    const [apiKey, setApiKey] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationError, setVerificationError] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [storedKeys, setStoredKeys] = useState<{ gemini: boolean; replicate: boolean }>({ gemini: false, replicate: false });

    // Check if keys exist on mount
    useEffect(() => {
        setStoredKeys({
            gemini: !!localStorage.getItem(GEMINI_KEY_STORAGE),
            replicate: !!localStorage.getItem(REPLICATE_KEY_STORAGE),
        });
    }, []);

    const hasAnyKey = storedKeys.gemini || storedKeys.replicate;

    const handleVerify = async () => {
        if (!apiKey.trim()) return;

        setIsVerifying(true);
        setVerificationError("");
        
        try {
            if (selectedProvider === "gemini") {
                // Verify Gemini API key
                const response = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey.trim()}`
                );
                
                if (response.ok) {
                    setIsVerified(true);
                    localStorage.setItem(GEMINI_KEY_STORAGE, apiKey.trim());
                    setStoredKeys(prev => ({ ...prev, gemini: true }));
                    setTimeout(() => setIsOpen(false), 1000);
                } else {
                    const error = await response.json().catch(() => ({}));
                    setVerificationError(error.error?.message || "Invalid Gemini API key.");
                }
            } else {
                // Verify Replicate API key
                const response = await fetch("https://api.replicate.com/v1/account", {
                    headers: { "Authorization": `Token ${apiKey.trim()}` }
                });
                
                if (response.ok) {
                    setIsVerified(true);
                    localStorage.setItem(REPLICATE_KEY_STORAGE, apiKey.trim());
                    setStoredKeys(prev => ({ ...prev, replicate: true }));
                    setTimeout(() => setIsOpen(false), 1000);
                } else {
                    setVerificationError("Invalid Replicate API key.");
                }
            }
        } catch (error) {
            setVerificationError("Failed to verify API key. Please check your connection.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRemoveKey = (provider: KeyProvider) => {
        if (provider === "gemini") {
            localStorage.removeItem(GEMINI_KEY_STORAGE);
            setStoredKeys(prev => ({ ...prev, gemini: false }));
        } else {
            localStorage.removeItem(REPLICATE_KEY_STORAGE);
            setStoredKeys(prev => ({ ...prev, replicate: false }));
        }
    };

    const resetForm = () => {
        setVerificationError("");
        setIsVerified(false);
        setApiKey("");
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) resetForm();
        }}>
            <DialogTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm transition-all duration-300 backdrop-blur-sm ${hasAnyKey
                            ? "border-green-500/50 bg-green-500/10 hover:bg-green-500/20 text-green-400"
                            : "border-slate-700 hover:border-primary/50 hover:text-primary text-slate-300 bg-slate-900/40"
                        }`}
                >
                    {hasAnyKey ? (
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                    ) : (
                        <Key className="w-3 h-3 text-xs" />
                    )}
                    <span className="hidden sm:inline">{hasAnyKey ? "Key Added" : "BYOK"}</span>
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Bring Your Own Key</DialogTitle>
                    <DialogDescription>
                        Add your API keys to use your own billing. We won't charge you credits for generations.
                    </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                    {/* Active Keys Section */}
                    {hasAnyKey && (
                        <div className="space-y-3">
                            <Label className="text-sm font-medium">Active Keys</Label>
                            
                            {storedKeys.gemini && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-green-400">Gemini API Key</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveKey("gemini")}
                                        className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                            
                            {storedKeys.replicate && (
                                <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                                        <span className="text-sm text-green-400">Replicate API Key</span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveKey("replicate")}
                                        className="h-7 px-2 text-red-400 hover:text-red-300 hover:bg-red-500/10"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {/* Add New Key Section */}
                    <div className="space-y-3 pt-2">
                        <Label className="text-sm font-medium">
                            {hasAnyKey ? "Add Another Key" : "Add API Key"}
                        </Label>
                        
                        {/* Provider Selection */}
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant={selectedProvider === "gemini" ? "default" : "outline"}
                                size="sm"
                                onClick={() => { setSelectedProvider("gemini"); resetForm(); }}
                                className={`flex-1 ${selectedProvider === "gemini" ? "bg-primary" : ""}`}
                                disabled={storedKeys.gemini}
                            >
                                Gemini {storedKeys.gemini && "✓"}
                            </Button>
                            <Button
                                type="button"
                                variant={selectedProvider === "replicate" ? "default" : "outline"}
                                size="sm"
                                onClick={() => { setSelectedProvider("replicate"); resetForm(); }}
                                className={`flex-1 ${selectedProvider === "replicate" ? "bg-primary" : ""}`}
                                disabled={storedKeys.replicate}
                            >
                                Replicate {storedKeys.replicate && "✓"}
                            </Button>
                        </div>
                        
                        {/* Key Input */}
                        {!(storedKeys.gemini && storedKeys.replicate) && (
                            <>
                                <Input
                                    placeholder={selectedProvider === "gemini" ? "AIza..." : "r8_..."}
                                    value={apiKey}
                                    onChange={(e) => {
                                        setApiKey(e.target.value);
                                        setVerificationError("");
                                    }}
                                    type="password"
                                />
                                
                                {verificationError && (
                                    <p className="text-xs text-red-500">{verificationError}</p>
                                )}
                                
                                <div className="text-xs text-text-muted space-y-1">
                                    <p>Your key is stored locally and never sent to our servers.</p>
                                    <a 
                                        href={selectedProvider === "gemini" 
                                            ? "https://aistudio.google.com/app/apikey"
                                            : "https://replicate.com/account/api-tokens"
                                        }
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-1 text-primary hover:underline"
                                    >
                                        Get your {selectedProvider === "gemini" ? "free Gemini" : "Replicate"} API key
                                        <ExternalLink className="w-3 h-3" />
                                    </a>
                                </div>
                            </>
                        )}
                    </div>
                </div>
                
                <DialogFooter>
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                        {hasAnyKey ? "Done" : "Cancel"}
                    </Button>
                    {!(storedKeys.gemini && storedKeys.replicate) && (
                        <Button 
                            onClick={handleVerify} 
                            disabled={!apiKey.trim() || isVerifying || isVerified}
                        >
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
                                "Verify & Save"
                            )}
                        </Button>
                    )}
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

// Helper functions to get stored API keys
export function getGeminiApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(GEMINI_KEY_STORAGE);
}

export function getReplicateApiKey(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(REPLICATE_KEY_STORAGE);
}

export function getStoredApiKey(): { key: string | null; provider: 'gemini' | 'replicate' | null } {
    const replicateKey = getReplicateApiKey();
    if (replicateKey) {
        return { key: replicateKey, provider: 'replicate' };
    }
    const geminiKey = getGeminiApiKey();
    if (geminiKey) {
        return { key: geminiKey, provider: 'gemini' };
    }
    return { key: null, provider: null };
}

// Legacy function for backward compatibility
export function getApiKey(): string | null {
    return getReplicateApiKey() || getGeminiApiKey();
}
