async function run (runtimeEnv, deployer) {
  const creatorAccount = deployer.accountsByName.get('alice');

  // Retreive AppInfo from checkpoints.
  const appInfo = deployer.getSSC('approval_program.py', 'clear_program.teal');
  const applicationID = appInfo.appID;
  console.log('Application Id ', applicationID);

  const updatedRes = await deployer.updateSSC(
    creatorAccount,
    {}, // pay flags
    applicationID,
    'approval_program.py',
    'clear_program.teal',
    {}
  );
  console.log('Application Updated: ', updatedRes);
}

module.exports = { default: run };
