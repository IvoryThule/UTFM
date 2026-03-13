import type { Config } from "tailwindcss";

const config: Config = {
	content: [
		"./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/components/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/app/**/*.{js,ts,jsx,tsx,mdx}",
		"./src/frontend/**/*.{js,ts,jsx,tsx,mdx}"
	],
	theme: {
		extend: {
			colors: {
				brand: {
					yellow: "#FFD100",
					orange: "#FF6633",
					warm: "#FFF8F0"
				},
				food: {
					success: "#4CAF50",
					danger: "#FF4444"
				}
			},
			animation: {
				"fade-in": "fadeIn 300ms ease-out",
				"slide-up": "slideUp 300ms ease-out",
				"scale-in": "scaleIn 200ms ease-out",
				heartbeat: "heartbeat 400ms ease-in-out",
				shake: "shake 600ms ease-in-out",
				"typing-dot": "typingDot 1.4s infinite",
				"gradient-flow": "gradientFlow 3s ease infinite"
			},
			keyframes: {
				fadeIn: {
					from: { opacity: "0" },
					to: { opacity: "1" }
				},
				slideUp: {
					from: { opacity: "0", transform: "translateY(20px)" },
					to: { opacity: "1", transform: "translateY(0)" }
				},
				scaleIn: {
					from: { opacity: "0", transform: "scale(0.9)" },
					to: { opacity: "1", transform: "scale(1)" }
				},
				heartbeat: {
					"0%, 100%": { transform: "scale(1)" },
					"25%": { transform: "scale(1.2)" },
					"50%": { transform: "scale(0.95)" },
					"75%": { transform: "scale(1.1)" }
				},
				shake: {
					"0%, 100%": { transform: "rotate(0deg)" },
					"10%": { transform: "rotate(-10deg)" },
					"20%": { transform: "rotate(10deg)" },
					"30%": { transform: "rotate(-8deg)" },
					"40%": { transform: "rotate(8deg)" },
					"50%": { transform: "rotate(-4deg)" },
					"60%": { transform: "rotate(4deg)" }
				},
				typingDot: {
					"0%, 60%, 100%": { opacity: "0.3", transform: "scale(0.8)" },
					"30%": { opacity: "1", transform: "scale(1)" }
				},
				gradientFlow: {
					"0%": { backgroundPosition: "0% 50%" },
					"50%": { backgroundPosition: "100% 50%" },
					"100%": { backgroundPosition: "0% 50%" }
				}
			},
			padding: {
				"safe-bottom": "env(safe-area-inset-bottom)",
				"safe-top": "env(safe-area-inset-top)"
			}
		}
	},
	plugins: []
};

export default config;
