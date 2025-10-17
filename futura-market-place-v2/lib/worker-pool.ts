interface WorkerTask<T, R> {
  id: string;
  data: T;
  resolve: (value: R) => void;
  reject: (error: any) => void;
}

export class WorkerPool<T = any, R = any> {
  private workers: Worker[] = [];
  private availableWorkers: Worker[] = [];
  private taskQueue: WorkerTask<T, R>[] = [];
  private taskMap: Map<string, WorkerTask<T, R>> = new Map();

  constructor(
    private workerScript: string,
    private poolSize: number = navigator.hardwareConcurrency || 4
  ) {
    this.initializeWorkers();
  }

  private initializeWorkers() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerScript);
      
      worker.onmessage = (event) => {
        const { taskId, result, error } = event.data;
        const task = this.taskMap.get(taskId);

        if (task) {
          if (error) {
            task.reject(new Error(error));
          } else {
            task.resolve(result);
          }

          this.taskMap.delete(taskId);
          this.availableWorkers.push(worker);
          this.processQueue();
        }
      };

      worker.onerror = (error) => {
        console.error('Worker error:', error);
      };

      this.workers.push(worker);
      this.availableWorkers.push(worker);
    }
  }

  async execute(data: T): Promise<R> {
    const taskId = Math.random().toString(36).substr(2, 9);

    return new Promise((resolve, reject) => {
      const task: WorkerTask<T, R> = {
        id: taskId,
        data,
        resolve,
        reject,
      };

      this.taskQueue.push(task);
      this.taskMap.set(taskId, task);
      this.processQueue();
    });
  }

  private processQueue() {
    while (this.taskQueue.length > 0 && this.availableWorkers.length > 0) {
      const task = this.taskQueue.shift()!;
      const worker = this.availableWorkers.shift()!;

      worker.postMessage({
        taskId: task.id,
        data: task.data,
      });
    }
  }

  terminate() {
    this.workers.forEach((worker) => worker.terminate());
    this.workers = [];
    this.availableWorkers = [];
    this.taskQueue = [];
    this.taskMap.clear();
  }

  get activeCount(): number {
    return this.poolSize - this.availableWorkers.length;
  }

  get queuedCount(): number {
    return this.taskQueue.length;
  }
}
