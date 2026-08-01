import { Request, Response } from 'express'
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary'

const configureCloudinary = (): boolean => {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME
  const apiKey = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return false
  }

  cloudinary.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret
  })

  return true
}

const uploadBufferToCloudinary = async (
  file: Express.Multer.File,
  folderName: string
): Promise<UploadApiResponse> => {
  const dataUri = `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
  
  const resourceType = file.mimetype.startsWith('video/') ? 'video' : 'image'

  return cloudinary.uploader.upload(dataUri, {
    folder: `athlink/${folderName}`,
    resource_type: resourceType
  })
}

export const uploadMedia = async (
  req: Request,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' })
      return
    }

    if (!req.file) {
      res.status(400).json({ error: 'Media file is required' })
      return
    }

    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/webp', 'image/gif',
      'video/mp4', 'video/webm', 'video/quicktime'
    ]

    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      res.status(400).json({ error: 'Invalid file type. Only standard images and videos are allowed.' })
      return
    }

    if (!configureCloudinary()) {
      res.status(500).json({ error: 'Cloudinary is not configured' })
      return
    }

    // Identify if the upload is for feed, messages, or listings based on query or just generic
    const folder = (req.query.folder as string) || 'uploads'

    const uploadResult = await uploadBufferToCloudinary(req.file, folder)

    const mediaType = req.file.mimetype.startsWith('video/') ? 'video' : 'image'

    res.status(201).json({ 
      data: {
        url: uploadResult.secure_url,
        media_type: mediaType,
        public_id: uploadResult.public_id,
        format: uploadResult.format,
        bytes: uploadResult.bytes
      } 
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    res.status(500).json({ error: message })
  }
}
