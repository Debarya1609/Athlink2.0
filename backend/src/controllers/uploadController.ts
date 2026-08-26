import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { v4 as uuidv4 } from 'uuid';

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_KEY || ''; // Needs service role key for signing uploads
const supabase = createClient(supabaseUrl, supabaseKey);

export const getPresignedUrl = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const { fileName, fileType, fileSize } = req.body;

    // Validate request
    if (!fileName || !fileType || !fileSize) {
      res.status(400).json({ error: 'Missing file metadata' });
      return;
    }

    // Limit to 50MB
    if (fileSize > 50 * 1024 * 1024) {
      res.status(400).json({ error: 'File size exceeds 50MB limit' });
      return;
    }

    // Allowed types
    if (!['image/jpeg', 'image/png', 'video/mp4'].includes(fileType)) {
      res.status(400).json({ error: 'Invalid file type' });
      return;
    }

    const uniqueFileName = `${userId}/${uuidv4()}-${fileName}`;

    // Create signed upload URL
    const { data, error } = await supabase.storage
      .from('chat-media')
      .createSignedUploadUrl(uniqueFileName);

    if (error) throw error;

    // The CDN URL to access the file after upload
    const publicUrl = supabase.storage.from('chat-media').getPublicUrl(uniqueFileName).data.publicUrl;

    res.status(200).json({
      uploadUrl: data.signedUrl,
      publicUrl,
      mediaId: uuidv4() // structural ID
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate pre-signed URL' });
  }
};
