
"use client"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import TuningGuideData from "@/app/tuning-guides.json"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import Logo from "@/assets/logo-alt.png"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useAuth } from "@/components/auth-provider"
import { useEffect, useState } from "react"
import { collection, query, onSnapshot } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { FilamentProfile } from "@/types/profile"


function getGuideImage(guide: any) {
    switch (guide.image) {
        case "Logo": return Logo;
        default: return guide.image;
    }
}

export default function Page() {
    const searchParams = useSearchParams();
    const guide = searchParams.get("guide");
    const { user } = useAuth();

    // State for filaments and form values
    const [filaments, setFilaments] = useState<FilamentProfile[]>([]);
    const [selectedFilament, setSelectedFilament] = useState<string>("");
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    // Fetch filaments from Firebase
    useEffect(() => {
        if (!user) return;

        const q = query(collection(db, "users", user.uid, "filaments"));
        const unsubscribe = onSnapshot(q, (querySnapshot) => {
            const profiles: FilamentProfile[] = [];
            querySnapshot.forEach((doc) => {
                profiles.push({ id: doc.id, ...doc.data() } as FilamentProfile);
            });
            setFilaments(profiles);
        });

        return () => unsubscribe();
    }, [user]);

    //get the current guide from searchparams
    const currentGuide = TuningGuideData.data.find((g: any) => g.id === guide);

    //display the steps in the guide
    if (!currentGuide) {
        return (
            <div className="container mx-auto p-6 max-w-4xl">
                <Link href={`/dashboard?view=tune`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-6">
                    <ArrowLeft className="w-4 h-4"/>
                    <span>Back to Tuning Guides</span>
                </Link>
                <Card>
                    <CardHeader>
                        <CardTitle>Guide Not Found</CardTitle>
                        <CardDescription>The requested tuning guide could not be found.</CardDescription>
                    </CardHeader>
                </Card>
            </div>
        )
    }

    return (
        <div className="container mx-auto p-6 max-w-4xl">
            {/* Header with back button */}
            <div className="mb-6">
                <Link href={`/dashboard?view=tune`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <ArrowLeft className="w-4 h-4"/>
                    <span>Back to Tuning Guides</span>
                </Link>
            </div>

            {/* Guide Overview Card */}
            <Card className="mb-8">
                <CardHeader>
                    <CardTitle className="text-3xl">{currentGuide.name}</CardTitle>
                    <CardDescription className="text-base">{currentGuide.intro}</CardDescription>
                </CardHeader>
            </Card>

            {/* Steps Section */}
            <div className="space-y-6">
                <h2 className="text-2xl font-semibold">Steps</h2>
                {currentGuide.steps.map((step: any, index: number) => (
                    <Card key={step.step} className="overflow-hidden">
                        <CardHeader>
                            <div className="flex items-center gap-3">
                                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                                    {step.step}
                                </div>
                                <CardTitle className="text-xl">{step.title}</CardTitle>
                            </div>
                            <CardDescription className="mt-6 text-muted-foreground">{step.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            
                            {step.image && (
                                <div className="rounded-lg overflow-hidden bg-muted">
                                    <Image 
                                        src={Logo} 
                                        width={16} 
                                        height={9} 
                                        alt={`Step ${step.step}`} 
                                        className="w-full aspect-video object-cover"
                                    />
                                </div>
                            )}
                            
                            {/* Filament Select */}
                            {step.select === "filament" && (
                                <div className="space-y-2">
                                    <Label htmlFor={`step-${step.step}-filament`}>Select Filament</Label>
                                    <Select value={selectedFilament} onValueChange={setSelectedFilament}>
                                        <SelectTrigger id={`step-${step.step}-filament`} className="w-full">
                                            <SelectValue placeholder="Choose a filament..." />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {filaments.map((filament) => (
                                                <SelectItem key={filament.id} value={filament.id}>
                                                    {filament.printerName} - {filament.brand} - {filament.type} ({filament.color})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            {/* Text Input (for future temperature input, etc.) */}
                            {step.input && (
                                <div className="space-y-2">
                                    <Label htmlFor={`step-${step.step}-input`}>
                                        {step.inputLabel || "Enter value"}
                                    </Label>
                                    <Input
                                        id={`step-${step.step}-input`}
                                        type={step.inputType || "text"}
                                        placeholder={step.inputPlaceholder || ""}
                                        value={formValues[`step-${step.step}`] || ""}
                                        onChange={(e) => setFormValues({
                                            ...formValues,
                                            [`step-${step.step}`]: e.target.value
                                        })}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}