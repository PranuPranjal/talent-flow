// MSW setup and initialization
import { worker } from './browser';

export const initializeMSW = async (): Promise<void> => {
  if (typeof window !== 'undefined') {
    // Start MSW worker in browser
    await worker.start({
      onUnhandledRequest: 'bypass',
      serviceWorker: {
        url: '/mockServiceWorker.js'
      }
    });
    console.log('MSW worker started');
  }
};

export const stopMSW = (): void => {
  if (typeof window !== 'undefined') {
    worker.stop();
    console.log('MSW worker stopped');
  }
};

// Export handlers for testing
export { handlers } from './handlers';

