import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from './Button';
import { triggerHaptic } from '@/utils/haptics';

vi.mock('@/utils/haptics', () => ({
    triggerHaptic: vi.fn(),
}));

describe('Button component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders children correctly', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeDefined();
    });

    it('calls onClick and triggers haptic when clicked', () => {
        const handleClick = vi.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);

        fireEvent.click(screen.getByText('Click Me'));

        expect(handleClick).toHaveBeenCalledTimes(1);
        expect(triggerHaptic).toHaveBeenCalledWith('light');
    });

    it('is disabled and does not call onClick when isLoading is true', () => {
        const handleClick = vi.fn();
        render(<Button isLoading={true} onClick={handleClick}>Click Me</Button>);

        const button = screen.getByRole('button');
        expect(button).toBeDisabled();

        fireEvent.click(button);
        expect(handleClick).not.toHaveBeenCalled();
    });

    it('renders icons correctly', () => {
        render(
            <Button
                leftIcon={<span data-testid="left-icon">L</span>}
                rightIcon={<span data-testid="right-icon">R</span>}
            >
                Text
            </Button>
        );

        expect(screen.getByTestId('left-icon')).toBeDefined();
        expect(screen.getByTestId('right-icon')).toBeDefined();
    });
});
