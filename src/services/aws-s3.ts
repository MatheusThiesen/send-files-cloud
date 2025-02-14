import AWS from "aws-sdk";
import { env } from "../env";

AWS.config.update({
  accessKeyId: env.S3_ACCESS_KEY,
  secretAccessKey: env.S3_SECRET_KEY,
  region: "nyc3",
});

class S3Service {
  private s3: AWS.S3;
  private bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: env.S3_ENDPOINT,
    });

    this.bucketName = env.S3_BUCKET;
  }

  /**
   * @description Atualiza (ou sobrescreve) um arquivo no S3.
   * @param filePath Caminho do arquivo dentro do bucket (ex: "Produtos/meuarquivo.png")
   * @param file Buffer ou string do arquivo
   * @param contentType Tipo de conteúdo (ex: "image/png", "application/pdf")
   * @returns URL do arquivo atualizado
   */
  async updateFile(
    filePath: string,
    file: Buffer | string,
    contentType: string
  ): Promise<string> {
    try {
      await this.s3
        .putObject({
          Bucket: this.bucketName,
          Key: filePath,
          Body: file,
          ContentType: contentType,
          ACL: "public-read", // Torna o arquivo acessível publicamente
        })
        .promise();

      // Construindo a URL pública do arquivo
      return `https://${this.bucketName}.${env.S3_ENDPOINT}/${filePath}`;
    } catch (error) {
      console.error("Erro ao atualizar arquivo no S3:", error);
      throw new Error("Erro ao atualizar arquivo no S3");
    }
  }
}

export const s3Service = new S3Service();
