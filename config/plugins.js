// config/plugins.js
module.exports = ({ env }) => ({
  // ⚙️ Deja tu configuración actual de S3 tal cual
  upload: {
    config: {
      provider: 'aws-s3',
      providerOptions: {
        s3Options: {
          accessKeyId: env('AWS_ACCESS_KEY_ID'),
          secretAccessKey: env('AWS_ACCESS_SECRET'),
          region: env('AWS_REGION'),
          params: {
            Bucket: env('AWS_BUCKET_NAME'),
          },
        },
      },
      // Estos parámetros ayudan con ACL public-read (issue #5868)
      actionOptions: {
        upload: {
          ACL: null,
        },
        uploadStream: {
          ACL: null,
        },
      },
    },
  },

  // 🧩 Habilita el Content-Type Builder en staging
  // Si quieres solo en desarrollo: enabled: env('NODE_ENV') === 'development'
  'content-type-builder': {
    enabled: true,
  },
});
