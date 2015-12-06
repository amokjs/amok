![amok](https://cloud.githubusercontent.com/assets/157787/9637439/58c03000-51d3-11e5-8502-0b7d57096d57.png)

Amok is a free open source, editor agnostic, cross-platform command line
tool for a hassle-free live development, testing and debugging workflow for web browsers.

It aims to make the development workflow feel like a native script runtime with a zero configuration development server that supports pre-processing, a read-eval-print-loop and console mirroring to standard output.

It has additional features to enable live editing, primarily hot patching which allows you to edit the source code of scripts that are currently active on the page, which will then be re-sourced while the application is running. There is also generic file watch events for handling hot swapping of resources in a domain specific manner, like reloading css, images, et cetera.

[Watch video](http://www.youtube.com/watch?v=gOC2yQFsnnE).

## INSTALLATION

Install through npm

```sh
$ npm install --global amok
```

Note that amok requires node.js **v5.0 or greater**

## USAGE

Open about:blank in Google Chrome and enter a read-eval-print-loop

```sh
$ amok --interactive --browser chrome about:blank
```

Start a server that generates an index.html page with the given index.js file as a script element.

```sh
$ amok --browser chrome index.js
```

Open chrome with hot patching enabled for the specified entry point

```sh
$ amok --browser chrome --hot file://$PWD/index.html
```

## DOCUMENTATION

See the [manuals](man/readme.md).

## SUPPORT

* If you need help, ask in the [chat](http://gitter.im/caspervonb/amok).
* If you found a bug, submit an [issue](https://github.com/caspervonb/amok/issues).
* If you have an idea, submit an [issue](https://github.com/caspervonb/amok/issues).
* If you’d like to ask a general question, submit an [issue](https://github.com/caspervonb/amok/issues).
* If you want to contribute, submit a [pull request](https://github.com/caspervonb/amok/pulls).

## RELEASES

[See the changelog](changelog.md).

## LICENSE

The project is licensed under the [MIT License](license.md).

## SPONSORS

The project is free and open source, and has been backed by a number of
[individuals and organizations](backers.md), a special thanks goes out to
[Webflow](http://webflow.com), [Apperson Labs](http://appersonlabs.com) and
[Daft Developers](http://daftdevelopers.com).

<table>
  <tr>
    <th><img src="https://cloud.githubusercontent.com/assets/157787/8017972/6413d068-0c39-11e5-9b14-bbc9057976d1.png"/></th>
    <th><img src="https://cloud.githubusercontent.com/assets/157787/8017971/64134d6e-0c39-11e5-8acf-ec2049345265.png"/></th>
    <th><img src="https://cloud.githubusercontent.com/assets/157787/8017975/7e9595ac-0c39-11e5-9d71-a6fd34e821f0.png"/></th>
  </tr>
</table>

A special thanks also goes out to Daniel Martinez, Dan Abramov and Tom Alon for going above and beyond in supporting development.

[![Patreon](https://cloud.githubusercontent.com/assets/157787/8892582/79e9f8d8-3392-11e5-8714-663b153a686b.png)](http://patreon.com/caspervonb)
