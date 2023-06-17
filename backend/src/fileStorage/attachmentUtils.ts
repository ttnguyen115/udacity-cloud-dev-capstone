import * as AWS from 'aws-sdk'
import { createLogger } from '../utils/logger'
const AWSXRay = require('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('fileStorage - AttachmentUtils')
const s3BucketName = process.env.ATTACHMENT_S3_BUCKET
const urlExpiration = process.env.SIGNED_URL_EXPIRATION

export class AttachmentUtils {
  constructor(
    private readonly s3 = new XAWS.S3({ signatureVersion: 'v4' }),
    private readonly bucketName = s3BucketName
  ) {}

  getAttachmentUrl(todoId: string): string {
    return `https://${this.bucketName}.s3.amazonaws.com/${todoId}`
  }

  getUploadUrl(todoId: string): string {
    try {
      const url = this.s3.getSignedUrl('putObject', {
        Bucket: this.bucketName,
        Key: todoId,
        Expires: Number(urlExpiration)
      })
      return url as string
    } catch (error) {
      logger.error('Failed to getUploadUrl', error)
    }
  }
}
