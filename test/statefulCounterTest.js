const { getProgram } = require('@algo-builder/algob');
const {
  Runtime, AccountStore, types,
  uint64ToBigEndian, stringToBytes, addressToPk
} = require('@algo-builder/runtime');
const { assert } = require('chai');

const minBalance = 10e6; // 10 ALGO's
const initialCreatorBalance = minBalance + 0.01e6;

describe('Stateful Counter Tests', function () {
    let creator = new AccountStore(initialCreatorBalance);
    let alice = new AccountStore(initialCreatorBalance);
    let bob = new AccountStore(initialCreatorBalance);

    let runtime;
    let flags;
    let applicationId;

    const approvalProgram = getProgram('approval_program.py');
    const clearProgram = getProgram('clear_program.teal');

    this.beforeEach(async function () {
        runtime = new Runtime([creator, alice, bob]);

        // Create new app
        applicationId = runtime.addApp({
            sender: creator.account,
            globalBytes: 0,
            globalInts: 1,
            localBytes: 0,
            localInts: 0
        }, {}, approvalProgram, clearProgram);

        // Opt-in to app
        runtime.optInToApp(creator.address, applicationId, {}, {});
        runtime.optInToApp(alice.address, applicationId, {}, {});
        runtime.optInToApp(bob.address, applicationId, {}, {});
    });

    // Fetch a global value
    const getGlobal = (key) => runtime.getGlobalState(applicationId, key);

    // Call the smart contract
    const callSSC = (sender) => ({
        type: types.TransactionType.CallNoOpSSC,
        sign: types.SignType.SecretKey,
        fromAccount: sender.account,
        appId: applicationId,
        payFlags: { totalFee: 1000 },
    });
    
    // Fetch latest account state
    function syncAccounts() {
        creator = runtime.getAccount(creator.address);
    }

    it('Init stateful counter application', () => {
        // Verify global state
        assert.isDefined(applicationId);
        assert.deepEqual(getGlobal('counter'), 0n);
    });

    it('Increment counter a few times', () => {
        runtime.executeTx(callSSC(creator));
        runtime.executeTx(callSSC(creator));
        runtime.executeTx(callSSC(creator));

        assert.deepEqual(getGlobal('counter'), 9n);
    });

    it('Increment counter from different accounts', () => {
        runtime.executeTx(callSSC(alice));
        runtime.executeTx(callSSC(creator));
        runtime.executeTx(callSSC(bob));        
        runtime.executeTx(callSSC(bob));

        assert.deepEqual(getGlobal('counter'), 12n);
    });
});
