import env from '../config/environment';
import AWS from 'aws-sdk';
import models from '../models';
import sequelize from 'sequelize';

const { File, User } = models;
//precisa receber fileName e retorna uma promise
export async function getUploadId(req, res) {
  try {
    const { fileName } = req.body;

    const s3Client = new AWS.S3({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
    });

    const nameUsed = await File.findOne({ where: { filename: fileName } });

    if (nameUsed) {
      return res.status(404).json({
        success: false,
        message: 'A file with this name is already uploaded',
      });
    }

    const awsParams = {
      Bucket: env.AWS_BUCKET,
      Key: fileName,
      Expires: 60 * 20, //20min
      // ContentType: 'application/octet-stream',
    };

    const multiPartUpload = await s3Client
      .createMultipartUpload(awsParams)
      .promise();
    return res.status(200).json({ uploadId: multiPartUpload.UploadId });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: err });
  }
}

export async function getUploadPart(req, res) {
  try {
    const { fileName, partNumber, uploadId } = req.body;
    const s3Client = new AWS.S3({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
    });

    const awsParams = {
      Bucket: env.AWS_BUCKET,
      Key: fileName,
      PartNumber: partNumber,
      UploadId: uploadId,
      // ContentType: 'application/octet-stream',
    };

    const preSignedUrl = await s3Client.getSignedUrl('uploadPart', awsParams);
    res.status(200).json({ preSignedUrl: preSignedUrl });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
}

export async function completeUpload(req, res) {
  try {
    const { fileName, parts, uploadId, jwt, size, type } = req.body;
    const s3Client = new AWS.S3({
      accessKeyId: env.AWS_ACCESS_KEY_ID,
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
      region: env.AWS_REGION,
    });

    const awsParams = {
      Bucket: env.AWS_BUCKET,
      Key: fileName,
      MultipartUpload: {
        Parts: parts,
      },
      UploadId: uploadId,
      // ContentType: 'application/octet-stream',
    };
    const user = await User.findOne({ where: { email: jwt.email } });
    console.log(user.id);
    console.log(fileName, size, type);

    await File.create({
      filename: fileName,
      size,
      type,
      UserId: user.id,
    });

    const completeUpload = await s3Client
      .completeMultipartUpload(awsParams)
      .promise();

    res.status(200).json({ completeUpload });
  } catch (error) {
    res.status(500).json({ success: false, message: error });
  }
}
