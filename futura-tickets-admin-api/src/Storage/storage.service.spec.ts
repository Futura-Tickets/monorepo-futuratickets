import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { StorageService } from './storage.service';
import { Storage } from '@google-cloud/storage';

// Mock @google-cloud/storage
jest.mock('@google-cloud/storage');

describe('StorageService', () => {
  let service: StorageService;
  let configService: ConfigService;
  let mockStorage: jest.Mocked<Storage>;
  let mockBucket: any;
  let mockFile: any;

  const mockConfig = {
    GCS_PROJECT_ID: 'test-project-id',
    GCS_BUCKET_NAME: 'test-bucket',
    GCS_KEY_FILE: './test-key.json',
  };

  beforeEach(async () => {
    // Setup mocks
    mockFile = {
      createWriteStream: jest.fn(),
      delete: jest.fn(),
      getSignedUrl: jest.fn(),
      exists: jest.fn(),
      makePublic: jest.fn(),
    };

    mockBucket = {
      file: jest.fn().mockReturnValue(mockFile),
    };

    mockStorage = {
      bucket: jest.fn().mockReturnValue(mockBucket),
    } as any;

    (Storage as jest.MockedClass<typeof Storage>).mockImplementation(
      () => mockStorage,
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        StorageService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => mockConfig[key]),
          },
        },
      ],
    }).compile();

    service = module.get<StorageService>(StorageService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should initialize Google Cloud Storage with correct config', () => {
      expect(Storage).toHaveBeenCalledWith({
        projectId: mockConfig.GCS_PROJECT_ID,
        keyFilename: mockConfig.GCS_KEY_FILE,
      });
    });

    it('should retrieve bucket name from config', () => {
      expect(configService.get).toHaveBeenCalledWith('GCS_BUCKET_NAME');
    });
  });

  describe('uploadFile', () => {
    const filename = 'test-image.jpg';
    const contentType = 'image/jpeg';
    let mockBlobStream: any;

    beforeEach(() => {
      mockBlobStream = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            // Store the callback to call it later
            mockBlobStream.finishCallback = callback;
          }
          return mockBlobStream;
        }),
        end: jest.fn(),
      };

      mockFile.createWriteStream.mockReturnValue(mockBlobStream);
      mockFile.makePublic.mockResolvedValue(undefined);
    });

    it('should upload a Buffer successfully', async () => {
      const fileBuffer = Buffer.from('test image data');

      // Start the upload
      const uploadPromise = service.uploadFile(
        fileBuffer,
        filename,
        contentType,
      );

      // Simulate successful upload
      await mockBlobStream.finishCallback();

      const url = await uploadPromise;

      expect(mockStorage.bucket).toHaveBeenCalledWith(
        mockConfig.GCS_BUCKET_NAME,
      );
      expect(mockBucket.file).toHaveBeenCalledWith(filename);
      expect(mockFile.createWriteStream).toHaveBeenCalledWith({
        resumable: false,
        contentType,
        metadata: {
          cacheControl: 'public, max-age=31536000',
        },
      });
      expect(mockBlobStream.end).toHaveBeenCalledWith(fileBuffer);
      expect(mockFile.makePublic).toHaveBeenCalled();
      expect(url).toBe(
        `https://storage.googleapis.com/${mockConfig.GCS_BUCKET_NAME}/${filename}`,
      );
    });

    it('should handle upload errors', async () => {
      const fileBuffer = Buffer.from('test image data');
      const uploadError = new Error('Upload failed');

      mockBlobStream.on = jest.fn((event, callback) => {
        if (event === 'error') {
          // Immediately call error callback
          callback(uploadError);
        }
        return mockBlobStream;
      });

      await expect(
        service.uploadFile(fileBuffer, filename, contentType),
      ).rejects.toThrow('Upload failed');
    });

    it('should set correct cache control headers', async () => {
      const fileBuffer = Buffer.from('test image data');

      const uploadPromise = service.uploadFile(
        fileBuffer,
        filename,
        contentType,
      );

      await mockBlobStream.finishCallback();
      await uploadPromise;

      expect(mockFile.createWriteStream).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: {
            cacheControl: 'public, max-age=31536000',
          },
        }),
      );
    });
  });

  describe('deleteFile', () => {
    it('should delete a file successfully', async () => {
      const filename = 'test-image.jpg';
      mockFile.delete.mockResolvedValue([{}]);

      await service.deleteFile(filename);

      expect(mockStorage.bucket).toHaveBeenCalledWith(
        mockConfig.GCS_BUCKET_NAME,
      );
      expect(mockBucket.file).toHaveBeenCalledWith(filename);
      expect(mockFile.delete).toHaveBeenCalled();
    });

    it('should handle delete errors', async () => {
      const filename = 'test-image.jpg';
      const deleteError = new Error('Delete failed');
      mockFile.delete.mockRejectedValue(deleteError);

      await expect(service.deleteFile(filename)).rejects.toThrow(
        'Delete failed',
      );
    });
  });

  describe('getSignedUrl', () => {
    it('should generate a signed URL with default expiration', async () => {
      const filename = 'test-image.jpg';
      const expectedUrl = 'https://storage.googleapis.com/signed-url';
      mockFile.getSignedUrl.mockResolvedValue([expectedUrl]);

      const url = await service.getSignedUrl(filename);

      expect(mockStorage.bucket).toHaveBeenCalledWith(
        mockConfig.GCS_BUCKET_NAME,
      );
      expect(mockBucket.file).toHaveBeenCalledWith(filename);
      expect(mockFile.getSignedUrl).toHaveBeenCalledWith({
        action: 'read',
        expires: expect.any(Number),
      });
      expect(url).toBe(expectedUrl);
    });

    it('should generate a signed URL with custom expiration', async () => {
      const filename = 'test-image.jpg';
      const expiresIn = 3600; // 1 hour
      const expectedUrl = 'https://storage.googleapis.com/signed-url';
      mockFile.getSignedUrl.mockResolvedValue([expectedUrl]);

      const url = await service.getSignedUrl(filename, expiresIn);

      expect(mockFile.getSignedUrl).toHaveBeenCalledWith({
        action: 'read',
        expires: expect.any(Number),
      });
      expect(url).toBe(expectedUrl);
    });

    it('should handle signed URL generation errors', async () => {
      const filename = 'test-image.jpg';
      const error = new Error('Signed URL generation failed');
      mockFile.getSignedUrl.mockRejectedValue(error);

      await expect(service.getSignedUrl(filename)).rejects.toThrow(
        'Signed URL generation failed',
      );
    });
  });

  describe('fileExists', () => {
    it('should return true when file exists', async () => {
      const filename = 'test-image.jpg';
      mockFile.exists.mockResolvedValue([true]);

      const exists = await service.fileExists(filename);

      expect(mockStorage.bucket).toHaveBeenCalledWith(
        mockConfig.GCS_BUCKET_NAME,
      );
      expect(mockBucket.file).toHaveBeenCalledWith(filename);
      expect(mockFile.exists).toHaveBeenCalled();
      expect(exists).toBe(true);
    });

    it('should return false when file does not exist', async () => {
      const filename = 'non-existent.jpg';
      mockFile.exists.mockResolvedValue([false]);

      const exists = await service.fileExists(filename);

      expect(exists).toBe(false);
    });

    it('should handle file exists check errors', async () => {
      const filename = 'test-image.jpg';
      const error = new Error('Exists check failed');
      mockFile.exists.mockRejectedValue(error);

      await expect(service.fileExists(filename)).rejects.toThrow(
        'Exists check failed',
      );
    });
  });

  describe('integration scenarios', () => {
    it('should upload and verify file exists', async () => {
      const filename = 'test-image.jpg';
      const fileBuffer = Buffer.from('test data');
      const contentType = 'image/jpeg';

      const mockBlobStream = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            mockBlobStream.finishCallback = callback;
          }
          return mockBlobStream;
        }),
        end: jest.fn(),
      };

      mockFile.createWriteStream.mockReturnValue(mockBlobStream);
      mockFile.makePublic.mockResolvedValue(undefined);
      mockFile.exists.mockResolvedValue([true]);

      // Upload file
      const uploadPromise = service.uploadFile(
        fileBuffer,
        filename,
        contentType,
      );
      await mockBlobStream.finishCallback();
      const url = await uploadPromise;

      expect(url).toBeDefined();

      // Verify file exists
      const exists = await service.fileExists(filename);
      expect(exists).toBe(true);
    });

    it('should upload, get signed URL, and delete file', async () => {
      const filename = 'test-image.jpg';
      const fileBuffer = Buffer.from('test data');
      const contentType = 'image/jpeg';

      const mockBlobStream = {
        on: jest.fn((event, callback) => {
          if (event === 'finish') {
            mockBlobStream.finishCallback = callback;
          }
          return mockBlobStream;
        }),
        end: jest.fn(),
      };

      mockFile.createWriteStream.mockReturnValue(mockBlobStream);
      mockFile.makePublic.mockResolvedValue(undefined);
      mockFile.getSignedUrl.mockResolvedValue(['https://signed-url']);
      mockFile.delete.mockResolvedValue([{}]);

      // Upload
      const uploadPromise = service.uploadFile(
        fileBuffer,
        filename,
        contentType,
      );
      await mockBlobStream.finishCallback();
      await uploadPromise;

      // Get signed URL
      const signedUrl = await service.getSignedUrl(filename);
      expect(signedUrl).toBe('https://signed-url');

      // Delete
      await service.deleteFile(filename);
      expect(mockFile.delete).toHaveBeenCalled();
    });
  });
});
