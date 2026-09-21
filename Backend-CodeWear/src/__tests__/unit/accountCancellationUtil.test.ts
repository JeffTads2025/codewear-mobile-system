import { buildCancelledAccountData, CANCELLED_EMAIL_DOMAIN } from '../../utils/accountCancellation';

describe('buildCancelledAccountData', () => {
  it('deve gerar dados arquivados para a conta cancelada', () => {
    const cancelledData = buildCancelledAccountData({ id: 42 } as never);

    expect(cancelledData.email).toContain(CANCELLED_EMAIL_DOMAIN);
    expect(cancelledData.address).toBe('Conta cancelada');
  });
});