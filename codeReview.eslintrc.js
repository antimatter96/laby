module.exports = {
	"env": {
        "node": true
    },
	"parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "strict",
    },
    "extends": "eslint:recommended",
    "rules": {
        // enable additional rules
		"indent": ["error", "tab"],
        "semi": ["error", "always"],
		"linebreak-style":["error","windows"],
        // override default options for rules from base configurations
        "no-cond-assign": ["error", "always"],
        // disable rules from base configurations
        "no-console": "off",
    }
}