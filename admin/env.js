import dotenv from 'dotenv';

let result = dotenv.config({ path: '../.env' });
if (result.error) {
  result = dotenv.config({ path: '.env' });

  if (result.error) {
    throw result.error;
  }
}
