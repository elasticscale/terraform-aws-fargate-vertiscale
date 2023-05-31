import { determineNewCpuMemory } from './index';

describe('determineNewCpuMemory', () => {
    const fargateConfigurations = {
      Windows: {
        1024: {
          memoryStart: 2048,
          memoryEnd: 8192,
          memoryStep: 1024,
        },
        2048: {
          memoryStart: 4096,
          memoryEnd: 16384,
          memoryStep: 1024,
        },
        4096: {
          memoryStart: 8192,
          memoryEnd: 30720,
          memoryStep: 1024,
        },
      },
      Linux: {
        256: {
          memoryStart: 1024,
          memoryEnd: 2048,
          memoryStep: 1024,
        },
        512: {
          memoryStart: 1024,
          memoryEnd: 4096,
          memoryStep: 1024,
        },
        1024: {
          memoryStart: 2048,
          memoryEnd: 8192,
          memoryStep: 1024,
        },
        2048: {
          memoryStart: 4096,
          memoryEnd: 16384,
          memoryStep: 1024,
        },
        4096: {
          memoryStart: 8192,
          memoryEnd: 30720,
          memoryStep: 1024,
        },
        8192: {
          memoryStart: 16384,
          memoryEnd: 61440,
          memoryStep: 4096,
        },
        16384: {
          memoryStart: 32768,
          memoryEnd: 122880,
          memoryStep: 8192,
        },
      },
    };
  
    it('returns the correct CPU and memory for a given capacity', () => {
      const capacity = 512;
      const currentCpu = 256;
      const currentMemory = 1024;
      const expectedCpu = 512;
      const expectedMemory = 2048;
  
      const result = determineNewCpuMemory(
        capacity,
        currentCpu,
        currentMemory,
        fargateConfigurations
      );
  
      expect(result).toEqual({
        cpu: expectedCpu,
        memory: expectedMemory,
      });
    });
  });