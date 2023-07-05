import { Task } from '@aws-sdk/client-ecs';

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

export const determineNewCpuMemory = (task: Task) => {
  if (
    !task['platformFamily'] ||
    !(task['platformFamily'] == 'Linux' || task['platformFamily'] == 'Windows')
  ) {
    throw new Error('Task does not have a platform family');
  }
  if (!fargateConfigurations[task['platformFamily']]) {
    throw new Error(
      'Task family ' +
        task['platformFamily'] +
        ' was not defined in the capacity settings',
    );
  }
  if (!task['memory'] || !task['cpu']) {
    throw new Error('Task does not have a cpu or memory');
  }
  const capacity = fargateConfigurations[task['platformFamily']];
  const newMemory = parseInt(task['memory']) * 2;
  let currentCpuSetting = findCapacitySetting(
    capacity,
    parseInt(task['cpu']),
    newMemory,
  );
  if (!currentCpuSetting) {
    // check if we can get to the right setting if we double the cpu
    for (
      let cpu = parseInt(task['cpu']);
      cpu <= 16384 || currentCpuSetting;
      cpu = cpu * 2
    ) {
      currentCpuSetting = findCapacitySetting(capacity, cpu, newMemory);
    }
  }
  return currentCpuSetting;
};

export const findCapacitySetting = <
  T extends typeof fargateConfigurations['Linux' | 'Windows'],
>(
  capacity: T,
  cpu: keyof T,
  memory: number,
) => {
  if (
    memory < capacity[cpu]['memoryStart'] ||
    memory > capacity[cpu]['memoryEnd']
  ) {
    // memory is out of range anyway
    return false;
  }
  const memoryOptions = [];
  for (
    let limit = capacity[cpu]['memoryStart'];
    capacity[cpu][cpu]['memoryEnd'] >= limit;
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
