import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

serve(async (req: Request): Promise<Response> => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { video_url }: { video_url: string } = await req.json();

    if (!video_url || typeof video_url !== 'string') {
      return new Response(JSON.stringify({ thumbnail_url: null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Step 1: Extract video ID from URL ──────────────────────────────────
    const videoIdMatch = video_url.match(
      /tiktok\.com\/@[\w.]+\/video\/(\d+)|tiktok\.com\/v\/(\d+)|v[mt]\.tiktok\.com\/([a-zA-Z0-9_-]+)/
    );
    const videoId = videoIdMatch?.[1] ?? videoIdMatch?.[2] ?? videoIdMatch?.[3];

    if (!videoId) {
      return new Response(JSON.stringify({ thumbnail_url: null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Step 2: Init Supabase admin client ─────────────────────────────────
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, // service role to bypass RLS
    );

    // ── Step 3: Check if we already have a stored thumbnail for this video ─
    const { data: existing } = await supabaseAdmin
      .from('technician_videos')
      .select('thumbnail_url')
      .eq('video_url', video_url)
      .maybeSingle();

    // If already stored in our own storage (not a TikTok CDN URL), return it
    if (existing?.thumbnail_url && !existing.thumbnail_url.includes('tiktokcdn')) {
      return new Response(JSON.stringify({ thumbnail_url: existing.thumbnail_url }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Step 4: Fetch thumbnail URL from TikTok oEmbed ────────────────────
    const oembedEndpoint = `https://www.tiktok.com/oembed?url=${encodeURIComponent(video_url)}`;
    const oembedRes = await fetch(oembedEndpoint, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!oembedRes.ok) {
      return new Response(JSON.stringify({ thumbnail_url: null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const oembedData = await oembedRes.json();
    const cdnUrl: string | null = oembedData.thumbnail_url || null;

    if (!cdnUrl) {
      return new Response(JSON.stringify({ thumbnail_url: null }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Step 5: Download the image from TikTok CDN ────────────────────────
    const imageRes = await fetch(cdnUrl, {
      headers: {
        'Referer': 'https://www.tiktok.com/',
        'User-Agent': 'Mozilla/5.0 (compatible; Mekh/1.0)',
      },
    });

    if (!imageRes.ok) {
      // CDN fetch failed — return the raw CDN URL as fallback (better than nothing)
      return new Response(JSON.stringify({ thumbnail_url: cdnUrl }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const imageBuffer = await imageRes.arrayBuffer();
    const contentType = imageRes.headers.get('content-type') || 'image/jpeg';
    const ext = contentType.includes('png') ? 'png' : 'jpg';
    const fileName = `tiktok-${videoId}.${ext}`;

    // ── Step 6: Upload to Supabase Storage ────────────────────────────────
    const { error: uploadError } = await supabaseAdmin.storage
      .from('thumbnails')
      .upload(fileName, imageBuffer, {
        contentType,
        upsert: true, // overwrite if exists
      });

    if (uploadError) {
      console.error('Storage upload error:', uploadError.message);
      // Fall back to CDN URL if upload fails
      return new Response(JSON.stringify({ thumbnail_url: cdnUrl }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // ── Step 7: Get the permanent public URL ──────────────────────────────
    const { data: { publicUrl } } = supabaseAdmin.storage
      .from('thumbnails')
      .getPublicUrl(fileName);

    // ── Step 8: Save permanent URL back to DB ─────────────────────────────
    await supabaseAdmin
      .from('technician_videos')
      .update({ thumbnail_url: publicUrl })
      .eq('video_url', video_url);

    return new Response(JSON.stringify({ thumbnail_url: publicUrl }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('get-tiktok-thumbnail error:', err);
    return new Response(JSON.stringify({ thumbnail_url: null }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});