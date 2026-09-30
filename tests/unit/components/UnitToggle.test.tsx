import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import UnitToggle from '../../../src/components/UnitToggle';

describe('UnitToggle', () => {
  it('expõe a unidade selecionada e permite alternância por teclado', async () => {
    const user = userEvent.setup();
    const onUnitChange = vi.fn();
    render(<UnitToggle unit="celsius" onUnitChange={onUnitChange} />);

    const celsius = screen.getByRole('button', { name: 'Celsius' });
    const fahrenheit = screen.getByRole('button', { name: 'Fahrenheit' });
    expect(celsius).toHaveAttribute('aria-pressed', 'true');
    expect(fahrenheit).toHaveAttribute('aria-pressed', 'false');

    fahrenheit.focus();
    await user.keyboard('{Enter}');
    expect(onUnitChange).toHaveBeenCalledOnce();
    expect(onUnitChange).toHaveBeenCalledWith('fahrenheit');
  });
});
