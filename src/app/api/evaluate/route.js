// src/app/api/evaluate/route.js

import { NextResponse } from 'next/server';
import { evaluateFuzzyLogic } from '@/utils/fuzzy'; 

export async function POST(request) {
  try {
    // 2. Ambil data dari request
    const body = await request.json();

    // 3. Panggil fungsi dari file utilitas untuk mendapatkan hasil
    const results = evaluateFuzzyLogic(body);

    // 4. Kembalikan hasil dalam format JSON
    return NextResponse.json(results);
    
  } catch (error) {
    // Penanganan error jika terjadi masalah
    console.error("API Error:", error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}