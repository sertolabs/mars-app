import { IDataStore, IIdentityManager, IKeyManager, IResolver } from 'daf-core'
import { ICredentialIssuer } from 'daf-w3c'
import { IDataStoreORM } from 'daf-typeorm'

export type Agent = IDataStore & IDataStoreORM & ICredentialIssuer & IIdentityManager & IKeyManager & IResolver

export const enabledMethods = [
  'keyManagerGetKeyManagementSystems',
  'keyManagerCreateKey',
  'keyManagerGetKey',
  'keyManagerDeleteKey',
  'keyManagerImportKey',
  'keyManagerEncryptJWE',
  'keyManagerDecryptJWE',
  'keyManagerSignJWT',
  'keyManagerSignEthTX',
  'identityManagerGetProviders',
  'identityManagerGetIdentities',
  'identityManagerGetIdentity',
  'identityManagerCreateIdentity',
  'identityManagerGetOrCreateIdentity',
  'identityManagerImportIdentity',
  'identityManagerDeleteIdentity',
  'identityManagerAddKey',
  'identityManagerRemoveKey',
  'identityManagerAddService',
  'identityManagerRemoveService',
  'resolveDid',
  'dataStoreSaveMessage',
  'dataStoreSaveVerifiableCredential',
  'dataStoreGetVerifiableCredential',
  'dataStoreSaveVerifiablePresentation',
  'dataStoreORMGetIdentities',
  'dataStoreORMGetIdentitiesCount',
  'dataStoreORMGetMessages',
  'dataStoreORMGetMessagesCount',
  'dataStoreORMGetVerifiableCredentialsByClaims',
  'dataStoreORMGetVerifiableCredentialsByClaimsCount',
  'dataStoreORMGetVerifiableCredentials',
  'dataStoreORMGetVerifiableCredentialsCount',
  'dataStoreORMGetVerifiablePresentations',
  'dataStoreORMGetVerifiablePresentationsCount',
  'handleMessage',
  'sendMessageDIDCommAlpha1',
  'createVerifiablePresentation',
  'createVerifiableCredential',
  'createSelectiveDisclosureRequest',
  'getVerifiableCredentialsForSdr',
  'validatePresentationAgainstSdr',
]