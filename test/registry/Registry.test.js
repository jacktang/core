const Registry = artifacts.require('Registry')
const OwnedUpgradeabilityProxy = artifacts.require('OwnedUpgradeabilityProxy')
const assertRevert = require('../helpers/assertRevert')

contract('Registry', ([_, owner, implementation_v0, implementation_v1]) => {
  beforeEach(async function () {
    this.registry = await Registry.new()
  })

  describe('addVersion', function () {
    describe('when the given version was not registered', function () {
      const version = '0'

      describe('when the given address is not the zero address', function () {
        const implementation = implementation_v0;

        it('registers the given version', async function () {
          await this.registry.addVersion(version, implementation)

          const registeredImplementation = await this.registry.getVersion(version)
          assert.equal(registeredImplementation, implementation)
        })

        it('emits an event', async function () {
          const { logs } = await this.registry.addVersion(version, implementation)

          assert.equal(logs.length, 1)
          assert.equal(logs[0].event, 'VersionAdded')
          assert.equal(logs[0].args.version, version)
          assert.equal(logs[0].args.implementation, implementation)
        })

        it('allows to register a another version', async function () {
          const anotherVersion = '1'
          const anotherImplementation = implementation_v1

          await this.registry.addVersion(version, implementation)
          await this.registry.addVersion(anotherVersion, anotherImplementation)

          const registeredImplementation = await this.registry.getVersion(version)
          assert.equal(registeredImplementation, implementation)

          const newRegisteredImplementation = await this.registry.getVersion(anotherVersion)
          assert.equal(newRegisteredImplementation, anotherImplementation)
        })
      })

      describe('when the given address is the zero address', function () {
        const implementation = 0x0;

        it('reverts', async function () {
          await assertRevert(this.registry.addVersion(version, implementation))
        })
      })
    })

    describe('when the given version was already registered', function () {
      const version = '0'

      beforeEach(async function () {
        await this.registry.addVersion(version, implementation_v0)
      })

      describe('when the given address is not the zero address', function () {
        const implementation = implementation_v0;

        it('reverts', async function () {
          await assertRevert(this.registry.addVersion(version, implementation))
        })

        it('allows to register a another version', async function () {
          const anotherVersion = '1'
          const anotherImplementation = implementation_v1

          await this.registry.addVersion(anotherVersion, anotherImplementation)

          const registeredImplementation = await this.registry.getVersion(version)
          assert.equal(registeredImplementation, implementation)

          const newRegisteredImplementation = await this.registry.getVersion(anotherVersion)
          assert.equal(newRegisteredImplementation, anotherImplementation)
        })
      })

      describe('when the given address is the zero address', function () {
        const implementation = 0x0;

        it('reverts', async function () {
          await assertRevert(this.registry.addVersion(version, implementation))
        })
      })
    })
  })

  describe('createProxy', function () {
    const version = '0'

    describe('when the requested version was not registered', function () {
      it('reverts', async function () {
        await assertRevert(this.registry.createProxy(version, { from: owner }))
      })
    })

    describe('when the requested version was already registered', function () {
      beforeEach(async function () {
        await this.registry.addVersion(version, implementation_v0)
        const { logs } = await this.registry.createProxy(version, { from: owner })
        this.logs = logs
        this.proxyAddress = this.logs.find(l => l.event === 'ProxyCreated').args.proxy
        this.proxy = await OwnedUpgradeabilityProxy.at(this.proxyAddress)
      })

      it('creates a proxy with the given registry', async function () {
        const registry = await this.proxy.registry()
        assert.equal(registry, this.registry.address)
      })

      it('upgrades that proxy to the requested version', async function () {
        const version = await this.proxy.version()
        assert.equal(version, '0')

        const implementation = await this.proxy.implementation()
        assert.equal(implementation, implementation_v0)
      })

      it('emits an event', async function () {
        assert.equal(this.logs.length, 1)

        assert.equal(this.logs[0].event, 'ProxyCreated')
        assert.equal(this.logs[0].args.proxy, this.proxyAddress)
      })
    })
  })
})
