import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))',
					subtle: 'hsl(var(--primary-subtle))',
					glow: 'hsl(var(--primary-glow))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				success: {
					DEFAULT: 'hsl(var(--success))',
					foreground: 'hsl(var(--success-foreground))'
				},
				warning: {
					DEFAULT: 'hsl(var(--warning))',
					foreground: 'hsl(var(--warning-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				grid: {
					line: 'hsl(var(--grid-line))',
					header: 'hsl(var(--grid-header))',
					selected: 'hsl(var(--grid-selected))',
					hover: 'hsl(var(--grid-hover))'
				},
				fab: {
					DEFAULT: 'hsl(var(--fab-background))',
					foreground: 'hsl(var(--fab-foreground))'
				}
			},
			boxShadow: {
				'subtle': '0 2px 8px hsl(var(--shadow-subtle))',
				'medium': '0 4px 16px hsl(var(--shadow-medium))',
				'strong': '0 8px 32px hsl(var(--shadow-strong))',
				'glow': '0 0 24px hsl(var(--glow-primary))'
			},
			transitionDuration: {
				'quick': 'var(--duration-quick)',
				'standard': 'var(--duration-standard)',
				'slow': 'var(--duration-slow)'
			},
			transitionTimingFunction: {
				'standard': 'var(--ease-standard)',
				'spring': 'var(--ease-spring)'
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: { height: '0' },
					to: { height: 'var(--radix-accordion-content-height)' }
				},
				'accordion-up': {
					from: { height: 'var(--radix-accordion-content-height)' },
					to: { height: '0' }
				},
				'fade-in': {
					'0%': { opacity: '0', transform: 'translateY(4px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-out': {
					'0%': { opacity: '1', transform: 'translateY(0)' },
					'100%': { opacity: '0', transform: 'translateY(-4px)' }
				},
				'scale-in': {
					'0%': { opacity: '0', transform: 'scale(0.96)' },
					'100%': { opacity: '1', transform: 'scale(1)' }
				},
				'slide-up': {
					'0%': { transform: 'translateY(100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'slide-down': {
					'0%': { transform: 'translateY(-100%)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' }
				},
				'shimmer': {
					'0%': { transform: 'translateX(-100%)' },
					'100%': { transform: 'translateX(100%)' }
				},
				'pulse-glow': {
					'0%, 100%': { boxShadow: '0 0 8px hsl(var(--primary) / 0.3)' },
					'50%': { boxShadow: '0 0 24px hsl(var(--primary) / 0.6)' }
				},
				'flip-value': {
					'0%': { transform: 'rotateX(0deg)' },
					'50%': { transform: 'rotateX(90deg)', filter: 'blur(1px)' },
					'100%': { transform: 'rotateX(0deg)' }
				},
				'elastic-bounce': {
					'0%': { transform: 'scale(1)' },
					'30%': { transform: 'scale(1.02)' },
					'60%': { transform: 'scale(0.98)' },
					'100%': { transform: 'scale(1)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'fade-in': 'fade-in 200ms cubic-bezier(0.4, 0, 0.2, 1)',
				'fade-out': 'fade-out 200ms cubic-bezier(0.4, 0, 0.2, 1)',
				'scale-in': 'scale-in 150ms cubic-bezier(0.4, 0, 0.2, 1)',
				'slide-up': 'slide-up 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
				'slide-down': 'slide-down 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
				'shimmer': 'shimmer 2s infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'flip-value': 'flip-value 300ms cubic-bezier(0.4, 0, 0.2, 1)',
				'elastic-bounce': 'elastic-bounce 400ms cubic-bezier(0.34, 1.56, 0.64, 1)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
