export type VerifiedRegisterRequest = {
  verification_ticket: string;
  password: string;
  display_name: string;
};

export function createRegisterRequest(
  verificationTicket: string,
  password: string,
  displayName: string,
): VerifiedRegisterRequest {
  return {
    verification_ticket: verificationTicket,
    password,
    display_name: displayName,
  };
}
