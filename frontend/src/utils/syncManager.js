import axios from 'axios';

class SyncManager {
    constructor() {
        this.queue = JSON.parse(localStorage.getItem('offlineQueue') || '[]');
        this.isSyncing = false;
    }

    addToQueue(action) {
        // action: { type: 'ADD_TASK', payload: {...}, id: tempId, timestamp: Date.now() }
        this.queue.push({
            ...action,
            timestamp: Date.now()
        });
        this.saveQueue();
    }

    saveQueue() {
        localStorage.setItem('offlineQueue', JSON.stringify(this.queue));
    }

    async processQueue(handlers) {
        if (this.isSyncing || this.queue.length === 0) return;
        this.isSyncing = true;

        console.log(`Syncing ${this.queue.length} offline actions...`);

        const failedActions = [];

        // Process items sequentially to maintain order dependencies
        for (const item of this.queue) {
            try {
                switch (item.type) {
                    case 'ADD_TASK':
                        // If task was created offline, payload has temp _id. 
                        // Backend will assign new _id.
                        // Ideally we update local store with real ID, but simpler is just to re-create it.
                        // We must remove the temp _id before sending.
                        const { _id, ...taskData } = item.payload;
                        await handlers.addTask(taskData);
                        break;

                    case 'UPDATE_TASK':
                        await handlers.updateTask(item.payload.id, item.payload.updates);
                        break;

                    case 'DELETE_TASK':
                        await handlers.deleteTask(item.payload.id);
                        break;

                    case 'UPDATE_PROFILE':
                        await handlers.updateProfile(item.payload);
                        break;

                    case 'UPDATE_SETTINGS':
                        await handlers.updateSettings(item.payload);
                        break;

                    case 'ADD_LOG':
                        await handlers.addLog(item.payload);
                        break;

                    case 'ADD_DUMP':
                        await handlers.addDump(item.payload);
                        break;

                    case 'ADD_IDEA':
                        await handlers.addIdea(item.payload);
                        break;

                    case 'ADD_CHECKLIST':
                        await handlers.addChecklist(item.payload);
                        break;
                }
            } catch (error) {
                console.error(`Failed to sync action ${item.type}:`, error);
                // If 400/500, maybe drop it? If network error, keep it.
                // For now, retry all errors.
                failedActions.push(item);
            }
        }

        this.queue = failedActions;
        this.saveQueue();
        this.isSyncing = false;

        if (this.queue.length === 0) {
            console.log("Sync Complete!");
            // Optional: Notify user?
        }
    }
}

export const syncManager = new SyncManager();
