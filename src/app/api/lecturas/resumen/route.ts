import { NextResponse } from 'next/server';
import { GeminiService } from '@/core/ai/service';
import { supabaseServerAdmin } from '@/lib/server/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Falta el id del recurso' }, { status: 400 });
    }

    // 1. Obtener la descripcion original de supabase
    const { data: recurso, error: fetchError } = await supabaseServerAdmin
      .from('recursos_lectura')
      .select('descripcion_original')
      .eq('id', id)
      .single();

    if (fetchError || !recurso) {
      return NextResponse.json({ error: 'Recurso no encontrado' }, { status: 404 });
    }

    if (!recurso.descripcion_original) {
      return NextResponse.json({ error: 'El recurso no tiene descripción para resumir' }, { status: 400 });
    }

    // 2. Pedir resumen a Gemini
    const systemInstruction = "Eres un experto en ciberseguridad. Tu objetivo es explicar de forma clara, sencilla y concisa (2 o 3 párrafos, tono claro para alguien que recién arranca) QUÉ ES este recurso y PARA QUÉ SIRVE en un contexto de aprendizaje de ciberseguridad, basándote ÚNICAMENTE en la descripción provista. Nunca pidas acceder a contenido de terceros, ni traduzcas contenido completo; solo explica su propósito basándote en el texto proporcionado.";
    const prompt = `Descripción original del recurso:\n\n${recurso.descripcion_original}`;

    const resumen = await GeminiService.askText('gemini-3.5-flash', systemInstruction, prompt);

    // 3. Guardar en supabase
    const { error: updateError } = await supabaseServerAdmin
      .from('recursos_lectura')
      .update({ resumen_es: resumen })
      .eq('id', id);

    if (updateError) {
      console.error('Error guardando resumen:', updateError);
      return NextResponse.json({ error: 'Error guardando el resumen' }, { status: 500 });
    }

    return NextResponse.json({ success: true, resumen }, { status: 200 });

  } catch (error: any) {
    console.error('Error generando resumen:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }
}
