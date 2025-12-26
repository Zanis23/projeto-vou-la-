
import type { Meta, StoryObj } from '@storybook/react';
import { Button } from './Button';
import { Mail, ArrowRight } from 'lucide-react';

const meta = {
    title: 'UI/Button',
    component: Button,
    parameters: {
        layout: 'centered',
    },
    tags: ['autodocs'],
    argTypes: {
        variant: {
            control: 'select',
            options: ['primary', 'secondary', 'outline', 'ghost', 'danger'],
        },
        size: {
            control: 'select',
            options: ['sm', 'md', 'lg', 'icon'],
        },
    },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
    args: {
        variant: 'primary',
        children: 'Button',
    },
};

export const Secondary: Story = {
    args: {
        variant: 'secondary',
        children: 'Secondary',
    },
};

export const Outline: Story = {
    args: {
        variant: 'outline',
        children: 'Outline',
    },
};

export const Danger: Story = {
    args: {
        variant: 'danger',
        children: 'Delete Action',
    },
};

export const WithIcon: Story = {
    args: {
        variant: 'primary',
        children: 'Login with Email',
        leftIcon: <Mail className="w-4 h-4" />,
    },
};

export const Loading: Story = {
    args: {
        children: 'Please wait',
        isLoading: true,
    },
};

export const FullWidth: Story = {
    decorators: [
        (Story) => (
            <div style={{ width: '300px' }}>
                <Story />
            </div>
        ),
    ],
    args: {
        fullWidth: true,
        children: 'Full Width Button',
    },
};
