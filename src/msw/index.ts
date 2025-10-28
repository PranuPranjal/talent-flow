import { worker } from './browser';

export const initializeMSW = async (): Promise<void> => {
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: '/mockServiceWorker.js'
    }
  });
  console.log('MSW worker started');
};

export const stopMSW = (): void => {
  worker.stop();
  console.log('MSW worker stopped');
};
export { handlers } from './handlers';

