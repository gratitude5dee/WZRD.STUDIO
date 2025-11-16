// ============================================================================
// EDGE FUNCTION: asset-upload
// PURPOSE: Handle multipart file uploads with validation and processing
// ROUTE: POST /functions/v1/asset-upload
// ============================================================================

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface UploadRequest {
  projectId?: string;
  assetType: "image" | "video" | "audio" | "document" | "model" | "font" | "other";
  assetCategory: "upload" | "generated" | "system" | "template";
  visibility: "private" | "project" | "public";
  file: {
    name: string;
    type: string;
    size: number;
    base64: string;
  };
}

interface UploadResponse {
  success: boolean;
  assetId?: string;
  asset?: any;
  error?: string;
  errors?: Array<{ field: string; message: string }>;
}

// File size limits by type (bytes)
const FILE_SIZE_LIMITS = {
  image: 50 * 1024 * 1024, // 50MB
  video: 500 * 1024 * 1024, // 500MB
  audio: 100 * 1024 * 1024, // 100MB
  document: 25 * 1024 * 1024, // 25MB
  model: 100 * 1024 * 1024, // 100MB
  font: 10 * 1024 * 1024, // 10MB
  other: 50 * 1024 * 1024, // 50MB
};

// Allowed MIME types by asset type
const ALLOWED_MIME_TYPES: Record<string, string[]> = {
  image: ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml"],
  video: ["video/mp4", "video/quicktime", "video/webm", "video/x-msvideo"],
  audio: ["audio/mpeg", "audio/wav", "audio/ogg", "audio/webm", "audio/aac"],
  document: ["application/pdf", "application/json"],
  model: ["model/gltf-binary", "model/gltf+json"],
  font: ["font/ttf", "font/otf", "font/woff", "font/woff2"],
  other: ["*/*"],
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Initialize Supabase client with user context
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization")! },
        },
      }
    );

    // Verify authentication
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, error: "Unauthorized" }),
        {
          status: 401,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Parse request body
    const body: UploadRequest = await req.json();
    const { projectId, assetType, assetCategory, visibility, file } = body;

    // Validation
    const errors: Array<{ field: string; message: string }> = [];

    if (!file || !file.name || !file.type || !file.base64) {
      errors.push({ field: "file", message: "File data is required" });
    }

    if (!assetType) {
      errors.push({ field: "assetType", message: "Asset type is required" });
    }

    if (!assetCategory) {
      errors.push({
        field: "assetCategory",
        message: "Asset category is required",
      });
    }

    // Check file size
    if (file && file.size > FILE_SIZE_LIMITS[assetType]) {
      errors.push({
        field: "file",
        message: `File size exceeds limit for ${assetType} (max ${FILE_SIZE_LIMITS[assetType] / 1024 / 1024}MB)`,
      });
    }

    // Check MIME type
    if (file && assetType) {
      const allowedTypes = ALLOWED_MIME_TYPES[assetType] || [];
      if (
        !allowedTypes.includes("*/*") &&
        !allowedTypes.includes(file.type)
      ) {
        errors.push({
          field: "file",
          message: `File type ${file.type} not allowed for ${assetType}`,
        });
      }
    }

    // Validate project exists if projectId provided
    if (projectId) {
      const { data: project, error: projectError } = await supabaseClient
        .from("projects")
        .select("id")
        .eq("id", projectId)
        .eq("user_id", user.id)
        .single();

      if (projectError || !project) {
        errors.push({
          field: "projectId",
          message: "Project not found or access denied",
        });
      }
    }

    if (errors.length > 0) {
      return new Response(
        JSON.stringify({ success: false, errors }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomId = crypto.randomUUID().split("-")[0];
    const extension = file.name.split(".").pop() || "";
    const sanitizedName = file.name
      .replace(/[^a-zA-Z0-9.-]/g, "_")
      .substring(0, 50);
    const fileName = `${timestamp}_${randomId}_${sanitizedName}`;

    // Storage path: {userId}/{projectId}/{assetType}/{fileName}
    const storagePath = projectId
      ? `${user.id}/${projectId}/${assetType}/${fileName}`
      : `${user.id}/${assetType}/${fileName}`;

    // Convert base64 to Uint8Array
    const fileData = Uint8Array.from(atob(file.base64), (c) => c.charCodeAt(0));

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabaseClient
      .storage
      .from("project-assets")
      .upload(storagePath, fileData, {
        contentType: file.type,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return new Response(
        JSON.stringify({
          success: false,
          error: `Upload failed: ${uploadError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get public URL
    const { data: urlData } = supabaseClient
      .storage
      .from("project-assets")
      .getPublicUrl(storagePath);

    // Create database record
    const { data: asset, error: dbError } = await supabaseClient
      .from("project_assets")
      .insert({
        user_id: user.id,
        project_id: projectId || null,
        file_name: fileName,
        original_file_name: file.name,
        mime_type: file.type,
        file_size_bytes: file.size,
        asset_type: assetType,
        asset_category: assetCategory,
        storage_provider: "supabase",
        storage_bucket: "project-assets",
        storage_path: storagePath,
        cdn_url: urlData.publicUrl,
        processing_status: "pending",
        visibility: visibility || "private",
        media_metadata: {},
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);

      // Cleanup: Delete uploaded file
      await supabaseClient
        .storage
        .from("project-assets")
        .remove([storagePath]);

      return new Response(
        JSON.stringify({
          success: false,
          error: `Database error: ${dbError.message}`,
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Queue processing job (thumbnail generation, metadata extraction, etc.)
    await supabaseClient.from("processing_queue").insert({
      asset_id: asset.id,
      job_type: "process_asset",
      priority: 1,
    });

    return new Response(
      JSON.stringify({
        success: true,
        assetId: asset.id,
        asset,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || "Internal server error",
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
