import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Generate creative prompts based on title and type
function generatePrompt(title: string, artist: string, type: 'track' | 'album' | 'video'): string {
  const titleLower = title.toLowerCase();
  
  // Custom prompts based on common crypto/music themes
  const themePrompts: Record<string, string> = {
    'blockchain': 'Futuristic neon blockchain cubes floating in digital space with electric blue and purple circuits, album cover art style',
    'crypto': 'Golden cryptocurrency coins floating in a cosmic void with holographic effects, vibrant colors, album artwork',
    'moon': 'Rocket launching toward a glowing full moon through starfield, crypto symbols, synthwave colors, album cover',
    'beats': 'Abstract sound waves in neon colors, equalizer bars, musical notes flowing through digital matrix, album art',
    'love': 'Heart made of shimmering digital particles, romantic pink and gold gradients, futuristic love theme, album cover',
    'night': 'Cyberpunk city skyline at night with neon lights reflecting on wet streets, moody atmosphere, album artwork',
    'dream': 'Surreal dreamscape with floating islands, soft pastel clouds, ethereal glow, fantasy album cover',
    'fire': 'Flames merged with digital fire effects, orange and red gradient, intense energy, album artwork',
    'gold': 'Liquid gold flowing through abstract geometric shapes, luxury feel, warm metallic tones, album cover',
    'future': 'Sleek futuristic architecture in chrome and glass, floating in space, sci-fi album artwork',
    'electric': 'Electric lightning bolts in vibrant purple and blue, energy burst, dynamic motion, album cover',
    'wave': 'Ocean waves made of digital particles and light, deep blue and cyan, fluid motion, album artwork',
    'star': 'Constellation pattern forming a face, cosmic dust, twinkling stars, mystical album cover',
    'live': 'Concert stage with dramatic spotlights, crowd silhouettes, energetic atmosphere, live performance poster',
    'lagos': 'African-inspired patterns with modern geometric shapes, warm earth tones and vibrant accents, cultural fusion',
    'tokyo': 'Neon-lit Tokyo streets at night, Japanese characters, rain reflections, cyberpunk aesthetic',
    'rise': 'Sunrise over mountain peaks with golden rays, inspirational, triumphant mood, album artwork',
    'vibes': 'Abstract colorful sound waves in gradient rainbow colors, chill atmosphere, modern album cover',
  };
  
  // Find matching theme or generate generic prompt
  let basePrompt = '';
  for (const [keyword, prompt] of Object.entries(themePrompts)) {
    if (titleLower.includes(keyword)) {
      basePrompt = prompt;
      break;
    }
  }
  
  if (!basePrompt) {
    // Generic prompts based on type
    if (type === 'video') {
      basePrompt = `Cinematic thumbnail for "${title}" by ${artist}, dramatic lighting, professional video thumbnail style, 16:9 aspect ratio, bold text space`;
    } else {
      basePrompt = `Modern album cover art for "${title}" by ${artist}, abstract digital art, vibrant colors, professional music artwork, square format`;
    }
  }
  
  // Add artist influence
  return `${basePrompt}. Artist: ${artist}. High quality, professional, ultra detailed.`;
}

