<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![Chat][chat-shield]][chat-url]
[![MIT License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/femto-apps/web-board-games">
    <img src="public/images/logo.png" alt="Logo" width="80" height="80">
  </a>

  <h3 align="center">Web Board Games</h3>

  <p align="center">
    List your games,  find games to play with others.
    <br />
    <a href="https://github.com/femto-apps/web-board-games"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://bg.femto.host">View Demo</a>
    ·
    <a href="https://github.com/femto-apps/web-board-games/issues">Report Bug</a>
    ·
    <a href="https://github.com/femto-apps/web-board-games/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
## Table of Contents

* [About the Project](#about-the-project)
  * [Built With](#built-with)
* [Getting Started](#getting-started)
  * [Prerequisites](#prerequisites)
  * [Installation](#installation)
* [Usage](#usage)
* [Roadmap](#roadmap)
* [Contributing](#contributing)
* [License](#license)
* [Contact](#contact)
* [Acknowledgements](#acknowledgements)



<!-- ABOUT THE PROJECT -->
## About The Project

[![Web Board Game Screenshot][product-screenshot]](https://bg.femto.host)

Finding out what games you have and which games you can play with others should be fast and easy.  At the moment, however, the process takes a lot of communication and manual effort.

Thus, the aptly named 'web board games' has been written, it's main features include:

- Fast and minimal, pages are <20kb in size.
- Supports any game in the "Board Game Geek" list.
- Can filter games by player count, playtime, etc.

### Built With

* [Node](https://nodejs.org)
* [Redis](https://redis.io/)
* [MongoDB](https://www.mongodb.com/)

<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple example steps.

### Prerequisites

* [node](https://nodejs.org/en/download/) (tested on v12+)
* npm
```sh
npm install npm@latest -g
```
* mongo
```sh
# either from https://www.mongodb.com/ or with Docker:
docker volume create --name=mongodata
docker run -p 27017:27017 --name mongo -v mongodata:/data/db -d mongo
```
* redis
```sh
# either from https://redis.io/ or with Docker:
docker volume create --name=redisdata
docker run -p 6379:6379 --name redis -v redisdata:/data -d redis redis-server --appendonly yes
```
* [web-authentication-provider](https://github.com/femto-apps/web-authentication-provider)
* [web-authentication-token-service](https://github.com/femto-apps/web-authentication-token-service)

### Installation

1. Clone the repo
```sh
git clone https://github.com/femto-apps/web-board-games
```
2. Install NPM packages
```sh
npm install
```
3. Copy `config.default.hjson` to `config.hjson`
```sh
cp config.default.hjson config.hjson
```
4. Update the configuration to your liking, specifically you must change `minio.accessKey`, `minio.secretKey`, `session.secret` and `authenticationProvider.consumerId`

<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/femto-apps/web-board-games/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Alexander Craggs - bg@femto.host  

Project Link: [https://github.com/femto-apps/web-board-games](https://github.com/femto-apps/web-board-games)



<!-- ACKNOWLEDGEMENTS -->
## Acknowledgements
* [Img Shields](https://shields.io)
* [Choose an Open Source License](https://choosealicense.com)





<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[contributors-shield]: https://img.shields.io/github/contributors/femto-apps/web-board-games.svg?style=flat-square
[contributors-url]: https://github.com/femto-apps/web-board-games/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/femto-apps/web-board-games.svg?style=flat-square
[forks-url]: https://github.com/femto-apps/web-board-games/network/members
[chat-shield]: https://img.shields.io/discord/493418312714289158?style=flat-square
[chat-url]: https://femto.pw/discord
[stars-shield]: https://img.shields.io/github/stars/femto-apps/web-board-games.svg?style=flat-square
[stars-url]: https://github.com/femto-apps/web-board-games/stargazers
[issues-shield]: https://img.shields.io/github/issues/femto-apps/web-board-games.svg?style=flat-square
[issues-url]: https://github.com/femto-apps/web-board-games/issues
[license-shield]: https://img.shields.io/github/license/femto-apps/web-board-games.svg?style=flat-square
[license-url]: https://github.com/femto-apps/web-board-games/blob/master/LICENSE.txt
[product-screenshot]: public/images/screenshot.png
