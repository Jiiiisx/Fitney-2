'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

export default function CompleteProfileBanner({ isVisible = true }: { isVisible?: boolean }) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className="bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800/50 mb-8">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-blue-900 dark:text-blue-200">Lengkapi Profil Anda</CardTitle>
          <CardDescription className="text-blue-700 dark:text-blue-300 mt-1">
            Dapatkan rekomendasi yang lebih akurat dengan menambahkan detail seperti tinggi dan berat badan.
          </CardDescription>
        </div>
        <Button asChild>
          <Link href="/settings">
            Lengkapi Sekarang <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
    </Card>
  );
}
