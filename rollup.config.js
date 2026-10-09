import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";

export default {
	input: {
		main: "src/main.js",
        constants: "src/constants.js",
		cleanup: "src/cleanup.js",
	},
	plugins: [commonjs(), resolve({ preferBuiltins: true, jail: "src" })],
	output: [
		{
			esModule: true,
			format: "es",
			preserveModules: true,
			dir: "dist"
		},
	],
};
