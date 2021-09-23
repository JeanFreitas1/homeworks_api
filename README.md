# Homeworks API Project

## Who am I?

Hi, my name is Jean, I'm 27 years old and I'm an engineering student with a passion for programming. I started to develop this API as a way to train my skills.

## General Configurations

Need to set the following variables in .env file

- _NODE_ENV_
- _DATABASE_URL_
- _JWT_ACCESS_TOKEN_SECRET_
- _JWT_REFRESH_TOKEN_SECRET_
- _SALT_ROUNDS_

## Root User First Database Installation

For first installation of the database is necessary to insert a root user. To accomplish this, you need to set this environment variables and after first `npm start` you should remove this variables.

- _SYSTEM_INITIALIZED_=true
- _ROOT_USERNAME_=your-user-name
- _ROOT_PASSWORD_=your-password
- _ROOT_EMAIL_=your-email

## Amazon S3 Storage API Configuration

This are variables for our API to communicate with AWS S3 Storage Services

- _AWS_ACCESS_KEY_ID_=your-user-key-id
- _AWS_SECRET_ACCESS_KEY_=your-user-access-key
- _AWS_REGION_=your-region
- _AWS_BUCKET_=your-bucket-name
