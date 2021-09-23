import env from '../config/environment';
import AWS from 'aws-sdk';
import models from '../models';
// var stream = require('stream');

const { File } = models;

export default async function deleteSingleFile(req, res) {
  const s3Client = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
  });

  const awsParams = {
    Bucket: env.AWS_BUCKET,
    Key: req.params.filename,
  };

  await s3Client.deleteObject(awsParams, async function (err, data) {
    if (err) {
      console.log(err, err.stack);
      res.status(500).json({ success: false, message: err.message });
    } else {
      await File.destroy({ where: { filename: req.params.filename } });

      res.status(200).json({ success: true });
    }
  });
}
