// config/plugins.js
module.exports = ({ env }) => ({
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_ACCESS_SECRET'),
          region: env('AWS_REGION'),
          params: { Bucket: env('AWS_BUCKET_NAME') },
        },
      },
      actionOptions: {
        upload: { ACL: null },
        uploadStream: { ACL: null },
      },
    },
  },

  graphql: {
    enabled: true,
    config: {
      endpoint: '/graphql',
      shadowCRUD: true,
      playgroundAlways: false, // pon true solo si necesitas Playground en prod
      defaultLimit: 25,
      maxLimit: 100,
    },
  },

  'content-type-builder': {
    enabled: true, // en prod no permite editar aunque esté true
  },
});
