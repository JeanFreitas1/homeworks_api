import env from '../config/environment';
import AWS from 'aws-sdk';
// var stream = require('stream');

export default async function getSingleFile(req, res) {
  const s3Client = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
  });

  const awsParams = {
    Bucket: env.AWS_BUCKET,
    Key: req.params.filename,
    Expires: 60 * 60 * 12,
  };

  const url = await s3Client.getSignedUrl('getObject', awsParams);

  res.status(200).json({ success: true, message: url });

  /* for downloading the file in pipe method */
  // s3Client
  //   .getObject(downloadParams)
  //   .on('error', function (err) {
  //     res.status(500).json({ error: 'Error -> ' + err });
  //   })
  //   .createReadStream()
  //   .pipe(res);
}
