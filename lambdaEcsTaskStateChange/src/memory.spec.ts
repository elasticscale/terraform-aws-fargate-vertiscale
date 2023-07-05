import { determineNewCpuMemory } from './memory';

describe('determineNewCpuMemory', () => {
  const outOfRangeCombinations = [
    // from here fails, max for windows is 15360 * 2 = 30720
    { family: 'Windows', cpu: 2048, memory: 16384 },
    { family: 'Windows', cpu: 4096, memory: 16384 },
    { family: 'Windows', cpu: 4096, memory: 17408 },
    { family: 'Windows', cpu: 4096, memory: 18432 },
    { family: 'Windows', cpu: 4096, memory: 19456 },
    { family: 'Windows', cpu: 4096, memory: 20480 },
    { family: 'Windows', cpu: 4096, memory: 21504 },
    { family: 'Windows', cpu: 4096, memory: 22528 },
    { family: 'Windows', cpu: 4096, memory: 23552 },
    { family: 'Windows', cpu: 4096, memory: 24576 },
    { family: 'Windows', cpu: 4096, memory: 25600 },
    { family: 'Windows', cpu: 4096, memory: 26624 },
    { family: 'Windows', cpu: 4096, memory: 27648 },
    { family: 'Windows', cpu: 4096, memory: 28672 },
    { family: 'Windows', cpu: 4096, memory: 29696 },
    { family: 'Windows', cpu: 4096, memory: 30720 },
    // from here fails, max for linux is 61440 * 2 = 122880
    { family: 'Linux', cpu: 16384, memory: 65536 },
    { family: 'Linux', cpu: 16384, memory: 73728 },
    { family: 'Linux', cpu: 16384, memory: 81920 },
    { family: 'Linux', cpu: 16384, memory: 90112 },
    { family: 'Linux', cpu: 16384, memory: 98304 },
    { family: 'Linux', cpu: 16384, memory: 106496 },
    { family: 'Linux', cpu: 16384, memory: 114688 },
    { family: 'Linux', cpu: 16384, memory: 122880 },
  ];
  const workingCombinations = [
    { family: 'Windows', cpu: 1024, memory: 2048 },
    { family: 'Windows', cpu: 1024, memory: 3072 },
    { family: 'Windows', cpu: 1024, memory: 4096 },
    { family: 'Windows', cpu: 1024, memory: 5120 },
    { family: 'Windows', cpu: 1024, memory: 6144 },
    { family: 'Windows', cpu: 1024, memory: 7168 },
    { family: 'Windows', cpu: 1024, memory: 8192 },
    { family: 'Windows', cpu: 2048, memory: 4096 },
    { family: 'Windows', cpu: 2048, memory: 5120 },
    { family: 'Windows', cpu: 2048, memory: 6144 },
    { family: 'Windows', cpu: 2048, memory: 7168 },
    { family: 'Windows', cpu: 2048, memory: 8192 },
    { family: 'Windows', cpu: 2048, memory: 9216 },
    { family: 'Windows', cpu: 2048, memory: 10240 },
    { family: 'Windows', cpu: 2048, memory: 11264 },
    { family: 'Windows', cpu: 2048, memory: 12288 },
    { family: 'Windows', cpu: 2048, memory: 13312 },
    { family: 'Windows', cpu: 2048, memory: 14336 },
    { family: 'Windows', cpu: 2048, memory: 15360 },
    { family: 'Windows', cpu: 4096, memory: 8192 },
    { family: 'Windows', cpu: 4096, memory: 9216 },
    { family: 'Windows', cpu: 4096, memory: 10240 },
    { family: 'Windows', cpu: 4096, memory: 11264 },
    { family: 'Windows', cpu: 4096, memory: 12288 },
    { family: 'Windows', cpu: 4096, memory: 13312 },
    { family: 'Windows', cpu: 4096, memory: 14336 },
    { family: 'Windows', cpu: 4096, memory: 15360 },
    { family: 'Linux', cpu: 256, memory: 1024 },
    { family: 'Linux', cpu: 256, memory: 2048 },
    { family: 'Linux', cpu: 512, memory: 1024 },
    { family: 'Linux', cpu: 512, memory: 2048 },
    { family: 'Linux', cpu: 512, memory: 3072 },
    { family: 'Linux', cpu: 512, memory: 4096 },
    { family: 'Linux', cpu: 1024, memory: 2048 },
    { family: 'Linux', cpu: 1024, memory: 3072 },
    { family: 'Linux', cpu: 1024, memory: 4096 },
    { family: 'Linux', cpu: 1024, memory: 5120 },
    { family: 'Linux', cpu: 1024, memory: 6144 },
    { family: 'Linux', cpu: 1024, memory: 7168 },
    { family: 'Linux', cpu: 1024, memory: 8192 },
    { family: 'Linux', cpu: 2048, memory: 4096 },
    { family: 'Linux', cpu: 2048, memory: 5120 },
    { family: 'Linux', cpu: 2048, memory: 6144 },
    { family: 'Linux', cpu: 2048, memory: 7168 },
    { family: 'Linux', cpu: 2048, memory: 8192 },
    { family: 'Linux', cpu: 2048, memory: 9216 },
    { family: 'Linux', cpu: 2048, memory: 10240 },
    { family: 'Linux', cpu: 2048, memory: 11264 },
    { family: 'Linux', cpu: 2048, memory: 12288 },
    { family: 'Linux', cpu: 2048, memory: 13312 },
    { family: 'Linux', cpu: 2048, memory: 14336 },
    { family: 'Linux', cpu: 2048, memory: 15360 },
    { family: 'Linux', cpu: 2048, memory: 16384 },
    { family: 'Linux', cpu: 4096, memory: 8192 },
    { family: 'Linux', cpu: 4096, memory: 9216 },
    { family: 'Linux', cpu: 4096, memory: 10240 },
    { family: 'Linux', cpu: 4096, memory: 11264 },
    { family: 'Linux', cpu: 4096, memory: 12288 },
    { family: 'Linux', cpu: 4096, memory: 13312 },
    { family: 'Linux', cpu: 4096, memory: 14336 },
    { family: 'Linux', cpu: 4096, memory: 15360 },
    { family: 'Linux', cpu: 4096, memory: 16384 },
    { family: 'Linux', cpu: 4096, memory: 17408 },
    { family: 'Linux', cpu: 4096, memory: 18432 },
    { family: 'Linux', cpu: 4096, memory: 19456 },
    { family: 'Linux', cpu: 4096, memory: 20480 },
    { family: 'Linux', cpu: 4096, memory: 21504 },
    { family: 'Linux', cpu: 4096, memory: 22528 },
    { family: 'Linux', cpu: 4096, memory: 23552 },
    { family: 'Linux', cpu: 4096, memory: 24576 },
    { family: 'Linux', cpu: 4096, memory: 25600 },
    { family: 'Linux', cpu: 4096, memory: 26624 },
    { family: 'Linux', cpu: 4096, memory: 27648 },
    { family: 'Linux', cpu: 4096, memory: 28672 },
    { family: 'Linux', cpu: 4096, memory: 29696 },
    { family: 'Linux', cpu: 4096, memory: 30720 },
    { family: 'Linux', cpu: 8192, memory: 16384 },
    { family: 'Linux', cpu: 8192, memory: 20480 },
    { family: 'Linux', cpu: 8192, memory: 24576 },
    { family: 'Linux', cpu: 8192, memory: 28672 },
    { family: 'Linux', cpu: 8192, memory: 32768 },
    { family: 'Linux', cpu: 8192, memory: 36864 },
    { family: 'Linux', cpu: 8192, memory: 40960 },
    { family: 'Linux', cpu: 8192, memory: 45056 },
    { family: 'Linux', cpu: 8192, memory: 49152 },
    { family: 'Linux', cpu: 8192, memory: 53248 },
    { family: 'Linux', cpu: 8192, memory: 57344 },
    { family: 'Linux', cpu: 8192, memory: 61440 },
    { family: 'Linux', cpu: 16384, memory: 32768 },
    { family: 'Linux', cpu: 16384, memory: 40960 },
    { family: 'Linux', cpu: 16384, memory: 49152 },
    { family: 'Linux', cpu: 16384, memory: 57344 },
  ];
  test.each(workingCombinations)('.check(%s)', (testcase) => {
    expect(
      determineNewCpuMemory(
        testcase.family,
        testcase.cpu.toString(),
        testcase.memory.toString(),
      ),
    ).not.toEqual(false);
  });
});
