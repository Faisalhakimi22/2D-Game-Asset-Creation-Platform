"use client";

import { useState } from "react";
import { Zap, CreditCard, Check } from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";
import { useUserProfileContext } from "@/contexts/UserProfileContext";

interface CreditPackage {
    id: string;
    credits: number;
    price: number;
    popular?: boolean;
    bonus?: number;
}

const CREDIT_PACKAGES: CreditPackage[] = [
    { id: "starter", credits: 100, price: 9.99 },
    { id: "popular", credits: 250, price: 19.99, popular: true, bonus: 25 },
    { id: "pro", credits: 500, price: 34.99, bonus: 75 },
    { id: "enterprise", credits: 1000, price: 59.99, bonus: 200 },
];

interface CreditsPurchaseModalProps {
    children: React.ReactNode;
}

export function CreditsPurchaseModal({ children }: CreditsPurchaseModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState<string | null>(null);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const { refreshProfile } = useUserProfileContext();

    const handlePurchase = async (packageId: string) => {
        const pkg = CREDIT_PACKAGES.find(p => p.id === packageId);
        if (!pkg) return;

        setIsPurchasing(true);
        setSelectedPackage(packageId);

        try {
            // TODO: Integrate with actual payment processor (Stripe, PayPal, etc.)
            // For now, simulate a purchase
            await new Promise(resolve => setTimeout(resolve, 2000));

            // TODO: Call your backend API to add credits after successful payment
            // const response = await fetch('/api/user/credits/add', {
            //     method: 'POST',
            //     headers: { 'Authorization': `Bearer ${idToken}` },
            //     body: JSON.stringify({ 
            //         credits: pkg.credits + (pkg.bonus || 0),
            //         reason: `Purchase: ${pkg.credits} credits package`
            //     })
            // });

            // Refresh user profile to show updated credits
            await refreshProfile();
            
            setIsOpen(false);
            alert(`Successfully purchased ${pkg.credits + (pkg.bonus || 0)} credits!`);
        } catch (error) {
            console.error('Purchase failed:', error);
            alert('Purchase failed. Please try again.');
        } finally {
            setIsPurchasing(false);
            setSelectedPackage(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Zap className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                        Purchase Credits
                    </DialogTitle>
                    <DialogDescription>
                        Choose a credit package to continue creating amazing game assets
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
                    {CREDIT_PACKAGES.map((pkg) => (
                        <Card 
                            key={pkg.id}
                            className={`cursor-pointer transition-all hover:shadow-md ${
                                pkg.popular ? 'border-primary bg-primary/5' : ''
                            }`}
                            onClick={() => handlePurchase(pkg.id)}
                        >
                            <CardContent className="p-4">
                                {pkg.popular && (
                                    <div className="flex justify-center mb-2">
                                        <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full font-semibold">
                                            Most Popular
                                        </span>
                                    </div>
                                )}
                                
                                <div className="text-center">
                                    <div className="flex items-center justify-center gap-1 mb-2">
                                        <Zap className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                                        <span className="text-2xl font-bold text-text">
                                            {pkg.credits}
                                        </span>
                                        {pkg.bonus && (
                                            <span className="text-sm text-green-500 font-semibold">
                                                +{pkg.bonus}
                                            </span>
                                        )}
                                    </div>
                                    
                                    <div className="text-sm text-text-muted mb-3">
                                        {pkg.bonus ? (
                                            <>
                                                {pkg.credits + pkg.bonus} total credits
                                                <div className="text-xs text-green-500">
                                                    {pkg.bonus} bonus credits included!
                                                </div>
                                            </>
                                        ) : (
                                            `${pkg.credits} credits`
                                        )}
                                    </div>

                                    <div className="text-xl font-bold text-text mb-3">
                                        ${pkg.price}
                                    </div>

                                    <Button
                                        className="w-full"
                                        disabled={isPurchasing}
                                        variant={pkg.popular ? "default" : "outline"}
                                    >
                                        {isPurchasing && selectedPackage === pkg.id ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-4 h-4 mr-2" />
                                                Purchase
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>

                <div className="text-xs text-text-muted text-center">
                    <p>• Credits never expire</p>
                    <p>• Secure payment processing</p>
                    <p>• Instant credit delivery</p>
                </div>
            </DialogContent>
        </Dialog>
    );
}