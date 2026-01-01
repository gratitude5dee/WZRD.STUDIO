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
				surface: {
					0: 'hsl(var(--surface-0))',
					1: 'hsl(var(--surface-1))',
					2: 'hsl(var(--surface-2))',
					3: 'hsl(var(--surface-3))',
					4: 'hsl(var(--surface-4))'
				},
				'border-subtle': 'hsl(var(--border-subtle))',
				'border-default': 'hsl(var(--border-default))',
				'border-strong': 'hsl(var(--border-strong))',
				'text-primary': 'hsl(var(--text-primary))',
				'text-secondary': 'hsl(var(--text-secondary))',
				'text-tertiary': 'hsl(var(--text-tertiary))',
				'text-disabled': 'hsl(var(--text-disabled))',
				'accent-teal': 'hsl(var(--accent-teal))',
				'accent-purple': 'hsl(var(--accent-purple))',
				'accent-amber': 'hsl(var(--accent-amber))',
				'accent-emerald': 'hsl(var(--accent-emerald))',
				'accent-rose': 'hsl(var(--accent-rose))',
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
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
				// NEW: Teal & Amber Accent Colors
				teal: {
					DEFAULT: 'hsl(var(--teal))',
					foreground: 'hsl(var(--teal-foreground))'
				},
				amber: {
					DEFAULT: 'hsl(var(--amber))',
					foreground: 'hsl(var(--amber-foreground))'
				},
				gold: 'hsl(var(--gold))',
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				// Refined Purple Palette (Partiful-inspired)
				'refined-deep': 'hsl(var(--refined-deep))',
				'refined-rich': 'hsl(var(--refined-rich))',
				'refined-lavender': 'hsl(var(--refined-lavender))',
				'refined-pink': 'hsl(var(--refined-pink))',
				'surface-dark': 'hsl(var(--surface-dark))',
				'surface-light': 'hsl(var(--surface-light))',
				cosmic: {
					void: 'hsl(var(--cosmic-void))',
					nebula: 'hsl(var(--nebula-purple))',
					stellar: 'hsl(var(--stellar-gold))',
					plasma: 'hsl(var(--plasma-blue))',
					quantum: 'hsl(var(--quantum-green))',
					temporal: 'hsl(var(--temporal-orange))',
					shadow: 'hsl(var(--void-shadow))'
				},
				glass: {
					primary: 'hsl(var(--glass-primary))',
					secondary: 'hsl(var(--glass-secondary))',
					accent: 'hsl(var(--glass-accent))',
					backdrop: 'hsl(var(--glass-backdrop))'
				},
				glow: {
					primary: 'hsl(var(--glow-primary))',
					secondary: 'hsl(var(--glow-secondary))',
					accent: 'hsl(var(--glow-accent))'
				},
				canvas: {
					bg: 'hsl(var(--canvas-bg))',
					block: 'hsl(var(--block-bg))',
					'text-primary': 'hsl(var(--text-primary))',
					'text-secondary': 'hsl(var(--text-secondary))',
					'accent-blue': 'hsl(var(--accent-blue))',
					'accent-purple': 'hsl(var(--accent-purple))',
					'connector-default': 'hsl(var(--connector-default))',
					'connector-active': 'hsl(var(--connector-active))'
				}
			},
			fontFamily: {
				display: ['var(--font-display)', 'Inter', 'system-ui', 'sans-serif'],
				body: ['var(--font-body)', 'Inter', 'system-ui', 'sans-serif'],
				mono: ['var(--font-mono)', 'JetBrains Mono', 'Fira Code', 'monospace'],
				tech: ['Rajdhani', 'sans-serif'],
				serif: ['Cinzel', 'serif'],
				cyber: ['Orbitron', 'monospace'],
				inter: ['Inter', 'sans-serif'],
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			boxShadow: {
				'glow-purple-sm': '0 0 8px rgba(147, 51, 234, 0.4), 0 0 15px rgba(147, 51, 234, 0.15)',
				'glow-purple-md': '0 0 15px rgba(147, 51, 234, 0.5), 0 0 25px rgba(147, 51, 234, 0.2)',
				'glow-blue-md': '0 0 15px rgba(47, 123, 188, 0.5), 0 0 25px rgba(47, 123, 188, 0.2)',
				'glow-teal-md': '0 0 15px rgba(20, 184, 166, 0.5), 0 0 25px rgba(20, 184, 166, 0.2)',
				'glow-teal': '0 0 20px hsl(var(--glow-teal)), 0 0 40px hsl(var(--glow-teal))',
				'glow-purple': '0 0 20px hsl(var(--glow-purple)), 0 0 40px hsl(var(--glow-purple))',
				'glow-amber': '0 0 20px hsl(var(--glow-amber)), 0 0 40px hsl(var(--glow-amber))',
			},
			transitionDuration: {
				'std': '300ms',
			},
			transitionTimingFunction: {
				'std': 'cubic-bezier(0.4, 0, 0.2, 1)',
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' }
				},
				'glow-pulse': {
					'0%, 100%': { 
						boxShadow: '0 0 5px rgba(147, 51, 234, 0.3), 0 0 10px rgba(147, 51, 234, 0.1)' 
					},
					'50%': { 
						boxShadow: '0 0 20px rgba(147, 51, 234, 0.5), 0 0 30px rgba(147, 51, 234, 0.2)' 
					}
				},
				'text-glow-pulse': {
					'0%, 100%': { 
						textShadow: '0 0 5px rgba(255, 182, 40, 0.3), 0 0 10px rgba(255, 182, 40, 0.1)' 
					},
					'50%': { 
						textShadow: '0 0 8px rgba(255, 182, 40, 0.5), 0 0 15px rgba(255, 182, 40, 0.2)' 
					}
				},
				'noise-animation': {
					'0%': { transform: 'translate(0, 0)' },
					'10%': { transform: 'translate(-5%, -5%)' },
					'20%': { transform: 'translate(-10%, 5%)' },
					'30%': { transform: 'translate(5%, -10%)' },
					'40%': { transform: 'translate(-5%, 15%)' },
					'50%': { transform: 'translate(-10%, 5%)' },
					'60%': { transform: 'translate(15%, 0)' },
					'70%': { transform: 'translate(0, 10%)' },
					'80%': { transform: 'translate(-15%, 0)' },
					'90%': { transform: 'translate(10%, 5%)' },
					'100%': { transform: 'translate(0, 0)' }
				},
				// Cyberpunk Animations
				'float': {
					'0%, 100%': { transform: 'translateY(0px)' },
					'50%': { transform: 'translateY(-20px)' }
				},
				'cyber-glow-pulse': {
					'0%': { boxShadow: '0 0 20px rgba(0, 245, 255, 0.5)' },
					'100%': { boxShadow: '0 0 40px rgba(0, 245, 255, 0.8), 0 0 60px rgba(0, 245, 255, 0.4)' }
				},
				'slide-up': {
					'0%': { opacity: '0', transform: 'translateY(50px)' },
					'100%': { opacity: '1', transform: 'translateY(0)' }
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' }
				},
				'hologram': {
					'0%, 100%': { backgroundPosition: '0% 0%' },
					'50%': { backgroundPosition: '100% 100%' }
				},
				'stars': {
					'from': { transform: 'translateY(0px)' },
					'to': { transform: 'translateY(-100px)' }
				},
				'gradient-shift': {
					'0%': { backgroundPosition: '0% 50%' },
					'100%': { backgroundPosition: '200% 50%' }
				},
				'border-flow': {
					'0%': { backgroundPosition: '0% 50%' },
					'100%': { backgroundPosition: '200% 50%' }
				},
				'pulse-glow': {
					'0%, 100%': { opacity: '0.3', strokeWidth: '3' },
					'50%': { opacity: '0.8', strokeWidth: '5' }
				},
				// Magic UI Animations
				'shimmer-slide': {
					to: { transform: 'translate(calc(100cqw - 100%), 0)' }
				},
				'spin-around': {
					'0%': { transform: 'translateZ(0) rotate(0)' },
					'15%, 35%': { transform: 'translateZ(0) rotate(90deg)' },
					'65%, 85%': { transform: 'translateZ(0) rotate(270deg)' },
					'100%': { transform: 'translateZ(0) rotate(360deg)' }
				},
				'shine': {
					'0%': { backgroundPosition: '0% 0%' },
					'50%': { backgroundPosition: '100% 100%' },
					'100%': { backgroundPosition: '0% 0%' }
				},
				'gradient': {
					to: { backgroundPosition: 'var(--bg-size) 0' }
				},
				'pulse-subtle': {
					'0%, 100%': { opacity: '1' },
					'50%': { opacity: '0.7' }
				},
				'marquee': {
					from: { transform: 'translateX(0)' },
					to: { transform: 'translateX(calc(-100% - var(--gap)))' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'shimmer': 'shimmer 2s infinite linear',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'text-glow-pulse': 'text-glow-pulse 3s ease-in-out infinite',
				'gradient-shift': 'gradient-shift 6s linear infinite',
				'border-flow': 'border-flow 3s linear infinite',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
				'noise': 'noise-animation 0.2s infinite',
				// Odyssey Cosmic Animations
				'cosmic-pulse': 'cosmic-pulse 4s ease-in-out infinite',
				'stellar-drift': 'stellar-drift 15s ease-in-out infinite',
				'quantum-shift': 'quantum-shift 8s ease-in-out infinite',
				'void-ripple': 'void-ripple 2s ease-out infinite',
				// Cyberpunk Animations
				'float': 'float 6s ease-in-out infinite',
				'cyber-glow-pulse': 'cyber-glow-pulse 2s ease-in-out infinite alternate',
				'slide-up': 'slide-up 0.8s ease-out',
				'fade-in': 'fade-in 1s ease-out',
				'hologram': 'hologram 3s ease-in-out infinite',
				'stars': 'stars 20s linear infinite',
				// Magic UI Animations
				'shimmer-slide': 'shimmer-slide var(--speed) ease-in-out infinite alternate',
				'spin-around': 'spin-around calc(var(--speed) * 2) infinite linear',
				'shine': 'shine var(--duration) infinite linear',
				'gradient': 'gradient 8s linear infinite',
				'pulse-subtle': 'pulse-subtle 2s ease-in-out infinite',
				'marquee': 'marquee var(--duration) linear infinite'
			},
			backgroundImage: {
				'noise': 'url("/noise.png")',
				'gradient-dark': 'radial-gradient(ellipse at bottom, hsl(224, 71%, 10%) 0%, hsl(224, 71%, 4%) 100%)',
				'gradient-hero': 'linear-gradient(135deg, rgba(76, 29, 149, 0.5) 0%, rgba(124, 58, 237, 0.5) 35%, rgba(139, 92, 246, 0.5) 75%, rgba(167, 139, 250, 0.3) 100%)',
				'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
				// Refined gradients
				'refined-gradient': 'linear-gradient(135deg, hsl(var(--refined-deep)) 0%, hsl(var(--refined-rich)) 50%, hsl(var(--refined-pink)) 100%)',
				'surface-gradient': 'linear-gradient(135deg, hsl(var(--surface-dark)) 0%, hsl(var(--surface-light)) 100%)',
				'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.04) 100%)',
				'mesh-pattern': 'radial-gradient(circle at 50% 50%, hsl(var(--refined-rich) / 0.3) 0%, transparent 50%)',
				// Odyssey Cosmic Gradients
				'cosmic-void': 'radial-gradient(circle at center, hsl(var(--cosmic-void)) 0%, hsl(var(--background)) 100%)',
				'nebula-field': 'linear-gradient(135deg, hsl(var(--glow-primary) / 0.2), hsl(var(--glow-secondary) / 0.3), hsl(var(--glow-accent) / 0.2))',
				'stellar-burst': 'radial-gradient(ellipse at top, hsl(var(--stellar-gold) / 0.3), transparent 70%)',
				'quantum-flow': 'conic-gradient(from 180deg, hsl(var(--quantum-green) / 0.4), hsl(var(--plasma-blue) / 0.4), hsl(var(--temporal-orange) / 0.4), hsl(var(--quantum-green) / 0.4))',
				'glass-reflection': 'linear-gradient(135deg, transparent 0%, hsl(var(--foreground) / 0.05) 25%, transparent 50%, hsl(var(--foreground) / 0.03) 75%, transparent 100%)',
				// Cyberpunk Gradients
				'cyber-gradient': 'linear-gradient(135deg, hsl(var(--deep-space)) 0%, #1a1a2e 50%, #16213e 100%)',
				'neon-gradient': 'linear-gradient(135deg, hsl(var(--electric)) 0%, hsl(var(--neon-purple)) 50%, hsl(var(--cyber-pink)) 100%)',
				'glass-gradient': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)'
			}
		},
		transformStyle: {
			'3d': 'preserve-3d',
			'flat': 'flat',
		},
		perspective: {
			'none': 'none',
			'500': '500px',
			'1000': '1000px',
			'2000': '2000px',
		},
		backfaceVisibility: {
			'visible': 'visible',
			'hidden': 'hidden',
		}
	},
	plugins: [
		require("tailwindcss-animate"),
		function({ addUtilities }) {
			const newUtilities = {
				'.transform-style-3d': {
					'transform-style': 'preserve-3d',
				},
				'.transform-style-flat': {
					'transform-style': 'flat',
				},
				'.perspective-none': {
					'perspective': 'none',
				},
				'.perspective-500': {
					'perspective': '500px',
				},
				'.perspective-1000': {
					'perspective': '1000px',
				},
				'.perspective-2000': {
					'perspective': '2000px',
				},
				'.backface-visible': {
					'backface-visibility': 'visible',
				},
				'.backface-hidden': {
					'backface-visibility': 'hidden',
				},
				'.transition-all-std': {
					'transition': 'all 300ms ease-out',
				},
				'.transition-all-fast': {
					'transition': 'all 200ms ease-out',
				},
				'.glass-panel': {
					'background': 'linear-gradient(135deg, rgba(15, 15, 20, 0.85) 0%, rgba(10, 12, 18, 0.95) 100%)',
					'backdrop-filter': 'blur(24px)',
					'border-color': 'rgba(255, 255, 255, 0.08)',
				},
				'.glass-panel-dark': {
					'background': 'linear-gradient(180deg, rgba(15, 15, 20, 0.9) 0%, rgba(8, 10, 14, 0.95) 100%)',
					'backdrop-filter': 'blur(32px)',
					'border-color': 'rgba(255, 255, 255, 0.05)',
				},
				'.glass-card': {
					'background': 'linear-gradient(135deg, rgba(24, 24, 32, 0.7) 0%, rgba(18, 18, 26, 0.5) 100%)',
					'backdrop-filter': 'blur(16px)',
					'border-color': 'rgba(255, 255, 255, 0.1)',
				},
				'.glass-card-warm': {
					'background': 'linear-gradient(135deg, rgba(28, 25, 23, 0.7) 0%, rgba(22, 20, 18, 0.5) 100%)',
					'backdrop-filter': 'blur(16px)',
					'border-color': 'rgba(255, 200, 150, 0.1)',
				},
				'.glass-stat': {
					'background': 'linear-gradient(135deg, rgba(20, 20, 28, 0.75) 0%, rgba(16, 16, 22, 0.6) 100%)',
					'backdrop-filter': 'blur(20px)',
					'border-color': 'rgba(255, 255, 255, 0.08)',
				},
				'.glass-sidebar': {
					'background': 'linear-gradient(180deg, rgba(12, 12, 18, 0.92) 0%, rgba(8, 8, 12, 0.98) 100%)',
					'backdrop-filter': 'blur(40px)',
					'border-color': 'rgba(255, 255, 255, 0.04)',
				},
				'.glass-input': {
					'background-color': 'rgba(0, 0, 0, 0.35)',
					'backdrop-filter': 'blur(8px)',
					'border-color': 'rgba(255, 255, 255, 0.1)',
				},
				'.glass-button': {
					'background': 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
					'backdrop-filter': 'blur(12px)',
					'border-color': 'rgba(255, 255, 255, 0.15)',
				},
				'.glow-teal': {
					'box-shadow': '0 0 20px rgba(20, 184, 166, 0.4), 0 0 40px rgba(20, 184, 166, 0.2)',
				},
				'.glow-amber': {
					'box-shadow': '0 0 20px rgba(245, 158, 11, 0.4), 0 0 40px rgba(245, 158, 11, 0.2)',
				},
			};
			addUtilities(newUtilities);
		}
	],
} satisfies Config;
