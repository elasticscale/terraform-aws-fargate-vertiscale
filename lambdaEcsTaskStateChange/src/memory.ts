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
    // we can get away with ommitting the 512 mb as when this invokes would already be double
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

export const determineNewCpuMemory = (
  platformFamily: string,
  cpuTask: string,
  memoryTask: string,
) => {
  if (
    !platformFamily ||
    !(platformFamily == 'Linux' || platformFamily == 'Windows')
  ) {
    throw new Error('Task does not have a platform family');
  }
  if (!fargateConfigurations[platformFamily]) {
    throw new Error(
      'Task family ' +
        platformFamily +
        ' was not defined in the capacity settings',
    );
  }
  if (!memoryTask || !cpuTask) {
    throw new Error('Task does not have a cpu or memory');
  }
  const capacity = fargateConfigurations[platformFamily];
  const newMemory = parseInt(memoryTask) * 2;
  let currentCpuSetting = findCapacitySetting(
    capacity,
    // @ts-expect-error todo
    parseInt(cpuTask),
    newMemory,
  );
  if (!currentCpuSetting) {
    // check if we can get to the right setting if we double the cpu
    for (
      let cpu = parseInt(cpuTask);
      cpu <= 16384 || currentCpuSetting;
      cpu = cpu * 2
    ) {
      // @ts-expect-error todo
      currentCpuSetting = findCapacitySetting(capacity, cpu, newMemory);
      if (currentCpuSetting) {
        break;
      }
    }
  }
  if (!currentCpuSetting) {
    // some combos bound by new memory because its an uneven number, so we loop over the memory as well
    for (
      let cpu = parseInt(cpuTask);
      cpu <= 16384 || currentCpuSetting;
      cpu = cpu * 2
    ) {
      for (
        let memoryCheck = newMemory;
        memoryCheck <= 122880;
        memoryCheck = memoryCheck + 1024
      ) {
        // @ts-expect-error todo
        currentCpuSetting = findCapacitySetting(capacity, cpu, memoryCheck);
        if (currentCpuSetting) {
          break;
        }
      }
      if (currentCpuSetting) {
        break;
      }
    }
  }
  return currentCpuSetting;
};

const findCapacitySetting = <
  T extends typeof fargateConfigurations[keyof typeof fargateConfigurations],
>(
  capacity: T,
  cpu: keyof T,
  memory: number,
) => {
  if (!capacity[cpu]) {
    // cpu is out of bounds
    return false;
  }
  if (
    // @ts-expect-error todo
    memory < capacity[cpu]['memoryStart'] ||
    // @ts-expect-error todo
    memory > capacity[cpu]['memoryEnd']
  ) {
    // memory is out of range anyway
    return false;
  }
  const memoryOptions = [];
  for (
    // @ts-expect-error todo
    let limit = capacity[cpu]['memoryStart'];
    // @ts-expect-error todo
    capacity[cpu]['memoryEnd'] >= limit;
    // @ts-expect-error todo
    limit += capacity[cpu]['memoryStep'] as number
  ) {
    memoryOptions.push(limit);
  }
  if (memoryOptions.includes(memory)) {
    return {
      cpu: cpu,
      memory: memory,
    } as { cpu: keyof T; memory: number };
  }
  return false;
};
