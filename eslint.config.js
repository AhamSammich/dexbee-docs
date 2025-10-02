import antfu from '@antfu/eslint-config'

export default antfu({
  // formatters: true,
  astro: true,
  react: true,
  vue: true,
}, {
  rules: {
    'react-hooks-extra/no-direct-set-state-in-use-effect': 'off',
  },
})
