import { Magic } from '@magic-sdk/admin';

const magic = new Magic(process.env.FESTIVAL_MAGIC_SECRET_KEY);

export const validateUserLoggedIn = async (request) => {
  const { authorization } = request.headers;

  if (authorization === undefined || !authorization.startsWith('Bearer ')) {
    throw new Error('Authorization header format invalid');
  }

  const didToken = authorization.substring(7);
  try {
    magic.token.validate(didToken);
  } catch {
    throw new Error('Token invalid');
  }

  let metadata;
  try {
    metadata = await magic.users.getMetadataByToken(didToken);
  } catch {
    throw new Error('Failed to get metadata from Magic');
  }

  if (metadata.email !== process.env.FESTIVAL_ADMIN_EMAIL) {
    throw new Error('Email address invalid');
  }
};
