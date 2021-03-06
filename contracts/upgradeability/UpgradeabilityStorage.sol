pragma solidity ^0.4.18;

import '../registry/IRegistry.sol';

/**
 * @title UpgradeabilityStorage
 * @dev This contract holds all the necessary state variables to support the upgrade functionality
 */
contract UpgradeabilityStorage {
  // Versions registry
  IRegistry private _registry;

  // Version name of the current implementation
  string internal _version;

  // Address of the current implementation
  address internal _implementation;

  /**
  * @dev Constructor function
  */
  function UpgradeabilityStorage() public {
    _registry = IRegistry(msg.sender);
  }

  /**
  * @dev Tells the version name of the current implementation
  * @return string representing the name of the current version
  */
  function version() public view returns (string) {
    return _version;
  }

  /**
  * @dev Tells the address of the current implementation
  * @return address of the current implementation
  */
  function implementation() public view returns (address) {
    return _implementation;
  }

  /**
  * @dev Tells the address of registry
  * @return address of the registry
  */
  function registry() public view returns (IRegistry) {
    return _registry;
  }
}
