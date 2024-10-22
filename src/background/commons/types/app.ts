export interface ApplicationOptions {
  executeSummariesAfter: number, // 24 hours
  deleteDataEvery: number, // 3 days
  forwardMinkDigestToEmail: boolean, // true
  maxAllowedLinksPerDay: number,
  shouldIgnoreSocialMediaPlatforms: boolean,
  startTrackingSessionAfter: number, // 5 minutes
  ignoredWebsiteList: [],
}

export interface ApplicationState {
  options: ApplicationOptions;
}
