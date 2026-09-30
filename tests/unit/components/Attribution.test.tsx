import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import Attribution from '../../../src/components/Attribution';

describe('Attribution', () => {
  it('exibe link acessível do provedor e aviso sobre previsões', () => {
    render(<Attribution />);

    expect(screen.getByRole('link', { name: 'Open-Meteo' })).toHaveAttribute(
      'href',
      'https://open-meteo.com/',
    );
    expect(screen.getByText('As previsões podem mudar.')).toBeVisible();
  });
});
