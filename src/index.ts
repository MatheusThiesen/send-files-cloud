import { $ } from "bun";
import type { queueAsPromised } from "fastq";
import * as fastq from "fastq";
import path from "path";
import sharp from "sharp";
import { env } from "./env";
import { s3Service } from "./services/aws-s3";
import { removeExtension } from "./utils/removeExtension";

type Task = {
  filename: string;
  queuePosition: string;
};

async function worker({ filename, queuePosition }: Task) {
  const filepath = path.resolve(env.PATH_IMAGES, filename);

  const [compressFile, compressFileMini] = await Promise.all([
    await sharp(filepath)
      .flatten({ background: "#ffffff" })
      .resize({
        width: 900,
      })
      .webp({
        quality: 70,
      })
      .toBuffer(),
    await sharp(filepath)
      .flatten({ background: "#ffffff" })
      .resize({
        width: 300,
      })
      .webp({
        quality: 70,
      })
      .toBuffer(),
  ]);

  const [fileLink] = await Promise.all([
    s3Service.updateFile(
      `${env.S3_FOLDER}${removeExtension(filename)}`,
      compressFile,
      "images"
    ),
    s3Service.updateFile(
      `${env.S3_FOLDER}${removeExtension(filename)}_smaller`,
      compressFileMini,
      "images"
    ),
  ]);

  console.log(`${queuePosition} (${fileLink})`);
}

const queue: queueAsPromised<Task> = fastq.promise(worker, 6);

async function execute() {
  const fileList = (await $`ls -1t ${env.PATH_IMAGES}`.text())
    .split("\n")
    .filter(Boolean);

  let count = 1;
  for (const filename of fileList) {
    queue
      .push({ filename, queuePosition: `${count}/${fileList.length}` })
      .catch((err) => console.error(err));
    count++;
  }
}

execute();
