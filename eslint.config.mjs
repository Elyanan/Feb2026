import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  ...nextVitals,
  ...nextTypescript,
  {
    ignores: [".next/**", ".next-test/**", "test-results/**", "playwright-report/**", "out/**", "build/**", "next-env.d.ts"]
  }
];

export default eslintConfig;
