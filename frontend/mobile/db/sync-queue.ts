import AsyncStorage from '@react-native-async-storage/async-storage';

export interface PendingSyncItem {
  id: string;
  type: 'PAYMENT' | 'CUSTOMER' | 'VISIT';
  payload: any;
  createdAt: string;
  status: 'PENDING' | 'SYNCING' | 'FAILED';
  error?: string;
  retryCount: number;
}

const QUEUE_STORAGE_KEY = '@shri_amudha_sync_queue_v1';

export class OfflineSyncQueue {
  /**
   * Retrieves all items currently pending in the offline queue.
   */
  static async getQueue(): Promise<PendingSyncItem[]> {
    try {
      const data = await AsyncStorage.getItem(QUEUE_STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Enqueues an offline action (e.g. payment collection performed without network).
   */
  static async enqueue(type: PendingSyncItem['type'], payload: any): Promise<PendingSyncItem> {
    const queue = await this.getQueue();
    const item: PendingSyncItem = {
      id: `SYNC-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      type,
      payload,
      createdAt: new Date().toISOString(),
      status: 'PENDING',
      retryCount: 0,
    };

    queue.push(item);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    return item;
  }

  /**
   * Removes an item from the queue after successful server sync.
   */
  static async remove(id: string): Promise<void> {
    const queue = await this.getQueue();
    const filtered = queue.filter((item) => item.id !== id);
    await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(filtered));
  }

  /**
   * Updates an item's status and error description.
   */
  static async updateStatus(id: string, status: PendingSyncItem['status'], error?: string): Promise<void> {
    const queue = await this.getQueue();
    const item = queue.find((i) => i.id === id);
    if (item) {
      item.status = status;
      if (error) item.error = error;
      if (status === 'FAILED') item.retryCount += 1;
      await AsyncStorage.setItem(QUEUE_STORAGE_KEY, JSON.stringify(queue));
    }
  }

  /**
   * Counts pending offline items.
   */
  static async getPendingCount(): Promise<number> {
    const queue = await this.getQueue();
    return queue.filter((i) => i.status === 'PENDING' || i.status === 'FAILED').length;
  }
}
