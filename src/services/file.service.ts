import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import { FinalizeUploadDto } from 'src/dto/UploadFileDto';

@Injectable()
export class FileService {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: process.env.GLASS_API_URL,
    });
  }

  private async get(url: string) {
    try {
      const response = await this.axiosInstance.get(url);
      return response.data;
    } catch (err) {
      throw new HttpException('Error with file request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  private async post(url: string, data) {
    try {
      const response = await this.axiosInstance.post(url, data);
      return response.data;
    } catch (err) {
      throw new HttpException('Error with file request', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  public async getUploadUrl(extension: string) {
    return this.post('', { extension });
  }

  public async getUploadStatus(uploadUuid: string) {
    return this.get(`/${uploadUuid}/status`);
  }

  public async finalizeUpload(data: FinalizeUploadDto) {
    return this.post(`/${data.uploadUuid}/finalize`, {
      name: data.name,
      description: data.description,
    });
  }
}
