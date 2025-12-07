"use client";

import { useState, useEffect } from "react";
import { FilamentProfile } from "@/types/filament";
import { db } from "@/lib/firebase";
import { collection, onSnapshot, query } from "firebase/firestore";
import { useAuth } from "@/components/auth-provider";
import { generateFilamentJson } from "@/lib/orcaslicer";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RefreshCw,
  FileJson,
  CheckCircle2,
  AlertCircle,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import TuningGuidesData from "@/app/tuning-guides.json";
import Logo from "@/assets/logo-alt.png";
import { redirect } from "next/dist/server/api-utils";
import Link from "next/link";

function getGuideImage(guide: any) {
  switch (guide.image) {
    case "Logo":
      return Logo;
    default:
      return guide.image;
  }
}

export function TuningView() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tuning Guide</h2>
          <p className="text-muted-foreground">
            Use these guides to adjust your filament profiles.
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {TuningGuidesData.data.map((guide: any) => (
          <Card key={guide.name}>
            <CardHeader>
              <CardTitle>{guide.name}</CardTitle>
              <CardDescription>{guide.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <Image
                src={getGuideImage(guide)}
                width={16}
                height={9}
                alt={guide.name}
                className="w-full aspect-16/9 object-cover rounded-lg"
              />

              <Link href={`/tuning?guide=${guide.id}`}>
                <Button className="mt-6">Start</Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
