'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export default function CompleteProfileBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkProfile = async () => {
      try {
        const res = await fetch("/api/users/profile", {
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();

          const isProfileIncomplete = !data.height || !data.weight || !data.dob || !data.gender;
          const needsOnBoarding = !data.hasCompletedOnboarding;

          if (isProfileIncomplete || needsOnBoarding) {
            setIsVisible(true);
          }
        }
      } catch (error) {
        console.error("Failed to check profile status", error);
      } finally {
        setLoading(false);
      }
    };

    checkProfile();
  }, []);

  if (loading || !isVisible) return null;

  return (
    <Card className='bg-gradient-to-r from-blue-600 to-indigo-700 border-none shadow-md mb-8 overflow-hidden relative'>
      <div className='absolute top-0 right-0 p-8 opacity-10 pointer-events-none'>
        <Sparkles className='w-40 h-40 text-white' />
      </div>

      <CardContent className='p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10'>
        <div className='space-y-2 text-white'>
          <h3 className='text-xl font-bold flex items-center gap-2'>
            <Sparkles className='w-5 h-5 text-yellow-300' />
            Lengkapi Profil Anda!
          </h3>
          <p className='text-blue-100 max-w-lg'>
            Agar Fitney bisa memberikan rekomendasi latihan dan nutrisi yang akurat,
            kami butuh data tubuh Anda yang terbaru.
          </p>
        </div>

        <Link href='/settings'>
          <Button
            variant='secondary'
            className='whitespace-nowrap bg-white text-blue-700 hover:bg-blue-50 font-semibold shadow-sm'
          >
            Lengkapi Sekarang
            <ArrowRight className='w-4 h-4 ml-2' />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}