// Convert base64 to Uint8Array for upload
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Parse request body for optional filtering
    let body: { type?: string; id?: string } = {};
    try {
      body = await req.json();
    } catch {
      // No body provided, generate all
    }

    const results: { type: string; id: string; title: string; status: string; path?: string; error?: string }[] = [];

    // Fetch items based on filter or all
    const fetchItems = async () => {
      const items: { type: 'track' | 'album' | 'video'; id: string; title: string; artist: string; currentPath: string | null }[] = [];

      if (!body.type || body.type === 'album') {
        const { data: albums } = await supabase.from('albums').select('id, title, artist, cover_path');
        if (albums) {
          for (const album of albums) {
            if (!body.id || body.id === album.id) {
              items.push({ type: 'album', id: album.id, title: album.title, artist: album.artist, currentPath: album.cover_path });
            }
          }
        }
      }

      if (!body.type || body.type === 'track') {
        const { data: tracks } = await supabase.from('tracks').select('id, title, artist, cover_path');
        if (tracks) {
          for (const track of tracks) {
            if (!body.id || body.id === track.id) {
              items.push({ type: 'track', id: track.id, title: track.title, artist: track.artist, currentPath: track.cover_path });
            }
          }
        }
      }

      if (!body.type || body.type === 'video') {
        const { data: videos } = await supabase.from('videos').select('id, title, artist, thumbnail_path');
        if (videos) {
          for (const video of videos) {
            if (!body.id || body.id === video.id) {
              items.push({ type: 'video', id: video.id, title: video.title, artist: video.artist, currentPath: video.thumbnail_path });
            }
          }
        }
      }

      return items;
    };

    const items = await fetchItems();
    console.log(`Found ${items.length} items to process`);

    // Process items one by one to avoid rate limits
    for (const item of items) {
      try {
        console.log(`Generating cover for ${item.type}: ${item.title}`);
        
        const prompt = generatePrompt(item.title, item.artist, item.type);
        console.log(`Prompt: ${prompt}`);

        // Call Lovable AI for image generation
        const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash-image-preview',
            messages: [
              { role: 'user', content: prompt }
            ],
            modalities: ['image', 'text']
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          console.error(`AI API error for ${item.title}:`, errorText);
          results.push({ type: item.type, id: item.id, title: item.title, status: 'error', error: `AI API error: ${aiResponse.status}` });
          continue;
        }

        const aiData = await aiResponse.json();
        console.log(`AI response received for ${item.title}`);

        // Extract base64 image from response
        const imageData = aiData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        if (!imageData) {
          console.error(`No image in AI response for ${item.title}:`, JSON.stringify(aiData));
          results.push({ type: item.type, id: item.id, title: item.title, status: 'error', error: 'No image in AI response' });
          continue;
        }

        // Extract base64 data (remove data:image/png;base64, prefix)
        const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
        const imageBytes = base64ToUint8Array(base64Data);

        // Determine file path and extension
        const extension = imageData.includes('png') ? 'png' : 'jpg';
        const fileName = item.type === 'video' 
          ? `${item.id}_thumb.${extension}`
          : `${item.id}_cover.${extension}`;

        // Upload to covers bucket
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('covers')
          .upload(fileName, imageBytes, {
            contentType: `image/${extension}`,
            upsert: true
          });

        if (uploadError) {
          console.error(`Upload error for ${item.title}:`, uploadError);
          results.push({ type: item.type, id: item.id, title: item.title, status: 'error', error: `Upload failed: ${uploadError.message}` });
          continue;
        }

        // Get public URL
        const { data: publicUrlData } = supabase.storage
          .from('covers')
          .getPublicUrl(fileName);

        const publicUrl = publicUrlData.publicUrl;

        // Update database record
        const table = item.type === 'video' ? 'videos' : item.type === 'album' ? 'albums' : 'tracks';
        const pathColumn = item.type === 'video' ? 'thumbnail_path' : 'cover_path';

        const { error: updateError } = await supabase
          .from(table)
          .update({ [pathColumn]: publicUrl })
          .eq('id', item.id);

        if (updateError) {
          console.error(`DB update error for ${item.title}:`, updateError);
          results.push({ type: item.type, id: item.id, title: item.title, status: 'error', error: `DB update failed: ${updateError.message}` });
          continue;
        }

        console.log(`Successfully generated cover for ${item.title}: ${publicUrl}`);
        results.push({ type: item.type, id: item.id, title: item.title, status: 'success', path: publicUrl });

        // Add delay to avoid rate limits (1 second between requests)
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (itemError) {
        console.error(`Error processing ${item.title}:`, itemError);
        results.push({ 
          type: item.type, 
          id: item.id, 
          title: item.title, 
          status: 'error', 
          error: itemError instanceof Error ? itemError.message : 'Unknown error' 
        });
      }
    }

    return new Response(
      JSON.stringify({ 
        message: `Processed ${results.length} items`,
        results 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-covers function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
