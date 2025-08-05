/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js'
  ],
  theme: {
    extend: {
      animation: {
        'fade-in': 'fadeIn 0.2s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'shake': 'shake 0.5s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        shake: {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' },
        },
      },
    },
  },
  plugins: [],
  safelist: [
    'bg-gray-100',
    'bg-gray-900',
    'bg-white',
    'bg-gray-800',
    'text-white',
    'text-black',
    'text-gray-800',
    'text-gray-300',
    'text-gray-600',
    'text-gray-400',
    'text-gray-500',
    'border-gray-200',
    'border-gray-700',
    'border-gray-300',
    'border-gray-600',
    'bg-gray-700',
    'bg-blue-50',
    'bg-blue-900',
    'text-blue-700',
    'text-blue-300',
    'text-blue-600',
    'text-blue-400',
    'border-blue-400',
    'border-blue-500',
    // Modal and animation classes
    'bg-red-100',
    'bg-red-900/30',
    'text-red-600',
    'text-red-400',
    'bg-gray-50',
    'bg-gray-700/50',
    'animate-fade-in',
    'animate-scale-in',
    'ring-gray-300',
    'ring-gray-500',
    'hover:bg-gray-50',
    'hover:bg-gray-500',
    'focus:ring-offset-white',
    'focus:ring-offset-gray-800'
  ]
}
