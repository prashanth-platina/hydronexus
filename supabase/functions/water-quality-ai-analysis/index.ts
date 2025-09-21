import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openRouterApiKey = Deno.env.get('OPENROUTER_API_KEY');
if (!openRouterApiKey) {
  console.error('OPENROUTER_API_KEY environment variable is not set');
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SensorReading {
  ph_level: number | null;
  turbidity: number | null;
  temperature: number | null;
  bacterial_count: number | null;
  dissolved_oxygen: number | null;
  chlorine_level: number | null;
  tds_level: number | null;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reading } = await req.json();
    
    if (!reading) {
      return new Response(
        JSON.stringify({ error: 'No sensor reading provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const prompt = `Analyze the following water quality reading and provide causes and precautions in both English and Telugu:

Water Quality Data:
- pH Level: ${reading.ph_level || 'N/A'}
- Turbidity: ${reading.turbidity || 'N/A'} NTU
- Temperature: ${reading.temperature || 'N/A'}°C
- Bacterial Count: ${reading.bacterial_count || 'N/A'} CFU/ml
- Dissolved Oxygen: ${reading.dissolved_oxygen || 'N/A'} mg/L
- Chlorine Level: ${reading.chlorine_level || 'N/A'} ppm
- TDS Level: ${reading.tds_level || 'N/A'} ppm

Provide a JSON response with the following structure:
{
  "causes_en": "Detailed explanation of potential causes in English",
  "precautions_en": "Specific precautions and recommendations in English",
  "causes_te": "Detailed explanation of potential causes in Telugu",
  "precautions_te": "Specific precautions and recommendations in Telugu",
  "risk_level": "low|medium|high"
}

Consider WHO water quality standards:
- pH: 6.5-8.5 (safe range)
- TDS: <500 ppm (good), 500-1000 ppm (acceptable), >1000 ppm (poor)
- Turbidity: <1 NTU (excellent), 1-4 NTU (good)
- Chlorine: 0.2-0.5 ppm (safe for treated water)

Be specific about health risks and actionable precautions. Use clear, simple language that rural communities can understand.`;

    console.log('Sending request to OpenRouter API...');

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openRouterApiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://supabase.com',
        'X-Title': 'AquaGuard Water Analysis'
      },
      body: JSON.stringify({
        model: 'qwen/qwen-2.5-72b-instruct',
        messages: [
          {
            role: 'system',
            content: 'You are a water quality expert helping rural communities understand water safety. Provide accurate, actionable advice in both English and Telugu. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: "json_object" }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', response.status, errorText);
      throw new Error(`OpenRouter API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('OpenRouter API response received');

    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      throw new Error('Invalid response format from OpenRouter API');
    }

    const analysisText = data.choices[0].message.content;
    let analysis;
    
    try {
      analysis = JSON.parse(analysisText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback analysis if JSON parsing fails
      analysis = {
        causes_en: "Unable to analyze water quality data at this time.",
        precautions_en: "Please ensure water is properly treated before consumption. Boil water for at least 1 minute if unsure about quality.",
        causes_te: "ఈ సమయంలో నీటి నాణ్యతను విశ్లేషించలేకపోతున్నాము.",
        precautions_te: "నీటి నాణ్యత గురించి అనుమానం ఉంటే తాగే ముందు కనీసం 1 నిమిషం ఉడకబెట్టండి.",
        risk_level: "medium"
      };
    }

    return new Response(
      JSON.stringify({ analysis }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error in water-quality-ai-analysis function:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to analyze water quality',
        details: error.message 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});