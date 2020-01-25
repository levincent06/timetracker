# timetracker
A Chrome Extension that hides suggested videos on YouTube as well as tracks time spent on unproductive websites.

[Chrome Webstore Link](https://chrome.google.com/webstore/detail/trackerpro/ommpiefnngepapcbfpjflaekdheahhek):
https://chrome.google.com/webstore/detail/trackerpro/ommpiefnngepapcbfpjflaekdheahhek

This productivity extension is designed to help users become aware of how much time they are spending unproductively online, whether it may be because of watching endless YouTube videos, checking e-mail for the 5th time that day, or taking their "5-minute Facebook break" too far.

This project was programmed using JavaScript for backend and HTML/CSS for frontend.
Backend is event-driven, using Chrome API to listen for events such as tab/window changes, history state updates, and user button clicks.
Data is stored using Chrome's Storage API, which can be accessed by the user through the extension UI.

<img src="https://github.com/levincent06/timetracker/blob/master/screenshots/popup.JPG?raw=true" width="100%" height="100%">

***

## Core Features ##
- Time tracking
- Limiting YouTube video accessibility 

## Time Tracking ##
Involves websites.html, websites.js, analytics.html, analytics.js, charts.css

A timer runs while the user has a Chrome window focused and the current active tab is marked for tracking.
Users can submit certain websites to be tracked through the following interface:

<img src="https://github.com/levincent06/timetracker/blob/master/screenshots/websitesTrack.JPG?raw=true" width="30%" height="30%">

background.js, the core backend script, has a `timer.timeSpent` variable which internally keeps track of the unproductive track for the current day. Upon the appropriate events (ex: changing tabs to a tab with an unproductive website), the timer starts/continues and a continuous loop increments `timer.timeSpent`. Upon "stopping" events (ex: minimizing Chrome with YouTube open), the loop stops and uses Chrome Storage API to store {`date`: `timer.timeSpent`}. The data is also stored every 10 seconds passively while the timer is active. `timer.timeSpent` is reset at midnight.

Users can view their tracked time as follows:

<img src="https://github.com/levincent06/timetracker/blob/master/screenshots/data.JPG?raw=true" width="30%" height="30%">

Every 60 minutes of tracked time will send the user a desktop notification:
<img src="https://github.com/levincent06/timetracker/blob/master/screenshots/notification.png?raw=true" width="30%" height="30%">

The total tracked time for the day is also displayed live on the extension icon on Chrome's toolbar. The icon lights red when the timer is active; otherwise it is grey.

## YouTube Accessibility ##
Involves hide.js

When accessing a YouTube-domain website, background.js sends a message to hide.js, which queries for HTML elements and hides them.
Videos on the Homepage, Trending, Library, and "Up Next" videos (seen on the right side when watching a video) are hidden, preventing users from clicking away to more videos.

Videos from subscribed channels and videos queried through the YouTube search bar are untouched.

***

## Potential Features ##
### Time Tracking ###
- Detailed breakdown of unproductive time (Ex: 55 minutes on YouTube, 20 minutes on Instagram)
- Stats on each website (Ex: Facebook : 10 minutes today; 50 minutes this week; 300 minutes total tracked)
### Website Accessibility ###
1. More content control (Ex: hide subscribed videos, hide YouTube browsing, hide comments)
  * Extend to other websites (Ex: hide Twitter feed)

2. Complete website blocking (Ex: inability to access Twitter)
  * Control over "break-time" (Ex: can access Twitter only between 9pm and 10pm)
