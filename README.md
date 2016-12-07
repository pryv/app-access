# Pryv app-web-access

Web app to generate pryv `app` [access](http://api.pryv.com/concepts/#accesses) tokens

## Usage

Pass a custom register name in the query parameter: `http://pryv.github.io/app-web-access/?pryv-reg={custom register name}`

Example: [http://pryv.github.io/app-web-access/?pryv-reg=reg.pryv.me](http://pryv.github.io/app-web-access/?pryv-reg=reg.pryv.me)

## Contribute

*Prerequisites:* Node

* Download dependencies with `npm install`.
* Generate web app with `npm run grunt`.
* Open the file `dist/index.html`.

## License

[MIT](https://github.com/pryv/app-web-access/blob/master/LICENSE)