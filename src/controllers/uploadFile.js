import env from '../config/environment';
import AWS from 'aws-sdk';
import models from '../models';

const { File, User } = models;

export default async function uploadFile(req, res) {
  const { fileName, fileSize, fileType, jwt } = req.body;

  const s3Client = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
  });

  const awsParams = {
    Bucket: env.AWS_BUCKET,
    Key: fileName,
    Expires: 60 * 60 * 4, //4h
    ContentType: 'application/octet-stream',
  };

  try {
    const user = await User.findOne({ where: { email: jwt.email } });

    if (!user) {
      throw Error('No user was found');
    }

    // const url = await s3Client.getSignedUrl('putObject', awsParams)

    // console.log(fileName, fileSize, fileType, user.id);

    const file = await File.create({
      fileName,
      fileSize,
      fileType,
      UserId: user.id,
    });

    res.status(200).json({ success: true, preSignedUrl: url });
  } catch (err) {
    res.status(500).json({ success: false, message: err.error });
  }
}
