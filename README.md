# ASW_Cafeteria

Live demo @ https://asw1819.christianserra.dev

Trello @ https://trello.com/b/6ZnmlOos/asw-caffetteria

# What is ASW_Cafeteria?

**Themes** : Game, entertainment, and multimedia applications, Social Good, Business.
**Ramifications** : Gamification, Data Visualization, potentially IoT

**What does it do?**
ASW-Cafeteria is a web-platform for the Cafeteria inside campus of Cesena. It was born to improve attendance with gamification. When you buy stuff at the Cafeteria you get lives which are used to play on the website. With every game there is a chance of getting discounts. The better you play the higher the chance.

**Tech stack**
Server: Node.js, Express (-session and -validator), Passport, Nodemailer 
DB: MongoDB + Mongoose
Client: HTML, SCSS/CSS, JS, Vue+Axios, Bootstrap, D3.js
CI/CD: Jenkins + Docker
Others: HTTPS with LetsEncrypt + Certbot, QR-codes,

**Design and Development**
It all started with a Mockup of the base architecture, created with Balsamiq. Afterwards, we sent out a Google Form to gather what a user would want from our application. We then created a small focus-group, where we presented teh base idea and we listened for opinions and suggestions.
Towards the end of the development we let some users try and test our User Experience and to gather more feedback.

**HCI (Human Computer Interface) Techniques and Usability**
**Mockups** : Simulated the webpage and the specific interactions.
**Focus Group** : Methodology used to explore and find pros and cons of the fuctionalities to implement. (Setup, Survey, Analysis).
**Cognitive Walkthrough** : Testers were left on their own to discover the functionalities, just like a new user would be.
**Usability Inspection Methods** : we, developers, were assisted by automated tools to verify the usability
**Usability Testing** : Final testing with the **think aloud protocol**, to understand the motivations that drove users to do a task in a certain way
**Interface Development Principles**
**KISS, Less is More** : Simple interface, only the bare minimum is required to be functional.
**Responsive Design, Mobile First** : ASW-Cafeteria was designed to be used in smartphones. 
**Graphical Interaction Elements** : Use of easily recognizable graphical elements. For example for the button icons in order to create an easy mental mapping between buttons and functionality.

**Validation and Accessibility**
We validated the html code with  **w3c validator** and verified the accessibility with **achecker**, as far as possibile.

**Survey Link (Italian)**
https://docs.google.com/forms/d/11j6b29UGHK0NFzE_cLXmlXFdfBBxeMzm_vaqVX99TJ8/edit#responses

**Credits:**
Game: https://github.com/Hextris/hextris (License: MIT)
Template: https://github.com/Position2/free-bootstrap-theme-ds (License MIT / CC by 3.0)


  

## Attention

To test the full functionalities of the app use the live demo that is provided of a secure connection.
Without a secure connection the QR scan functionalities are not permitted.

## License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.
