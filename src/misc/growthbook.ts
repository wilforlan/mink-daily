import { GrowthBook, useFeatureValue } from '@growthbook/growthbook-react';
import { isProduction } from '@/src/misc';

// Create a GrowthBook instance
export const initializeGrowthbook = () =>
  new GrowthBook({
    enableDevMode: !isProduction,
    trackingCallback: (experiment, result) => {
      console.log('Experiment Viewed', {
        experimentId: experiment.key,
        variationId: result.variationId,
      });
    },
  });

export const getGrowthbookFeature = (value: string, defaultValue?: string | boolean) => {
  return useFeatureValue(value, defaultValue || false);
};
