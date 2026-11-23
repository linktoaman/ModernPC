export interface IdentityPrincipal {
  readonly subject: string;
  readonly email: string;
  readonly roles: readonly string[];
}

export const identityModuleName = 'identity';
