/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/views/**/*.html.erb',
    './app/helpers/**/*.rb',
    './app/assets/stylesheets/**/*.css',
    './app/javascript/**/*.js'
  ],
  theme: {
    extend: {},
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
    'border-blue-500'
  ]
}
