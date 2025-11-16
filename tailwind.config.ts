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
				display: ['Orbitron', 'sans-serif'],
				body: ['JetBrains Mono', 'monospace'],
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
			},
			transitionDuration: {
				'std': '300ms',
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
				'hologram': {
					'0%, 100%': { backgroundPosition: '0% 0%' },
					'50%': { backgroundPosition: '100% 100%' }
				},
				'stars': {
					'from': { transform: 'translateY(0px)' },
					'to': { transform: 'translateY(-100px)' }
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'shimmer': 'shimmer 2s infinite linear',
				'glow-pulse': 'glow-pulse 3s ease-in-out infinite',
				'text-glow-pulse': 'text-glow-pulse 3s ease-in-out infinite',
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
				'stars': 'stars 20s linear infinite'
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
					'background-color': 'rgba(10, 13, 22, 0.8)',
					'backdrop-filter': 'blur(12px)',
					'border-color': 'rgba(255, 255, 255, 0.1)',
				},
				'.glass-card': {
					'background-color': 'rgba(24, 24, 27, 0.6)',
					'backdrop-filter': 'blur(8px)',
					'border-color': 'rgba(255, 255, 255, 0.1)',
				},
				'.glass-input': {
					'background-color': 'rgba(0, 0, 0, 0.3)',
					'backdrop-filter': 'blur(4px)',
					'border-color': 'rgba(255, 255, 255, 0.1)',
				},
			};
			addUtilities(newUtilities);
		}
	],
} satisfies Config;
