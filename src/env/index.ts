import "dotenv/config";
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),

  PATH_IMAGES: z.coerce.string(),
  S3_BUCKET: z.coerce.string(),
  S3_ACCESS_KEY: z.coerce.string(),
  S3_SECRET_KEY: z.coerce.string(),
  S3_ENDPOINT: z.coerce.string(),
  S3_FOLDER: z.coerce.string(),
});

const _env = envSchema.safeParse(process.env);

if (_env.success === false) {
  console.error(
    "Invalid environment variable" + JSON.stringify(_env.error.format())
  );

  throw new Error("Invalid environment variable.");
}

export const env = _env.data;
