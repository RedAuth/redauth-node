module.exports = {
    /*
    parser:  '@typescript-eslint/parser', //??ESLint????
    extends: ['plugin:@typescript-eslint/recommended'],//??????????
    plugins: ['@typescript-eslint'],//????eslint????????
    env:{                          //?????????
        browser: true,
        node: true,
    },
    */
    overrides: [
        {
            "files": ['*.js'],
            "parser": 'babel-eslint',
        },
        {
            "files": ['*.ts', '*.tsx'],
            "extends": ["plugin:@typescript-eslint/recommended"],
            "parser": '@typescript-eslint/parser',
            "plugins": ['@typescript-eslint/eslint-plugin'],
        },
    ],
    rules: {
        'arrow-parens': [2, 'as-needed'],
        eqeqeq: 0,
        'no-return-assign': 0, // fails for arrow functions
        'no-var': 2,
        semi: [2, 'always'],
        'space-before-function-paren': [2, 'never'],
        yoda: 0,
        'arrow-spacing': 2,
        'dot-location': [2, 'property'],
        'prefer-arrow-callback': 2
    }
}