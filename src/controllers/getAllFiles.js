import env from '../config/environment';
import AWS from 'aws-sdk';
import models from '../models';

const { File } = models;

export default async function getAllFiles(req, res) {
  const s3Client = new AWS.S3({
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
    region: env.AWS_REGION,
  });

  const awsParams = {
    Bucket: env.AWS_BUCKET,
  };

  // s3Client.listObjects(awsParams, function (err, data) {
  //   if (err) {
  //     res
  //       .status(500)
  //       .json({ success: false, message: 'Something went wrong!' });
  //   } else {
  //     const keys = data.Contents.map(function (obj) {
  //       return obj.Key;
  //     });
  //     res.status(200).json({ success: true, data: keys }); // successful response
  //   }
  // });
  // const fakeKeys = ['movie.mp4', 'music.mp3', 'image1.jpg', 'image2.jpg'];

  const files = await File.findAll();

  res.status(200).json({ success: true, data: files });
}
