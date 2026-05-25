export const config = {
  dryRunExternal: process.env.DRY_RUN_EXTERNAL_CALLS === 'true',
  dryRunEmailTo: process.env.DRY_RUN_EMAIL_TO ?? 'jeroen@jeroenandpaws.com',
};
