import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import SearchForm from '../../../src/components/SearchForm';

describe('SearchForm', () => {
  it('submete por botão ou Enter com input válido', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    const props = {
      query: 'São Paulo',
      queryError: null,
      isLoading: false,
      onQueryChange: vi.fn(),
      onSubmit,
    };
    const { rerender } = render(<SearchForm {...props} />);

    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(onSubmit).toHaveBeenCalledTimes(1);

    onSubmit.mockClear();
    rerender(<SearchForm {...props} />);
    await user.click(screen.getByRole('searchbox', { name: 'Cidade' }));
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it('expõe o erro fornecido pelo hook e mantém foco no campo ao submeter inválido', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    render(
      <SearchForm
        query=""
        queryError="empty"
        isLoading={false}
        onQueryChange={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    const input = screen.getByRole('searchbox', { name: 'Cidade' });
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent('Digite uma cidade.');
    await user.click(screen.getByRole('button', { name: 'Buscar' }));
    expect(input).toHaveFocus();
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
